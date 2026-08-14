# AI Resume Builder - Backend

AI-powered resume builder backend built with **FastAPI**, **PostgreSQL**, **SQLAlchemy**, **Alembic**, **Groq AI**, and **Docker**.

The backend provides resume upload and parsing, AI-powered resume improvement, ATS analysis, job-description analysis, tailored resume generation, resume quality scoring, and PDF generation.

---

## Features

- User registration and login
- JWT-based authentication
- Password hashing
- Candidate profile management
- Resume CRUD operations
- Resume upload and parsing
- PDF and DOCX resume parsing
- AI-powered resume text improvement
- AI-powered project improvement
- AI-powered experience improvement
- AI-powered summary improvement
- Full AI resume generation
- Job description management
- AI job-description analysis
- ATS score calculation
- ATS optimization recommendations
- Section-level ATS optimization
- Tailored resume generation
- Apply tailored resume changes
- Resume quality scoring
- AI resume quality recommendations
- PDF resume generation
- Classic, Modern, and Professional PDF templates
- PostgreSQL database
- Alembic database migrations
- Docker and Docker Compose support
- Automated pytest test suite

---

# Tech Stack

| Technology | Purpose |
|---|---|
| Python 3.12+ | Backend language |
| FastAPI | REST API framework |
| PostgreSQL | Production database |
| SQLAlchemy | ORM |
| Alembic | Database migrations |
| Pydantic | Data validation |
| Groq | LLM/AI provider |
| PyMuPDF / pdfplumber | PDF processing |
| python-docx | DOCX processing |
| ReportLab | PDF generation |
| JWT | Authentication |
| bcrypt/passlib | Password hashing |
| pytest | Automated testing |
| Docker | Containerization |
| Docker Compose | Multi-container environment |

---

# Project Architecture

```text
backend/
│
├── app/
│   ├── ai/
│   │   ├── context_builder.py
│   │   ├── jd_schemas.py
│   │   ├── prompts.py
│   │   ├── provider.py
│   │   ├── schemas.py
│   │   └── service.py
│   │
│   ├── api/
│   │   ├── dependencies.py
│   │   └── routes/
│   │
│   ├── ats/
│   │   ├── schemas.py
│   │   └── service.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   └── security.py
│   │
│   ├── database/
│   │   ├── base.py
│   │   └── session.py
│   │
│   ├── models/
│   │
│   ├── parser/
│   │   ├── document_parser.py
│   │   ├── docx_parser.py
│   │   └── pdf_parser.py
│   │
│   ├── pdf/
│   │   ├── generator.py
│   │   └── templates.py
│   │
│   ├── quality/
│   │   ├── schemas.py
│   │   └── service.py
│   │
│   ├── schemas/
│   │
│   ├── services/
│   │   └── resume_upload_service.py
│   │
│   └── main.py
│
├── alembic/
│   ├── versions/
│   └── env.py
│
├── tests/
│
├── uploads/
│
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── alembic.ini
├── .env
└── README.md
