from pydantic import BaseModel, ConfigDict, Field


class AchievementCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    organization: str | None = Field(default=None, max_length=200)
    year: int | None = None


class AchievementUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    organization: str | None = Field(default=None, max_length=200)
    year: int | None = None


class AchievementResponse(BaseModel):
    id: int
    resume_id: int
    title: str
    description: str | None
    organization: str | None
    year: int | None

    model_config = ConfigDict(from_attributes=True)