from types import SimpleNamespace

from app.ai.schemas import (
    AIChange,
    TailoredResumeContent,
    TailoredResumeResponse,
)
from app.ai.jd_schemas import JobDescriptionAnalysis
from app.ai.service import AIService
from app.api.routes.ai import get_ai_service
from app.main import app
from app.models.experience import Experience

from tests.test_resume import (
    auth_headers,
    register_and_login,
    create_resume,
)


class FakeTailoredResumeAIService:
    def analyze_job_description(
        self,
        title: str,
        company: str | None,
        description: str,
    ):
        assert title == "Machine Learning Engineer"
        assert "NLP" in description
        return JobDescriptionAnalysis(
            job_title=title,
            required_skills=["Python", "NLP"],
            preferred_skills=["AWS"],
            keywords=["sentiment analysis"],
        )

    def generate_tailored_resume(
        self,
        resume_id: int,
        job_description_id: int,
        generation_context: dict,
        job_description: str,
        instruction: str | None,
        jd_analysis: dict | None = None,
    ):
        assert generation_context["education"] == []
        assert generation_context["certifications"] == []
        assert generation_context["languages"] == []
        assert generation_context["achievements"] == []
        assert generation_context["skills"] == []
        assert jd_analysis["required_skills"] == ["Python", "NLP"]
        assert jd_analysis["preferred_skills"] == ["AWS"]

        experience = generation_context.get(
            "experience",
            [],
        )

        changes = []

        # ---------------------------------------------------------
        # Summary change
        # ---------------------------------------------------------

        current_summary = (
            generation_context.get(
                "profile",
                {},
            ).get(
                "summary",
                "",
            )
            or ""
        )

        new_summary = (
            "Machine Learning Engineer with experience "
            "in Python, NLP, and sentiment analysis, "
            "developing practical machine learning solutions."
        )

        changes.append(
            AIChange(
                id=(
                    f"tailored_summary_"
                    f"{resume_id}_"
                    f"{job_description_id}"
                ),
                action="update",
                section="summary",
                target_id=None,
                old_content=current_summary,
                new_content=new_summary,
                reason=(
                    "Tailored the resume summary to better "
                    "match the selected job description."
                ),
            )
        )

        # ---------------------------------------------------------
        # Experience change
        # ---------------------------------------------------------

        if experience:
            experience_id = experience[0]["id"]

            old_description = (
                experience[0].get(
                    "description",
                    "",
                )
                or ""
            )

            new_description = (
                "Developed machine learning solutions using "
                "Python and Scikit-learn. Applied NLP and "
                "sentiment analysis techniques to process "
                "and analyze text data."
            )

            changes.append(
                AIChange(
                    id=(
                        f"tailored_experience_"
                        f"{experience_id}_"
                        f"{job_description_id}"
                    ),
                    action="update",
                    section="experience",
                    target_id=experience_id,
                    old_content=old_description,
                    new_content=new_description,
                    reason=(
                        "Tailored the service history to emphasize "
                        "experience relevant to the selected job."
                    ),
                )
            )

        # ---------------------------------------------------------
        # Return tailored resume
        # ---------------------------------------------------------

        return TailoredResumeResponse(
            resume_id=resume_id,
            job_description_id=job_description_id,
            content=(
                "MACHINE LEARNING ENGINEER\n\n"
                f"SUMMARY\n{new_summary}\n\n"
                "EXPERIENCE\n"
                "Developed machine learning solutions using "
                "Python and Scikit-learn."
            ),
            structured=TailoredResumeContent(
                summary=new_summary,
                skills=generation_context.get(
                    "skills",
                    [],
                ),
                experience=[
                    (
                        "Developed machine learning solutions "
                        "using Python and Scikit-learn."
                    )
                ],
                projects=[],
            ),
            changes=changes,
        )


class CapturingProvider:
    def __init__(self, response: str):
        self.response = response
        self.prompt = ""

    def generate(self, prompt: str) -> str:
        self.prompt = prompt
        return self.response


class RetryCountingProvider:
    def __init__(self, responses):
        self.responses = list(responses)
        self.calls = 0
        self.prompts = []

    def generate(self, prompt: str) -> str:
        self.calls += 1
        self.prompts.append(prompt)
        if self.calls > len(self.responses):
            return self.responses[-1]
        return self.responses[self.calls - 1]


def test_tailored_resume_retries_once_when_output_is_essentially_unchanged():
    original_summary = (
        "Java backend developer with hands-on experience building secure "
        "authentication systems and real-time client-server applications using Java."
    )
    original_experience = (
        "Developed secure backend services in Java with role-based access control "
        "and client-server integrations."
    )
    original_project = (
        "Built a Java-based client-server application focused on secure access and "
        "real-time communication features."
    )

    provider = RetryCountingProvider([
        '{'
        '"summary":"' + original_summary + '",' 
        '"experience":[{"id":101,"description":"' + original_experience + '"}],'
        '"projects":[{"id":201,"description":"' + original_project + '"}],'
        '"relevant_existing_skills":["Java","Spring Boot","REST APIs","PostgreSQL"],'
        '"matched_skills":["Java","Spring Boot","REST APIs","PostgreSQL"],'
        '"missing_skills":["Kafka"],'
        '"matched_keywords":["Java","REST APIs","PostgreSQL"],'
        '"missing_keywords":["Kafka"],'
        '"recommendations":["Keep the Java backend focus. "]'
        '}',
        '{'
        '"summary":"Java backend engineer focused on Spring Boot, REST APIs, and PostgreSQL for secure service development.",' 
        '"experience":[{"id":101,"description":"Developed Java backend services with Spring Boot, REST APIs, and PostgreSQL to support secure authentication and access control workflows."}],'
        '"projects":[{"id":201,"description":"Built a Java-based backend application with REST APIs and PostgreSQL to support real-time client-server workflows and secure access control."}],'
        '"relevant_existing_skills":["Java","Spring Boot","REST APIs","PostgreSQL"],'
        '"matched_skills":["Java","Spring Boot","REST APIs","PostgreSQL"],'
        '"missing_skills":["Kafka"],'
        '"matched_keywords":["Java","REST APIs","PostgreSQL"],'
        '"missing_keywords":["Kafka"],'
        '"recommendations":["Emphasize the Java backend, Spring Boot, and PostgreSQL experience for the role."]'
        '}'
    ])

    service = AIService(provider)
    context = {
        "profile": {
            "first_name": "Tejas",
            "last_name": "Diware",
            "summary": original_summary,
        },
        "education": [],
        "experience": [{
            "id": 101,
            "company": "DevCons Software Solutions",
            "job_title": "Java Backend Developer",
            "description": original_experience,
        }],
        "skills": ["Java", "Spring Boot", "REST APIs", "PostgreSQL", "Docker"],
        "projects": [{
            "id": 201,
            "title": "Secure Client Server App",
            "description": original_project,
            "technologies": "Java, PostgreSQL, REST APIs",
        }],
        "certifications": [],
        "languages": [],
        "achievements": [],
    }

    result = service.generate_tailored_resume(
        resume_id=7,
        job_description_id=9,
        generation_context=context,
        job_description="Java backend developer role focused on Spring Boot, REST APIs, PostgreSQL, and secure backend services.",
        instruction=None,
        jd_analysis={
            "job_title": "Java Backend Developer",
            "required_skills": ["Java", "Spring Boot", "REST APIs", "PostgreSQL"],
            "preferred_skills": ["Docker"],
            "experience_requirements": [],
            "education_requirements": [],
            "keywords": ["Java", "REST APIs", "PostgreSQL", "Docker"],
        },
    )

    assert provider.calls == 2
    assert result.structured.summary != original_summary
    assert result.structured.summary.startswith("Java backend engineer")
    assert result.structured.matched_skills == ["Java", "Spring Boot", "REST APIs", "PostgreSQL"]
    assert "Kafka" not in result.structured.skills
    assert result.structured.experience[0]["company"] == "DevCons Software Solutions"
    assert result.structured.experience[0]["job_title"] == "Java Backend Developer"
    assert result.structured.projects[0]["project_id"] == 201
    assert result.structured.projects[0]["title"] == "Secure Client Server App"


def test_tailored_resume_keeps_only_existing_supported_skills_and_identity_fields():
    provider = CapturingProvider(
        '{'
        '"summary":"Java backend engineer with Spring Boot and PostgreSQL experience.",' 
        '"experience":[{"id":11,"description":"Built Java backend services with Spring Boot and PostgreSQL for secure APIs."}],'
        '"projects":[{"id":22,"description":"Developed a Java backend application with Spring Boot and PostgreSQL for data persistence."}],'
        '"relevant_existing_skills":["Java","Spring Boot","PostgreSQL"],'
        '"matched_skills":["Java","Spring Boot","PostgreSQL"],'
        '"missing_skills":["Kafka"],'
        '"matched_keywords":["Java","Spring Boot","PostgreSQL"],'
        '"missing_keywords":["Kafka"],'
        '"recommendations":["Highlight the backend stack and data layer work."]'
        '}'
    )
    service = AIService(provider)
    context = {
        "profile": {
            "first_name": "Tejas",
            "last_name": "Diware",
            "summary": "Java backend developer.",
        },
        "education": [],
        "experience": [{
            "id": 11,
            "company": "ACME Systems",
            "job_title": "Java Developer",
            "description": "Built secure backend APIs in Java.",
            "start_date": "2022-01-01",
            "end_date": "2024-01-01",
        }],
        "skills": ["Java", "Spring Boot", "PostgreSQL", "Docker"],
        "projects": [{
            "id": 22,
            "title": "Order API",
            "description": "Built a Java API with secure endpoints.",
            "technologies": "Java, Spring Boot, PostgreSQL",
        }],
        "certifications": [],
        "languages": [],
        "achievements": [],
    }

    result = service.generate_tailored_resume(
        resume_id=7,
        job_description_id=9,
        generation_context=context,
        job_description="Java backend developer with Spring Boot, PostgreSQL, and secure APIs.",
        instruction=None,
        jd_analysis={
            "job_title": "Java Backend Developer",
            "required_skills": ["Java", "Spring Boot", "PostgreSQL"],
            "preferred_skills": ["Docker"],
            "experience_requirements": [],
            "education_requirements": [],
            "keywords": ["Java", "Spring Boot", "PostgreSQL"],
        },
    )

    assert result.structured.matched_skills == ["Java", "Spring Boot", "PostgreSQL"]
    assert result.structured.missing_skills == ["Kafka"]
    assert "Kafka" not in result.structured.skills
    assert result.structured.experience[0]["company"] == "ACME Systems"
    assert result.structured.experience[0]["job_title"] == "Java Developer"
    assert result.structured.experience[0]["tailored_description"]
    assert result.structured.projects[0]["title"] == "Order API"
    assert result.structured.projects[0]["project_id"] == 22


def test_real_tailoring_service_returns_complete_structured_result():
    provider = CapturingProvider(
        '{'
        '"summary":"Python engineer focused on NLP.",'
        '"experience":[{"id":11,"description":"Built NLP tools with Python."}],'
        '"projects":[],'
        '"relevant_existing_skills":["Python"],'
        '"matched_skills":["Python"],'
        '"missing_skills":["AWS"],'
        '"matched_keywords":["NLP"],'
        '"missing_keywords":[],'
        '"recommendations":["Emphasize NLP work."]'
        '}'
    )
    service = AIService(provider)
    context = {
        "profile": {
            "first_name": "Tejas",
            "last_name": "Diware",
            "summary": "Python developer.",
        },
        "education": [{"id": 1, "institution": "AISSMS IOIT"}],
        "experience": [{
            "id": 11,
            "company": "ABC",
            "job_title": "Developer",
            "description": "Built tools with Python.",
        }],
        "skills": ["Python"],
        "projects": [],
        "certifications": [{"id": 2, "name": "Python Certificate"}],
        "languages": [{"id": 3, "name": "English"}],
        "achievements": [{"id": 4, "title": "Award", "description": "Awarded."}],
    }

    result = service.generate_tailored_resume(
        resume_id=7,
        job_description_id=9,
        generation_context=context,
        job_description="Python and AWS NLP role.",
        instruction=None,
        jd_analysis={
            "job_title": "NLP Engineer",
            "required_skills": ["Python", "AWS"],
            "preferred_skills": [],
            "experience_requirements": [],
            "education_requirements": [],
            "keywords": ["NLP"],
        },
    )

    assert "Education:" in provider.prompt
    assert "Certifications:" in provider.prompt
    assert "Languages:" in provider.prompt
    assert "Achievements:" in provider.prompt
    assert "Structured Job Description Analysis:" in provider.prompt
    assert result.structured is not None
    assert result.structured.skills == ["Python"]
    assert result.structured.matched_skills == ["Python"]
    assert result.structured.missing_skills == ["AWS"]
    assert result.structured.profile["first_name"] == "Tejas"
    assert result.structured.education[0]["institution"] == "AISSMS IOIT"
    assert result.structured.recommendations == ["Emphasize NLP work."]


def test_generate_tailored_resume_returns_changes(
    client,
    db_session,
):
    app.dependency_overrides[get_ai_service] = (
        lambda: FakeTailoredResumeAIService()
    )

    try:
        # ---------------------------------------------------------
        # Create user
        # ---------------------------------------------------------

        token = register_and_login(
            client,
            "tailored-generation@example.com",
        )

        # ---------------------------------------------------------
        # Create resume
        # ---------------------------------------------------------

        resume = create_resume(
            client,
            token,
            "Tailored AI Resume",
        )

        assert resume["id"]

        # ---------------------------------------------------------
        # Create candidate profile
        # ---------------------------------------------------------

        profile_response = client.post(
            "/api/v1/profile",
            headers=auth_headers(token),
            json={
                "first_name": "Tejas",
                "last_name": "Diware",
                "phone": "+919876543210",
                "professional_title": (
                    "Machine Learning Engineer"
                ),
                "summary": (
                    "Machine Learning Engineer with "
                    "Python experience."
                ),
                "location": "Pune, India",
                "linkedin_url": None,
                "github_url": None,
                "portfolio_url": None,
            },
        )

        assert profile_response.status_code == 201

        # ---------------------------------------------------------
        # Create existing experience
        # ---------------------------------------------------------

        experience = Experience(
            resume_id=resume["id"],
            company="ABC Technologies",
            job_title="Machine Learning Engineer",
            description=(
                "Worked on machine learning projects "
                "using Python."
            ),
            location="Pune",
            employment_type="Full-time",
            is_current=False,
        )

        db_session.add(experience)
        db_session.commit()
        db_session.refresh(experience)

        # ---------------------------------------------------------
        # Create Job Description
        # ---------------------------------------------------------

        job_description_response = client.post(
            "/api/v1/job-descriptions",
            headers=auth_headers(token),
            json={
                "title": "Machine Learning Engineer",
                "company": "XYZ Technologies",
                "description": (
                    "We are looking for a Machine Learning "
                    "Engineer with experience in Python, "
                    "NLP, sentiment analysis, Scikit-learn, "
                    "and machine learning."
                ),
            },
        )

        assert (
            job_description_response.status_code
            == 201
        )

        job_description = (
            job_description_response.json()
        )

        assert job_description["id"]

        # ---------------------------------------------------------
        # Generate tailored resume
        # ---------------------------------------------------------

        response = client.post(
            (
                "/api/v1/ai/"
                f"generate-tailored-resume/"
                f"{resume['id']}/"
                f"{job_description['id']}"
            ),
            headers=auth_headers(token),
            json={
                "instruction": None,
            },
        )

        assert response.status_code == 200

        data = response.json()

        # ---------------------------------------------------------
        # Basic response
        # ---------------------------------------------------------

        assert data["resume_id"] == resume["id"]

        assert (
            data["job_description_id"]
            == job_description["id"]
        )

        assert data["content"]

        assert data["structured"] is not None

        assert data["structured"]["summary"]

        # ---------------------------------------------------------
        # Verify changes
        # ---------------------------------------------------------

        assert "changes" in data

        assert isinstance(
            data["changes"],
            list,
        )

        changes = data["changes"]

        assert len(changes) >= 2

        # ---------------------------------------------------------
        # Summary change
        # ---------------------------------------------------------

        summary_changes = [
            change
            for change in changes
            if change["section"] == "summary"
        ]

        assert len(summary_changes) == 1

        summary_change = summary_changes[0]

        assert summary_change["action"] == "update"

        assert summary_change["target_id"] is None

        assert (
            summary_change["old_content"]
            == "Machine Learning Engineer with "
            "Python experience."
        )

        assert summary_change["new_content"]

        assert summary_change["reason"]

        # ---------------------------------------------------------
        # Experience change
        # ---------------------------------------------------------

        experience_changes = [
            change
            for change in changes
            if change["section"] == "experience"
        ]

        assert len(experience_changes) == 1

        experience_change = experience_changes[0]

        assert (
            experience_change["action"]
            == "update"
        )

        assert (
            experience_change["target_id"]
            == experience.id
        )

        assert (
            experience_change["old_content"]
            == (
                "Worked on machine learning projects "
                "using Python."
            )
        )

        assert experience_change["new_content"]

        assert experience_change["reason"]

    finally:
        app.dependency_overrides.pop(
            get_ai_service,
            None,
        )


def test_generate_tailored_resume_requires_existing_resume(
    client,
):
    token = register_and_login(
        client,
        "tailored-missing-resume@example.com",
    )

    response = client.post(
        "/api/v1/ai/generate-tailored-resume/999999/1",
        headers=auth_headers(token),
        json={
            "instruction": None,
        },
    )

    assert response.status_code == 404

    assert response.json()["detail"] == (
        "Resume not found"
    )


def test_generate_tailored_resume_requires_existing_job_description(
    client,
):
    token = register_and_login(
        client,
        "tailored-missing-jd@example.com",
    )

    resume = create_resume(
        client,
        token,
        "Tailored Missing JD Resume",
    )

    response = client.post(
        (
            "/api/v1/ai/"
            f"generate-tailored-resume/"
            f"{resume['id']}/999999"
        ),
        headers=auth_headers(token),
        json={
            "instruction": None,
        },
    )

    assert response.status_code == 404

    assert response.json()["detail"] == (
        "Job description not found"
    )


def test_generate_tailored_resume_requires_authentication(
    client,
):
    response = client.post(
        "/api/v1/ai/generate-tailored-resume/1/1",
        json={
            "instruction": None,
        },
    )

    assert response.status_code == 401