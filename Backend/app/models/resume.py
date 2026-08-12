from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class ResumeTemplate(str, Enum):
    CLASSIC = "classic"
    MODERN = "modern"
    PROFESSIONAL = "professional"


class ResumeStatus(str, Enum):
    DRAFT = "draft"
    COMPLETED = "completed"


class Resume(Base):
    __tablename__ = "resumes"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    template: Mapped[ResumeTemplate] = mapped_column(
        nullable=False,
        default=ResumeTemplate.CLASSIC,
    )

    status: Mapped[ResumeStatus] = mapped_column(
        nullable=False,
        default=ResumeStatus.DRAFT,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="resumes",
    )

    education = relationship(
    "Education",
    back_populates="resume",
    cascade="all, delete-orphan",
)

    experience = relationship(
    "Experience",
    back_populates="resume",
    cascade="all, delete-orphan",
)

    skills = relationship(
    "Skill",
    back_populates="resume",
    cascade="all, delete-orphan",
)

    projects = relationship(
    "Project",
    back_populates="resume",
    cascade="all, delete-orphan",
)

    certifications = relationship(
    "Certification",
    back_populates="resume",
    cascade="all, delete-orphan",
)

    languages = relationship(
    "Language",
    back_populates="resume",
    cascade="all, delete-orphan",
)

    achievements = relationship(
    "Achievement",
    back_populates="resume",
    cascade="all, delete-orphan",
)