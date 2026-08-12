from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.database.session import get_db
from app.models.project import Project
from app.models.resume import Resume
from app.models.user import User
from app.schemas.project import (
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
)


router = APIRouter(
    prefix="/resumes/{resume_id}/projects",
    tags=["Projects"],
)


def get_user_resume(
    resume_id: int,
    current_user: User,
    db: Session,
) -> Resume:
    resume = db.scalar(
        select(Resume).where(
            Resume.id == resume_id,
            Resume.user_id == current_user.id,
        )
    )

    if resume is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found",
        )

    return resume


def normalize_project_data(data: dict) -> dict:
    if data.get("project_url") is not None:
        data["project_url"] = str(data["project_url"])

    return data


@router.post(
    "",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_project(
    resume_id: int,
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_resume(resume_id, current_user, db)

    data = normalize_project_data(
        project_data.model_dump()
    )

    project = Project(
        resume_id=resume_id,
        **data,
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    return project



@router.get(
    "",
    response_model=list[ProjectResponse],
)
def get_projects(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_resume(resume_id, current_user, db)

    projects = db.scalars(
        select(Project)
        .where(Project.resume_id == resume_id)
        .order_by(
            Project.start_date.desc().nullslast(),
            Project.id.desc(),
        )
    ).all()

    return projects


@router.put(
    "/{project_id}",
    response_model=ProjectResponse,
)
def update_project(
    resume_id: int,
    project_id: int,
    project_data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_resume(resume_id, current_user, db)

    project = db.scalar(
        select(Project).where(
            Project.id == project_id,
            Project.resume_id == resume_id,
        )
    )

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    update_data = project_data.model_dump(exclude_unset=True)
    update_data = normalize_project_data(update_data)

    for field, value in update_data.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)

    return project



@router.delete(
    "/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_project(
    resume_id: int,
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_user_resume(resume_id, current_user, db)

    project = db.scalar(
        select(Project).where(
            Project.id == project_id,
            Project.resume_id == resume_id,
        )
    )

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    db.delete(project)
    db.commit()