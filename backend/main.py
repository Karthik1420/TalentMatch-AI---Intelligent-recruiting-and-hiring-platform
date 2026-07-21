from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from database import engine, get_db, SessionLocal
import models
from routes import auth_routes, admin_routes, recruiter_routes, candidate_routes
import auth
from schemas import UserRegister
import os

# Create all tables in database
models.Base.metadata.create_all(bind=engine)

# Ensure static directory exists
os.makedirs("static/images", exist_ok=True)
os.makedirs("static/certifications", exist_ok=True)

app = FastAPI(title="TalentMatch AI API")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"Validation Error: {exc.errors()}")
    print(f"Body: {exc.body}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body},
    )

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# CORS setup for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://talentmatchai-xi.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(admin_routes.router)
app.include_router(recruiter_routes.router)
app.include_router(candidate_routes.router)

@app.on_event("startup")
def startup_event():
    # Seed the Admin User
    db = SessionLocal()
    try:
        admin_email = "karthikbangera1406@gmail.com"
        admin_user = db.query(models.User).filter(models.User.email == admin_email).first()
        if not admin_user:
            hashed_password = auth.get_password_hash("Karthik1406")
            new_admin = models.User(
                email=admin_email,
                hashed_password=hashed_password,
                role=models.RoleEnum.admin
            )
            db.add(new_admin)
            db.commit()
            print("Admin user seeded successfully.")
    finally:
        db.close()

@app.get("/")
def root():
    return {"message": "Welcome to TalentMatch AI"}
