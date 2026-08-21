from pydantic import BaseModel, ConfigDict, Field

from app.models.resume import ResumeStatus, ResumeTemplate


# ==========================================================
# Create Resume
# ==========================================================

class ResumeCreate(BaseModel):
    title: str = Field(
        min_length=1,
        max_length=150,
    )

    job_description_id: int | None = Field(
        default=None,
        ge=1,
    )

    # Actual frontend template ID.
    #
    # Example:
    # 1  = Dark Navy Sidebar
    # 17 = Enhancv Timeline
    # 27 = Richard Sanchez
    template_id: int = Field(
        default=1,
        ge=1,
    )

    # Existing template category.
    # Kept for backward compatibility.
    template: ResumeTemplate = ResumeTemplate.CLASSIC


# ==========================================================
# Update Resume
# ==========================================================

class ResumeUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=150,
    )

    job_description_id: int | None = Field(
        default=None,
        ge=1,
    )

    template_id: int | None = Field(
        default=None,
        ge=1,
    )

    template: ResumeTemplate | None = None

    status: ResumeStatus | None = None


# ==========================================================
# Resume Response
# ==========================================================

class ResumeResponse(BaseModel):
    id: int
    user_id: int
    title: str

    job_description_id: int | None

    # Actual frontend template ID
    template_id: int

    # Existing template category
    template: ResumeTemplate

    status: ResumeStatus

    model_config = ConfigDict(
        from_attributes=True,
    )