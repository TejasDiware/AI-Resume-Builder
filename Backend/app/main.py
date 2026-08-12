from fastapi import FastAPI
from sqlalchemy import text

from app.database.session import engine
from app.api.routes.auth import router as auth_router
from app.api.routes.profile import router as profile_router
from app.api.routes.resume import router as resume_router
from app.api.routes.education import router as education_router
from app.api.routes.experience import router as experience_router
from app.api.routes.skill import router as skill_router


app = FastAPI(
    title="AI Resume Builder API",
    version="1.0.0",
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
