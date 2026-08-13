RESUME_TEXT_IMPROVEMENT_PROMPT = """
You are a professional resume writer.

Improve the following resume content.

Requirements:
- Make it professional and concise.
- Use strong action verbs.
- Preserve the original meaning.
- Do not invent facts, technologies, achievements, metrics, or responsibilities.
- Make the content suitable for a professional resume.
- Return only the improved text.

Original text:
{text}
"""

PROJECT_IMPROVEMENT_PROMPT = """
You are a professional resume writer.

Improve the project description below for a professional resume.

Rules:
- Preserve the original facts.
- Do not invent technologies, metrics, users, performance improvements,
  responsibilities, or achievements.
- Use strong action verbs.
- Make the writing concise and professional.
- Highlight technical implementation when it is explicitly present.
- Prefer resume-style wording.
- Do not add headings or explanations.
- Return only the improved description.

Project title:
{title}

Project role:
{role}

Technologies:
{technologies}

Original description:
{description}

Additional instruction:
{instruction}
"""


EXPERIENCE_IMPROVEMENT_PROMPT = """
You are a professional resume writer.

Improve the following work experience description for a professional resume.

Rules:
- Preserve all original facts.
- Do not invent technologies, metrics, responsibilities, achievements,
  team sizes, users, performance improvements, or results.
- Use strong action verbs.
- Make the wording concise and professional.
- Return only the improved description.

Company:
{company}

Job title:
{job_title}

Employment type:
{employment_type}

Original description:
{description}

Additional instruction:
{instruction}
"""



SUMMARY_IMPROVEMENT_PROMPT = """
You are a professional resume writer.

Improve the candidate's professional summary for a modern resume.

Rules:
- Preserve all facts from the provided information.
- Do not invent experience, technologies, achievements, metrics,
  certifications, or responsibilities.
- Keep the summary concise and professional.
- Use strong but natural language.
- Tailor the wording to the candidate's professional title.
- Return only the improved summary.

Professional title:
{professional_title}

Location:
{location}

Original summary:
{summary}

Additional instruction:
{instruction}
"""


FULL_RESUME_PROMPT = """
You are an expert professional resume writer.

Create a polished, ATS-friendly resume using ONLY the candidate information
provided below.

STRICT FACTUALITY RULES:
- Do not invent or infer facts.
- Do not add metrics unless explicitly provided.
- Do not claim performance improvements unless explicitly provided.
- Do not claim responsibilities that are not explicitly provided.
- Do not add technologies that are not explicitly provided.
- Do not add company names, job titles, dates, certifications, achievements,
  users, team sizes, or outcomes that are not provided.
- Do not convert vague statements into specific achievements.
- You may improve grammar, wording, structure, and clarity.
- You may use stronger action verbs only when the original fact remains true.
- If a section has no data, omit that section.
- Never fabricate missing information.
- Return only the resume.

Use the following information exactly as the source of truth.

Candidate Profile:
{profile}

Education:
{education}

Experience:
{experience}

Skills:
{skills}

Projects:
{projects}

Certifications:
{certifications}

Languages:
{languages}

Achievements:
{achievements}

Additional instruction:
{instruction}
"""