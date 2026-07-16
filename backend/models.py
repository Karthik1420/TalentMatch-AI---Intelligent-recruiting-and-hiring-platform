import enum
from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime, Boolean, Float, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class RoleEnum(str, enum.Enum):
    admin = "admin"
    recruiter = "recruiter"
    candidate = "candidate"  # Note: updated from "user" to match schema

class EmploymentTypeEnum(str, enum.Enum):
    Full_Time = "Full-Time"
    Part_Time = "Part-Time"
    Internship = "Internship"
    Contract = "Contract"
    Freelance = "Freelance"

class WorkModeEnum(str, enum.Enum):
    Remote = "Remote"
    Hybrid = "Hybrid"
    Onsite = "Onsite"

class JobStatusEnum(str, enum.Enum):
    Open = "Open"
    Closed = "Closed"
    Draft = "Draft"

class SkillImportanceEnum(str, enum.Enum):
    Required = "Required"
    Preferred = "Preferred"
    Nice_To_Have = "Nice To Have"

class SkillLevelEnum(str, enum.Enum):
    Beginner = "Beginner"
    Intermediate = "Intermediate"
    Advanced = "Advanced"
    Expert = "Expert"

class ApplicationStatusEnum(str, enum.Enum):
    Applied = "Applied"
    Screened = "Screened"
    Interview = "Interview"
    Rejected = "Rejected"
    Hired = "Hired"

class LanguageProficiencyEnum(str, enum.Enum):
    Beginner = "Beginner"
    Intermediate = "Intermediate"
    Professional = "Professional"
    Native = "Native"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)
    
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    companies_created = relationship("Company", back_populates="creator")
    recruiter_profile = relationship("Recruiter", back_populates="user", uselist=False)
    job_applications = relationship("JobApplication", back_populates="candidate")
    candidate_profile = relationship("CandidateProfile", back_populates="user", uselist=False)

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    logo_url = Column(String, nullable=True)
    website = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    company_size = Column(String, nullable=True)
    headquarters = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    country = Column(String, nullable=True)
    founded_year = Column(Integer, nullable=True)
    description = Column(String, nullable=True)
    mission = Column(String, nullable=True)
    vision = Column(String, nullable=True)
    culture = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    facebook_url = Column(String, nullable=True)
    twitter_url = Column(String, nullable=True)
    
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    creator = relationship("User", back_populates="companies_created")
    recruiters = relationship("Recruiter", back_populates="company")
    jobs = relationship("Job", back_populates="company")

class Recruiter(Base):
    __tablename__ = "recruiters"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    designation = Column(String, nullable=True)
    department = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)
    profile_picture = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="recruiter_profile")
    company = relationship("Company", back_populates="recruiters")
    jobs = relationship("Job", back_populates="posted_by_recruiter")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    posted_by = Column(Integer, ForeignKey("recruiters.id"), nullable=False)

    title = Column(String, index=True, nullable=False)
    employment_type = Column(Enum(EmploymentTypeEnum), nullable=False)
    work_mode = Column(Enum(WorkModeEnum), nullable=False)
    department = Column(String, nullable=True)
    
    location_city = Column(String, nullable=True)
    location_state = Column(String, nullable=True)
    location_country = Column(String, nullable=True)
    
    salary_min = Column(Float, nullable=True)
    salary_max = Column(Float, nullable=True)
    currency = Column(String, nullable=True)
    
    experience_min_years = Column(Integer, nullable=True)
    experience_max_years = Column(Integer, nullable=True)
    
    required_degree = Column(String, nullable=True)
    required_specialization = Column(String, nullable=True)
    minimum_cgpa = Column(Float, nullable=True)
    
    vacancies = Column(Integer, default=1)
    
    description = Column(Text, nullable=True)
    responsibilities = Column(Text, nullable=True)
    requirements = Column(Text, nullable=True)
    preferred_qualifications = Column(Text, nullable=True)
    benefits = Column(Text, nullable=True)
    required_skills_text = Column(Text, nullable=True)
    
    application_deadline = Column(DateTime(timezone=True), nullable=True)
    status = Column(Enum(JobStatusEnum), default=JobStatusEnum.Draft)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    company = relationship("Company", back_populates="jobs")
    posted_by_recruiter = relationship("Recruiter", back_populates="jobs")
    required_skills = relationship("JobRequiredSkill", back_populates="job")
    applications = relationship("JobApplication", back_populates="job")

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False, unique=True)
    category = Column(String, index=True, nullable=True)
    
    # Relationships
    job_requirements = relationship("JobRequiredSkill", back_populates="skill")
    candidate_skills = relationship("CandidateSkill", back_populates="skill")

class JobRequiredSkill(Base):
    __tablename__ = "job_required_skills"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    
    importance = Column(Enum(SkillImportanceEnum), default=SkillImportanceEnum.Required)
    required_level = Column(Enum(SkillLevelEnum), default=SkillLevelEnum.Intermediate)

    # Relationships
    job = relationship("Job", back_populates="required_skills")
    skill = relationship("Skill", back_populates="job_requirements")

class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    status = Column(Enum(ApplicationStatusEnum), default=ApplicationStatusEnum.Applied)
    
    applied_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    job = relationship("Job", back_populates="applications")
    candidate = relationship("User", back_populates="job_applications")
    history = relationship("JobApplicationHistory", back_populates="application")

class JobApplicationHistory(Base):
    __tablename__ = "job_application_history"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("job_applications.id"), nullable=False)
    
    previous_status = Column(Enum(ApplicationStatusEnum), nullable=True)
    new_status = Column(Enum(ApplicationStatusEnum), nullable=False)
    
    comment = Column(Text, nullable=True)
    
    changed_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    changed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    application = relationship("JobApplication", back_populates="history")
    changer = relationship("User")

# --- Job Seekers / Candidate Portfolio Models ---

class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    headline = Column(String, nullable=True)
    date_of_birth = Column(String, nullable=True) # Or Date
    gender = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    alternate_phone = Column(String, nullable=True)
    email = Column(String, nullable=False)
    linkedin_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    portfolio_url = Column(String, nullable=True)
    website = Column(String, nullable=True)
    address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    country = Column(String, nullable=True)
    postal_code = Column(String, nullable=True)
    current_company = Column(String, nullable=True)
    current_designation = Column(String, nullable=True)
    current_salary = Column(String, nullable=True)
    expected_salary = Column(String, nullable=True)
    notice_period = Column(String, nullable=True)
    preferred_location = Column(String, nullable=True)
    work_authorization = Column(String, nullable=True)
    summary = Column(Text, nullable=True)
    resume_url = Column(String, nullable=True)
    profile_photo = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="candidate_profile")
    education = relationship("Education", back_populates="candidate", cascade="all, delete")
    experience = relationship("Experience", back_populates="candidate", cascade="all, delete")
    projects = relationship("Project", back_populates="candidate", cascade="all, delete")
    certifications = relationship("Certification", back_populates="candidate", cascade="all, delete")
    languages = relationship("CandidateLanguage", back_populates="candidate", cascade="all, delete")
    skills = relationship("CandidateSkill", back_populates="candidate", cascade="all, delete")

class Education(Base):
    __tablename__ = "education"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id"), nullable=False)
    degree = Column(String, nullable=False)
    specialization = Column(String, nullable=True)
    institution = Column(String, nullable=False)
    university = Column(String, nullable=True)
    start_year = Column(Integer, nullable=True)
    end_year = Column(Integer, nullable=True)
    cgpa = Column(Float, nullable=True)
    percentage = Column(Float, nullable=True)
    grade = Column(String, nullable=True)
    description = Column(Text, nullable=True)

    candidate = relationship("CandidateProfile", back_populates="education")

class Experience(Base):
    __tablename__ = "experience"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id"), nullable=False)
    company_name = Column(String, nullable=False)
    designation = Column(String, nullable=False)
    employment_type = Column(String, nullable=True)
    location = Column(String, nullable=True)
    start_date = Column(String, nullable=True)
    end_date = Column(String, nullable=True)
    currently_working = Column(Boolean, default=False)
    duration_months = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    achievements = Column(Text, nullable=True)

    candidate = relationship("CandidateProfile", back_populates="experience")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    technologies = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    live_demo_url = Column(String, nullable=True)
    start_date = Column(String, nullable=True)
    end_date = Column(String, nullable=True)

    candidate = relationship("CandidateProfile", back_populates="projects")

class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id"), nullable=False)
    certificate_name = Column(String, nullable=False)
    issuer = Column(String, nullable=False)
    issue_date = Column(String, nullable=True)
    expiry_date = Column(String, nullable=True)
    credential_id = Column(String, nullable=True)
    credential_url = Column(String, nullable=True)
    certificate_file_url = Column(String, nullable=True)

    candidate = relationship("CandidateProfile", back_populates="certifications")

class Language(Base):
    __tablename__ = "languages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    
    candidate_languages = relationship("CandidateLanguage", back_populates="language")

class CandidateLanguage(Base):
    __tablename__ = "candidate_languages"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id"), nullable=False)
    language_id = Column(Integer, ForeignKey("languages.id"), nullable=False)
    proficiency = Column(Enum(LanguageProficiencyEnum), default=LanguageProficiencyEnum.Professional)

    candidate = relationship("CandidateProfile", back_populates="languages")
    language = relationship("Language", back_populates="candidate_languages")

class CandidateSkill(Base):
    __tablename__ = "candidate_skills"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidate_profiles.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    proficiency = Column(String, nullable=True) # Optional enum can be used, but string works too
    experience_years = Column(Integer, nullable=True)

    candidate = relationship("CandidateProfile", back_populates="skills")
    skill = relationship("Skill", back_populates="candidate_skills")
