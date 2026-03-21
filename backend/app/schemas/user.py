from pydantic import BaseModel, EmailStr
from datetime import datetime

# REMOVED: The line "from app.schemas.user import ..." which was causing
# the circular import error.

class UserCreate(BaseModel):
    email: EmailStr
    name: str | None = None

class UserProfileUpdate(BaseModel):
    name: str | None = None
    phone_number: str | None = None
    profile_image: str | None = None
    address: str | None = None
    bio: str | None = None
    date_of_birth: str | None = None

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    name: str | None = None
    google_refresh_token: str | None = None
    
    # Profile fields
    phone_number: str | None = None
    profile_image: str | None = None
    address: str | None = None
    bio: str | None = None
    date_of_birth: str | None = None
    
    class Config:
        from_attributes = True

class StoreTokenRequest(BaseModel):
    """The request body for storing the refresh token."""
    refresh_token: str

class ImportantUpdateResponse(BaseModel):
    id: int
    title: str
    summary: str
    discovered_at: datetime
    
    class Config:
        from_attributes = True