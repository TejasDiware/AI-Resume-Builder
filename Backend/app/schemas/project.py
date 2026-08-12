from datetime import date

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class ProjectCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    role: str | None = Field(default=None, max_length=150)
    technologies: str | None = None
    project_url: HttpUrl | None = None
    start_date: date | None = None
    end_date: date | None = None


class ProjectUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    role: str | None = Field(default=None, max_length=150)
    technologies: str | None = None
    project_url: HttpUrl | None = None
    start_date: date | None = None
    end_date: date | None = None


class ProjectResponse(BaseModel):
    id: int
    resume_id: int
    title: str
    description: str | None
    role: str | None
    technologies: str | None
    project_url: str | None
    start_date: date | None
    end_date: date | None

    model_config = ConfigDict(from_attributes=True)