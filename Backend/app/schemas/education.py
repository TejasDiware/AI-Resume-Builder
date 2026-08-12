from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class EducationCreate(BaseModel):
    institution: str = Field(min_length=1, max_length=200)
    degree: str = Field(min_length=1, max_length=150)
    field_of_study: str | None = Field(default=None, max_length=150)
    start_date: date | None = None
    end_date: date | None = None
    description: str | None = None


class EducationUpdate(BaseModel):
    institution: str | None = Field(default=None, min_length=1, max_length=200)
    degree: str | None = Field(default=None, min_length=1, max_length=150)
    field_of_study: str | None = Field(default=None, max_length=150)
    start_date: date | None = None
    end_date: date | None = None
    description: str | None = None


class EducationResponse(BaseModel):
    id: int
    resume_id: int
    institution: str
    degree: str
    field_of_study: str | None
    start_date: date | None
    end_date: date | None
    description: str | None

    model_config = ConfigDict(from_attributes=True)