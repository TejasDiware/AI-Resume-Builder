from pydantic import BaseModel, Field

from typing import Literal

from pydantic import BaseModel, Field


class ApplyAIChangeRequest(BaseModel):
    section: Literal[
        "summary",
        "experience",
        "project",
        "skill",
        "education",
        "certification",
        "language",
        "achievement",
    ]

    target_id: int | None = None

    content: str = Field(
        min_length=1,
        max_length=10000,
    )


class ImproveTextRequest(BaseModel):
    text: str = Field(
        min_length=1,
        max_length=5000,
    )


class ImproveTextResponse(BaseModel):
    original_text: str
    improved_text: str

class ImproveProjectRequest(BaseModel):
    instruction: str | None = Field(
        default=None,
        max_length=1000,
    )


class ImproveProjectResponse(BaseModel):
    project_id: int
    original_description: str | None
    improved_description: str   


class ImproveExperienceRequest(BaseModel):
    instruction: str | None = Field(
        default=None,
        max_length=1000,
    )


class ImproveExperienceResponse(BaseModel):
    experience_id: int
    original_description: str | None
    improved_description: str   


class ImproveSummaryRequest(BaseModel):
    instruction: str | None = Field(
        default=None,
        max_length=1000,
    )


class ImproveSummaryResponse(BaseModel):
    original_summary: str | None
    improved_summary: str 




class GenerateResumeRequest(BaseModel):
    instruction: str | None = Field(
        default=None,
        max_length=2000,
    )


class GeneratedExperienceUpdate(BaseModel):
    id: int
    description: str


class GeneratedProjectUpdate(BaseModel):
    id: int
    description: str


class GeneratedResumeContent(BaseModel):
    summary: str = ""
    experience: list[GeneratedExperienceUpdate] = Field(
        default_factory=list
    )
    projects: list[GeneratedProjectUpdate] = Field(
        default_factory=list
    )

class GeneratedResumeResponse(BaseModel):
    resume_id: int
    content: str       


class GenerateAndSaveResumeResponse(BaseModel):
    resume_id: int
    version_id: int
    version_number: int
    content: str




class TailoredResumeRequest(BaseModel):
    instruction: str | None = Field(
        default=None,
        max_length=2000,
    )


class TailoredResumeResponse(BaseModel):
    resume_id: int
    job_description_id: int
    content: str

class GenerateAndSaveTailoredResumeResponse(BaseModel):
    resume_id: int
    job_description_id: int
    version_id: int
    version_number: int
    content: str


class TailoredResumeContent(BaseModel):
    summary: str
    skills: list[str]
    experience: list[str]
    projects: list[str]


class TailoredResumeResponse(BaseModel):
    resume_id: int
    job_description_id: int
    content: str
    structured: TailoredResumeContent | None = None

class ApplyTailoredResumeRequest(BaseModel):
    summary: str | None = None
    skill_ids: list[int] = Field(default_factory=list)
    experience_updates: dict[int, str] = Field(default_factory=dict)
    project_updates: dict[int, str] = Field(default_factory=dict)

class GeneratedTailoredExperience(BaseModel):
    id: int
    description: str


class GeneratedTailoredProject(BaseModel):
    id: int
    description: str


class GeneratedTailoredContent(BaseModel):
    summary: str = ""
    experience: list[GeneratedTailoredExperience] = Field(
        default_factory=list
    )
    projects: list[GeneratedTailoredProject] = Field(
        default_factory=list
    )