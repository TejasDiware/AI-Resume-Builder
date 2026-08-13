from docx2python import docx2python

def extract_docx_text(file_path: str) -> str:
    result = docx2python(file_path)

    print("\n========== DOCX TEXT ==========")
    print(repr(result.text))
    print("Length:", len(result.text))
    print("===============================")

    return result.text.strip()