from pydantic import BaseModel, Field


class JobDescriptionAnalysis(BaseModel):
    job_title: str | None = None

    required_skills: list[str] = Field(
        default_factory=list,
    )

    preferred_skills: list[str] = Field(
        default_factory=list,
    )

    experience_requirements: list[str] = Field(
        default_factory=list,
    )

    education_requirements: list[str] = Field(
        default_factory=list,
    )

    keywords: list[str] = Field(
        default_factory=list,
    )