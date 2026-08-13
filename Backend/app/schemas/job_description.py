from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class JobDescriptionCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    company: str | None = Field(default=None, max_length=200)
    description: str = Field(min_length=1)


class JobDescriptionUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    company: str | None = Field(default=None, max_length=200)
    description: str | None = Field(default=None, min_length=1)


class JobDescriptionResponse(BaseModel):
    id: int
    user_id: int
    title: str
    company: str | None
    description: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)