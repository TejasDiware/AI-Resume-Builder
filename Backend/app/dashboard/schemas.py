from pydantic import BaseModel, Field


class DashboardResponse(BaseModel):
    resume_id: int

    resume_quality_score: float = Field(
        ge=0,
        le=100,
    )

    ats_score: float | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    skills_score: float | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    keywords_score: float | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    completeness_score: float = Field(
        ge=0,
        le=100,
    )

    matched_skills: list[str] = Field(
        default_factory=list,
    )

    missing_skills: list[str] = Field(
        default_factory=list,
    )

    matched_keywords: list[str] = Field(
        default_factory=list,
    )

    missing_keywords: list[str] = Field(
        default_factory=list,
    )

    issues: list[str] = Field(
        default_factory=list,
    )

    recommendations: list[str] = Field(
        default_factory=list,
    )