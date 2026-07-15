from pydantic import BaseModel, EmailStr
from typing import Optional, List
from enum import Enum
from datetime import datetime
from models import (
    EmploymentTypeEnum, WorkModeEnum, JobStatusEnum,
    SkillImportanceEnum, SkillLevelEnum, ApplicationStatusEnum
)

class RoleEnum(str, Enum):
    admin = "admin"
    recruiter = "recruiter"
    candidate = "candidate"

class CompanyCreate(BaseModel):
    name: str
    logo_url: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    headquarters: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    founded_year: Optional[int] = None
    description: Optional[str] = None
    mission: Optional[str] = None
    vision: Optional[str] = None
    culture: Optional[str] = None
    linkedin_url: Optional[str] = None
    facebook_url: Optional[str] = None
    twitter_url: Optional[str] = None

class CompanyResponse(CompanyCreate):
    id: int
    created_by: Optional[int] = None

    class Config:
        from_attributes = True

class RecruiterCreate(BaseModel):
    email: EmailStr
    password: str
    company_id: int
    designation: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    profile_picture: Optional[str] = None

class RecruiterUpdate(BaseModel):
    designation: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    profile_picture: Optional[str] = None

class RecruiterResponse(BaseModel):
    id: int
    user_id: int
    company_id: int
    email: Optional[EmailStr] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    profile_picture: Optional[str] = None
    is_active: bool = True
    
    class Config:
        from_attributes = True

class RecruiterProfileResponse(RecruiterResponse):
    company: CompanyResponse
    
    class Config:
        from_attributes = True

class PasswordConfirm(BaseModel):
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: RoleEnum
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: RoleEnum
    user_id: int

# --- Skills Schemas ---
class SkillCreate(BaseModel):
    name: str
    category: Optional[str] = None

class SkillResponse(SkillCreate):
    id: int

    class Config:
        from_attributes = True

# --- Job Required Skills Schemas ---
class JobRequiredSkillCreate(BaseModel):
    skill_id: int
    importance: SkillImportanceEnum = SkillImportanceEnum.Required
    required_level: SkillLevelEnum = SkillLevelEnum.Intermediate

class JobRequiredSkillResponse(BaseModel):
    id: int
    job_id: int
    skill: SkillResponse
    importance: SkillImportanceEnum
    required_level: SkillLevelEnum

    class Config:
        from_attributes = True

# --- Jobs Schemas ---
class JobCreate(BaseModel):
    title: str
    employment_type: EmploymentTypeEnum
    work_mode: WorkModeEnum
    department: Optional[str] = None
    
    location_city: Optional[str] = None
    location_state: Optional[str] = None
    location_country: Optional[str] = None
    
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    currency: Optional[str] = None
    
    experience_min_years: Optional[int] = None
    experience_max_years: Optional[int] = None
    
    required_degree: Optional[str] = None
    required_specialization: Optional[str] = None
    minimum_cgpa: Optional[float] = None
    
    vacancies: Optional[int] = 1
    
    description: Optional[str] = None
    responsibilities: Optional[str] = None
    requirements: Optional[str] = None
    preferred_qualifications: Optional[str] = None
    benefits: Optional[str] = None
    required_skills_text: Optional[str] = None
    
    application_deadline: Optional[datetime] = None
    status: JobStatusEnum = JobStatusEnum.Draft

class JobUpdate(BaseModel):
    title: Optional[str] = None
    employment_type: Optional[EmploymentTypeEnum] = None
    work_mode: Optional[WorkModeEnum] = None
    department: Optional[str] = None
    location_city: Optional[str] = None
    location_state: Optional[str] = None
    location_country: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    currency: Optional[str] = None
    experience_min_years: Optional[int] = None
    experience_max_years: Optional[int] = None
    required_degree: Optional[str] = None
    required_specialization: Optional[str] = None
    minimum_cgpa: Optional[float] = None
    vacancies: Optional[int] = None
    description: Optional[str] = None
    responsibilities: Optional[str] = None
    requirements: Optional[str] = None
    preferred_qualifications: Optional[str] = None
    benefits: Optional[str] = None
    required_skills_text: Optional[str] = None
    application_deadline: Optional[datetime] = None
    status: Optional[JobStatusEnum] = None

class JobResponse(JobCreate):
    id: int
    company_id: int
    posted_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    required_skills: List[JobRequiredSkillResponse] = []

    class Config:
        from_attributes = True

# --- Application Schemas ---
class JobApplicationHistoryResponse(BaseModel):
    id: int
    application_id: int
    previous_status: Optional[ApplicationStatusEnum] = None
    new_status: ApplicationStatusEnum
    comment: Optional[str] = None
    changed_by: int
    changed_at: datetime

    class Config:
        from_attributes = True

class JobApplicationResponse(BaseModel):
    id: int
    job_id: int
    candidate_id: int
    status: ApplicationStatusEnum
    applied_at: datetime
    updated_at: Optional[datetime] = None
    history: List[JobApplicationHistoryResponse] = []

    class Config:
        from_attributes = True

class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatusEnum
    comment: Optional[str] = None
