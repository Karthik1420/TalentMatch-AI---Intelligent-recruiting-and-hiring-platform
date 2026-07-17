import smtplib
from email.message import EmailMessage
from config import SMTP_USERNAME, SMTP_PASSWORD, SMTP_FROM_EMAIL

def send_recruiter_credentials(to_email: str, password: str, company_name: str):
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print("Warning: SMTP credentials not configured. Skipping email.")
        return

    msg = EmailMessage()
    msg['Subject'] = f"Welcome to TalentMatch AI - {company_name} Recruiter Portal"
    msg['From'] = SMTP_FROM_EMAIL
    msg['To'] = to_email

    # HTML Email Content
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #334155; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }}
            h1 {{ color: #4f46e5; font-size: 24px; margin-bottom: 20px; }}
            p {{ line-height: 1.6; font-size: 16px; margin-bottom: 16px; }}
            .credentials {{ background-color: #f1f5f9; padding: 20px; border-radius: 6px; margin: 24px 0; border-left: 4px solid #4f46e5; }}
            .credential-item {{ margin-bottom: 10px; font-family: monospace; font-size: 16px; }}
            .btn {{ display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 20px; }}
            .footer {{ margin-top: 40px; font-size: 14px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Welcome to the {company_name} Team!</h1>
            <p>Hello,</p>
            <p>An administrator has created a new recruiter account for you on the TalentMatch AI platform for <strong>{company_name}</strong>.</p>
            <p>You can use the following credentials to access your personalized recruiter dashboard, post jobs, and manage your candidates pipeline:</p>
            
            <div class="credentials">
                <div class="credential-item"><strong>Email:</strong> {to_email}</div>
                <div class="credential-item"><strong>Password:</strong> {password}</div>
            </div>
            
            <p>We highly recommend logging in and changing your password as soon as possible.</p>
            
            <a href="https://talentmatchai-xi.vercel.app/login" class="btn" style="color: white;">Login to Dashboard</a>
            
            <div class="footer">
                <p>If you did not expect this invitation, please contact your administrator.</p>
                <p>&copy; 2026 TalentMatch AI. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    msg.set_content(f"Welcome to TalentMatch AI!\n\nEmail: {to_email}\nPassword: {password}\n\nPlease login and change your password.")
    msg.add_alternative(html_content, subtype='html')

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
        print(f"Credentials email sent successfully to {to_email}")
    except Exception as e:
        print(f"Failed to send email to {to_email} via SMTP: {e}. Falling back to Resend.")
        try:
            # pyrefly: ignore [missing-import]
            import resend
            from config import RESEND_API_KEY
            if RESEND_API_KEY:
                resend.api_key = RESEND_API_KEY
                r = resend.Emails.send({
                  "from": "onboarding@resend.dev",
                  "to": to_email,
                  "subject": msg['Subject'],
                  "html": html_content
                })
                print(f"Credentials email sent successfully to {to_email} via Resend fallback")
            else:
                print("RESEND_API_KEY not configured. Backup email failed.")
        except Exception as resend_e:
            print(f"Failed to send backup email to {to_email} via Resend: {resend_e}")

def send_interview_invitation(to_email: str, company_name: str, job_title: str, scheduled_time: str, meet_link: str):
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print("Warning: SMTP credentials not configured. Skipping email.")
        return

    msg = EmailMessage()
    msg['Subject'] = f"Interview Scheduled: {job_title} at {company_name}"
    msg['From'] = SMTP_FROM_EMAIL
    msg['To'] = to_email

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #334155; padding: 20px; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }}
            h1 {{ color: #4f46e5; font-size: 24px; margin-bottom: 20px; }}
            p {{ line-height: 1.6; font-size: 16px; margin-bottom: 16px; }}
            .details {{ background-color: #f1f5f9; padding: 20px; border-radius: 6px; margin: 24px 0; border-left: 4px solid #4f46e5; }}
            .detail-item {{ margin-bottom: 10px; font-size: 16px; }}
            .btn {{ display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 20px; }}
            .footer {{ margin-top: 40px; font-size: 14px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Interview Scheduled!</h1>
            <p>Hello,</p>
            <p>We are pleased to inform you that your interview for the <strong>{job_title}</strong> role at <strong>{company_name}</strong> has been scheduled.</p>
            
            <div class="details">
                <div class="detail-item"><strong>Date & Time:</strong> {scheduled_time} (UTC)</div>
                <div class="detail-item"><strong>Location:</strong> Google Meet</div>
            </div>
            
            <a href="{meet_link}" class="btn" style="color: white;">Join Google Meet</a>
            
            <p>Please ensure you join a few minutes early. Good luck!</p>
            
            <div class="footer">
                <p>&copy; 2026 TalentMatch AI. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    msg.set_content(f"Interview Scheduled for {job_title} at {company_name}.\n\nTime: {scheduled_time} (UTC)\nJoin Link: {meet_link}")
    msg.add_alternative(html_content, subtype='html')

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
        print(f"Interview email sent successfully to {to_email}")
    except Exception as e:
        print(f"Failed to send interview email to {to_email} via SMTP: {e}. Falling back to Resend.")
        try:
            # pyrefly: ignore [missing-import]
            import resend
            from config import RESEND_API_KEY
            if RESEND_API_KEY:
                resend.api_key = RESEND_API_KEY
                r = resend.Emails.send({
                  "from": "onboarding@resend.dev",
                  "to": to_email,
                  "subject": msg['Subject'],
                  "html": html_content
                })
                print(f"Interview email sent successfully to {to_email} via Resend fallback")
            else:
                print("RESEND_API_KEY not configured. Backup email failed.")
        except Exception as resend_e:
            print(f"Failed to send backup email to {to_email} via Resend: {resend_e}")
