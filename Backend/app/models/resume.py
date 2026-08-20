from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
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

    # ==========================================================
    # Primary Key
    # ==========================================================

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    # ==========================================================
    # Owner
    # ==========================================================

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # ==========================================================
    # Resume Metadata
    # ==========================================================

    title: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    # Existing high-level template category.
    # Kept for backward compatibility.
    template: Mapped[ResumeTemplate] = mapped_column(
        nullable=False,
        default=ResumeTemplate.CLASSIC,
    )

    # Actual frontend template ID.
    #
    # Examples:
    # 1  -> Dark Navy Sidebar
    # 2  -> Brian Professional
    # 17 -> Enhancv Timeline
    # 27 -> Richard Sanchez
    #
    # This connects the backend resume to the
    # frontend templateMap.
    template_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
        server_default="1",
    )

    # ==========================================================
    # Resume Status
    # ==========================================================

    status: Mapped[ResumeStatus] = mapped_column(
        nullable=False,
        default=ResumeStatus.DRAFT,
    )

    # ==========================================================
    # Timestamps
    # ==========================================================

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

    # ==========================================================
    # User Relationship
    # ==========================================================

    user = relationship(
        "User",
        back_populates="resumes",
    )

    # ==========================================================
    # Resume Section Relationships
    # ==========================================================

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