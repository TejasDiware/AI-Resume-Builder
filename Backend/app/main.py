from fastapi import FastAPI

app = FastAPI(
    title="AI Resume Builder API",
    version="1.0.0",
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