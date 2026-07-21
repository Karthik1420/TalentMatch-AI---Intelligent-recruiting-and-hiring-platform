import os
from dotenv import load_dotenv

load_dotenv()

# Database
# Connect using the provided connection string from user
DATABASE_URL = os.getenv("DATABASE_URL")

# JWT Settings
SECRET_KEY = os.getenv("SECRET_KEY", "b3a1a63c46e2a2223a31c19b4a45a33118d0b5e28a9b2b513476d09e5306913e") # Change in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# SMTP Settings
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL")

# Cloudinary Settings
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

# Google Calendar API (OAuth)
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "https://talentmatch-ai-intelligent-recruiting.onrender.com/recruiter/google-auth/callback")

# Gemini Settings
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
RESUME_HELPER_API_KEY = os.getenv("RESUME_HELPER_API_KEY")

# Resend Settings
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
