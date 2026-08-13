from io import BytesIO
import html
import re

from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
)

from app.pdf.templates import CLASSIC_TEMPLATE


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
    Normalize Unicode characters so the default ReportLab fonts
    produce clean, readable PDF text.
    """

    replacements = {
        "\u2010": "-",   # hyphen
        "\u2011": "-",   # non-breaking hyphen
        "\u2012": "-",   # figure dash
        "\u2013": "-",   # en dash
        "\u2014": "-",   # em dash
        "\u2212": "-",   # minus sign

        "\u2018": "'",   # left single quote
        "\u2019": "'",   # right single quote
        "\u201a": "'",

        "\u201c": '"',   # left double quote
        "\u201d": '"',   # right double quote
        "\u201e": '"',

        "\u2022": "-",   # bullet
        "\u25cf": "-",   # black circle
        "\u25aa": "-",   # small square
        "\u25e6": "-",   # white bullet

        "\u2192": "->",  # right arrow
        "\u00a0": " ",   # non-breaking space
        "\u202f": " ",   # narrow no-break space
        "\u200b": "",    # zero-width space
        "\ufeff": "",    # BOM
        "\ufffd": "",    # replacement character
    }

    for old, new in replacements.items():
        text = text.replace(old, new)

    # Remove control characters.
    # Keep newline and tab, remove DEL (0x7F) and other controls.
    cleaned_chars = []

    for char in text:
        code = ord(char)

        if char in "\n\t":
            cleaned_chars.append(char)
        elif 32 <= code < 127:
            cleaned_chars.append(char)
        else:
            # Ignore unsupported non-ASCII/control characters
            cleaned_chars.append(" ")

    text = "".join(cleaned_chars)

    # Collapse repeated spaces.
    text = re.sub(r"[ ]{2,}", " ", text)

    return text


def clean_markdown(text: str) -> str:
    """Convert common Markdown formatting into safe resume text."""

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

    # Markdown links:
    # [GitHub](https://github.com/example)
    text = re.sub(
        r"\[([^\]]+)\]\([^)]+\)",
        r"\1",
        text,
    )

    # Bullets
    text = re.sub(
        r"^\s*[-*•]\s+",
        "- ",
        text,
    )

    # Remove markdown horizontal rules.
    if re.fullmatch(r"-{3,}", text.strip()):
        return ""

    # Normalize bullets.
    text = re.sub(
        r"^\s*[-*]\s+",
        "- ",
        text,
    )


    # Fix escaped URLs.
    text = text.replace(r"\https://", "https://")
    text = text.replace(r"\http://", "http://")

    return text.strip()


def generate_resume_pdf(
    content: str,
    filename: str = "resume.pdf",
) -> tuple[BytesIO, str]:
    """
    Generate a professional single-column resume PDF.
    """

    if not content or not content.strip():
        raise ValueError("Resume content is empty")

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

    title_style = ParagraphStyle(
        "ResumeTitle",
        parent=styles["Title"],
        fontName=CLASSIC_TEMPLATE["font_name"],
        fontSize=22,
        leading=25,
        alignment=TA_CENTER,
        spaceAfter=4,
    )

    contact_style = ParagraphStyle(
        "ResumeContact",
        parent=styles["BodyText"],
        fontName=CLASSIC_TEMPLATE["font_name"],
        fontSize=9,
        leading=12,
        alignment=TA_CENTER,
        spaceAfter=3,
    )

    section_style = ParagraphStyle(
        "ResumeSection",
        parent=styles["Heading2"],
        fontName=CLASSIC_TEMPLATE["font_name"],
        fontSize=12,
        leading=15,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True,
    )

    subheading_style = ParagraphStyle(
        "ResumeSubheading",
        parent=styles["BodyText"],
        fontName=CLASSIC_TEMPLATE["font_name"],
        fontSize=10.5,
        leading=13,
        spaceBefore=3,
        spaceAfter=2,
        keepWithNext=True,
    )

    body_style = ParagraphStyle(
        "ResumeBody",
        parent=styles["BodyText"],
        fontName=CLASSIC_TEMPLATE["font_name"],
        fontSize=9.5,
        leading=12.5,
        spaceAfter=3,
    )

    bullet_style = ParagraphStyle(
        "ResumeBullet",
        parent=body_style,
        leftIndent=12,
        firstLineIndent=-7,
        spaceAfter=2,
    )

    story = []

    lines = content.splitlines()

    first_content_found = False
    current_section = None

    for raw_line in lines:
        line = raw_line.strip()

        if not line:
            story.append(Spacer(1, 2))
            continue

        is_markdown_heading = line.startswith("#")

        cleaned = clean_markdown(line)

        if not cleaned:
            continue

        lower_cleaned = cleaned.lower().strip()

        # ---------------------------------------------------------
        # Candidate name
        # ---------------------------------------------------------
        if not first_content_found:
            story.append(
                Paragraph(
                    cleaned,
                    title_style,
                )
            )
            first_content_found = True
            continue

        # ---------------------------------------------------------
        # Section heading
        # ---------------------------------------------------------
        if (
            is_markdown_heading
            or lower_cleaned in SECTION_HEADINGS
        ):
            current_section = lower_cleaned

            story.append(
                Spacer(1, 2)
            )

            story.append(
                Paragraph(
                    cleaned.upper(),
                    section_style,
                )
            )

            continue

        # ---------------------------------------------------------
        # Bullet
        # ---------------------------------------------------------
        if cleaned.startswith("- "):
            story.append(
                Paragraph(
                    f"- {html.escape(cleaned[2:])}",
                    bullet_style,
                )
            )
            continue

        # ---------------------------------------------------------
        # Contact line
        # ---------------------------------------------------------
        if any(
            marker in cleaned.lower()
            for marker in (
                "linkedin:",
                "github:",
                "portfolio:",
                "phone:",
            )
        ):
            story.append(
                Paragraph(
                    cleaned,
                    contact_style,
                )
            )
            continue

        # ---------------------------------------------------------
        # Body content
        # ---------------------------------------------------------
        story.append(
            Paragraph(
                cleaned,
                body_style,
            )
        )

    if not story:
        raise ValueError("No resume content could be rendered")

    document.build(story)

    buffer.seek(0)

    return buffer, filename