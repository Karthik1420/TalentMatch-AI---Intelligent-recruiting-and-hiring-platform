from sqlalchemy.orm import Session
from fastapi import HTTPException
import models, schemas, auth

def get_companies(db: Session):
    return db.query(models.Company).all()

def create_company(db: Session, company: schemas.CompanyCreate, admin_id: int):
    new_company = models.Company(
        name=company.name,
        logo_url=company.logo_url,
        website=company.website,
        industry=company.industry,
        company_size=company.company_size,
        headquarters=company.headquarters,
        city=company.city,
        state=company.state,
        country=company.country,
        founded_year=company.founded_year,
        description=company.description,
        mission=company.mission,
        vision=company.vision,
        culture=company.culture,
        linkedin_url=company.linkedin_url,
        facebook_url=company.facebook_url,
        twitter_url=company.twitter_url,
        created_by=admin_id
    )
    db.add(new_company)
    db.commit()
    db.refresh(new_company)
    return new_company

def create_recruiter(db: Session, recruiter: schemas.RecruiterCreate):
    # Ensure company exists
    company = db.query(models.Company).filter(models.Company.id == recruiter.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    # Ensure email is unique
    db_user = db.query(models.User).filter(models.User.email == recruiter.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = auth.get_password_hash(recruiter.password)
    
    # 1. Create the User record
    new_user = models.User(
        email=recruiter.email, 
        hashed_password=hashed_password, 
        role=models.RoleEnum.recruiter,
        is_verified=True,
        is_active=True
    )
    db.add(new_user)
    db.flush() # Get user ID before committing
    
    # 2. Create the Recruiter record
    new_recruiter = models.Recruiter(
        user_id=new_user.id,
        company_id=company.id,
        designation=recruiter.designation,
        department=recruiter.department,
        phone=recruiter.phone,
        linkedin_url=recruiter.linkedin_url,
        profile_picture=recruiter.profile_picture
    )
    db.add(new_recruiter)
    db.commit()
    db.refresh(new_recruiter)
    
    return new_recruiter

def get_recruiters(db: Session, company_id: int):
    # Fetch recruiters and their associated user (for email)
    recruiters = db.query(models.Recruiter).filter(models.Recruiter.company_id == company_id).all()
    
    result = []
    for r in recruiters:
        # Convert to dictionary and attach email
        r_dict = {
            "id": r.id,
            "user_id": r.user_id,
            "company_id": r.company_id,
            "designation": r.designation,
            "department": r.department,
            "phone": r.phone,
            "linkedin_url": r.linkedin_url,
            "profile_picture": r.profile_picture,
            "email": r.user.email if r.user else None
        }
        result.append(r_dict)
    return result

def update_recruiter(db: Session, recruiter_id: int, recruiter_update: schemas.RecruiterUpdate):
    db_recruiter = db.query(models.Recruiter).filter(models.Recruiter.id == recruiter_id).first()
    if not db_recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")
        
    update_data = recruiter_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_recruiter, key, value)
        
    db.commit()
    db.refresh(db_recruiter)
    
    # Return mapped dict with email
    return {
        "id": db_recruiter.id,
        "user_id": db_recruiter.user_id,
        "company_id": db_recruiter.company_id,
        "designation": db_recruiter.designation,
        "department": db_recruiter.department,
        "phone": db_recruiter.phone,
        "linkedin_url": db_recruiter.linkedin_url,
        "profile_picture": db_recruiter.profile_picture,
        "email": db_recruiter.user.email if db_recruiter.user else None,
        "is_active": db_recruiter.user.is_active if db_recruiter.user else False
    }

def toggle_recruiter_status(db: Session, recruiter_id: int):
    db_recruiter = db.query(models.Recruiter).filter(models.Recruiter.id == recruiter_id).first()
    if not db_recruiter or not db_recruiter.user:
        raise HTTPException(status_code=404, detail="Recruiter not found")
        
    db_recruiter.user.is_active = not db_recruiter.user.is_active
    db.commit()
    
    return {
        "id": db_recruiter.id,
        "user_id": db_recruiter.user_id,
        "company_id": db_recruiter.company_id,
        "email": db_recruiter.user.email,
        "is_active": db_recruiter.user.is_active
    }

def delete_recruiter(db: Session, recruiter_id: int, password: str, admin_user: models.User):
    if not auth.verify_password(password, admin_user.hashed_password):
        raise HTTPException(status_code=403, detail="Invalid admin password")
        
    db_recruiter = db.query(models.Recruiter).filter(models.Recruiter.id == recruiter_id).first()
    if not db_recruiter:
        raise HTTPException(status_code=404, detail="Recruiter not found")
        
    db_user = db_recruiter.user
    
    db.delete(db_recruiter)
    if db_user:
        db.delete(db_user)
        
    db.commit()
    return {"message": "Recruiter deleted successfully"}

def delete_company(db: Session, company_id: int, password: str, admin_user: models.User):
    if not auth.verify_password(password, admin_user.hashed_password):
        raise HTTPException(status_code=403, detail="Invalid admin password")
        
    db_company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    # Delete associated recruiters and their users first
    recruiters = db.query(models.Recruiter).filter(models.Recruiter.company_id == company_id).all()
    for r in recruiters:
        u = r.user
        db.delete(r)
        if u:
            db.delete(u)
            
    # Delete the company
    db.delete(db_company)
    db.commit()
    return {"message": "Company and associated recruiters deleted successfully"}

