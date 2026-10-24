from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from backend.services.ingestion_service import IngestionService
from backend.models.domain import IngestDocumentRequest
from backend.config import settings

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/ingest")
def ingest_document(body: IngestDocumentRequest, tenant_id: str = settings.DEFAULT_TENANT_ID):
    return IngestionService.ingest_document(
        title=body.title,
        content=body.content,
        source_type=body.source_type,
        author=body.author,
        acl_group=body.acl_group,
        project_id=body.project_id,
        tenant_id=tenant_id
    )

@router.post("/upload")
async def upload_document_file(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    author: str = Form("Priya Sharma"),
    acl_group: str = Form("all"),
    project_id: Optional[str] = Form(None),
    tenant_id: str = settings.DEFAULT_TENANT_ID
):
    try:
        content_bytes = await file.read()
        content = content_bytes.decode("utf-8", errors="replace")
        doc_title = title or file.filename or "Uploaded Document"

        return IngestionService.ingest_document(
            title=doc_title,
            content=content,
            source_type="document",
            author=author,
            acl_group=acl_group,
            project_id=project_id,
            tenant_id=tenant_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process uploaded file: {str(e)}")
