import re


def extract_linkedin(text: str):
    pattern = r"(https?://(?:www\.)?linkedin\.com/in/[^\s]+|linkedin\.com/in/[^\s]+)"
    match = re.search(pattern, text, re.IGNORECASE)

    if match:
        return match.group(0)

    return None


def extract_github(text: str):
    pattern = r"(https?://(?:www\.)?github\.com/[^\s]+|github\.com/[^\s]+)"
    match = re.search(pattern, text, re.IGNORECASE)

    if match:
        return match.group(0)

    return None


def extract_portfolio(text: str):
    urls = re.findall(
        r"https?://[^\s]+",
        text
    )

    ignore = ["linkedin.com", "github.com"]

    for url in urls:
        if not any(site in url.lower() for site in ignore):
            return url

    return None


def extract_address(text: str):
    """
    Simple address extractor.
    Looks for lines containing common location keywords.
    """

    lines = text.split("\n")

    keywords = [
        "india",
        "maharashtra",
        "pune",
        "mumbai",
        "bangalore",
        "hyderabad",
        "delhi",
        "address"
    ]

    for line in lines:

        line_lower = line.lower()

        if any(word in line_lower for word in keywords):
            return line.strip()

    return None