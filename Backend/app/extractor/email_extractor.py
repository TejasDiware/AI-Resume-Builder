import re


EMAIL_PATTERN = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"


def extract_email(text: str):
    """
    Extract the first email address from resume text.
    """

    match = re.search(EMAIL_PATTERN, text)

    if match:
        return match.group()

    return None
