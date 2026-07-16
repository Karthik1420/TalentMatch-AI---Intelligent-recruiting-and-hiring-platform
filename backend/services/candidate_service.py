from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile
import models, schemas
import os
import uuid
from typing import Optional
from datetime import datetime
import cloudinary
import cloudinary.uploader
import config

# Configure Cloudinary
if config.CLOUDINARY_CLOUD_NAME and config.CLOUDINARY_API_KEY and config.CLOUDINARY_API_SECRET:
    cloudinary.config(
        cloud_name=config.CLOUDINARY_CLOUD_NAME,
        api_key=config.CLOUDINARY_API_KEY,
        api_secret=config.CLOUDINARY_API_SECRET
    )

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".webp"}
CERT_DIR = "static/certifications"

# Ensure directory exists
os.makedirs(CERT_DIR, exist_ok=True)

# Helper to check profile existence
def get_candidate_profile_by_user_id(db: Session, user_id: int):
    return db.query(models.CandidateProfile).filter(models.CandidateProfile.user_id == user_id).first()

# Helper for file uploads
def handle_file_upload(file: UploadFile, folder: str = "certifications") -> str:
    # We can check size by reading and resetting cursor
    content = file.file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 5MB limit.")
    file.file.seek(0)
    
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported file format.")
    
    # Try Cloudinary upload
    if config.CLOUDINARY_CLOUD_NAME and config.CLOUDINARY_API_KEY and config.CLOUDINARY_API_SECRET:
        try:
            upload_result = cloudinary.uploader.upload(
                file.file,
                folder=folder,
                resource_type="auto"
            )
            return upload_result.get("secure_url")
        except Exception as e:
            print(f"Cloudinary upload failed: {e}. Falling back to local storage.")
    
    # Fallback to local storage
    target_dir = os.path.join("static", folder)
    os.makedirs(target_dir, exist_ok=True)
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(target_dir, unique_filename)
    
    with open(file_path, "wb") as buffer:
        buffer.write(content)
        
    return f"/{file_path}" # Return URL path

def delete_file(file_url: str):
    if not file_url: return
    # If it's a cloudinary URL, we can attempt to delete it by extracting public_id
    if "cloudinary.com" in file_url:
        try:
            # Simple extraction of public_id: folder/filename without extension
            parts = file_url.split("/")
            if len(parts) >= 2:
                folder = parts[-2]
                filename = parts[-1].split(".")[0]
                public_id = f"{folder}/{filename}"
                cloudinary.uploader.destroy(public_id)
        except Exception as e:
            print(f"Failed to delete from Cloudinary: {e}")
        return
        
    # Local file fallback deletion
    local_path = file_url.lstrip("/")
    if os.path.exists(local_path):
        os.remove(local_path)

# --- Portfolio Retrieval ---
def get_full_portfolio(db: Session, user_id: int):
    profile = get_candidate_profile_by_user_id(db, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Candidate profile not found. Please complete the wizard.")
    
    return schemas.CandidatePortfolioResponse(
        profile=profile,
        education=profile.education,
        experience=profile.experience,
        projects=profile.projects,
        certifications=profile.certifications,
        languages=profile.languages,
        skills=profile.skills
    )

# --- CRUD for Candidate Profile ---
def create_profile(db: Session, profile_data: schemas.CandidateProfileCreate, user_id: int, file: Optional[UploadFile] = None):
    if get_candidate_profile_by_user_id(db, user_id):
        raise HTTPException(status_code=400, detail="Profile already exists")
    
    file_url = profile_data.profile_photo
    if file:
        file_url = handle_file_upload(file, folder="profile_photos")
    
    profile_dict = profile_data.dict(exclude={"profile_photo"})
    new_profile = models.CandidateProfile(**profile_dict, user_id=user_id, profile_photo=file_url)
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return new_profile

def update_profile(db: Session, profile_data: schemas.CandidateProfileUpdate, user_id: int, file: Optional[UploadFile] = None):
    profile = get_candidate_profile_by_user_id(db, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    if file:
        if profile.profile_photo:
            delete_file(profile.profile_photo)
        profile.profile_photo = handle_file_upload(file, folder="profile_photos")
    
    for key, value in profile_data.dict(exclude_unset=True).items():
        if key != "profile_photo": # handled above
            setattr(profile, key, value)
        
    db.commit()
    db.refresh(profile)
    return profile

# --- Generic CRUD Helpers ---
def get_entity_or_404(db: Session, model, entity_id: int, candidate_id: int):
    entity = db.query(model).filter(model.id == entity_id, model.candidate_id == candidate_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail=f"{model.__name__} not found or unauthorized")
    return entity

def add_entity(db: Session, model, schema, candidate_id: int):
    entity = model(**schema.dict(), candidate_id=candidate_id)
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return entity

def update_entity(db: Session, model, entity_id: int, schema, candidate_id: int):
    entity = get_entity_or_404(db, model, entity_id, candidate_id)
    for key, value in schema.dict(exclude_unset=True).items():
        setattr(entity, key, value)
    db.commit()
    db.refresh(entity)
    return entity

def delete_entity(db: Session, model, entity_id: int, candidate_id: int):
    entity = get_entity_or_404(db, model, entity_id, candidate_id)
    db.delete(entity)
    db.commit()

# --- Education ---
def add_education(db: Session, data: schemas.EducationCreate, user_id: int):
    profile = get_candidate_profile_by_user_id(db, user_id)
    if not profile: raise HTTPException(status_code=404, detail="Profile not found")
    return add_entity(db, models.Education, data, profile.id)

def update_education(db: Session, ed_id: int, data: schemas.EducationCreate, user_id: int):
    profile = get_candidate_profile_by_user_id(db, user_id)
    if not profile: raise HTTPException(status_code=404, detail="Profile not found")
    return update_entity(db, models.Education, ed_id, data, profile.id)

def delete_education(db: Session, ed_id: int, user_id: int):
    profile = get_candidate_profile_by_user_id(db, user_id)
    if not profile: raise HTTPException(status_code=404, detail="Profile not found")
    delete_entity(db, models.Education, ed_id, profile.id)

# --- Experience ---
def add_experience(db: Session, data: schemas.ExperienceCreate, user_id: int):
    profile = get_candidate_profile_by_user_id(db, user_id)
    if not profile: raise HTTPException(status_code=404, detail="Profile not found")
    return add_entity(db, models.Experience, data, profile.id)

def update_experience(db: Session, exp_id: int, data: schemas.ExperienceCreate, user_id: int):
    profile = get_candidate_profile_by_user_id(db, user_id)
    if not profile: raise HTTPException(status_code=404, detail="Profile not found")
    return update_entity(db, models.Experience, exp_id, data, profile.id)

def delete_experience(db: Session, exp_id: int, user_id: int):
    profile = get_candidate_profile_by_user_id(db, user_id)
    if not profile: raise HTTPException(status_code=404, detail="Profile not found")
    delete_entity(db, models.Experience, exp_id, profile.id)

# --- Projects ---
def add_project(db: Session, data: schemas.ProjectCreate, user_id: int):
    profile = get_candidate_profile_by_user_id(db, user_id)
    if not profile: raise HTTPException(status_code=404, detail="Profile not found")
    return add_entity(db, models.Project, data, profile.id)

def update_project(db: Session, proj_id: int, data: schemas.ProjectCreate, user_id: int):
    profile = get_candidate_profile_by_user_id(db, user_id)
    if not profile: raise HTTPException(status_code=404, detail="Profile not found")
    return update_entity(db, models.Project, proj_id, data, profile.id)

def delete_project(db: Session, proj_id: int, user_id: int):
    profile = get_candidate_profile_by_user_id(db, user_id)
    if not profile: raise HTTPException(status_code=404, detail="Profile not found")
    delete_entity(db, models.Project, proj_id, profile.id)

# --- Certifications (File Handled) ---
def add_certification(db: Session, data: schemas.CertificationCreate, user_id: int, file: Optional[UploadFile] = None):
    profile = get_candidate_profile_by_user_id(db, user_id)
    if not profile: raise HTTPException(status_code=404, detail="Profile not found")
    file_url = None
    if file:
        file_url = handle_file_upload(file, folder="certifications")
    
    cert = models.Certification(**data.dict(), certificate_file_url=file_url, candidate_id=profile.id)
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return cert

def update_certification(db: Session, cert_id: int, data: schemas.CertificationCreate, user_id: int, file: Optional[UploadFile] = None):
    profile = get_candidate_profile_by_user_id(db, user_id)
    if not profile: raise HTTPException(status_code=404, detail="Profile not found")
    cert = get_entity_or_404(db, models.Certification, cert_id, profile.id)
    
    if file:
        delete_file(cert.certificate_file_url)
        cert.certificate_file_url = handle_file_upload(file, folder="certifications")
        
    for key, value in data.dict(exclude_unset=True).items():
        setattr(cert, key, value)
        
    db.commit()
    db.refresh(cert)
    return cert

def delete_certification(db: Session, cert_id: int, user_id: int):
    profile = get_candidate_profile_by_user_id(db, user_id)
    if not profile: raise HTTPException(status_code=404, detail="Profile not found")
    cert = get_entity_or_404(db, models.Certification, cert_id, profile.id)
    delete_file(cert.certificate_file_url)
    db.delete(cert)
    db.commit()

# --- Languages ---
def add_language(db: Session, data: schemas.CandidateLanguageCreate, user_id: int):
    profile = get_candidate_profile_by_user_id(db, user_id)
    if not profile: raise HTTPException(status_code=404, detail="Profile not found")
    # Check if language_id exists
    lang = db.query(models.Language).filter(models.Language.id == data.language_id).first()
    if not lang:
        raise HTTPException(status_code=400, detail="Invalid language_id")
    
    return add_entity(db, models.CandidateLanguage, data, profile.id)

def delete_language(db: Session, lang_id: int, user_id: int):
    profile = get_candidate_profile_by_user_id(db, user_id)
    if not profile: raise HTTPException(status_code=404, detail="Profile not found")
    delete_entity(db, models.CandidateLanguage, lang_id, profile.id)

# --- Skills ---
def add_skill(db: Session, data: schemas.CandidateSkillCreate, user_id: int):
    profile = get_candidate_profile_by_user_id(db, user_id)
    if not profile: raise HTTPException(status_code=404, detail="Profile not found")
    # Check if skill_id exists
    skill = db.query(models.Skill).filter(models.Skill.id == data.skill_id).first()
    if not skill:
        raise HTTPException(status_code=400, detail="Invalid skill_id")
        
    return add_entity(db, models.CandidateSkill, data, profile.id)

def delete_skill(db: Session, skill_id: int, user_id: int):
    profile = get_candidate_profile_by_user_id(db, user_id)
    if not profile: raise HTTPException(status_code=404, detail="Profile not found")
    delete_entity(db, models.CandidateSkill, skill_id, profile.id)

# --- Job Matches (Job Seeker Module 2) ---

def get_active_jobs(db: Session, title: str = None, company_name: str = None, location: str = None, employment_type: str = None):
    query = db.query(models.Job).filter(models.Job.status == models.JobStatusEnum.Open)
    
    if title:
        query = query.filter(models.Job.title.ilike(f"%{title}%"))
    if employment_type:
        query = query.filter(models.Job.employment_type == employment_type)
    if location:
        # Search across city, state, or country
        query = query.filter(
            (models.Job.location_city.ilike(f"%{location}%")) |
            (models.Job.location_state.ilike(f"%{location}%")) |
            (models.Job.location_country.ilike(f"%{location}%"))
        )
    if company_name:
        query = query.join(models.Company).filter(models.Company.name.ilike(f"%{company_name}%"))
        
    return query.all()

def get_job_details(db: Session, job_id: int):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

def apply_for_job(db: Session, job_id: int, user_id: int):
    # Check if candidate profile exists
    profile = get_candidate_profile_by_user_id(db, user_id)
    if not profile:
        raise HTTPException(status_code=400, detail="Please complete your profile before applying.")
        
    # Check if job exists and is open
    job = db.query(models.Job).filter(models.Job.id == job_id, models.Job.status == models.JobStatusEnum.Open).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job is not available.")
        
    # Check if already applied
    existing_app = db.query(models.JobApplication).filter(
        models.JobApplication.job_id == job_id,
        models.JobApplication.candidate_id == user_id
    ).first()
    
    if existing_app:
        raise HTTPException(status_code=400, detail="You have already applied for this job.")
        
    # Create application
    new_app = models.JobApplication(
        job_id=job_id,
        candidate_id=user_id,
        status=models.ApplicationStatusEnum.Applied
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    
    # Create history entry
    history = models.JobApplicationHistory(
        application_id=new_app.id,
        new_status=models.ApplicationStatusEnum.Applied,
        comment="Application submitted",
        changed_by=user_id
    )
    db.add(history)
    db.commit()
    
    return new_app

def get_my_applications(db: Session, user_id: int):
    return db.query(models.JobApplication).filter(models.JobApplication.candidate_id == user_id).all()
