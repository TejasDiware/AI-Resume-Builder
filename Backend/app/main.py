from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database.session import engine
from app.api.routes.auth import router as auth_router
from app.api.routes.profile import router as profile_router
from app.api.routes.resume import router as resume_router
from app.api.routes.education import router as education_router
from app.api.routes.experience import router as experience_router
from app.api.routes.skill import router as skill_router
from app.api.routes.project import router as project_router
from app.api.routes.certification import router as certification_router
from app.api.routes.language import router as language_router
from app.api.routes.achievement import router as achievement_router
from app.api.routes.ai import router as ai_router
from app.api.routes.job_description import router as job_description_router
from app.api.routes.ats import router as ats_router
from app.api.routes.pdf import router as pdf_router
from app.api.routes.quality import router as quality_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.resume_upload import (
    router as resume_upload_router,
)



app = FastAPI(
    title="AI Resume Builder API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    resume_upload_router,
    prefix="/api/v1",
)

app.include_router(
    dashboard_router,
    prefix="/api/v1",
)

app.include_router(
    auth_router,
    prefix="/api/v1",
)


app.include_router(
    profile_router,
    prefix="/api/v1",
)

app.include_router(
    resume_router,
    prefix="/api/v1",
)

app.include_router(
    education_router,
    prefix="/api/v1",
)

app.include_router(
    experience_router,
    prefix="/api/v1",
)

app.include_router(
    skill_router,
    prefix="/api/v1",
)

app.include_router(
    project_router,
    prefix="/api/v1",
)

app.include_router(
    certification_router,
    prefix="/api/v1",
)

app.include_router(
    language_router,
    prefix="/api/v1",
)

app.include_router(
    achievement_router,
    prefix="/api/v1",
)

app.include_router(
    ai_router,
    prefix="/api/v1",
)


app.include_router(
    job_description_router,
    prefix="/api/v1",
)

app.include_router(
    ats_router,
    prefix="/api/v1",
)

app.include_router(
    pdf_router,
    prefix="/api/v1",
)

app.include_router(
    quality_router,
    prefix="/api/v1",
)
@app.get("/")
def root():
    return {
        "message": "AI Resume Builder API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.get("/health/db")
def database_health():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    return {
        "database": "connected"
    }
