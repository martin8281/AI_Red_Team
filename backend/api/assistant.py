from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

# Pydantic schema for POST /api/assistant/chat
class ChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    project_id: str = Field(..., description="Parent engagement project ID")
    context_type: str = Field(..., description="Context category: project, finding, scope, risk, evidence")
    context_id: Optional[str] = Field(None, description="Specific finding or scope ID if applicable")
    message: str = Field(..., description="User prompt or inquiry")
    quick_action: Optional[str] = Field(None, description="Predefined quick action identifier")

class ChatResponse(BaseModel):
    conversation_id: str
    message_id: str
    role: str = "assistant"
    structured_response: Dict[str, Any]
    metadata: Dict[str, Any]
