from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class CandidateProfileCreate(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    phone: str | None = Field(default=None, max_length=30)
    professional_title: str | None = Field(default=None, max_length=150)
    summary: str | None = None
    location: str | None = Field(default=None, max_length=255)
    linkedin_url: HttpUrl | None = None
    github_url: HttpUrl | None = None
    portfolio_url: HttpUrl | None = None


class CandidateProfileUpdate(BaseModel):
    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    phone: str | None = Field(default=None, max_length=30)
    professional_title: str | None = Field(default=None, max_length=150)
    summary: str | None = None
    location: str | None = Field(default=None, max_length=255)
    linkedin_url: HttpUrl | None = None
    github_url: HttpUrl | None = None
    portfolio_url: HttpUrl | None = None


class CandidateProfileResponse(BaseModel):
    id: int
    user_id: int
    first_name: str
    last_name: str
    phone: str | None
    professional_title: str | None
    summary: str | None
    location: str | None
    linkedin_url: str | None
    github_url: str | None
    portfolio_url: str | None

    model_config = ConfigDict(from_attributes=True)