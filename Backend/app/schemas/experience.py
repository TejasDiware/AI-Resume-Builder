from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class ExperienceCreate(BaseModel):
    company: str = Field(min_length=1, max_length=200)
    job_title: str = Field(min_length=1, max_length=150)
    location: str | None = Field(default=None, max_length=150)
    employment_type: str | None = Field(default=None, max_length=100)
    start_date: date | None = None
    end_date: date | None = None
    is_current: bool = False
    description: str | None = None


class ExperienceUpdate(BaseModel):
    company: str | None = Field(default=None, min_length=1, max_length=200)
    job_title: str | None = Field(default=None, min_length=1, max_length=150)
    location: str | None = Field(default=None, max_length=150)
    employment_type: str | None = Field(default=None, max_length=100)
    start_date: date | None = None
    end_date: date | None = None
    is_current: bool | None = None
    description: str | None = None


class ExperienceResponse(BaseModel):
    id: int
    resume_id: int
    company: str
    job_title: str
    location: str | None
    employment_type: str | None
    start_date: date | None
    end_date: date | None
    is_current: bool
    description: str | None

    model_config = ConfigDict(from_attributes=True)