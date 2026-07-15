from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import shutil
import uuid
import os
from database import get_db
from auth import get_current_admin
import schemas, models
from services import admin_service, email_service

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[Depends(get_current_admin)]
)

@router.post("/upload")
def upload_image(file: UploadFile = File(...)):
    """Upload a company logo or image and return its URL"""
    file_extension = file.filename.split(".")[-1]
    new_filename = f"{uuid.uuid4()}.{file_extension}"
    file_location = f"static/images/{new_filename}"
    
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
        
    return {"url": f"http://localhost:8000/static/images/{new_filename}"}

@router.get("/companies", response_model=List[schemas.CompanyResponse])
def get_companies(db: Session = Depends(get_db)):
    """Admin retrieves list of companies"""
    return admin_service.get_companies(db=db)

@router.post("/company", response_model=schemas.CompanyResponse)
def create_company(company: schemas.CompanyCreate, current_admin: models.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Admin creates a new company"""
    return admin_service.create_company(db=db, company=company, admin_id=current_admin.id)

@router.get("/company/{company_id}/recruiters", response_model=List[schemas.RecruiterResponse])
def get_recruiters(company_id: int, db: Session = Depends(get_db)):
    """Admin retrieves list of recruiters for a specific company"""
    return admin_service.get_recruiters(db=db, company_id=company_id)

@router.post("/recruiter", response_model=schemas.RecruiterResponse)
def create_recruiter(recruiter: schemas.RecruiterCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Admin creates a new recruiter for a specific company"""
    db_recruiter = admin_service.create_recruiter(db=db, recruiter=recruiter)
    
    # Send email in background
    company_name = db_recruiter.company.name if db_recruiter.company else "TalentMatch AI"
    background_tasks.add_task(
        email_service.send_recruiter_credentials,
        to_email=recruiter.email,
        password=recruiter.password,
        company_name=company_name
    )
    
    return {
        "id": db_recruiter.id,
        "user_id": db_recruiter.user_id,
        "company_id": db_recruiter.company_id,
        "designation": db_recruiter.designation,
        "department": db_recruiter.department,
        "phone": db_recruiter.phone,
        "linkedin_url": db_recruiter.linkedin_url,
        "profile_picture": db_recruiter.profile_picture,
        "email": db_recruiter.user.email if db_recruiter.user else None
    }

@router.put("/recruiter/{recruiter_id}", response_model=schemas.RecruiterResponse)
def update_recruiter(recruiter_id: int, recruiter_update: schemas.RecruiterUpdate, db: Session = Depends(get_db)):
    """Admin updates recruiter details"""
    return admin_service.update_recruiter(db=db, recruiter_id=recruiter_id, recruiter_update=recruiter_update)

@router.patch("/recruiter/{recruiter_id}/toggle-active")
def toggle_recruiter_status(recruiter_id: int, db: Session = Depends(get_db)):
    """Admin toggles a recruiter's active status"""
    return admin_service.toggle_recruiter_status(db=db, recruiter_id=recruiter_id)

@router.post("/recruiter/{recruiter_id}/delete")
def delete_recruiter(recruiter_id: int, payload: schemas.PasswordConfirm, current_admin: models.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Admin securely deletes a recruiter and their account"""
    return admin_service.delete_recruiter(db=db, recruiter_id=recruiter_id, password=payload.password, admin_user=current_admin)

@router.post("/company/{company_id}/delete")
def delete_company(company_id: int, payload: schemas.PasswordConfirm, current_admin: models.User = Depends(get_current_admin), db: Session = Depends(get_db)):
    """Admin securely deletes a company and all associated recruiters"""
    return admin_service.delete_company(db=db, company_id=company_id, password=payload.password, admin_user=current_admin)
