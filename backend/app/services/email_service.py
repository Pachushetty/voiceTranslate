import os, smtplib
from email.message import EmailMessage
class EmailNotConfigured(Exception): pass
def send(to, subject, body):
    host = os.getenv("SMTP_HOST")
    if not host: raise EmailNotConfigured("Email is not configured on the server")
    m = EmailMessage(); m["From"] = os.getenv("SMTP_FROM", os.getenv("SMTP_USER", "")); m["To"] = to; m["Subject"] = subject; m.set_content(body)
    with smtplib.SMTP(host, int(os.getenv("SMTP_PORT", "587")), timeout=15) as s:
        s.starttls()
        if os.getenv("SMTP_USER"): s.login(os.getenv("SMTP_USER"), os.getenv("SMTP_PASSWORD", ""))
        s.send_message(m)
