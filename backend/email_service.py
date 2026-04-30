import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication

# ✅ Load from environment variables
EMAIL = os.getenv("SMTP_USER")
PASSWORD = os.getenv("SMTP_PASS")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))


def send_email(to_email, subject, body, attachment_path=None):

    if not EMAIL or not PASSWORD:
        raise Exception("❌ SMTP credentials not set")

    # 🔥 Create Email Container
    msg = MIMEMultipart()
    msg["Subject"] = subject
    msg["From"] = EMAIL
    msg["To"] = to_email

    # ✅ Body
    msg.attach(MIMEText(body, "plain"))

    # 📎 Attach file (optional)
    if attachment_path and os.path.exists(attachment_path):
        with open(attachment_path, "rb") as f:
            part = MIMEApplication(f.read(), _subtype="pdf")
            part.add_header(
                "Content-Disposition",
                "attachment",
                filename=os.path.basename(attachment_path)
            )
            msg.attach(part)

    try:
        # 🔥 Send Email
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()
        server.login(EMAIL, PASSWORD)
        server.send_message(msg)
        server.quit()

        print("✅ Email sent successfully")

    except Exception as e:
        print("❌ Email failed:", str(e))