from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
import models, schemas, auth
from services import candidate_service

router = APIRouter(
    prefix="/candidate",
    tags=["Candidate / Job Seeker"]
)

# --- Master Data for Candidate (Skills and Languages) ---
@router.get("/master/skills", response_model=List[schemas.SkillResponse])
def get_master_skills(db: Session = Depends(get_db)):
    return db.query(models.Skill).all()

@router.post("/master/skills", response_model=schemas.SkillResponse)
def create_master_skill(skill: schemas.SkillCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Skill).filter(models.Skill.name.ilike(skill.name)).first()
    if existing:
        return existing
    new_skill = models.Skill(name=skill.name, category=skill.category)
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    return new_skill

@router.get("/master/languages", response_model=List[schemas.LanguageResponse])
def get_master_languages(db: Session = Depends(get_db)):
    return db.query(models.Language).all()

@router.post("/master/languages", response_model=schemas.LanguageResponse)
def create_master_language(lang: schemas.LanguageCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Language).filter(models.Language.name.ilike(lang.name)).first()
    if existing:
        return existing
    new_lang = models.Language(name=lang.name)
    db.add(new_lang)
    db.commit()
    db.refresh(new_lang)
    return new_lang

# --- Portfolio Retrieval ---
@router.get("/portfolio", response_model=schemas.CandidatePortfolioResponse)
def get_portfolio(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_candidate)):
    """Get the full portfolio for the logged-in candidate."""
    return candidate_service.get_full_portfolio(db=db, user_id=current_user.id)

# --- Candidate Profile ---
@router.post("/profile", response_model=schemas.CandidateProfileResponse)
def create_profile(profile_data: schemas.CandidateProfileCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_candidate)):
    return candidate_service.create_profile(db=db, profile_data=profile_data, user_id=current_user.id)

@router.put("/profile", response_model=schemas.CandidateProfileResponse)
def update_profile(
    profile_data: schemas.CandidateProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_candidate)
):
    return candidate_service.update_profile(db=db, profile_data=profile_data, user_id=current_user.id)

@router.post("/profile/photo", response_model=schemas.CandidateProfileResponse)
def upload_profile_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_candidate)
):
    profile = candidate_service.get_candidate_profile_by_user_id(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    if profile.profile_photo:
        candidate_service.delete_file(profile.profile_photo)
    
    file_url = candidate_service.handle_file_upload(file, folder="profile_photos")
    profile.profile_photo = file_url
    db.commit()
    db.refresh(profile)
    return profile

# --- Education ---
@router.post("/education", response_model=schemas.EducationResponse)
def add_education(data: schemas.EducationCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_candidate)):
    return candidate_service.add_education(db=db, data=data, user_id=current_user.id)

@router.put("/education/{ed_id}", response_model=schemas.EducationResponse)
def update_education(ed_id: int, data: schemas.EducationCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_candidate)):
    return candidate_service.update_education(db=db, ed_id=ed_id, data=data, user_id=current_user.id)

@router.delete("/education/{ed_id}")
def delete_education(ed_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_candidate)):
    candidate_service.delete_education(db=db, ed_id=ed_id, user_id=current_user.id)
    return {"detail": "Education deleted successfully"}

# --- Experience ---
@router.post("/experience", response_model=schemas.ExperienceResponse)
def add_experience(data: schemas.ExperienceCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_candidate)):
    return candidate_service.add_experience(db=db, data=data, user_id=current_user.id)

@router.put("/experience/{exp_id}", response_model=schemas.ExperienceResponse)
def update_experience(exp_id: int, data: schemas.ExperienceCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_candidate)):
    return candidate_service.update_experience(db=db, exp_id=exp_id, data=data, user_id=current_user.id)

@router.delete("/experience/{exp_id}")
def delete_experience(exp_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_candidate)):
    candidate_service.delete_experience(db=db, exp_id=exp_id, user_id=current_user.id)
    return {"detail": "Experience deleted successfully"}

# --- Projects ---
@router.post("/projects", response_model=schemas.ProjectResponse)
def add_project(data: schemas.ProjectCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_candidate)):
    return candidate_service.add_project(db=db, data=data, user_id=current_user.id)

@router.put("/projects/{proj_id}", response_model=schemas.ProjectResponse)
def update_project(proj_id: int, data: schemas.ProjectCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_candidate)):
    return candidate_service.update_project(db=db, proj_id=proj_id, data=data, user_id=current_user.id)

@router.delete("/projects/{proj_id}")
def delete_project(proj_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_candidate)):
    candidate_service.delete_project(db=db, proj_id=proj_id, user_id=current_user.id)
    return {"detail": "Project deleted successfully"}

# --- Certifications (Multipart Form) ---
@router.post("/certifications", response_model=schemas.CertificationResponse)
def add_certification(
    certificate_name: str = Form(...),
    issuer: str = Form(...),
    issue_date: Optional[str] = Form(None),
    expiry_date: Optional[str] = Form(None),
    credential_id: Optional[str] = Form(None),
    credential_url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_candidate)
):
    data = schemas.CertificationCreate(
        certificate_name=certificate_name,
        issuer=issuer,
        issue_date=issue_date,
        expiry_date=expiry_date,
        credential_id=credential_id,
        credential_url=credential_url
    )
    return candidate_service.add_certification(db=db, data=data, user_id=current_user.id, file=file)

@router.put("/certifications/{cert_id}", response_model=schemas.CertificationResponse)
def update_certification(
    cert_id: int,
    certificate_name: str = Form(...),
    issuer: str = Form(...),
    issue_date: Optional[str] = Form(None),
    expiry_date: Optional[str] = Form(None),
    credential_id: Optional[str] = Form(None),
    credential_url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_candidate)
):
    data = schemas.CertificationCreate(
        certificate_name=certificate_name,
        issuer=issuer,
        issue_date=issue_date,
        expiry_date=expiry_date,
        credential_id=credential_id,
        credential_url=credential_url
    )
    return candidate_service.update_certification(db=db, cert_id=cert_id, data=data, user_id=current_user.id, file=file)

@router.delete("/certifications/{cert_id}")
def delete_certification(cert_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_candidate)):
    candidate_service.delete_certification(db=db, cert_id=cert_id, user_id=current_user.id)
    return {"detail": "Certification deleted successfully"}

# --- Languages ---
@router.post("/languages", response_model=schemas.CandidateLanguageResponse)
def add_language(data: schemas.CandidateLanguageCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_candidate)):
    return candidate_service.add_language(db=db, data=data, user_id=current_user.id)

@router.delete("/languages/{lang_id}")
def delete_language(lang_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_candidate)):
    candidate_service.delete_language(db=db, lang_id=lang_id, user_id=current_user.id)
    return {"detail": "Language removed successfully"}

# --- Skills ---
@router.post("/skills", response_model=schemas.CandidateSkillResponse)
def add_skill(data: schemas.CandidateSkillCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_candidate)):
    return candidate_service.add_skill(db=db, data=data, user_id=current_user.id)

@router.delete("/skills/{skill_id}")
def delete_skill(skill_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_candidate)):
    candidate_service.delete_skill(db=db, skill_id=skill_id, user_id=current_user.id)
    return {"detail": "Skill removed successfully"}

# --- Job Matches (Job Seeker Module 2) ---

@router.get("/jobs", response_model=List[schemas.JobResponse])
def get_active_jobs(
    title: Optional[str] = None,
    company_name: Optional[str] = None,
    location: Optional[str] = None,
    employment_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_candidate)
):
    return candidate_service.get_active_jobs(
        db=db, title=title, company_name=company_name, location=location, employment_type=employment_type
    )

@router.get("/jobs/{job_id}", response_model=schemas.JobResponse)
def get_job_details(job_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_candidate)):
    return candidate_service.get_job_details(db=db, job_id=job_id)

@router.post("/jobs/{job_id}/apply", response_model=schemas.JobApplicationResponse)
def apply_for_job(job_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_candidate)):
    return candidate_service.apply_for_job(db=db, job_id=job_id, user_id=current_user.id, background_tasks=background_tasks)

@router.get("/applications", response_model=List[schemas.JobApplicationResponse])
def get_my_applications(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_candidate)):
    return candidate_service.get_my_applications(db=db, user_id=current_user.id)
