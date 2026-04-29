import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication

EMAIL = "hetasvivaghani@gmail.com"
PASSWORD = "dscg nqby llwf gwep"   


def send_email(to_email, subject, body, attachment_path=None):

    # 🔥 Create Email Container
    msg = MIMEMultipart()
    msg["Subject"] = subject
    msg["From"] = EMAIL
    msg["To"] = to_email

    # ✅ Body
    msg.attach(MIMEText(body, "plain"))

    # ===============================
    # 🔥 ATTACH PDF (IMPORTANT)
    # ===============================
    if attachment_path and os.path.exists(attachment_path):
        with open(attachment_path, "rb") as f:
            part = MIMEApplication(f.read(), _subtype="pdf")
            part.add_header(
                "Content-Disposition",
                "attachment",
                filename=os.path.basename(attachment_path)
            )
            msg.attach(part)

    # 🔥 Send Email
    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.starttls()
    server.login(EMAIL, PASSWORD)
    server.send_message(msg)
    server.quit()