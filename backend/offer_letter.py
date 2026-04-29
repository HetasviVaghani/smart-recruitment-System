from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import letter
import os
from datetime import datetime


def generate_offer_letter(
    name,
    position,
    salary,
    company_name,
    company_website="",
    company_location="India",
    company_email="hr@company.com"
):
    folder = "offer_letters"
    os.makedirs(folder, exist_ok=True)

    file_path = f"{folder}/{name}_offer_letter.pdf"

    doc = SimpleDocTemplate(file_path, pagesize=letter)
    styles = getSampleStyleSheet()

    elements = []

    # ================= HEADER =================
    elements.append(Paragraph(f"<b>{company_name.upper()}</b>", styles["Title"]))
    elements.append(Spacer(1, 8))

    if company_location:
        elements.append(Paragraph(company_location, styles["Normal"]))

    if company_email:
        elements.append(Paragraph(f"Email: {company_email}", styles["Normal"]))

    if company_website:
        elements.append(Paragraph(f"Website: {company_website}", styles["Normal"]))

    elements.append(Spacer(1, 20))

    # ================= DATE =================
    date_str = datetime.now().strftime("%d %B %Y")
    elements.append(Paragraph(f"Date: {date_str}", styles["Normal"]))
    elements.append(Spacer(1, 20))

    # ================= TITLE =================
    elements.append(Paragraph("<b>Subject: Offer of Employment</b>", styles["Heading2"]))
    elements.append(Spacer(1, 20))

    # ================= BODY =================
    body = f"""
    Dear <b>{name}</b>,<br/><br/>

    We are pleased to offer you the position of <b>{position}</b> at 
    <b>{company_name}</b> based on your performance and qualifications.

    <br/><br/>

    You will receive an annual compensation of <b>₹{salary}</b>.

    <br/><br/>

    Your joining date and reporting details will be shared shortly by the HR team.

    <br/><br/>

    We are excited to have you join our team and contribute to our growth.
    """

    elements.append(Paragraph(body, styles["Normal"]))
    elements.append(Spacer(1, 20))

    # ================= JOB DETAILS TABLE =================
    table_data = [
        ["Candidate Name", name],
        ["Position", position],
        ["Company", company_name],
        ["Salary", f"₹{salary}"],
        ["Employment Type", "Full-Time"],
        ["Location", company_location],
    ]

    table = Table(table_data, colWidths=[160, 260])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
        ("GRID", (0, 0), (-1, -1), 1, colors.black),
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
    ]))

    elements.append(table)
    elements.append(Spacer(1, 20))

    # ================= TERMS =================
    terms = """
    <b>Terms & Conditions:</b><br/>
    1. This offer is subject to verification of documents.<br/>
    2. You must maintain confidentiality of company information.<br/>
    3. Employment is governed by company policies.<br/>
    4. This offer is valid for 7 days from the date of issue.<br/>
    """

    elements.append(Paragraph(terms, styles["Normal"]))
    elements.append(Spacer(1, 30))

    # ================= CLOSING =================
    closing = f"""
    We look forward to welcoming you to <b>{company_name}</b>.<br/><br/>

    Sincerely,<br/>
    <b>HR Department</b><br/>
    {company_name}
    """

    elements.append(Paragraph(closing, styles["Normal"]))
    elements.append(Spacer(1, 50))

    # ================= SIGNATURE =================
    elements.append(Paragraph("__________________________", styles["Normal"]))
    elements.append(Paragraph("Authorized Signature", styles["Normal"]))

    # Build PDF
    doc.build(elements)

    return file_path