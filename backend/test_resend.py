import os
# pyrefly: ignore [missing-import]
import resend
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")

def test_email():
    try:
        print(f"Using API Key: {resend.api_key[:10]}...")
        # Note: Resend only allows sending FROM a verified domain or onboarding@resend.dev (to the verified email address)
        # If talentmatchai2026@gmail.com is not a verified domain, this might fail unless used as 'to' with onboarding@resend.dev
        r = resend.Emails.send({
            "from": "talentmatchai2026@gmail.com",
            "to": "talentmatchai2026@gmail.com",
            "subject": "Test Email from TalentMatch AI",
            "html": "<p>This is a test email using Resend API!</p>"
        })
        print("Success:", r)
    except Exception as e:
        print("Failed:", e)

if __name__ == "__main__":
    test_email()
