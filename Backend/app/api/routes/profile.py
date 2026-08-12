from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.database.session import get_db
from app.models.candidate_profile import CandidateProfile
from app.models.user import User
from app.schemas.profile import (
    CandidateProfileCreate,
    CandidateProfileResponse,
    CandidateProfileUpdate,
)


router = APIRouter(
    prefix="/profile",
    tags=["Candidate Profile"],
)


@router.post(
    "",
    response_model=CandidateProfileResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_profile(
    profile_data: CandidateProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing_profile = db.scalar(
        select(CandidateProfile).where(
            CandidateProfile.user_id == current_user.id
        )
    )

    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Candidate profile already exists",
        )

    profile_data_dict = profile_data.model_dump()

    for field in (
        "linkedin_url",
        "github_url",
        "portfolio_url",
    ):
        if profile_data_dict[field] is not None:
            profile_data_dict[field] = str(profile_data_dict[field])

    profile = CandidateProfile(
        user_id=current_user.id,
        **profile_data_dict,
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


@router.get(
    "",
    response_model=CandidateProfileResponse,
)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.scalar(
        select(CandidateProfile).where(
            CandidateProfile.user_id == current_user.id
        )
    )

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile not found",
        )

    return profile


@router.put(
    "",
    response_model=CandidateProfileResponse,
)
def update_profile(
    profile_data: CandidateProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.scalar(
        select(CandidateProfile).where(
            CandidateProfile.user_id == current_user.id
        )
    )

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile not found",
        )

    update_data = profile_data.model_dump(exclude_unset=True)

    for field in (
        "linkedin_url",
        "github_url",
        "portfolio_url",
    ):
        if field in update_data and update_data[field] is not None:
            update_data[field] = str(update_data[field])

    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    return profile


@router.delete(
    "",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.scalar(
        select(CandidateProfile).where(
            CandidateProfile.user_id == current_user.id
        )
    )

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile not found",
        )

    db.delete(profile)
    db.commit()