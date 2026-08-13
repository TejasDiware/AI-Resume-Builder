from pydantic import BaseModel, Field


class ResumeSectionScores(BaseModel):
    summary: float = Field(ge=0, le=100)
    experience: float = Field(ge=0, le=100)
    skills: float = Field(ge=0, le=100)
    projects: float = Field(ge=0, le=100)
    education: float = Field(ge=0, le=100)


class ResumeQualityResponse(BaseModel):
    resume_id: int
    overall_score: float = Field(ge=0, le=100)
    completeness_score: float = Field(ge=0, le=100)
    content_quality_score: float = Field(ge=0, le=100)
    ats_readiness_score: float = Field(ge=0, le=100)

    sections: ResumeSectionScores

    issues: list[str]
    recommendations: list[str]