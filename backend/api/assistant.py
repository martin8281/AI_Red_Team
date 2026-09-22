import base64
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from backend.ai.ai_service import AIService
from backend.pipeline.feedback_store import FeedbackLoopService, AnalystRejection
from backend.pipeline.correlation_engine import DeterministicCorrelationEngine, LogRecord
from backend.pipeline.file_parser import FileParserService

router = APIRouter(prefix="/api/assistant", tags=["assistant"])
ai_service = AIService()


class ForensicAttachmentModel(BaseModel):
    id: str
    name: str
    contentSnippet: Optional[str] = None
    content: Optional[str] = None
    raw_content: Optional[str] = None
    rawContent: Optional[str] = None
    fullContent: Optional[str] = None
    type: Optional[str] = None
    category: Optional[str] = None
    size: Optional[int] = None
    extension: Optional[str] = None


class ParseFileRequest(BaseModel):
    name: str
    content_base64: Optional[str] = None
    content_text: Optional[str] = None


@router.post("/parse-file")
async def parse_file_handler(payload: ParseFileRequest):
    """
    Universal File Extraction Endpoint:
    Parses and extracts clean searchable text from PDF, DOCX, TXT, LOG, CSV, JSON, XML, Archives, etc.
    """
    try:
        filename = payload.name
        if payload.content_base64:
            raw_b64 = payload.content_base64
            if "," in raw_b64:
                raw_b64 = raw_b64.split(",", 1)[1]
            data = base64.b64decode(raw_b64)
            parsed = FileParserService.parse_file(filename, data)
        else:
            text_bytes = (payload.content_text or "").encode("utf-8")
            parsed = FileParserService.parse_file(filename, text_bytes)
        return parsed
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse file: {str(e)}")


class ChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    project_id: str = Field(..., description="Parent engagement project ID")
    context_type: str = Field(..., description="Context category: project, finding, scope, risk, evidence")
    context_id: Optional[str] = Field(None, description="Specific finding or scope ID if applicable")
    message: str = Field(..., description="User prompt or inquiry")
    mode: Optional[str] = Field("chat", description="Conversation mode: 'chat' (Normal Chat) or 'assistant' (Assistant Mode)")
    quick_action: Optional[str] = Field(None, description="Predefined quick action identifier")
    attachments: Optional[List[ForensicAttachmentModel]] = Field(default_factory=list)


class ChatResponse(BaseModel):
    conversation_id: str
    message_id: str
    role: str = "assistant"
    mode: str = "chat"
    structured_response: Dict[str, Any]
    metadata: Dict[str, Any]


class CorrelationRequest(BaseModel):
    project_id: str
    records: List[Dict[str, Any]]
    window_minutes: int = 15


class RejectionRequest(BaseModel):
    project_id: str
    finding_id: str
    finding_category: str
    affected_asset: str
    detection_rule: str = "DEFAULT"
    rejection_reason: str = "FALSE_POSITIVE"
    analyst_comment: str


@router.post("/chat", response_model=ChatResponse)
async def chat_handler(req: ChatRequest):
    project_data = {
        "id": req.project_id,
        "name": f"Engagement {req.project_id}",
        "scope": ["api.apexfin.com", "auth.apexfin.com"]
    }
    
    finding_data = None
    if req.context_id:
        finding_data = {
            "id": req.context_id,
            "category": "Authentication Vulnerability",
            "severity": "HIGH",
            "riskScore": 80,
            "affectedAsset": "auth.apexfin.com",
            "evidenceRefs": ["EVD-101", "EVD-102"],
            "description": "Observed authentication bypass pattern in target endpoint."
        }

    attachments_data = [a.model_dump() for a in req.attachments] if req.attachments else []

    res = await ai_service.analyze(
        project_data=project_data,
        context_type=req.context_type,
        message=req.message,
        finding_data=finding_data,
        quick_action=req.quick_action,
        attachments=attachments_data,
        conversation_id=req.conversation_id,
        mode=req.mode or "chat"
    )

    conv_id = req.conversation_id or "conv-live"
    return ChatResponse(
        conversation_id=conv_id,
        message_id="msg-live",
        role="assistant",
        mode=req.mode or "chat",
        structured_response=res,
        metadata={"projectId": req.project_id, "confidence": res.get("confidence", "HIGH")}
    )


@router.post("/correlate")
async def correlate_handler(req: CorrelationRequest):
    engine = DeterministicCorrelationEngine(window_minutes=req.window_minutes)
    log_records = []
    for r in req.records:
        try:
            log_records.append(LogRecord(**r))
        except Exception as e:
            continue

    correlated = engine.correlate(log_records)
    return {
        "project_id": req.project_id,
        "correlation_count": len(correlated),
        "correlations": [c.model_dump() for c in correlated]
    }


@router.post("/rejection")
async def record_rejection_handler(req: RejectionRequest):
    rejection = FeedbackLoopService.record_rejection(
        project_id=req.project_id,
        finding_category=req.finding_category,
        affected_asset=req.affected_asset,
        rejection_reason=req.rejection_reason,
        analyst_comment=req.analyst_comment,
        detection_rule=req.detection_rule
    )
    return {
        "status": "RECORDED",
        "rejection": rejection.model_dump()
    }


@router.get("/rejections/{project_id}")
async def list_rejections_handler(project_id: str):
    rejections = FeedbackLoopService.get_rejections_for_project(project_id)
    return {
        "project_id": project_id,
        "count": len(rejections),
        "rejections": [r.model_dump() for r in rejections]
    }
