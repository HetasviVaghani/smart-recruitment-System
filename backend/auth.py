from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "secretkey123"
ALGORITHM = "HS256"


def hash_password(password: str):
    password = password[:72]   # bcrypt limit fix
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    plain_password = plain_password[:72]
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=2)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme)):

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("id") 
        email = payload.get("sub")
        role = payload.get("role")

        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        return {"id": user_id,"email": email, "role": role}

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
   

