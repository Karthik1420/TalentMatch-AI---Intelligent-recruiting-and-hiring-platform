from pydantic import BaseModel, EmailStr
from typing import Optional, List
from enum import Enum
from datetime import datetime
from models import (
    EmploymentTypeEnum, WorkModeEnum, JobStatusEnum,
    SkillImportanceEnum, SkillLevelEnum, ApplicationStatusEnum,
    LanguageProficiencyEnum, InterviewStatusEnum
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

# --- Tags Schemas ---
class TagCreate(BaseModel):
    name: str

class TagResponse(TagCreate):
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
    tag_ids: Optional[List[int]] = []

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
    tag_ids: Optional[List[int]] = None

class JobResponse(JobCreate):
    id: int
    company_id: int
    posted_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    required_skills: List[JobRequiredSkillResponse] = []
    company: Optional[CompanyResponse] = None
    tags: List[TagResponse] = []
    tag_match_score: Optional[int] = 0

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

class JobApplicationCandidateProfile(BaseModel):
    first_name: str
    last_name: str
    profile_photo: Optional[str] = None
    
    class Config:
        from_attributes = True

class JobApplicationCandidate(BaseModel):
    id: int
    email: str
    candidate_profile: Optional[JobApplicationCandidateProfile] = None
    
    class Config:
        from_attributes = True

class AIEvaluationResponse(BaseModel):
    id: int
    application_id: int
    candidate_id: int
    recruiter_id: int
    job_id: int
    ats_score: Optional[int] = None
    summary: Optional[str] = None
    pros: Optional[str] = None
    cons: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class InterviewCreate(BaseModel):
    scheduled_time: datetime
    duration_minutes: int = 30

class InterviewResponse(BaseModel):
    id: int
    application_id: int
    scheduled_by: int
    scheduled_time: datetime
    duration_minutes: int
    meet_link: Optional[str] = None
    status: InterviewStatusEnum
    created_at: datetime
    
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
    candidate: Optional[JobApplicationCandidate] = None
    ai_evaluation: Optional[AIEvaluationResponse] = None
    interviews: List[InterviewResponse] = []

    class Config:
        from_attributes = True

class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatusEnum
    comment: Optional[str] = None

# --- Candidate Portfolio Schemas ---

class EducationCreate(BaseModel):
    degree: str
    specialization: Optional[str] = None
    institution: str
    university: Optional[str] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    cgpa: Optional[float] = None
    percentage: Optional[float] = None
    grade: Optional[str] = None
    description: Optional[str] = None

class EducationResponse(EducationCreate):
    id: int
    candidate_id: int

    class Config:
        from_attributes = True

class ExperienceCreate(BaseModel):
    company_name: str
    designation: str
    employment_type: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    currently_working: bool = False
    duration_months: Optional[int] = None
    description: Optional[str] = None
    achievements: Optional[str] = None

class ExperienceResponse(ExperienceCreate):
    id: int
    candidate_id: int

    class Config:
        from_attributes = True

class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    technologies: Optional[str] = None
    github_url: Optional[str] = None
    live_demo_url: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class ProjectResponse(ProjectCreate):
    id: int
    candidate_id: int

    class Config:
        from_attributes = True

class CertificationCreate(BaseModel):
    certificate_name: str
    issuer: str
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None

class CertificationResponse(CertificationCreate):
    id: int
    candidate_id: int
    certificate_file_url: Optional[str] = None

    class Config:
        from_attributes = True

class LanguageCreate(BaseModel):
    name: str

class LanguageResponse(LanguageCreate):
    id: int

    class Config:
        from_attributes = True

class CandidateLanguageCreate(BaseModel):
    language_id: int
    proficiency: Optional[LanguageProficiencyEnum] = LanguageProficiencyEnum.Professional

class CandidateLanguageResponse(BaseModel):
    id: int
    candidate_id: int
    language: LanguageResponse
    proficiency: LanguageProficiencyEnum

    class Config:
        from_attributes = True

class CandidateSkillCreate(BaseModel):
    skill_id: int
    proficiency: Optional[str] = None
    experience_years: Optional[int] = None

class CandidateSkillResponse(BaseModel):
    id: int
    candidate_id: int
    skill: SkillResponse
    proficiency: Optional[str] = None
    experience_years: Optional[int] = None

    class Config:
        from_attributes = True

class CandidateProfileCreate(BaseModel):
    first_name: str
    last_name: str
    headline: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    alternate_phone: Optional[str] = None
    email: EmailStr
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    current_company: Optional[str] = None
    current_designation: Optional[str] = None
    current_salary: Optional[str] = None
    expected_salary: Optional[str] = None
    notice_period: Optional[str] = None
    preferred_location: Optional[str] = None
    work_authorization: Optional[str] = None
    summary: Optional[str] = None
    resume_url: Optional[str] = None
    profile_photo: Optional[str] = None
    tag_ids: Optional[List[int]] = []

class CandidateProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    headline: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    alternate_phone: Optional[str] = None
    email: Optional[EmailStr] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    current_company: Optional[str] = None
    current_designation: Optional[str] = None
    current_salary: Optional[str] = None
    expected_salary: Optional[str] = None
    notice_period: Optional[str] = None
    preferred_location: Optional[str] = None
    work_authorization: Optional[str] = None
    summary: Optional[str] = None
    resume_url: Optional[str] = None
    profile_photo: Optional[str] = None
    tag_ids: Optional[List[int]] = None

class CandidateProfileResponse(CandidateProfileCreate):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    career_tags: List[TagResponse] = []

    class Config:
        from_attributes = True

class CandidatePortfolioResponse(BaseModel):
    profile: CandidateProfileResponse
    education: List[EducationResponse] = []
    experience: List[ExperienceResponse] = []
    projects: List[ProjectResponse] = []
    certifications: List[CertificationResponse] = []
    languages: List[CandidateLanguageResponse] = []
    skills: List[CandidateSkillResponse] = []
