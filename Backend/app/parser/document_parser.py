import os

from app.parser.pdf_parser import extract_text as extract_pdf_text
from app.parser.docx_parser import extract_docx_text


def extract_text(file_path: str):

    extension = os.path.splitext(file_path)[1].lower()

    if extension == ".pdf":
        return extract_pdf_text(file_path)

    elif extension == ".docx":
        return extract_docx_text(file_path)

    elif extension == ".txt":
        with open(file_path, "r", encoding="utf-8") as file:
            return file.read().strip()

    else:
        raise ValueError(f"Unsupported file type: {extension}")