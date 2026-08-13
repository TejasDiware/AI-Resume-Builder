import pdfplumber
import fitz  # PyMuPDF


def extract_text(pdf_path: str):

    text = ""

    # -------- Extract visible text --------
    with pdfplumber.open(pdf_path) as pdf:

        for page in pdf.pages:

            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"

    # -------- Extract embedded hyperlinks --------
    doc = fitz.open(pdf_path)

    text += "\n\n----- EXTRACTED LINKS -----\n"

    for page in doc:

        links = page.get_links()

        for link in links:

            if "uri" in link:
                text += link["uri"] + "\n"

    doc.close()

    return text