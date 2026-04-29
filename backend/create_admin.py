from .database import SessionLocal
from .models import User
from .auth import hash_password


db = SessionLocal()

admin = User(
    name="Admin",
    email="admin@gmail.com",
    password=hash_password("admin123"),
    role="admin"
)

db.add(admin)
db.commit()

print("✅ Admin created successfully")