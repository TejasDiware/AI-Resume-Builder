import re

PHONE_PATTERN = (
    r"(?:\+?\d{1,3}[-.\s]?)?"
    r"(?:\(?\d{2,5}\)?[-.\s]?)?"
    r"\d{5}[-.\s]?\d{5}"
)


def extract_phone(text: str):
    """
    Extract the first phone number from resume text.
    """

    match = re.search(PHONE_PATTERN, text)

    if match:
        return match.group().strip()

    return None