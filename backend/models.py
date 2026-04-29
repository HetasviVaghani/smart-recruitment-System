from sqlalchemy import Column, Integer, String, Text, Float, TIMESTAMP, DateTime, ForeignKey, UniqueConstraint, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.database import Base
from datetime import datetime

# -------------------------
# COMPANY
# -------------------------
class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=True)
    company_code = Column(String(50), unique=True)
    description = Column(String, nullable=True)
    website = Column(String, nullable=True)
    is_profile_complete = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # 🔥 RELATIONSHIPS
    users = relationship("User", back_populates="company", cascade="all, delete")
    jobs = relationship("Job", back_populates="company", cascade="all, delete")


# -------------------------
# USER
# -------------------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(150), unique=True, index=True)
    password = Column(String(255))
    role = Column(String(20))  # admin / recruiter / candidate
    created_at = Column(TIMESTAMP, server_default=func.now())

    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"))

    # 🔥 RELATIONSHIP
    company = relationship("Company", back_populates="users")
    jobs = relationship("Job", back_populates="recruiter", cascade="all, delete")


# -------------------------
# JOB
# -------------------------
class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text)
    skills = Column(Text)
    experience = Column(Integer)

    location = Column(String, nullable=True)
    salary = Column(Integer, nullable=True)

    recruiter_email = Column(String)

    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"))
    recruiter_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))

    created_at = Column(TIMESTAMP, server_default=func.now())

    # 🔥 RELATIONSHIPS
    company = relationship("Company", back_populates="jobs")
    recruiter = relationship("User", back_populates="jobs")
    applications = relationship("JobApplication", back_populates="job", cascade="all, delete")


# -------------------------
# RESUME
# -------------------------
class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer)
    file_path = Column(String)
    extracted_text = Column(Text)

    applications = relationship("JobApplication", back_populates="resume", cascade="all, delete")


# -------------------------
# JOB APPLICATION
# -------------------------
class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True)

    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"))
    candidate_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"))

    status = Column(String, default="applied")
    match_score = Column(Float)
    exam_started_at = Column(DateTime, nullable=True)
    # 🔥 RELATIONSHIPS
    job = relationship("Job", back_populates="applications")
    resume = relationship("Resume", back_populates="applications")
    
    offer_letter_path = Column(String, nullable=True)

    __table_args__ = (
        UniqueConstraint('job_id', 'candidate_id', name='unique_application_per_job'),
    )


# -------------------------
# EXAM QUESTIONS
# -------------------------
class ExamQuestion(Base):
    __tablename__ = "exam_questions"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer)
    candidate_id = Column(Integer)

    question = Column(String)
    option_a = Column(String)
    option_b = Column(String)
    option_c = Column(String)
    option_d = Column(String)

    correct_answer = Column(String)


# -------------------------
# APTITUDE RESULT
# -------------------------
class AptitudeResult(Base):
    __tablename__ = "aptitude_results"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer)
    job_id = Column(Integer)
    score = Column(Integer)
    time_taken = Column(Integer, default=0)
    percentage = Column(Float)
    status = Column(String)
    cheating_score = Column(Float, default=0.0)
    submitted_at = Column(DateTime, default=datetime.utcnow)
# -------------------------
# INTERVIEW SLOT
# -------------------------
class InterviewSlot(Base):
    __tablename__ = "interview_slots"

    id = Column(Integer, primary_key=True)
    candidate_id = Column(Integer)
    job_id = Column(Integer)
    slot_time = Column(String)
    interviewer = Column(String)
    round = Column(String)
    meeting_link = Column(String)


# -------------------------
# CHEATING LOG
# -------------------------
class CheatingLog(Base):
    __tablename__ = "cheating_logs"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer)
    job_id = Column(Integer)
    violation_type = Column(String)
   
    score = Column(Integer, default=0)
    timestamp = Column(DateTime, default=datetime.utcnow)


# -------------------------
# QUESTION BANK
# -------------------------
class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True)
    job_id = Column(Integer)

    question = Column(String)
    option_a = Column(String)
    option_b = Column(String)
    option_c = Column(String)
    option_d = Column(String)

    answer = Column(String)