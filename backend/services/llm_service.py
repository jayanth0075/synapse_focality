import os
import json
import logging
from typing import Optional, Dict, Any, List
from backend.config import settings, load_env_variables

logger = logging.getLogger("synapse.llm")

def get_active_provider() -> Optional[str]:
    """Returns 'openai' if OPENAI_API_KEY is configured, 'gemini' if GEMINI_API_KEY is configured, else None."""
    load_env_variables()
    openai_key = os.getenv("OPENAI_API_KEY") or settings.OPENAI_API_KEY
    if openai_key and openai_key.strip() and not openai_key.startswith("your-"):
        return "openai"
    
    gemini_key = os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY
    if gemini_key and gemini_key.strip() and not gemini_key.startswith("your-"):
        return "gemini"
        
    return None

def call_llm(system_prompt: str, user_prompt: str, json_mode: bool = False) -> Optional[str]:
    """
    Unified LLM caller with multi-provider failover:
    Supports OpenAI (GPT-4o-mini) and Google Gemini (gemini-2.5-flash).
    Returns None if no API keys are provided or if upstream network fails.
    """
    provider = get_active_provider()
    if not provider:
        return None

    if provider == "openai":
        try:
            import openai
            api_key = os.getenv("OPENAI_API_KEY") or settings.OPENAI_API_KEY
            client = openai.OpenAI(api_key=api_key)
            
            kwargs: Dict[str, Any] = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.2
            }
            if json_mode:
                kwargs["response_format"] = {"type": "json_object"}
                
            response = client.chat.completions.create(**kwargs)
            return response.choices[0].message.content
        except Exception as e:
            logger.warning(f"OpenAI API call failed: {e}. Falling back to deterministic engine.")
            return None

    elif provider == "gemini":
        try:
            from google import genai
            from google.genai import types

            api_key = os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY
            client = genai.Client(api_key=api_key)
            generation_config = types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=0.2,
                response_mime_type="application/json" if json_mode else None,
            )
                
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=user_prompt,
                config=generation_config,
            )
            return response.text
        except Exception as e:
            logger.warning(f"Gemini API call failed: {e}. Falling back to deterministic engine.")
            return None

    return None

def synthesize_grounded_answer(query: str, citations: List[Dict[str, Any]], graph_paths: List[Dict[str, Any]]) -> Optional[str]:
    """
    Synthesize an organizational memory answer grounded strictly in verified citations and graph paths.
    """
    if not citations:
        return None
        
    citations_context = []
    for c in citations[:5]:
        citations_context.append(
            f"Citation [{c['id']}]:\n"
            f"Title: {c['title']}\n"
            f"Author: {c['author']} ({c['timestamp']})\n"
            f"Source Type: {c.get('sourceType', 'document')}\n"
            f"Excerpt: {c['snippet']}\n"
        )
    citations_text = "\n---\n".join(citations_context)
    
    graph_context = []
    for gp in graph_paths:
        nodes = " -> ".join(gp.get("nodes", []))
        graph_context.append(f"Graph Path: {nodes} ({gp.get('description', '')})")
    graph_text = "\n".join(graph_context) if graph_context else "None"

    system_prompt = (
        "You are SYNAPSE, an enterprise organizational memory agent developed by Artisan Systems.\n"
        "Your task is to provide rigorous, truthful, evidence-backed answers to organizational queries.\n"
        "RULES:\n"
        "1. Every factual assertion must be attributed to the provided citations using [cite-id] brackets.\n"
        "2. Directly synthesize the causal history, technical decisions, risks, or incidents.\n"
        "3. Highlight active consensus or known conflicts explicitly.\n"
        "4. If graph traversal paths are provided, integrate the causal lineage smoothly.\n"
        "5. Format output with clean Markdown headings, bullet points, and citation tags."
    )

    user_prompt = (
        f"USER QUERY: {query}\n\n"
        f"VERIFIED EVIDENCE CITATIONS:\n{citations_text}\n\n"
        f"KNOWLEDGE GRAPH TRAVERSAL PATHS:\n{graph_text}\n\n"
        f"Please synthesize the comprehensive answer:"
    )

    return call_llm(system_prompt, user_prompt, json_mode=False)

def extract_entities_llm(content: str, title: str, author: str) -> Optional[Dict[str, Any]]:
    """
    Extract entities and causal relationships from text using structured LLM output.
    """
    system_prompt = (
        "You are an enterprise knowledge graph extraction engine for SYNAPSE.\n"
        "Extract named entities and directed relationships from the text.\n"
        "Entity types allowed: 'Project', 'Person', 'Topic', 'Problem', 'Decision', 'Team', 'Document'.\n"
        "Edge labels allowed: 'AUTHORED', 'MENTIONS', 'RESOLVES', 'DEPRECATES', 'DEPENDS_ON', 'OWNS', 'CONFLICTS_WITH'.\n"
        "Output MUST be valid JSON adhering to this schema:\n"
        "{\n"
        '  "entities": [\n'
        '    {"id": "node-topic-raft", "label": "Raft Consensus", "type": "Topic", "summary": "brief summary", "confidence": 0.95}\n'
        "  ],\n"
        '  "relations": [\n'
        '    {"source": "source_id", "target": "target_id", "label": "RESOLVES", "supportingText": "evidence span", "confidence": 0.92}\n'
        "  ]\n"
        "}"
    )

    user_prompt = (
        f"DOCUMENT TITLE: {title}\n"
        f"AUTHOR: {author}\n"
        f"CONTENT:\n{content[:2500]}\n\n"
        "Extract the JSON representation:"
    )

    raw_json = call_llm(system_prompt, user_prompt, json_mode=True)
    if not raw_json:
        return None

    try:
        data = json.loads(raw_json)
        if isinstance(data, dict) and "entities" in data:
            return data
    except Exception as e:
        logger.warning(f"Failed to parse LLM extraction JSON: {e}")
    return None
