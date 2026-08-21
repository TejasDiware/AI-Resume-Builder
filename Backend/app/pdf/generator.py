from io import BytesIO
import html
import re

from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import (
    ParagraphStyle,
    getSampleStyleSheet,
)
from reportlab.lib.units import mm
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
)

from app.pdf.templates import TEMPLATES


SECTION_HEADINGS = {
    "summary",
    "professional summary",
    "experience",
    "professional experience",
    "education",
    "skills",
    "projects",
    "certifications",
    "languages",
    "achievements",
}


def normalize_text(text: str) -> str:
    """
    Normalize Unicode characters so ReportLab's built-in fonts
    produce clean and readable PDF text.
    """

    replacements = {
        "\u2010": "-",
        "\u2011": "-",
        "\u2012": "-",
        "\u2013": "-",
        "\u2014": "-",
        "\u2212": "-",

        "\u2018": "'",
        "\u2019": "'",
        "\u201a": "'",

        "\u201c": '"',
        "\u201d": '"',
        "\u201e": '"',

        "\u2022": "-",
        "\u25cf": "-",
        "\u25aa": "-",
        "\u25e6": "-",

        "\u2192": "->",
        "\u00a0": " ",
        "\u202f": " ",
        "\u200b": "",
        "\ufeff": "",
        "\ufffd": "",
    }

    for old, new in replacements.items():
        text = text.replace(old, new)

    cleaned_chars = []

    for char in text:
        code = ord(char)

        if char in "\n\t":
            cleaned_chars.append(char)
        elif 32 <= code < 127:
            cleaned_chars.append(char)
        else:
            cleaned_chars.append(" ")

    text = "".join(cleaned_chars)

    text = re.sub(r"[ ]{2,}", " ", text)

    return text


def clean_markdown(text: str) -> str:
    """
    Convert common Markdown formatting into
    ReportLab-safe resume text.
    """

    text = normalize_text(text)
    text = html.escape(text)

    # Markdown headings
    text = re.sub(r"^###\s*", "", text)
    text = re.sub(r"^##\s*", "", text)
    text = re.sub(r"^#\s*", "", text)

    # Bold / italic
    text = text.replace("**", "")
    text = text.replace("__", "")
    text = text.replace("*", "")

    # Markdown links
    text = re.sub(
        r"\[([^\]]+)\]\([^)]+\)",
        r"\1",
        text,
    )

    # Markdown horizontal rule
    if re.fullmatch(r"-{3,}", text.strip()):
        return ""

    # Bullets
    text = re.sub(
        r"^\s*[-*•]\s+",
        "- ",
        text,
    )

    # Normalize escaped URLs
    text = text.replace(
        r"\https://",
        "https://",
    )
    text = text.replace(
        r"\http://",
        "http://",
    )

    return text.strip()


def generate_resume_pdf(
    content: str,
    filename: str = "resume.pdf",
    template: str = "classic",
) -> tuple[BytesIO, str]:
    """
    Generate a professional resume PDF using the selected template.

    Supported templates:
    - classic
    - modern
    - professional
    """

    if not content or not content.strip():
        raise ValueError("Resume content is empty")

    template_name = template.strip().lower()

    if template_name not in TEMPLATES:
        raise ValueError(
            "Unsupported template. "
            "Use classic, modern, or professional."
        )

    template_config = TEMPLATES[template_name]

    buffer = BytesIO()

    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=16 * mm,
        leftMargin=16 * mm,
        topMargin=14 * mm,
        bottomMargin=14 * mm,
        title="Resume",
        author="AI Resume Builder",
    )

    styles = getSampleStyleSheet()

    # ---------------------------------------------------------
    # Alignment
    # ---------------------------------------------------------

    title_alignment = (
        TA_CENTER
        if template_config.get("title_alignment") == "center"
        else TA_LEFT
    )

    # ---------------------------------------------------------
    # Styles
    # ---------------------------------------------------------

    title_style = ParagraphStyle(
        "ResumeTitle",
        parent=styles["Title"],
        fontName=template_config["bold_font_name"],
        fontSize=template_config["title_size"],
        leading=25,
        alignment=title_alignment,
        textColor=colors.HexColor(template_config["accent_color"]),
        spaceBefore=0,
        spaceAfter=2,
    )

    subtitle_style = ParagraphStyle(
        "ResumeSubtitle",
        parent=styles["BodyText"],
        fontName=template_config["font_name"],
        fontSize=template_config["subtitle_size"],
        leading=14,
        alignment=title_alignment,
        spaceAfter=2,
    )

    contact_style = ParagraphStyle(
        "ResumeContact",
        parent=styles["BodyText"],
        fontName=template_config["font_name"],
        fontSize=template_config["contact_size"],
        leading=12,
        alignment=title_alignment,
        spaceAfter=8,
    )

    section_style = ParagraphStyle(
        "ResumeSection",
        parent=styles["Heading2"],
        fontName=template_config["bold_font_name"],
        fontSize=template_config["heading_size"],
        leading=14,
        textColor=colors.HexColor(template_config["accent_color"]),
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True,
    )

    body_style = ParagraphStyle(
        "ResumeBody",
        parent=styles["BodyText"],
        fontName=template_config["font_name"],
        fontSize=template_config["body_size"],
        leading=12,
        spaceBefore=0,
        spaceAfter=3,
    )

    bullet_style = ParagraphStyle(
        "ResumeBullet",
        parent=body_style,
        leftIndent=10,
        firstLineIndent=-6,
        spaceAfter=2,
    )

    project_title_style = ParagraphStyle(
        "ResumeProjectTitle",
        parent=body_style,
        fontName=template_config["bold_font_name"],
        fontSize=template_config["body_size"],
        leading=12,
        spaceBefore=3,
        spaceAfter=2,
        keepWithNext=True,
    )

    technology_style = ParagraphStyle(
        "ResumeTechnology",
        parent=body_style,
        fontName=template_config["font_name"],
        fontSize=8.8,
        leading=11,
        spaceAfter=2,
    )

    # ---------------------------------------------------------
    # Story
    # ---------------------------------------------------------

    story = []

    lines = content.splitlines()

    first_content_found = False
    header_contact_rendered = False

    # ---------------------------------------------------------
    # Helper for section divider
    # ---------------------------------------------------------

    def add_section_heading(cleaned_text: str) -> None:
        story.append(
            Spacer(1, 3)
        )

        story.append(
            Paragraph(
                cleaned_text.upper(),
                section_style,
            )
        )

        if template_config.get(
            "section_line",
            False,
        ):
            story.append(
                HRFlowable(
                    width="100%",
                    thickness=0.7,
                    color=colors.HexColor(template_config["accent_color"]),
                    spaceBefore=0,
                    spaceAfter=5,
                )
            )

    # ---------------------------------------------------------
    # Build PDF content
    # ---------------------------------------------------------

    for raw_line in lines:
        line = raw_line.strip()

        if not line:
            story.append(
                Spacer(1, 2)
            )
            continue

        is_markdown_heading = line.startswith("#")

        cleaned = clean_markdown(line)

        if not cleaned:
            continue

        lower_cleaned = cleaned.lower().strip()

        # -----------------------------------------------------
        # Candidate name
        # -----------------------------------------------------

        if not first_content_found:
            story.append(
                Paragraph(
                    cleaned,
                    title_style,
                )
            )

            first_content_found = True
            continue

        # -----------------------------------------------------
        # Section heading
        # -----------------------------------------------------

        if (
            is_markdown_heading
            or lower_cleaned in SECTION_HEADINGS
        ):
            add_section_heading(
                cleaned
            )
            continue

        # -----------------------------------------------------
        # Contact information
        # -----------------------------------------------------

        is_contact_line = any(
            marker in cleaned.lower()
            for marker in (
                "email:",
                "phone:",
                "location:",
                "linkedin:",
                "github:",
                "portfolio:",
            )
        )

        if is_contact_line or (
            not header_contact_rendered
            and "|" in cleaned
        ):
            story.append(
                Paragraph(
                    cleaned,
                    contact_style,
                )
            )

            header_contact_rendered = True
            continue

        # -----------------------------------------------------
        # Bullet
        # -----------------------------------------------------

        if cleaned.startswith("- "):
            bullet_text = html.escape(
                cleaned[2:].strip()
            )

            story.append(
                Paragraph(
                    f"&#8226;&nbsp;{bullet_text}",
                    bullet_style,
                )
            )

            continue

        # -----------------------------------------------------
        # Technology line
        # -----------------------------------------------------

        if cleaned.lower().startswith(
            "technologies:"
        ):
            technology_text = html.escape(
                cleaned
            )

            story.append(
                Paragraph(
                    technology_text,
                    technology_style,
                )
            )

            continue

        # -----------------------------------------------------
        # Project title heuristic
        #
        # A title appearing directly before
        # "Technologies:" should get stronger styling.
        # -----------------------------------------------------

        if (
            any(
                marker in cleaned.lower()
                for marker in (
                    "application",
                    "platform",
                    "detection",
                    "system",
                )
            )
            and not cleaned.endswith(".")
        ):
            story.append(
                Paragraph(
                    html.escape(cleaned),
                    project_title_style,
                )
            )
            continue

        # -----------------------------------------------------
        # Normal body text
        # -----------------------------------------------------

        story.append(
            Paragraph(
                html.escape(cleaned),
                body_style,
            )
        )

    if not story:
        raise ValueError(
            "No resume content could be rendered"
        )

    document.build(story)

    buffer.seek(0)

    return buffer, filename