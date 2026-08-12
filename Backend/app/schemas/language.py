from pydantic import BaseModel, ConfigDict, Field


class LanguageCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    proficiency: str | None = Field(default=None, max_length=50)


class LanguageUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    proficiency: str | None = Field(default=None, max_length=50)


class LanguageResponse(BaseModel):
    id: int
    resume_id: int
    name: str
    proficiency: str | None

    model_config = ConfigDict(from_attributes=True)