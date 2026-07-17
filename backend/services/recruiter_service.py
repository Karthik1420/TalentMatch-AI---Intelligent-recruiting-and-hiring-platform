from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import models, schemas

def create_job(db: Session, job: schemas.JobCreate, recruiter_id: int, company_id: int):
    new_job = models.Job(
        company_id=company_id,
        posted_by=recruiter_id,
        title=job.title,
        employment_type=job.employment_type,
        work_mode=job.work_mode,
        department=job.department,
        location_city=job.location_city,
        location_state=job.location_state,
        location_country=job.location_country,
        salary_min=job.salary_min,
        salary_max=job.salary_max,
        currency=job.currency,
        experience_min_years=job.experience_min_years,
        experience_max_years=job.experience_max_years,
        required_degree=job.required_degree,
        required_specialization=job.required_specialization,
        minimum_cgpa=job.minimum_cgpa,
        vacancies=job.vacancies,
        description=job.description,
        responsibilities=job.responsibilities,
        requirements=job.requirements,
        preferred_qualifications=job.preferred_qualifications,
        benefits=job.benefits,
        required_skills_text=job.required_skills_text,
        application_deadline=job.application_deadline,
        status=job.status
    )
    db.add(new_job)
    
    if job.tag_ids is not None:
        tags = db.query(models.Tag).filter(models.Tag.id.in_(job.tag_ids)).all()
        new_job.tags = tags
        
    db.commit()
    db.refresh(new_job)
    return new_job

def get_jobs(db: Session, company_id: int):
    return db.query(models.Job).filter(models.Job.company_id == company_id).all()

def get_job(db: Session, job_id: int, company_id: int):
    job = db.query(models.Job).filter(models.Job.id == job_id, models.Job.company_id == company_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found or access denied")
    return job

def update_job(db: Session, job_id: int, company_id: int, job_update: schemas.JobUpdate):
    job = get_job(db, job_id, company_id)
    
    update_data = job_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "tag_ids":
            tags = db.query(models.Tag).filter(models.Tag.id.in_(value)).all()
            job.tags = tags
        else:
            setattr(job, key, value)
        
    db.commit()
    db.refresh(job)
    return job

def delete_job(db: Session, job_id: int, company_id: int):
    job = get_job(db, job_id, company_id)
    db.delete(job)
    db.commit()
    return True


def get_skills(db: Session):
    return db.query(models.Skill).all()

def create_skill(db: Session, skill: schemas.SkillCreate):
    existing = db.query(models.Skill).filter(models.Skill.name == skill.name).first()
    if existing:
        return existing
        
    new_skill = models.Skill(name=skill.name, category=skill.category)
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    return new_skill

def add_skill_to_job(db: Session, job_id: int, company_id: int, req_skill: schemas.JobRequiredSkillCreate):
    # Verify job belongs to company
    job = get_job(db, job_id, company_id)
    
    # Verify skill exists
    skill = db.query(models.Skill).filter(models.Skill.id == req_skill.skill_id).first()
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
        
    # Check if already added
    existing = db.query(models.JobRequiredSkill).filter(
        models.JobRequiredSkill.job_id == job_id,
        models.JobRequiredSkill.skill_id == req_skill.skill_id
    ).first()
    
    if existing:
        existing.importance = req_skill.importance
        existing.required_level = req_skill.required_level
        db.commit()
        db.refresh(existing)
        return existing
        
    new_req_skill = models.JobRequiredSkill(
        job_id=job_id,
        skill_id=req_skill.skill_id,
        importance=req_skill.importance,
        required_level=req_skill.required_level
    )
    db.add(new_req_skill)
    db.commit()
    db.refresh(new_req_skill)
    return new_req_skill

def remove_skill_from_job(db: Session, job_id: int, skill_id: int, company_id: int):
    # Verify job belongs to company
    get_job(db, job_id, company_id)
    
    req_skill = db.query(models.JobRequiredSkill).filter(
        models.JobRequiredSkill.job_id == job_id,
        models.JobRequiredSkill.skill_id == skill_id
    ).first()
    
    if not req_skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Required skill not found for this job")
        
    db.delete(req_skill)
    db.commit()
    return {"message": "Skill removed from job successfully"}

def get_job_applications(db: Session, job_id: int, company_id: int):
    # Verify job belongs to company
    job = get_job(db, job_id, company_id)
    return db.query(models.JobApplication).filter(models.JobApplication.job_id == job_id).all()

def update_application_status(db: Session, app_id: int, company_id: int, recruiter_id: int, update_data: schemas.ApplicationStatusUpdate):
    # First, verify the application belongs to a job from this company
    application = db.query(models.JobApplication).join(models.Job).filter(
        models.JobApplication.id == app_id,
        models.Job.company_id == company_id
    ).first()
    
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found or access denied")
        
    previous_status = application.status
    
    # Update the status
    application.status = update_data.status
    db.commit()
    db.refresh(application)
    
    # Record history
    history = models.JobApplicationHistory(
        application_id=application.id,
        previous_status=previous_status,
        new_status=update_data.status,
        comment=update_data.comment,
        changed_by=recruiter_id
    )
    db.add(history)
    db.commit()
    
    return application

def get_candidate_portfolio(db: Session, company_id: int, candidate_id: int):
    # Verify that the candidate has applied to at least one job at this company
    application = db.query(models.JobApplication).join(models.Job).filter(
        models.JobApplication.candidate_id == candidate_id,
        models.Job.company_id == company_id
    ).first()
    
    if not application:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have access to this candidate's portfolio")
        
    from services.candidate_service import get_full_portfolio
    return get_full_portfolio(db, candidate_id)

def schedule_interview(db: Session, app_id: int, company_id: int, recruiter_id: int, interview_data: schemas.InterviewCreate):
    application = db.query(models.JobApplication).join(models.Job).filter(
        models.JobApplication.id == app_id,
        models.Job.company_id == company_id
    ).first()
    
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found or access denied")
        
    recruiter_profile = db.query(models.Recruiter).filter(models.Recruiter.user_id == recruiter_id).first()
    if not recruiter_profile or not recruiter_profile.google_refresh_token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google Calendar is not connected. Please connect your account first.")
        
    candidate_user = application.candidate
    candidate_email = candidate_user.email
    recruiter_user = recruiter_profile.user
    recruiter_email = recruiter_user.email
    job_title = application.job.title
    company_name = application.job.company.name
    
    from services.google_calendar_service import create_interview_event
    from services.email_service import send_interview_invitation
    
    try:
        event_result = create_interview_event(
            refresh_token=recruiter_profile.google_refresh_token,
            candidate_email=candidate_email,
            recruiter_email=recruiter_email,
            start_time=interview_data.scheduled_time.isoformat(),
            duration_minutes=interview_data.duration_minutes,
            job_title=job_title
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Google API Error: {str(e)}")
        
    new_interview = models.Interview(
        application_id=application.id,
        scheduled_by=recruiter_id,
        scheduled_time=interview_data.scheduled_time,
        duration_minutes=interview_data.duration_minutes,
        google_event_id=event_result.get("event_id"),
        meet_link=event_result.get("meet_link"),
        status=models.InterviewStatusEnum.Scheduled
    )
    db.add(new_interview)
    
    previous_status = application.status
    application.status = models.ApplicationStatusEnum.Interview
    
    history = models.JobApplicationHistory(
        application_id=application.id,
        previous_status=previous_status,
        new_status=models.ApplicationStatusEnum.Interview,
        comment=f"Interview scheduled.",
        changed_by=recruiter_id
    )
    db.add(history)
    db.commit()
    db.refresh(new_interview)
    
    if event_result.get("meet_link"):
        send_interview_invitation(
            to_email=candidate_email,
            company_name=company_name,
            job_title=job_title,
            scheduled_time=interview_data.scheduled_time.strftime("%Y-%m-%d %H:%M:%S"),
            meet_link=event_result.get("meet_link")
        )
        
    return new_interview
