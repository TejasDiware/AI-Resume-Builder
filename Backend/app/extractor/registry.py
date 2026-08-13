from app.extractor.name_extractor import extract_name
from app.extractor.email_extractor import extract_email
from app.extractor.phone_extractor import extract_phone
from app.extractor.skills_extractor import extract_skills
from app.extractor.education_extractor import extract_education
from app.extractor.experience_extractor import extract_experience

ENTITY_EXTRACTORS = {
    "name": extract_name,
    "email": extract_email,
    "phone": extract_phone,
    "skills": extract_skills,
    "education": extract_education,
    "experience": extract_experience,
}