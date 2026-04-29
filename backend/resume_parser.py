from pdfminer.high_level import extract_text
import docx

def extract_resume_text(file_path):

    if file_path.endswith(".pdf"):
        text = extract_text(file_path)

    elif file_path.endswith(".docx"):
        doc = docx.Document(file_path)
        text = "\n".join([para.text for para in doc.paragraphs])

    else:
        text = ""

    return text