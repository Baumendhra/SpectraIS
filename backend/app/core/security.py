import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
import jwt
from passlib.context import CryptContext
from app.core.config import settings

# Password hashing context (Argon2id primary, bcrypt backup)
pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generates a secure password hash."""
    return pwd_context.hash(password)


def create_access_token(subject: str | Any, roles: list[str] = [], extra_claims: Optional[Dict[str, Any]] = None) -> str:
    """Generates a signed JWT Access Token."""
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    jti = str(uuid.uuid4())
    
    to_encode = {
        "sub": str(subject),
        "exp": expire,
        "iat": now,
        "jti": jti,
        "type": "access",
        "roles": roles
    }
    if extra_claims:
        to_encode.update(extra_claims)
        
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(subject: str | Any) -> tuple[str, str, datetime]:
    """Generates a signed JWT Refresh Token. Returns (token, jti, expiry)."""
    now = datetime.now(timezone.utc)
    expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    jti = str(uuid.uuid4())
    
    to_encode = {
        "sub": str(subject),
        "exp": expire,
        "iat": now,
        "jti": jti,
        "type": "refresh"
    }
    token = jwt.encode(to_encode, settings.REFRESH_SECRET_KEY, algorithm=settings.ALGORITHM)
    return token, jti, expire


def decode_access_token(token: str) -> Dict[str, Any]:
    """Decodes and validates an Access Token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "access":
            raise jwt.InvalidTokenError("Invalid token type")
        return payload
    except jwt.PyJWTError as e:
        raise e


def decode_refresh_token(token: str) -> Dict[str, Any]:
    """Decodes and validates a Refresh Token."""
    try:
        payload = jwt.decode(token, settings.REFRESH_SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "refresh":
            raise jwt.InvalidTokenError("Invalid token type")
        return payload
    except jwt.PyJWTError as e:
        raise e
