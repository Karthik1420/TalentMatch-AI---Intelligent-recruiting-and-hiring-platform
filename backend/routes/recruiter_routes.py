from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from auth import get_current_recruiter
import schemas, models
from services import recruiter_service

router = APIRouter(
    prefix="/recruiter",
    tags=["Recruiter"],
    dependencies=[Depends(get_current_recruiter)]
)

def get_recruiter_profile(current_user: models.User, db: Session):
    profile = db.query(models.Recruiter).filter(models.Recruiter.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=403, detail="Recruiter profile not found")
    return profile

@router.get("/me", response_model=schemas.RecruiterProfileResponse)
def get_current_recruiter_profile(current_user: models.User = Depends(get_current_recruiter), db: Session = Depends(get_db)):
    """Fetch the current logged-in recruiter's profile and company details"""
    profile = get_recruiter_profile(current_user, db)
    # the schema expects `email` from the user, and `company` is a relationship on the profile
    # Let's populate the email manually if needed, but RecruiterResponse might need it or get it from relationship.
    # We will just return the profile, SQLAlchemy relationships should handle the rest.
    
    # We need to ensure email is populated
    response_data = profile.__dict__.copy()
    response_data['email'] = current_user.email
    response_data['company'] = profile.company
    
    return response_data

@router.post("/jobs", response_model=schemas.JobResponse)
def create_job(job: schemas.JobCreate, current_user: models.User = Depends(get_current_recruiter), db: Session = Depends(get_db)):
    """Recruiter posts a new job for their company"""
    profile = get_recruiter_profile(current_user, db)
    return recruiter_service.create_job(db=db, job=job, recruiter_id=profile.id, company_id=profile.company_id)

@router.get("/jobs", response_model=List[schemas.JobResponse])
def get_jobs(current_user: models.User = Depends(get_current_recruiter), db: Session = Depends(get_db)):
    """Recruiter retrieves list of jobs for their company"""
    profile = get_recruiter_profile(current_user, db)
    return recruiter_service.get_jobs(db=db, company_id=profile.company_id)

@router.get("/jobs/{job_id}", response_model=schemas.JobResponse)
def get_job(job_id: int, current_user: models.User = Depends(get_current_recruiter), db: Session = Depends(get_db)):
    """Recruiter gets details of a specific job"""
    profile = get_recruiter_profile(current_user, db)
    return recruiter_service.get_job(db=db, job_id=job_id, company_id=profile.company_id)

@router.put("/jobs/{job_id}", response_model=schemas.JobResponse)
def update_job(job_id: int, job_update: schemas.JobUpdate, current_user: models.User = Depends(get_current_recruiter), db: Session = Depends(get_db)):
    """Recruiter updates a specific job"""
    profile = get_recruiter_profile(current_user, db)
    return recruiter_service.update_job(db=db, job_id=job_id, company_id=profile.company_id, job_update=job_update)

@router.delete("/jobs/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(job_id: int, current_user: models.User = Depends(get_current_recruiter), db: Session = Depends(get_db)):
    """Recruiter deletes a specific job"""
    profile = get_recruiter_profile(current_user, db)
    recruiter_service.delete_job(db=db, job_id=job_id, company_id=profile.company_id)
    return None

@router.post("/jobs/{job_id}/skills", response_model=schemas.JobRequiredSkillResponse)
def add_skill_to_job(job_id: int, req_skill: schemas.JobRequiredSkillCreate, current_user: models.User = Depends(get_current_recruiter), db: Session = Depends(get_db)):
    """Recruiter adds a required skill to a job"""
    profile = get_recruiter_profile(current_user, db)
    return recruiter_service.add_skill_to_job(db=db, job_id=job_id, company_id=profile.company_id, req_skill=req_skill)

@router.delete("/jobs/{job_id}/skills/{skill_id}")
def remove_skill_from_job(job_id: int, skill_id: int, current_user: models.User = Depends(get_current_recruiter), db: Session = Depends(get_db)):
    """Recruiter removes a required skill from a job"""
    profile = get_recruiter_profile(current_user, db)
    return recruiter_service.remove_skill_from_job(db=db, job_id=job_id, skill_id=skill_id, company_id=profile.company_id)

@router.get("/skills", response_model=List[schemas.SkillResponse])
def get_all_skills(db: Session = Depends(get_db)):
    """Get list of all available skills (Master Table)"""
    return recruiter_service.get_skills(db=db)

@router.post("/skills", response_model=schemas.SkillResponse)
def create_skill(skill: schemas.SkillCreate, db: Session = Depends(get_db)):
    """Create a new skill if it doesn't exist"""
    return recruiter_service.create_skill(db=db, skill=skill)

@router.get("/jobs/{job_id}/applications", response_model=List[schemas.JobApplicationResponse])
def get_job_applications(job_id: int, current_user: models.User = Depends(get_current_recruiter), db: Session = Depends(get_db)):
    """Recruiter retrieves applications for a specific job"""
    profile = get_recruiter_profile(current_user, db)
    return recruiter_service.get_job_applications(db=db, job_id=job_id, company_id=profile.company_id)

@router.patch("/applications/{app_id}/status", response_model=schemas.JobApplicationResponse)
def update_application_status(app_id: int, status_update: schemas.ApplicationStatusUpdate, current_user: models.User = Depends(get_current_recruiter), db: Session = Depends(get_db)):
    """Recruiter updates the status of a job application (e.g. Applied -> Screened) with optional comment"""
    profile = get_recruiter_profile(current_user, db)
    return recruiter_service.update_application_status(
        db=db, 
        app_id=app_id, 
        company_id=profile.company_id, 
        recruiter_id=current_user.id, 
        update_data=status_update
    )

@router.get("/candidates/{candidate_id}/portfolio")
def get_candidate_portfolio(candidate_id: int, current_user: models.User = Depends(get_current_recruiter), db: Session = Depends(get_db)):
    """Recruiter views the portfolio of a candidate who applied to their jobs"""
    profile = get_recruiter_profile(current_user, db)
    return recruiter_service.get_candidate_portfolio(db=db, company_id=profile.company_id, candidate_id=candidate_id)
