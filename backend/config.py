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
