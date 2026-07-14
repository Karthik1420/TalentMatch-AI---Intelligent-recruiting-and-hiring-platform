from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum

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
