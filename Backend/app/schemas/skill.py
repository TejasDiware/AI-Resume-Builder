from pydantic import BaseModel, ConfigDict, Field


class SkillCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    category: str | None = Field(default=None, max_length=100)
    proficiency: str | None = Field(default=None, max_length=50)


class SkillUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    category: str | None = Field(default=None, max_length=100)
    proficiency: str | None = Field(default=None, max_length=50)


class SkillResponse(BaseModel):
    id: int
    resume_id: int
    name: str
    category: str | None
    proficiency: str | None

    model_config = ConfigDict(from_attributes=True)