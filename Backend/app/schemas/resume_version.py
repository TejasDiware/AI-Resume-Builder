from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ResumeVersionCreate(BaseModel):
    content: str


class ResumeVersionResponse(BaseModel):
    id: int
    resume_id: int
    version_number: int
    content: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)