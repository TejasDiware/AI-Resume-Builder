from pydantic import BaseModel, Field


class ImproveTextRequest(BaseModel):
    text: str = Field(
        min_length=1,
        max_length=5000,
    )


class ImproveTextResponse(BaseModel):
    original_text: str
    improved_text: str

class ImproveProjectRequest(BaseModel):
    instruction: str | None = Field(
        default=None,
        max_length=1000,
    )


class ImproveProjectResponse(BaseModel):
    project_id: int
    original_description: str | None
    improved_description: str   


class ImproveExperienceRequest(BaseModel):
    instruction: str | None = Field(
        default=None,
        max_length=1000,
    )


class ImproveExperienceResponse(BaseModel):
    experience_id: int
    original_description: str | None
    improved_description: str   


class ImproveSummaryRequest(BaseModel):
    instruction: str | None = Field(
        default=None,
        max_length=1000,
    )


class ImproveSummaryResponse(BaseModel):
    original_summary: str | None
    improved_summary: str 




class GenerateResumeRequest(BaseModel):
    instruction: str | None = Field(
        default=None,
        max_length=2000,
    )


class GeneratedResumeResponse(BaseModel):
    resume_id: int
    content: str       


class GenerateAndSaveResumeResponse(BaseModel):
    resume_id: int
    version_id: int
    version_number: int
    content: str




class TailoredResumeRequest(BaseModel):
    instruction: str | None = Field(
        default=None,
        max_length=2000,
    )


class TailoredResumeResponse(BaseModel):
    resume_id: int
    job_description_id: int
    content: str

class GenerateAndSaveTailoredResumeResponse(BaseModel):
    resume_id: int
    job_description_id: int
    version_id: int
    version_number: int
    content: str