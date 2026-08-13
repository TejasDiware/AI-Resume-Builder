import re
import spacy

nlp = spacy.load("en_core_web_sm")

IGNORE_WORDS = {
    "linkedin", "linkdin", "github", "portfolio",
    "resume", "email", "phone", "mobile", "contact"
}


def extract_name(text: str):

    lines = text.splitlines()

    # First try a rule-based approach
    for line in lines[:10]:
        line = line.strip()

        if not line:
            continue

        lower = line.lower()

        if any(word in lower for word in IGNORE_WORDS):
            continue

        # Skip email
        if "@" in line:
            continue

        # Skip phone numbers
        if re.search(r"\d{5,}", line):
            continue

        # Looks like a name?
        if re.fullmatch(r"[A-Za-z]+(?: [A-Za-z]+){1,3}", line):
            return line.title()

    # Fallback to spaCy
    doc = nlp("\n".join(lines[:10]))

    for ent in doc.ents:
        if ent.label_ == "PERSON":
            return ent.text.strip()

    return None