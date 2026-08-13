from app.extractor.email_extractor import extract_email
from app.extractor.phone_extractor import extract_phone
from app.extractor.name_extractor import extract_name
from app.extractor.skills_extractor import extract_skills
from app.extractor.education_extractor import extract_education
from app.extractor.experience_extractor import extract_experience
from app.extractor.project_extractor import extract_projects
from app.extractor.certification_extractor import extract_certifications
from app.extractor.contact_extractor import (
    extract_address,
    extract_github,
    extract_linkedin,
    extract_portfolio
)


def extract_basic_info(text: str):
    return {
        "name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "skills": extract_skills(text),
        "education": extract_education(text),
        "experience": extract_experience(text),
        "address": extract_address(text),
        "github": extract_github(text),
        "linkedin": extract_linkedin(text),
        "portfolio": extract_portfolio(text),
        "projects": extract_projects(text),
        "certifications": extract_certifications(text)
    }