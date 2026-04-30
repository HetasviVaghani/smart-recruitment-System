import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from dotenv import load_dotenv

# ✅ Load .env file
load_dotenv()


def send_email(to_email, subject, body, attachment_path=None):
    # ✅ Load env INSIDE function (IMPORTANT FIX)
    EMAIL = os.getenv("SMTP_USER")
    PASSWORD = os.getenv("SMTP_PASS")
    SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", 587))

    print("📧 EMAIL:", EMAIL)
    print("🔑 PASSWORD:", PASSWORD)
    print("📁 FILE:", __file__)

    # ❌ If not set → don't crash API, just log
    if not EMAIL or not PASSWORD:
        print("❌ SMTP credentials not set")
        return False

    # 🔥 Create Email
    msg = MIMEMultipart()
    msg["Subject"] = subject
    msg["From"] = EMAIL
    msg["To"] = to_email

    # ✅ Body
    msg.attach(MIMEText(body, "plain"))

    # 📎 Optional Attachment
    if attachment_path and os.path.exists(attachment_path):
        try:
            with open(attachment_path, "rb") as f:
                part = MIMEApplication(f.read(), _subtype="pdf")
                part.add_header(
                    "Content-Disposition",
                    "attachment",
                    filename=os.path.basename(attachment_path)
                )
                msg.attach(part)
        except Exception as e:
            print("❌ Attachment error:", e)

    try:
        print("🔐 Connecting to SMTP...")
        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
        server.starttls()

        print("🔐 Logging in...")
        server.login(EMAIL, PASSWORD)

        print("📤 Sending email...")
        server.send_message(msg)

        server.quit()
        print("✅ Email sent successfully")
        return True

    except Exception as e:
        print("❌ REAL EMAIL ERROR:", str(e))
        return False