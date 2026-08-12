from datetime import date

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class CertificationCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    issuing_organization: str = Field(min_length=1, max_length=200)
    issue_date: date | None = None
    expiration_date: date | None = None
    credential_id: str | None = Field(default=None, max_length=150)
    credential_url: HttpUrl | None = None


class CertificationUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    issuing_organization: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )
    issue_date: date | None = None
    expiration_date: date | None = None
    credential_id: str | None = Field(default=None, max_length=150)
    credential_url: HttpUrl | None = None


class CertificationResponse(BaseModel):
    id: int
    resume_id: int
    name: str
    issuing_organization: str
    issue_date: date | None
    expiration_date: date | None
    credential_id: str | None
    credential_url: str | None

    model_config = ConfigDict(from_attributes=True)