from pydantic import BaseModel, Field

from app.ai.schemas import AIChange


class ATSScoreResponse(BaseModel):
    resume_id: int
    job_description_id: int

    overall_score: float = Field(
        ge=0,
        le=100,
    )

    skills_score: float = Field(
        ge=0,
        le=100,
    )

    keywords_score: float = Field(
        ge=0,
        le=100,
    )

    completeness_score: float = Field(
        ge=0,
        le=100,
    )

    experience_score: float = Field(
        ge=0,
        le=100,
    )

    education_score: float = Field(
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

    recommendations: list[str] = Field(
        default_factory=list,
    )


class ATSOptimizationResponse(BaseModel):
    resume_id: int
    job_description_id: int

    current_score: float = Field(
        ge=0,
        le=100,
    )

    priority: list[str] = Field(
        default_factory=list,
    )

    recommendations: list[str] = Field(
        default_factory=list,
    )

    changes: list[AIChange] = Field(
        default_factory=list,
    )


class OptimizeSectionRequest(BaseModel):
    section: str = Field(
        min_length=1,
        max_length=50,
    )

    instruction: str | None = Field(
        default=None,
        max_length=1000,
    )


class OptimizeSectionResponse(BaseModel):
    resume_id: int
    section: str

    original_content: str

    optimized_content: str

    changes: list[AIChange] = Field(
        default_factory=list,
    )