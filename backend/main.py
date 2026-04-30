from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from backend.database import engine, Base, SessionLocal
from backend.models import ExamQuestion, User, Job, Resume, JobApplication, AptitudeResult,Question, InterviewSlot,Company
from backend.auth import hash_password, verify_password, create_access_token
from backend.resume_parser import extract_resume_text
from backend.ai_matching import calculate_match_score
from backend.email_service import send_email
from backend.offer_letter import generate_offer_letter
from backend.cheating_engine import calculate_score, should_auto_reject
from backend.ai_proctoring import analyze_frame
import shutil
from fastapi.staticfiles import StaticFiles
import os
from backend.models import CheatingLog
from backend.auth import get_current_user
import backend.auth
print("AUTH FILE LOADED FROM:", backend.auth.__file__)
print("AVAILABLE FUNCTIONS:", dir(backend.auth))
chat_memory = {}

def require_role(user, allowed_roles: list):
    role = user.get("role", "").lower()

    if role not in [r.lower() for r in allowed_roles]:
        raise HTTPException(
            status_code=403,
            detail=f"Access denied for role: {role}"
        )

def get_logged_in_user(db, current_user):
    user = db.query(User).filter(User.email == current_user["email"]).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = FastAPI()
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","https://smart-recruitment-system-15f9bbxh4-23aihet015-3622s-projects.vercel.app"], # allow all (for development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



Base.metadata.create_all(bind=engine)

# -------------------------
# Database Dependency
# -------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------------
# Root API
# -------------------------
@app.get("/")
def root():
    return {"message": "Smart Recruit AI Running 🚀"}

# -------------------------
# Register
# -------------------------
from pydantic import BaseModel

# ✅ Step 1.1: Create Pydantic model
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    

# ✅ Step 1.2: Update API
@app.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == data.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=data.name,
        email=data.email,
        password=hash_password(data.password),

        # 🔥 FORCE ROLE (SECURITY FIX)
        role="candidate"
    )

    db.add(new_user)
    db.commit()

    return {"message": "Candidate registered successfully"}

# -------------------------
# Login
# -------------------------
from fastapi.security import OAuth2PasswordRequestForm

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token({"id": user.id,"sub": user.email, "role": user.role,})

    return {
    "access_token": token,
    "token_type": "bearer",
    "role": user.role   
}


import uuid

def generate_company_code():
    return "COMP-" + str(uuid.uuid4())[:8]


from pydantic import BaseModel

class RecruiterCreate(BaseModel):
    name: str
    email: str
    password: str


@app.post("/admin/create-recruiter")
def create_recruiter(
    data: RecruiterCreate,  # ✅ FIXED
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403)

    # 🔥 Create company
    company = Company(
        company_code=generate_company_code(),
        is_profile_complete=False   # ✅ IMPORTANT
    )

    db.add(company)
    db.commit()
    db.refresh(company)

    # 🔥 Create recruiter
    new_user = User(
        name=data.name,
        email=data.email,
        password=hash_password(data.password),
        role="recruiter",
        company_id=company.id
    )

    db.add(new_user)
    db.commit()

    return {
        "message": "Recruiter created successfully",
        "company_code": company.company_code
    }

class CompanyCreate(BaseModel):
    name: str
    company_code: str
    description: str
    website: str


@app.post("/company/setup")
def setup_company(
    data: CompanyCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user["role"] != "recruiter":
        raise HTTPException(status_code=403)

    company = db.query(Company).filter(
        Company.company_code == data.company_code
    ).first()

    if not company:
        raise HTTPException(status_code=404, detail="Invalid company code")

    # ✅ Update existing company
    company.name = data.name
    company.description = data.description
    company.website = data.website
    company.is_profile_complete = True

    db.commit()

    return {"message": "Company profile completed"}

class CompanyUpdate(BaseModel):
    name: str
    description: str
    website: str

@app.put("/company/update")
def update_company(
    data: CompanyUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user["role"] != "recruiter":
        raise HTTPException(status_code=403)

    user = db.query(User).filter(
        User.id == current_user["id"]
    ).first()

    company = db.query(Company).filter(
        Company.id == user.company_id
    ).first()

    if not company:
        raise HTTPException(404, "Company not found")

    company.name = data.name
    company.description = data.description
    company.website = data.website
    company.is_profile_complete = True

    db.commit()

    return {"message": "Company updated"}
@app.get("/admin/companies")
def get_all_companies(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403)

    companies = db.query(Company).all()

    result = []
    for c in companies:
        result.append({
            "id": c.id,
            "name": c.name,
            "description": c.description,
            "website": c.website,
            "company_code": c.company_code,
            "is_profile_complete": c.is_profile_complete
        })

    return result



@app.delete("/admin/company/{company_id}")
def delete_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403)

    company = db.query(Company).filter(Company.id == company_id).first()

    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    try:
        # ✅ delete dependent data FIRST
        db.query(User).filter(User.company_id == company_id).delete()

        # 👉 If you have jobs/applications → delete them too

        db.delete(company)
        db.commit()

        return {"message": "Deleted successfully"}

    except Exception as e:
        db.rollback()  # 🔥 VERY IMPORTANT
        print("DELETE ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/profile")
def get_profile(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == current_user["id"]).first()

    company = None
    if user.company_id:
        company = db.query(Company).filter(
            Company.id == user.company_id
        ).first()

    return {
        "id": user.id,
        "role": user.role,
        "company_id": user.company_id,
        "company_code": company.company_code if company else None,
        "company_complete": company.is_profile_complete if company else False
    }

@app.get("/company/me")
def get_company(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user["role"] != "recruiter":
        raise HTTPException(status_code=403)

    # ✅ ALWAYS GET USER FROM DB
    user = db.query(User).filter(
        User.id == current_user["id"]
    ).first()

    if not user or not user.company_id:
        raise HTTPException(404, "No company linked")

    company = db.query(Company).filter(
        Company.id == user.company_id
    ).first()

    if not company:
        raise HTTPException(404, "Company not found")

    return {
        "name": company.name,
        "description": company.description,
        "website": company.website,
        "company_code": company.company_code
    }


# -------------------------
# Post Job
# -------------------------
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

# ✅ Request Model
class JobCreate(BaseModel):
    title: str
    description: str
    skills: str
    experience: int
    location: str   
    salary: int     

# ✅ Response Model
class JobResponse(BaseModel):
    job_id: int
    message: str

# ✅ Role Checker
def require_role(user, allowed_roles: list):
    role = user.get("role", "").lower()

    if role not in [r.lower() for r in allowed_roles]:
        raise HTTPException(
            status_code=403,
            detail=f"Access denied for role: {role}"
        )

# ✅ API FIXED
@app.post("/post_job", response_model=JobResponse)
def post_job(
    data: JobCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["admin", "recruiter"])

    # 🔥 ALWAYS FETCH USER FROM DB
    user = db.query(User).filter(User.id == current_user["id"]).first()

    if not user:
        raise HTTPException(404, "User not found")

    company = None

    if user.role == "recruiter":
        company = db.query(Company).filter(
            Company.id == user.company_id
        ).first()

        if not company or not company.is_profile_complete:
            raise HTTPException(
                status_code=403,
                detail="Complete company profile first"
            )

    job = Job(
        title=data.title,
        description=data.description,
        skills=data.skills,
        experience=data.experience,

        recruiter_email=user.email,
        recruiter_id=user.id,
        location=data.location,   # ✅ NEW
        salary=data.salary,
        company_id=user.company_id   # ✅ FIXED
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    return {
        "job_id": job.id,
        "message": "Job created successfully"
    }
# -------------------------
# Get Jobs
# -------------------------
@app.get("/jobs")
def get_jobs(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["admin", "recruiter", "candidate"])

    user = db.query(User).filter(
        User.id == current_user["id"]
    ).first()

    # 👑 ADMIN & 🎓 CANDIDATE → ALL JOBS
    if current_user["role"] in ["admin", "candidate"]:
        jobs = db.query(Job).all()

    # 🧑‍💼 RECRUITER → ONLY THEIR COMPANY JOBS
    elif current_user["role"] == "recruiter":
        jobs = db.query(Job).filter(
            Job.company_id == user.company_id
        ).all()

    result = []
    for job in jobs:
        # ✅ applicant count
        count = db.query(JobApplication).filter(
            JobApplication.job_id == job.id
        ).count()

        # ✅ company
        company = None
        if job.company_id:
            company = db.query(Company).filter(
                Company.id == job.company_id
            ).first()

        result.append({
            "id": job.id,
            "title": job.title,
            "description": job.description,
            "skills": job.skills,
            "experience": job.experience,
            "location": job.location,
            "salary": job.salary,
            "applicant_count": count,
            "company_code": company.company_code if company else None,
            # ✅ company info
            "company_name": company.name if company else "N/A",
            "company_website": company.website if company else "N/A",
            "company_description": company.description if company else "N/A",
        })

    return result
# -------------------------
# Get Applicants Per Job
# -------------------------
@app.get("/jobs/{job_id}/applications")
def get_job_applications(
    job_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["admin", "recruiter"])

    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    applications = db.query(JobApplication).filter(
        JobApplication.job_id == job_id
    ).all()

    if not applications:
        return []   # ✅ no crash if empty

    result = []

    for app in applications:
        user = db.query(User).filter(User.id == app.candidate_id).first()

        result.append({
            "application_id": app.id,
            "candidate_id": app.candidate_id,
            "candidate_name": user.name if user else "Unknown",
            "email": user.email if user else "N/A",
            "status": app.status,
            "match_score": app.match_score if app.match_score else 0
        })

    return result

#----------------
#total applicants
#----------------
@app.get("/all-applications")
def get_all_applications(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["admin", "recruiter"])

    # 🔥 ADMIN → all applications
    if current_user["role"] == "admin":
        applications = db.query(JobApplication).all()

    # 🔥 RECRUITER → only their company applications
    else:
        user = db.query(User).filter(
            User.id == current_user["id"]
        ).first()

        applications = db.query(JobApplication).join(Job).filter(
            Job.company_id == user.company_id
        ).all()

    result = []

    for app in applications:
        user = db.query(User).filter(
            User.id == app.candidate_id
        ).first()

        job = db.query(Job).filter(
            Job.id == app.job_id
        ).first()

        # ✅ COMPANY
        company = None
        if job and job.company_id:
            company = db.query(Company).filter(
                Company.id == job.company_id
            ).first()

        # ✅ EXAM SCORE
        exam = db.query(AptitudeResult).filter(
            AptitudeResult.job_id == app.job_id,
            AptitudeResult.candidate_id == app.candidate_id
        ).first()

        result.append({
            "application_id": app.id,
            "job_id": app.job_id,

            "job_title": job.title if job else "Unknown",

            "candidate_name": user.name if user else "Unknown",
            "email": user.email if user else "N/A",

            "status": app.status,
            "match_score": app.match_score if app.match_score else 0,

            # 🔥 NEW FIELDS
            "company_name": company.name if company else "N/A",
            "company_code": company.company_code if company else "N/A",
            "exam_score": exam.percentage if exam else 0
        })

    return result





#-------------
# delete jobs
#-------------
@app.delete("/jobs/{job_id}")
def delete_job(
    job_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["admin", "recruiter"])

    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    db.delete(job)
    db.commit()

    return {"message": "Job deleted"}
#-----------
#update jobs
#-----------
@app.put("/jobs/{job_id}")
def update_job(
    job_id: int,
    data: JobCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["admin", "recruiter"])

    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    job.title = data.title
    job.description = data.description
    job.skills = data.skills
    job.experience = data.experience
    job.location = data.location
    job.salary = data.salary


    db.commit()
    db.refresh(job)

    return {"message": "Job updated successfully"}





















# -------------------------
# Upload Resume
# -------------------------
@app.post("/upload-resume")
def upload_resume(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["candidate"])
    
    user = get_logged_in_user(db, current_user)
    candidate_id = user.id

    filename = file.filename.replace(" ", "_")
    path = f"{UPLOAD_FOLDER}/{filename}"

    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    text = extract_resume_text(path)

    resume = Resume(
        candidate_id=candidate_id,
        file_path=path,
        extracted_text=text
    )

    db.add(resume)
    db.commit()
    db.refresh(resume)

    return {"resume_id": resume.id}

# -------------------------
# Apply Job
# -------------------------
@app.post("/apply-job")
def apply_job(
    job_id: int,
    resume_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["candidate"])

    user = get_logged_in_user(db, current_user)
    candidate_id = user.id

    # ✅ CHECK: already applied to this job?
    existing_application = db.query(JobApplication).filter(
        JobApplication.candidate_id == candidate_id,
        JobApplication.job_id == job_id
    ).first()

    if existing_application:
        raise HTTPException(
            status_code=400,
            detail="You have already applied to this job"
        )

    # ✅ create application
    application = JobApplication(
        candidate_id=candidate_id,
        job_id=job_id,
        resume_id=resume_id
    )

    db.add(application)
    db.commit()

    return {"message": "Applied successfully"}



# -------------------------
# Match Resume
# -------------------------
# -------------------------
# Match Resume
# -------------------------
@app.post("/match-resume")
def match_resume(
    resume_id: int,
    job_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = get_logged_in_user(db, current_user)
    candidate_id = user.id

    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    job = db.query(Job).filter(Job.id == job_id).first()

    if not resume or not job:
        raise HTTPException(status_code=404, detail="Resume or Job not found")

    score = float(calculate_match_score(
        resume.extracted_text,
        job.description,
        job.skills
    ))

    application = db.query(JobApplication).filter(
        JobApplication.job_id == job_id,
        JobApplication.candidate_id == candidate_id
    ).first()

    if not application:
        raise HTTPException(status_code=400, detail="Apply job first")

    application.match_score = score

    # 🔥 SMART THRESHOLD
    threshold = 45 if job.experience == 0 else 50

    if score >= threshold:
        application.status = "shortlisted"

        # ✅ EMAIL SEND
        send_email(
            user.email,
            "🎉 You are Shortlisted!",
            f"""
Hi {user.name},

Congratulations! 🎉

You have been shortlisted for:
📌 Job: {job.title}
📊 Match Score: {score}%

Next Step: Aptitude Test

Best of luck 🚀
"""
        )
    else:
        application.status = "rejected"

        send_email(
            user.email,
            "❌ Application Update",
            f"""
Hi {user.name},

Thank you for applying for {job.title}.

Your match score: {score}%

Unfortunately, you were not shortlisted.

Keep trying 💪
"""
        )

    db.commit()

    return {
        "match_score": score,
        "status": application.status
    }
# -------------------------
# Rank Candidates
# -------------------------
@app.get("/rank-candidates")
def rank_candidates(
    job_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["admin", "recruiter"])

    # ================= GET JOB =================
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(404, "Job not found")

    # ================= SECURITY CHECK =================
    if current_user["role"] == "recruiter":
        user = db.query(User).filter(
            User.id == current_user["id"]
        ).first()

        # 🚨 Block if recruiter tries other company job
        if job.company_id != user.company_id:
            raise HTTPException(403, "Not allowed to access this job")

    # ================= GET APPLICATIONS =================
    apps = db.query(JobApplication).filter(
        JobApplication.job_id == job_id
    ).all()

    ranking = []

    for app in apps:
        user = db.query(User).filter(User.id == app.candidate_id).first()
        resume = db.query(Resume).filter(Resume.id == app.resume_id).first()

        exam = db.query(AptitudeResult).filter(
            AptitudeResult.candidate_id == app.candidate_id,
            AptitudeResult.job_id == job_id
        ).first()

        interview = db.query(InterviewSlot).filter(
            InterviewSlot.candidate_id == app.candidate_id,
            InterviewSlot.job_id == job_id
        ).first()

        ranking.append({
            "job_id": job.id,
            "job_title": job.title,

            # ✅ COMPANY INFO (important)
            "company_id": job.company_id,

            "candidate_id": app.candidate_id,
            "candidate_name": user.name if user else "Unknown",
            "email": user.email if user else "N/A",

            "match_score": app.match_score or 0,
            "status": app.status,

            "exam_status": exam.status if exam else "pending",
            "exam_percentage": exam.percentage if exam else 0,

            "interview": {
                "round": interview.round if interview else None,
                "slot_time": interview.slot_time if interview else None,
                "meeting_link": interview.meeting_link if interview else None
            },

            "resume_path": resume.file_path if resume else None,
            "resume_id": resume.id if resume else None
        })

    # ================= SORT =================
    ranking.sort(key=lambda x: x["match_score"], reverse=True)

    return ranking

@app.get("/ai-explain")
def ai_explain(resume_id: int, job_id: int):
    return {
        "explanation": f"""
Candidate matched based on:
- Skills matching
- Experience relevance
- Resume keyword similarity

AI compares resume with job description using NLP.
"""
    }














@app.post("/add-question")
def add_question(
    job_id: int,
    question: str,
    option_a: str,
    option_b: str,
    option_c: str,
    option_d: str,
    answer: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["admin", "recruiter"])
    q = Question(
        job_id=job_id,
        question=question,
        option_a=option_a,
        option_b=option_b,
        option_c=option_c,
        option_d=option_d,
        answer=answer
    )

    db.add(q)
    db.commit()
    db.refresh(q)

    return {"message": "Question added successfully"}
from datetime import datetime
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session

@app.post("/start-exam")
def start_exam(
    job_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["candidate"])

    user = get_logged_in_user(db, current_user)

    # ===============================
    # 1️⃣ Prevent multiple attempts
    # ===============================
    existing = db.query(AptitudeResult).filter(
        AptitudeResult.job_id == job_id,
        AptitudeResult.candidate_id == user.id
    ).first()

    if existing:
        raise HTTPException(400, "Exam already attempted")

    # ===============================
    # 2️⃣ Get application
    # ===============================
    app_obj = db.query(JobApplication).filter(
        JobApplication.job_id == job_id,
        JobApplication.candidate_id == user.id
    ).first()

    if not app_obj:
        raise HTTPException(404, "Application not found")

    # ===============================
    # 3️⃣ Prevent restart abuse
    # ===============================
    if app_obj.exam_started_at:
        raise HTTPException(400, "Exam already started")

    # ===============================
    # 4️⃣ Get job
    # ===============================
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(404, "Job not found")

    # ===============================
    # 5️⃣ AI GENERATION (SAFE FIRST)
    # ===============================
    from backend.ai_exam import generate_ai_questions, parse_ai_questions

    raw = generate_ai_questions(job.title)
    questions = parse_ai_questions(raw)

    if not questions or len(questions) == 0:
        raise HTTPException(500, "AI failed to generate questions")

    # ===============================
    # 6️⃣ DB TRANSACTION START
    # ===============================
    try:
        # ✅ mark exam start
        app_obj.exam_started_at = datetime.utcnow()

        # ✅ reset completion (IMPORTANT)
        app_obj.exam_completed_at = None

        # ✅ clear old logs (safe now)
        db.query(CheatingLog).filter(
            CheatingLog.job_id == job_id,
            CheatingLog.candidate_id == user.id
        ).delete()

        # ✅ clear old questions
        db.query(ExamQuestion).filter(
            ExamQuestion.job_id == job_id,
            ExamQuestion.candidate_id == user.id
        ).delete()

        # ===============================
        # 7️⃣ SAVE QUESTIONS
        # ===============================
        for q in questions:
            db.add(ExamQuestion(
                job_id=job_id,
                candidate_id=user.id,
                question=q["question"],
                option_a=q["options"]["A"],
                option_b=q["options"]["B"],
                option_c=q["options"]["C"],
                option_d=q["options"]["D"],
                correct_answer=q["answer"]
            ))

        db.commit()

    except Exception as e:
        db.rollback()
        print("START EXAM ERROR:", e)
        raise HTTPException(500, "Failed to start exam")

    return {"message": "Exam started successfully"}

from fastapi import Depends
import random
import uuid

@app.get("/exam-questions")
def get_exam_questions(
    job_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = get_logged_in_user(db, current_user)

    questions = db.query(ExamQuestion).filter(
        ExamQuestion.job_id == job_id,
        ExamQuestion.candidate_id == user.id
    ).all()

    if not questions:
        raise HTTPException(status_code=404, detail="Start exam first")

    return [
        {
            "id": q.id,
            "question": q.question,
            "option_a": q.option_a,
            "option_b": q.option_b,
            "option_c": q.option_c,
            "option_d": q.option_d,
        }
        for q in questions
    ]
from sqlalchemy import func

@app.get("/admin/cheating-dashboard/{job_id}")
def cheating_dashboard(
    job_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["admin", "recruiter"])

    # ✅ FIX: always fetch user from DB
    db_user = db.query(User).filter(
        User.id == current_user["id"]
    ).first()

    if not db_user:
        raise HTTPException(404, "User not found")

    # ✅ Recruiter can only see own company job
    if db_user.role == "recruiter":
        job = db.query(Job).filter(
            Job.id == job_id,
            Job.company_id == db_user.company_id
        ).first()

        if not job:
            raise HTTPException(status_code=403, detail="Not authorized")

    data = db.query(
        CheatingLog.candidate_id,
        func.sum(CheatingLog.score).label("total_score"),
        func.count(CheatingLog.id).label("total_violations")
    ).filter(
        CheatingLog.job_id == job_id
    ).group_by(CheatingLog.candidate_id).all()

    result = []

    for candidate_id, total_score, total_violations in data:
        user = db.query(User).filter(User.id == candidate_id).first()

        app_obj = db.query(JobApplication).filter(
            JobApplication.candidate_id == candidate_id,
            JobApplication.job_id == job_id
        ).first()

        total_score = int(total_score or 0)

        result.append({
            "candidate_id": candidate_id,
            "candidate_name": user.name if user else "Unknown",
            "email": user.email if user else "N/A",
            "total_violations": int(total_violations or 0),
            "cheating_score": total_score,
            "status": app_obj.status if app_obj else "N/A",
            "risk_level": (
                "HIGH" if total_score >= 80 else
                "MEDIUM" if total_score >= 40 else
                "LOW"
            )
        })

    return result

from sqlalchemy.orm import joinedload

@app.get("/admin/live-cheating/{job_id}")
def live_cheating(
    job_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["admin", "recruiter"])

    # ✅ Get user from DB
    db_user = db.query(User).filter(
        User.id == current_user["id"]
    ).first()

    if not db_user:
        raise HTTPException(404, "User not found")

    # ✅ SECURITY: recruiter can only access own company job
    if db_user.role == "recruiter":
        job = db.query(Job).filter(
            Job.id == job_id,
            Job.company_id == db_user.company_id
        ).first()

        if not job:
            raise HTTPException(403, "Not authorized")

    # ✅ OPTIMIZED QUERY (JOIN instead of loop query)
    logs = db.query(CheatingLog, User).join(
        User, User.id == CheatingLog.candidate_id
    ).filter(
        CheatingLog.job_id == job_id
    ).order_by(
        CheatingLog.timestamp.desc()
    ).limit(20).all()

    result = []

    for log, user in logs:
        result.append({
            "candidate_id": log.candidate_id,
            "candidate_name": user.name if user else "Unknown",
            "violation_type": log.violation_type,
            "score": log.score,

            # ✅ FIX: JSON SAFE timestamp
            "timestamp": log.timestamp.isoformat() if log.timestamp else None
        })

    return result
class FrameRequest(BaseModel):
    job_id: int
  


@app.post("/proctor-frame")
def proctor_frame(
    data: FrameRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["candidate"])

    user = get_logged_in_user(db, current_user)

    result = analyze_frame(data.image)

    if result not in ["normal", "error"]:
        score = calculate_score([result])

        log = CheatingLog(
            candidate_id=user.id,
            job_id=data.job_id,
            violation_type=result,
            score=score,
            timestamp=datetime.utcnow()
        )

        db.add(log)
        db.commit()

        print("✅ AI LOG SAVED")

        return {
            "status": "violation_detected",
            "type": result,
            "score": score
        }

    # 🔥 DEBUG LOG
    print("No violation detected")

    return {
        "status": "clean",
        "type": result
    }

from pydantic import BaseModel
from datetime import datetime

class CheatingLogRequest(BaseModel):
    job_id: int
    violation_type: str


@app.post("/log-cheating")
def log_cheating(
    data: CheatingLogRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["candidate"])

    user = get_logged_in_user(db, current_user)

    job_id = data.job_id
    violation_type = data.violation_type

    print("🔥 LOG REQUEST:", job_id, violation_type)

    # ✅ Ensure application exists
    app_obj = db.query(JobApplication).filter(
        JobApplication.candidate_id == user.id,
        JobApplication.job_id == job_id
    ).first()

    if not app_obj:
        raise HTTPException(404, "Application not found")

    # ✅ Ensure exam started
    if not app_obj.exam_started_at:
        app_obj.exam_started_at = datetime.utcnow()
        print("⚡ AUTO FIX: exam_started_at set")

    # ✅ Get last log safely
    recent = db.query(CheatingLog).filter(
        CheatingLog.candidate_id == user.id,
        CheatingLog.job_id == job_id
    ).order_by(CheatingLog.timestamp.desc()).first()

    # ✅ SAFE duplicate check
    if recent:
        diff = (datetime.utcnow() - recent.timestamp).total_seconds()

        if diff < 0.3 and recent.violation_type == violation_type:
            print("⚠️ IGNORED: duplicate spam")
            return {"message": "Duplicate ignored"}

    # ✅ Calculate score
    score = calculate_score([violation_type])

    # ✅ Create log
    log = CheatingLog(
        candidate_id=user.id,
        job_id=job_id,
        violation_type=violation_type,
        score=score,
        timestamp=datetime.utcnow()
    )

    db.add(log)

    try:
        db.commit()
        db.refresh(log)
        print("✅ LOG SAVED IN DB:", log.id)
    except Exception as e:
        db.rollback()
        print("❌ DB ERROR:", e)
        raise HTTPException(500, "Failed to save log")

    return {"message": "Logged successfully"}

@app.get("/exam-results/{job_id}")
def exam_results(job_id: int, db: Session = Depends(get_db)):

    results = db.query(AptitudeResult).filter(
        AptitudeResult.job_id == job_id
    ).all()

    data = []

    for r in results:
        user = db.query(User).filter(User.id == r.candidate_id).first()

        app_obj = db.query(JobApplication).filter(
            JobApplication.candidate_id == r.candidate_id,
            JobApplication.job_id == job_id
        ).first()

        cheating_score = db.query(func.sum(CheatingLog.score)).filter(
            CheatingLog.candidate_id == r.candidate_id,
            CheatingLog.job_id == job_id
        ).scalar() or 0

        data.append({
            "candidate_name": user.name if user else "Unknown",
            "email": user.email if user else "N/A",
            "final_percentage": r.percentage,
            "cheating_score": cheating_score,
            "status": app_obj.status if app_obj else "pending"
        })

    return data

@app.get("/me")
def get_profile(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == current_user["email"]).first()

    return {
        "name": user.name,
        "email": user.email,
        "role": user.role
    }



@app.get("/my-applications")
def my_applications(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = get_logged_in_user(db, current_user)

    apps = db.query(JobApplication).filter(
        JobApplication.candidate_id == user.id
    ).all()

    result = []

    for app in apps:
        job = db.query(Job).filter(Job.id == app.job_id).first()

        exam = db.query(AptitudeResult).filter(
            AptitudeResult.candidate_id == user.id,
            AptitudeResult.job_id == app.job_id
        ).first()

        interview = db.query(InterviewSlot).filter(
           InterviewSlot.candidate_id == user.id,
           InterviewSlot.job_id == app.job_id
).order_by(InterviewSlot.id.desc()).first()

        result.append({
            "job_id": app.job_id,
            "job_title": job.title if job else "N/A",
            "status": app.status,
            "match_score": app.match_score or 0,

            # ✅ FIXED
            "exam_status": exam.status if exam else "pending",
            "exam_score": exam.percentage if exam else 0,

            # ✅ FULL INTERVIEW OBJECT
            "interview": None if not interview else {
            "round": interview.round,
            "slot_time": interview.slot_time,
            "meeting_link": interview.meeting_link
}
             
        })

    return result

from pydantic import BaseModel
from typing import Dict

class ExamSubmit(BaseModel):
    answers: Dict[str, str]






@app.post("/submit-exam")
def submit_exam(
    job_id: int,
    data: ExamSubmit,
    time_taken: int = 0,  # optional query param
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["candidate"])

    user = get_logged_in_user(db, current_user)

    # ===============================
    # 1️⃣ Prevent double submission
    # ===============================
    existing = db.query(AptitudeResult).filter(
        AptitudeResult.job_id == job_id,
        AptitudeResult.candidate_id == user.id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Exam already submitted")

    # ===============================
    # 2️⃣ Validate application & exam started
    # ===============================
    app_obj = db.query(JobApplication).filter(
        JobApplication.candidate_id == user.id,
        JobApplication.job_id == job_id
    ).first()

    if not app_obj:
        raise HTTPException(status_code=404, detail="Application not found")

    if not app_obj.exam_started_at:
        raise HTTPException(status_code=400, detail="Exam not started properly")

    # ===============================
    # 3️⃣ Fetch questions
    # ===============================
    questions = db.query(ExamQuestion).filter(
        ExamQuestion.job_id == job_id,
        ExamQuestion.candidate_id == user.id
    ).all()

    if not questions:
        raise HTTPException(status_code=400, detail="No questions found")

    # ===============================
    # 4️⃣ Calculate raw score
    # ===============================
    score = 0
    total = len(questions)

    for q in questions:
        if str(q.id) in data.answers:
            if data.answers[str(q.id)].upper() == q.correct_answer.upper():
                score += 1

    original_percentage = (score / total) * 100

    # ===============================
    # 5️⃣ Calculate cheating score
    # ===============================
    cheating_score = db.query(func.sum(CheatingLog.score)).filter(
        CheatingLog.candidate_id == user.id,
        CheatingLog.job_id == job_id,
        CheatingLog.timestamp >= app_obj.exam_started_at
    ).scalar()

    cheating_score = cheating_score or 0

    # ===============================
    # 6️⃣ Apply penalty logic
    # ===============================
    final_percentage = original_percentage
    final_status = "pass" if original_percentage >= 60 else "fail"

    # Severe cheating
    if cheating_score >= 80:
        final_percentage = 0
        final_status = "disqualified"

    # Major cheating
    elif cheating_score >= 40:
        final_percentage *= 0.7

    # Minor cheating
    elif cheating_score >= 20:
        final_percentage *= 0.9

    # Re-evaluate pass/fail after penalty
    if final_percentage < 60:
        final_status = "fail"

    # ===============================
    # 7️⃣ Save result
    # ===============================
    result = AptitudeResult(
        candidate_id=user.id,
        job_id=job_id,
        score=score,
        percentage=round(final_percentage, 2),
        status=final_status,
        time_taken=time_taken,
        cheating_score=cheating_score,
        submitted_at=datetime.utcnow()
    )

    db.add(result)

    # Mark application exam completed
    app_obj.exam_completed_at = datetime.utcnow()

    db.commit()

    # ===============================
    # 8️⃣ Response
    # ===============================
    return {
        "original_percentage": round(original_percentage, 2),
        "cheating_score": cheating_score,
        "final_percentage": round(final_percentage, 2),
        "status": final_status
    }


    
from fastapi import BackgroundTasks
from datetime import datetime

def create_zoom_meeting(candidate_id: int):
    return f"https://zoom.us/j/{1000000000 + candidate_id}?pwd=AIInterview"


class InterviewRequest(BaseModel):
    candidate_id: int
    job_id: int
    slot_time: str
    interviewer: str
    round: str


@app.post("/schedule-interview")
def schedule_interview(
    req: InterviewRequest,
    background_tasks: BackgroundTasks,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["admin", "recruiter"])

    try:
        parsed_time = datetime.fromisoformat(req.slot_time)
    except:
        raise HTTPException(400, "Invalid datetime format")

    user = db.query(User).filter(User.id == req.candidate_id).first()
    if not user:
        raise HTTPException(404, "Candidate not found")

    existing = db.query(InterviewSlot).filter(
        InterviewSlot.candidate_id == req.candidate_id,
        InterviewSlot.job_id == req.job_id,
        InterviewSlot.round == req.round
    ).first()

    if existing:
        raise HTTPException(400, "Interview already scheduled")

    meeting_link = create_zoom_meeting(req.candidate_id)

    slot = InterviewSlot(
        candidate_id=req.candidate_id,
        job_id=req.job_id,
        slot_time=parsed_time,  # ✅ FIXED
        interviewer=req.interviewer,
        round=req.round,
        meeting_link=meeting_link
    )

    db.add(slot)

    # ✅ FIXED STATUS UPDATE
    application = db.query(JobApplication).filter(
        JobApplication.candidate_id == req.candidate_id,
        JobApplication.job_id == req.job_id
    ).first()

    if application:
        application.status = f"{req.round}_scheduled"

    db.commit()

    background_tasks.add_task(
        send_email,
        user.email,
        f"{req.round.upper()} Interview Scheduled",
        f"""
Hello {user.name},

📅 Time: {parsed_time}
👨‍💼 Interviewer: {req.interviewer}
📌 Round: {req.round}
🔗 Link: {meeting_link}

Best of luck!
"""
    )

    return {
        "message": "Interview scheduled successfully",
        "meeting_link": meeting_link
    }

from pydantic import BaseModel

# =========================
# REQUEST MODELS
# =========================
class TechnicalResultRequest(BaseModel):
    candidate_id: int
    job_id: int
    status: str

class HRResultRequest(BaseModel):
    candidate_id: int
    job_id: int
    status: str
    salary: int


# =========================
# TECHNICAL RESULT
# =========================
@app.post("/technical-result")
def technical_result(
    data: TechnicalResultRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["admin","recruiter"])

    application = db.query(JobApplication).filter(
        JobApplication.candidate_id == data.candidate_id,
        JobApplication.job_id == data.job_id
    ).first()

    if not application:
        raise HTTPException(404, "Application not found")

    user = db.query(User).filter(User.id == data.candidate_id).first()

    if data.status.lower() == "pass":
        application.status = "technical_passed"

        send_email(
            user.email,
            "Technical Interview Result",
            f"""
Hello {user.name},

✅ You cleared Technical Interview!
Proceed to HR round.

Good luck 🚀
"""
        )
    else:
        application.status = "rejected"

        send_email(
            user.email,
            "Technical Interview Result",
            f"""
Hello {user.name},

❌ You did not clear Technical Interview.

Best wishes for future.
"""
        )

    db.commit()

    return {"message": "Technical result updated"}


# =========================
# HR RESULT
# =========================
@app.post("/hr-result")
def hr_result(
    data: HRResultRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["admin", "recruiter"])

    user = db.query(User).filter(User.id == data.candidate_id).first()
    job = db.query(Job).filter(Job.id == data.job_id).first()

    if not user or not job:
        raise HTTPException(404, "User or Job not found")

    application = db.query(JobApplication).filter(
        JobApplication.candidate_id == data.candidate_id,
        JobApplication.job_id == data.job_id
    ).first()

    if not application:
        raise HTTPException(404, "Application not found")

    company = db.query(Company).filter(
        Company.id == job.company_id
    ).first()

    # ================= PASS =================
    if data.status.lower() == "pass":
        application.status = "selected"

        # 🔥 GENERATE FILE
        file_path = generate_offer_letter(
            name=user.name,
            position=job.title,
            salary=data.salary,
            company_name=company.name,
            company_website=company.website,
            company_location="India",
            company_email="hr@" + company.website.replace("https://", "")
            if company.website else "hr@company.com"
        )

        # 🔥 SAVE IN DB (IMPORTANT)
        application.offer_letter_path = file_path

        # 🔥 SEND EMAIL
        send_email(
            to_email=user.email,
            subject="🎉 Offer Letter - Congratulations!",
            body=f"""
Dear {user.name},

🎉 Congratulations!

You are selected for {job.title} at {company.name}.

Salary: ₹{data.salary}

Offer letter attached.
""",
            attachment_path=file_path
        )

    # ================= FAIL =================
    else:
        application.status = "rejected"

        send_email(
            user.email,
            "HR Result",
            f"""
Hello {user.name},

❌ You were not selected.
"""
        )

    db.commit()

    return {"message": "HR result updated"}
from fastapi.responses import FileResponse
import os

@app.get("/download-offer")
def download_offer(
    job_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    application = db.query(JobApplication).filter(
        JobApplication.candidate_id == current_user["id"],
        JobApplication.job_id == job_id,
        JobApplication.status == "selected"
    ).first()

    if not application:
        raise HTTPException(403, "Not authorized or not selected")

    # ✅ FETCH FROM DB
    file_path = application.offer_letter_path

    if not file_path or not os.path.exists(file_path):
        raise HTTPException(404, "Offer letter not found")

    return FileResponse(
        path=file_path,
        filename="Offer_Letter.pdf",
        media_type="application/pdf"
    )


from backend.ai_exam import generate_ai_questions, parse_ai_questions,ai_chatbot

@app.post("/generate-ai-exam")
def ai_exam(job_id: int,
            current_user=Depends(get_current_user),
            db: Session = Depends(get_db)):

    require_role(current_user, ["admin", "recruiter"])

    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    raw = generate_ai_questions(job.title)
    questions = parse_ai_questions(raw)

    if not questions:
        raise HTTPException(status_code=500, detail="AI failed to generate questions")

    for q in questions:
        try:
            new_q = Question(
                job_id=job.id,
                question=q["question"],
                option_a=q["options"]["A"],
                option_b=q["options"]["B"],
                option_c=q["options"]["C"],
                option_d=q["options"]["D"],
                answer=q["options"][q["answer"]]
            )
            db.add(new_q)

        except Exception as e:
            print("Skipping invalid question:", e)

    db.commit()

    return {
        "message": "✅ AI questions saved",
        "count": len(questions)
    }

@app.get("/candidate-dashboard")
def candidate_dashboard(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["candidate"])

    # ================= USER =================
    user = db.query(User).filter(
        User.id == current_user["id"]
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # ================= APPLICATIONS =================
    applications = db.query(JobApplication).filter(
        JobApplication.candidate_id == user.id
    ).all()

    total_applications = len(applications)

    # ================= STATUS COUNTS =================
    applied = []
    shortlisted = []
    rejected = []

    for app in applications:
        job = db.query(Job).filter(
            Job.id == app.job_id
        ).first()

        item = {
            "job_id": app.job_id,
            "job_title": job.title if job else "Unknown",
            "company": (
                job.company.name
                if job and job.company else "N/A"
            ),
            "status": app.status,

            # FIXED: removed nonexistent created_at
            "applied_at": None
        }

        

        if app.status == "shortlisted":
            shortlisted.append(item)

        elif app.status == "rejected":
            rejected.append(item)

    # ================= APTITUDE RESULTS =================
    results = db.query(AptitudeResult).filter(
        AptitudeResult.candidate_id == user.id
    ).all()

    avg_score = (
        sum(r.percentage for r in results) / len(results)
        if results else 0
    )

    # ================= RESPONSE =================
    return {
        "jobs": total_applications,
        "candidates": 1,
        "applications": total_applications,
        "rate": round(avg_score, 2),

        "pipeline": {
            
            "shortlisted": shortlisted,
            "rejected": rejected
        }
    }

@app.get("/admin-analytics")
def admin_analytics(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    require_role(current_user, ["admin"])

    users = db.query(User).count()
    jobs = db.query(Job).count()
    apps = db.query(JobApplication).count()

    results = db.query(AptitudeResult).all()

    avg = (
        sum(r.percentage for r in results)/len(results)
        if results else 0
    )

    return {
        "total_users": users,
        "total_jobs": jobs,
        "total_applications": apps,
        "average_score": round(avg,2)
    }