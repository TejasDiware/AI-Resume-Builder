from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class ParsedContact(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin: str = ""
    github: str = ""
    portfolio: str = ""


class ParsedEducation(BaseModel):
    model_config = ConfigDict(extra="forbid")

    institution: str = ""
    degree: str = ""
    field_of_study: str = ""
    start_year: int = 0
    end_year: int = 0
    cgpa: str = ""
    percentage: str = ""


class ParsedExperience(BaseModel):
    model_config = ConfigDict(extra="forbid")

    company: str = ""
    job_title: str = ""
    location: str = ""
    employment_type: str = ""
    start_date: str = ""
    end_date: str = ""
    is_current: bool = False
    description: str = ""


class ParsedProject(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = ""
    role: str = ""
    description: str = ""
    technologies: list[str] = Field(default_factory=list)
    project_url: str = ""
    start_date: str = ""
    end_date: str = ""


class ParsedCertification(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = ""
    issuing_organization: str = ""
    issue_date: str = ""
    expiration_date: str = ""
    credential_id: str = ""
    credential_url: str = ""


class ParsedLanguage(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = ""
    proficiency: str = ""


class ParsedAchievement(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = ""
    description: str = ""
    organization: str = ""
    year: int = 0


class ParsedResume(BaseModel):
    model_config = ConfigDict(extra="forbid")

    contact: ParsedContact = Field(
        default_factory=ParsedContact
    )

    summary: str = ""

    skills: list[str] = Field(
        default_factory=list
    )

    education: list[ParsedEducation] = Field(
        default_factory=list
    )

    experience: list[ParsedExperience] = Field(
        default_factory=list
    )

    projects: list[ParsedProject] = Field(
        default_factory=list
    )

    certifications: list[ParsedCertification] = Field(
        default_factory=list
    )

    languages: list[ParsedLanguage] = Field(
        default_factory=list
    )

    achievements: list[ParsedAchievement] = Field(
        default_factory=list
    )