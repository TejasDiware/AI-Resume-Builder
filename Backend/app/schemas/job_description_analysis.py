from datetime import datetime

from pydantic import BaseModel, ConfigDict


class JobDescriptionAnalysisResponse(BaseModel):
    id: int
    job_description_id: int
    job_title: str | None
    required_skills: list[str]
    preferred_skills: list[str]
    experience_requirements: list[str]
    education_requirements: list[str]
    keywords: list[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)