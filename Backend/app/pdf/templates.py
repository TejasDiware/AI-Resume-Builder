CLASSIC_TEMPLATE = {
    "name": "Classic",
    "font_name": "Helvetica",
    "bold_font_name": "Helvetica-Bold",
    "title_size": 22,
    "subtitle_size": 11,
    "contact_size": 9,
    "heading_size": 11,
    "body_size": 9.5,
    "title_alignment": "center",
    "section_line": True,
    "accent_color": "#111827",
}


MODERN_TEMPLATE = {
    "name": "Modern",
    "font_name": "Helvetica",
    "bold_font_name": "Helvetica-Bold",
    "title_size": 20,
    "subtitle_size": 11,
    "contact_size": 9,
    "heading_size": 11,
    "body_size": 9.5,
    "title_alignment": "left",
    "section_line": True,
    "accent_color": "#0f766e",
}


PROFESSIONAL_TEMPLATE = {
    "name": "Professional",
    "font_name": "Helvetica",
    "bold_font_name": "Helvetica-Bold",
    "title_size": 20,
    "subtitle_size": 11,
    "contact_size": 9,
    "heading_size": 11,
    "body_size": 9.5,
    "title_alignment": "left",
    "section_line": True,
    "accent_color": "#1e3a8a",
}


TEMPLATES = {
    "classic": CLASSIC_TEMPLATE,
    "modern": MODERN_TEMPLATE,
    "professional": PROFESSIONAL_TEMPLATE,
}


# The backend renderer provides compatibility layouts for the React templates.
# Keep this registry as the only numeric-ID mapping used by PDF generation.
FRONTEND_TEMPLATE_FAMILIES = {
    1: "professional",
    2: "professional",
    4: "classic",
    5: "modern",
    6: "classic",
    7: "professional",
    12: "professional",
    15: "professional",
    16: "classic",
    17: "modern",
    18: "professional",
    19: "modern",
    20: "modern",
    21: "professional",
    22: "modern",
    23: "modern",
    25: "professional",
    26: "professional",
    27: "professional",
}


def resolve_template_family(template_id: int) -> str:
    try:
        return FRONTEND_TEMPLATE_FAMILIES[template_id]
    except KeyError as exc:
        supported_ids = ", ".join(
            str(value)
            for value in sorted(FRONTEND_TEMPLATE_FAMILIES)
        )
        raise ValueError(
            f"Unsupported template ID {template_id}. "
            f"Supported template IDs: {supported_ids}."
        ) from exc