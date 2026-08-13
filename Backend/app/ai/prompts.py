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


JOB_DESCRIPTION_ANALYSIS_PROMPT = """
You are an expert job-description analyzer.

Analyze the job description below and extract structured information.

STRICT RULES:
- Extract only information explicitly present in the job description.
- Do not invent requirements.
- Do not infer skills that are not stated.
- Keep technology and skill names close to their original wording.
- Avoid duplicate skills.
- Return ONLY valid JSON.
- Do not include markdown fences.
- Do not include explanations.

Return exactly this JSON structure:

{{
  "job_title": "string or null",
  "required_skills": [],
  "preferred_skills": [],
  "experience_requirements": [],
  "education_requirements": [],
  "keywords": []
}}

Job title:
{title}

Company:
{company}

Job description:
{description}
"""

ATS_OPTIMIZATION_PROMPT = """
You are an expert resume optimization assistant.

Analyze the ATS evaluation below and provide actionable resume improvement
recommendations for the candidate.

STRICT RULES:
- Never invent skills, technologies, achievements, metrics, companies,
  responsibilities, or experience.
- Never tell the candidate to claim a skill they do not have.
- Missing skills must be clearly labeled as missing.
- Suggest adding a missing skill ONLY if the candidate genuinely has it.
- Focus on improvements that can increase relevance to the job description.
- Prioritize the most important improvements first.
- Be concise and practical.
- Return ONLY valid JSON.
- Do not use markdown fences.

Return exactly:

{{
  "priority": [],
  "recommendations": []
}}

ATS Score:
{score}

Matched Skills:
{matched_skills}

Missing Skills:
{missing_skills}

Matched Keywords:
{matched_keywords}

Missing Keywords:
{missing_keywords}

Resume Profile:
{profile}

Resume Experience:
{experience}

Resume Projects:
{projects}

Job Description:
{job_description}
"""



SECTION_OPTIMIZATION_PROMPT = """
You are an expert resume optimization assistant.

Improve ONLY the requested resume section for the target job.

STRICT RULES:
- Preserve all factual information.
- Never invent technologies, metrics, achievements, responsibilities,
  companies, dates, users, or results.
- Do not add missing skills unless they are already supported by the
  candidate's provided information.
- Improve clarity, relevance, wording, and ATS alignment.
- Naturally incorporate relevant job-description terminology only when
  it accurately describes the candidate's experience.
- Do not change facts.
- Return ONLY valid JSON.
- Do not use markdown fences.

Return exactly:

{{
  "optimized_content": "string",
  "changes": []
}}

Section:
{section}

Original content:
{original_content}

Job description:
{job_description}

ATS missing skills:
{missing_skills}

ATS missing keywords:
{missing_keywords}

Additional instruction:
{instruction}
"""



TAILORED_RESUME_PROMPT = """
You are an expert resume writer specializing in ATS optimization.

Create a tailored version of the candidate's resume for the target job
description.

STRICT RULES:
- Use ONLY facts contained in the candidate resume context.
- Never invent skills, technologies, companies, responsibilities,
  achievements, metrics, dates, users, or experience.
- Do not add a missing skill unless it is supported by the candidate's
  existing resume information.
- Prioritize experience and projects most relevant to the target job.
- Naturally use job-description terminology when it accurately matches
  the candidate's existing experience.
- Improve wording, clarity, relevance, and ATS alignment.
- Do not fabricate achievements to improve the score.
- Keep the resume professional and concise.
- Return ONLY the tailored resume.
- Do not include explanations about the tailoring process.

Candidate Resume:

Profile:
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

Target Job Description:
{job_description}

Additional instruction:
{instruction}
"""


AI_RESUME_QUALITY_PROMPT = """
You are an expert resume reviewer and ATS optimization assistant.

Analyze the candidate's resume quality information and provide practical
improvement recommendations.

STRICT RULES:
- Do not invent facts.
- Do not invent skills, technologies, achievements, metrics,
  responsibilities, companies, dates, or experience.
- Never tell the candidate to claim a skill they do not have.
- Recommendations must be based on the supplied resume content and scores.
- Prioritize the most important improvements.
- Be concise and actionable.
- Focus on clarity, completeness, ATS readiness, and professional presentation.
- Return ONLY valid JSON.
- Do not use markdown fences.

Return exactly:

{{
  "priority": [],
  "recommendations": []
}}

Resume quality score:
{overall_score}

Completeness score:
{completeness_score}

Content quality score:
{content_quality_score}

ATS readiness score:
{ats_readiness_score}

Section scores:
{sections}

Issues:
{issues}

Candidate resume:
{resume_context}
"""