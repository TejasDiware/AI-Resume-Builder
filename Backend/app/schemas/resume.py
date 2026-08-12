from pydantic import BaseModel, ConfigDict, Field

from app.models.resume import ResumeStatus, ResumeTemplate


class ResumeCreate(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    template: ResumeTemplate = ResumeTemplate.CLASSIC


class ResumeUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=150)
    template: ResumeTemplate | None = None
    status: ResumeStatus | None = None


class ResumeResponse(BaseModel):
    id: int
    user_id: int
    title: str
    template: ResumeTemplate
    status: ResumeStatus

    model_config = ConfigDict(from_attributes=True)