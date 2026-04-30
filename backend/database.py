import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:1234@localhost:5432/smart_recruit_ai"
)

# 🔥 Detect if SSL is already defined
if "sslmode" in DATABASE_URL:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True
    )
else:
    # ✅ Local vs Production handling
    if "localhost" in DATABASE_URL or "127.0.0.1" in DATABASE_URL:
        # LOCAL → no SSL
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            connect_args={"sslmode": "disable"}
        )
    else:
        # PRODUCTION → require SSL
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            connect_args={"sslmode": "require"}
        )

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()