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

STRICT RULES:
- Use ONLY facts explicitly provided below.
- Never invent experience, technologies, achievements, metrics,
  certifications, responsibilities, employers, or years.
- Never use placeholders.
- Never output [Location], [Company], [Title], [Years of Experience],
  or similar template text.
- Never use example.com or fabricated URLs.
- If location is unavailable, omit location entirely.
- If professional title is unavailable, do not invent one.
- Keep the summary concise and professional.
- Use strong but truthful language.
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

The candidate information is the ONLY source of truth.

STRICT FACTUALITY RULES:
- Never invent or infer facts.
- Never create placeholder values.
- Never use template/example values.
- Never output the word "string" as a value.
- Never output values such as:
  [Location]
  [Company]
  [Job Title]
  [Phone]
  [Email]
  [LinkedIn]
  [GitHub]
  [Portfolio]
  https://example.com/
  example@example.com
  or any similar placeholder/example value.
- Never invent URLs.
- If LinkedIn, GitHub, Portfolio, phone, location, or another field
  is unavailable, OMIT that field completely.
- Never invent a professional title.
- Never invent metrics, percentages, achievements, users, team sizes,
  responsibilities, technologies, certifications, dates, companies,
  or outcomes.
- Never infer a role that is not explicitly provided.
- Never convert a skill into an achievement.
- Never convert a project into work experience.
- Never convert an internship into a permanent job.
- Never add a technology merely because it is commonly associated with
  the candidate's role.
- Preserve all explicitly provided skills.
- Do not remove factual resume information merely to shorten the resume.
- Preserve education, experience, projects, certifications,
  languages, and achievements when they contain data.
- If a section has no data, omit that section.
- You may improve grammar, wording, formatting, ordering, and clarity.
- You may use stronger action verbs only when the resulting statement
  remains factually equivalent to the source.
- Do not add information from your general knowledge.
- Return ONLY the final resume content.
- Do not include explanations, comments, notes, placeholders,
  or generation instructions.

SOURCE INFORMATION
------------------

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

FINAL OUTPUT RULES
------------------

Before producing the final answer, verify:

1. Every factual statement is supported by the source information.
2. No placeholder text exists.
3. No example URL exists.
4. No fabricated contact information exists.
5. No skill from the supplied skills is silently removed.
6. No unsupported job title or professional title is added.
7. Missing information is omitted instead of invented.
8. The result contains only the final resume.
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

Analyze the ATS evaluation and the candidate's resume below.

Your job is to:
1. Explain the most important optimization priorities.
2. Provide concise recommendations.
3. Generate concrete, reviewable resume changes when a legitimate
   improvement can be made.

STRICT RULES:

- Never invent skills, technologies, achievements, metrics, companies,
  responsibilities, education, certifications, projects, or experience.
- Never tell the candidate to claim a skill they do not have.
- Missing skills must remain clearly identified as missing.
- Suggest a missing skill only when the candidate's existing resume
  provides evidence that they genuinely have that skill.
- Never invent a database ID.
- For experience changes, target_id MUST be an ID from
  structured_resume.experience.
- For project changes, target_id MUST be an ID from
  structured_resume.projects.
- For summary changes, target_id MUST be null.
- Never create an experience or project merely to fill a missing skill.
- Never change company names, job titles, dates, institutions,
  certification names, URLs, or other factual identity information.
- Only rewrite existing prose content when the change is supported
  by the candidate's existing resume.
- Preserve the candidate's original meaning and factual claims.
- Do not add unsupported metrics or achievements.
- Do not make unnecessary changes.
- If no safe concrete change can be proposed, return an empty changes
  array.
- The changes are proposals only. Do not assume they have been applied.
- Return ONLY valid JSON.
- Do not use markdown fences.

IMPORTANT:

The frontend will show each item in "changes" to the user.

The user will be able to ACCEPT or REJECT each change.

Therefore every change must contain enough information for the
application to apply it without asking the user for another instruction.

Return exactly:

{{
  "priority": [],
  "recommendations": [],
  "changes": []
}}

Each item in "changes" must have exactly this structure:

{{
  "id": "unique-change-id",
  "action": "update",
  "section": "summary | experience | project",
  "target_id": null,
  "old_content": "existing resume content",
  "new_content": "improved resume content",
  "reason": "why this change improves alignment with the job"
}}

TARGET ID RULES:

- summary:
  target_id must be null.

- experience:
  target_id must be the exact numeric ID from
  structured_resume.experience.

- project:
  target_id must be the exact numeric ID from
  structured_resume.projects.

Do NOT invent IDs.

For experience and project changes:
old_content must correspond to the existing record identified by target_id.

new_content must be a factual improvement of that existing content.

Do not create changes for skills unless the application provides a
verified skill record and the change can be safely applied.

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

Structured Resume:
{structured_resume}

Job Description:
{job_description}
"""



SECTION_OPTIMIZATION_PROMPT = """
You are an expert resume optimization assistant.

Improve ONLY the requested resume section for the target job.

The candidate must remain completely truthful.

STRICT RULES:

- Preserve all factual information.
- Never invent technologies, metrics, achievements, responsibilities,
  companies, dates, users, clients, team sizes, or results.
- Never tell the candidate to claim a skill they do not have.
- Do not add missing skills unless they are already supported by the
  candidate's provided information.
- Improve clarity, relevance, wording, and ATS alignment.
- Naturally incorporate relevant job-description terminology only when
  it accurately describes the candidate's existing experience.
- Do not change factual information.
- Never invent database IDs.
- For experience changes, target_id MUST be an exact ID from
  structured_resume.experience.
- For project changes, target_id MUST be an exact ID from
  structured_resume.projects.
- For summary changes, target_id MUST be null.
- old_content must correspond to the actual existing content.
- new_content must remain factually supported by the original content.
- Do not create experience or project records unless explicitly supported.
- If no safe improvement can be made, return an empty changes array.
- The changes are proposals only and have NOT been applied.
- Return ONLY valid JSON.
- Do not use markdown fences.
- Do not include explanations outside the JSON.

The frontend will display the changes to the user.

The user can ACCEPT or REJECT each individual change.

Therefore each change must contain enough information for the application
to apply it without asking the user for another instruction.

Return exactly:

{{
  "optimized_content": "",
  "changes": []
}}

Each item in "changes" must have exactly this structure:

{{
  "id": "unique-change-id",
  "action": "update",
  "section": "summary | experience | project",
  "target_id": null,
  "old_content": "existing resume content",
  "new_content": "improved resume content",
  "reason": "why this change improves alignment with the job"
}}

TARGET ID RULES:

- summary:
  target_id must be null.

- experience:
  target_id must be the exact numeric ID from
  structured_resume.experience.

- project:
  target_id must be the exact numeric ID from
  structured_resume.projects.

Do NOT invent target IDs.

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

Structured Resume:
{structured_resume}
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



STRUCTURED_RESUME_GENERATION_PROMPT = """
You are a professional resume editor.

You are NOT creating facts for a resume.

You are ONLY improving the wording of the supplied summary,
experience descriptions, and project descriptions.

STRICT RULES:

- Use ONLY the information supplied below.
- Never invent facts.
- Never invent technologies.
- Never invent metrics.
- Never invent responsibilities.
- Never invent achievements.
- Never invent companies.
- Never invent dates.
- Never invent education.
- Never invent certifications.
- Never invent URLs.
- Never invent contact information.
- Never change company names.
- Never change job titles.
- Never change project titles.
- Never change education institutions.
- Never change skill names.
- Never create a project role that is not provided.
- Never add information from general knowledge.
- Preserve the original meaning.
- Use professional resume wording.
- Use strong action verbs only when the original fact remains true.

The application will assemble the final resume itself.

Return ONLY valid JSON with this structure:

{{
  "summary": "",
  "experience": [
    {{
      "id": 0,
      "description": ""
    }}
  ],
  "projects": [
    {{
      "id": 0,
      "description": ""
    }}
  ]
}}

Rules for IDs:

- Use exactly the IDs supplied in the input.
- Never create new IDs.
- Do not omit an existing experience or project unless its
  original description is empty.
- Do not change any factual field other than description/summary.

Candidate Profile:
{profile}

Experience:
{experience}

Projects:
{projects}

Additional instruction:
{instruction}
"""



STRUCTURED_TAILORED_RESUME_PROMPT = """
You are a professional resume editor and ATS optimization assistant.

You are NOT creating a new resume from scratch.

You are ONLY improving and prioritizing the wording of the candidate's
existing summary, experience descriptions, and project descriptions for
the target job description.

STRICT FACTUALITY RULES:

- Use ONLY facts supplied in the candidate resume.
- Never invent facts.
- Never invent technologies.
- Never invent metrics.
- Never invent responsibilities.
- Never invent achievements.
- Never invent companies.
- Never invent dates.
- Never invent education.
- Never invent certifications.
- Never invent URLs.
- Never invent contact information.
- Never change company names.
- Never change job titles.
- Never change project titles.
- Never change education institutions.
- Never change skill names.
- Never create a project role that is not supplied.
- Never claim that the candidate performed a responsibility
  merely because it is mentioned in the job description.
- Never add a job-description skill as if the candidate already had it.
- Never transform a job requirement into candidate experience.
- Never add a technology because it is common for the target role.
- Only emphasize terminology from the job description when it accurately
  matches facts already present in the candidate resume.
- Preserve the original meaning of every description.
- Use stronger action verbs only when the resulting statement remains
  factually equivalent.
- The application will assemble the final tailored resume itself.

Return ONLY valid JSON with this structure:

{{
  "summary": "",
  "experience": [
    {{
      "id": 0,
      "description": ""
    }}
  ],
  "projects": [
    {{
      "id": 0,
      "description": ""
    }}
  ]
}}

ID RULES:

- Use exactly the IDs supplied in the candidate context.
- Never create a new ID.
- Never change an ID.
- Preserve every existing experience and project.
- Only modify description text.
- Do not modify names, dates, job titles, technologies, or other
  factual fields.

TARGETING RULES:

- Prefer content relevant to the target job.
- Do not remove true facts simply because they are less relevant.
- Do not add claims merely to improve ATS score.
- If a job requirement is missing from the candidate resume,
  leave it missing.
- Do not tell the candidate they performed something they did not perform.

Candidate Profile:
{profile}

Experience:
{experience}

Projects:
{projects}

Target Job Description:
{job_description}

Additional instruction:
{instruction}
"""


GENERATE_RESUME_CONTENT_PROMPT = """
You are an expert resume writer for technical professionals.

Convert the candidate's request into professional, detailed,
ATS-friendly resume content.

IMPORTANT:
The candidate request is the source of truth.
You MUST use the specific information explicitly provided by the candidate.

DO NOT invent:
- companies
- clients
- teams
- metrics
- percentages
- leadership
- dashboards
- deployment
- cross-functional collaboration
- certifications
- responsibilities not supported by the request

However, when the candidate explicitly provides technologies,
libraries, techniques, tasks, metrics, or project activities,
USE THEM DIRECTLY in the generated content.

Do not replace specific technologies with vague terms.

OUTPUT:

1. PROFESSIONAL SUMMARY
- Write 3 to 5 sentences.
- Mention experience level and specialization.
- Naturally include the important technologies and techniques
  explicitly provided by the candidate.
- Make it suitable for a technical resume.

2. SERVICE HISTORY / PROFESSIONAL EXPERIENCE
- Generate 8 to 10 UNIQUE bullet points.
- Every bullet must describe a different technical responsibility,
  activity, workflow, or contribution supported by the candidate request.
- Use explicit technologies and techniques from the request.
- Do NOT repeat the same sentence with different verbs.
- Use strong action verbs such as:
  Developed, Implemented, Performed, Applied, Built, Trained,
  Evaluated, Engineered, Analyzed, Processed, Improved.
- Combine related facts when necessary to create meaningful bullets.

3. PROJECT
- Generate one project.
- Create a professional project title using only the supplied information.
- Include the important technologies explicitly provided by the candidate.
- Generate 6 to 8 UNIQUE project bullets.
- Cover the project activities described by the candidate.
- Do not invent project results or unsupported responsibilities.

QUALITY RULES:
- Prefer specific technical details over generic statements.
- Do not repeat the phrase "NLP, sentiment analysis project".
- Do not use filler phrases such as:
  "Collaborated on..."
  "Contributed to..."
  "Assisted in..."
  "Supported..."
  "Participated in..."
  unless collaboration or assistance was explicitly stated.
- Do not create generic bullets merely to reach the requested count.
- Use the available technical information to make each bullet distinct.

For example, if the candidate explicitly provides:
Python, Scikit-learn, NLTK, spaCy, Pandas, NumPy,
text preprocessing, tokenization, stopword removal,
stemming, lemmatization, TF-IDF, Bag-of-Words,
sentiment classification, Accuracy, Precision, Recall,
F1-score, feature engineering,

then these details should appear naturally across the summary,
service history, and project.

Return ONLY valid JSON.

Return exactly:

{{
  "summary": "",
  "service_history": [],
  "project": {{
    "title": "",
    "technologies": [],
    "description": []
  }}
}}

Candidate Request:
{prompt}
"""