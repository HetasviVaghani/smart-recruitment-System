# Smart Recruit AI 🚀

> An AI-powered recruitment platform that automates resume screening, candidate ranking, aptitude assessment, interview workflows, and hiring decisions using NLP, Machine Learning, and modern web technologies.

<p align="center">
  <img src="./docs/workflow-diagram.png" alt="Smart Recruit AI Workflow" width="100%">
</p>

---

## 📌 Overview

Smart Recruit AI is an intelligent recruitment platform designed to simplify and automate the hiring process. The system leverages Artificial Intelligence, Natural Language Processing (NLP), and Machine Learning to analyze resumes, match candidates with job requirements, conduct aptitude assessments, monitor exam integrity, and assist recruiters in making data-driven hiring decisions.

The platform provides a complete recruitment lifecycle for Candidates, Recruiters, and Administrators within a single ecosystem.

---

## ✨ Features

### 🔐 Authentication & Authorization

- Secure User Registration & Login
- JWT Authentication
- Password Hashing
- Role-Based Access Control (RBAC)
- Candidate Dashboard
- Recruiter Dashboard
- Admin Panel

---

### 📄 Resume Management

- Upload PDF & DOCX Resumes
- Resume Parsing & Text Extraction
- Skill Identification
- Candidate Profile Generation
- Resume Storage & Management

---

### 🤖 AI Resume Screening & Matching

- Semantic Resume Analysis
- Skill Extraction using NLP
- Job Description Matching
- AI Match Score Calculation
- Candidate Ranking
- Automated Shortlisting

---

### 💼 Job Management

- Create Job Openings
- Edit Job Details
- Delete Jobs
- View Applications
- Track Recruitment Pipeline
- Manage Candidate Status

---

### 📝 AI Aptitude Assessment

- Automated Aptitude Tests
- Multiple Choice Questions (MCQs)
- Timed Assessments
- Instant Evaluation
- Performance Scoring
- Candidate Benchmarking

---

### 🛡️ AI Proctoring & Cheating Detection

- Fullscreen Monitoring
- Tab Switching Detection
- Browser Focus Tracking
- Webcam Monitoring
- Camera Disable Detection
- Violation Logging
- Automatic Submission on Excessive Violations

---

### 📧 Email Automation

- Application Confirmation
- Candidate Shortlisting Notification
- Interview Invitations
- Rejection Notifications
- Offer Letter Notifications
- Recruitment Updates

---

### 📊 Recruiter Analytics

- Applicant Overview
- AI Match Scores
- Aptitude Scores
- Candidate Ranking
- Hiring Insights
- Recruitment Metrics

---

## 🏗️ Recruitment Workflow

### Admin

1. Create Recruiter Account
2. Generate Company Code
3. Share Recruiter Credentials

### Recruiter

1. Login
2. Create Job Posting
3. Define Skills & Requirements
4. Receive Candidate Applications
5. Review AI Rankings
6. Schedule Interviews
7. Select or Reject Candidates

### Candidate

1. Register & Login
2. View Available Jobs
3. Upload Resume
4. Apply for Jobs
5. Receive Shortlisting Notification
6. Attend AI Aptitude Test
7. Participate in Interviews
8. Receive Offer/Rejection Notification

### AI System

1. Parse Resume
2. Extract Skills & Experience
3. Match Candidate with Job Requirements
4. Calculate Match Score
5. Shortlist Candidates
6. Conduct AI Aptitude Assessment
7. Monitor Candidate Activities
8. Calculate Final Candidate Score
9. Generate Hiring Recommendations

---

## 🛠️ Technology Stack

### Frontend

- Next.js 15
- React
- TypeScript
- Tailwind CSS
- Framer Motion

### Backend

- FastAPI
- Python
- SQLAlchemy
- Pydantic
- JWT Authentication

### Database

- PostgreSQL

### AI & Machine Learning

- Sentence Transformers
- Scikit-Learn
- NLP-Based Resume Analysis
- Semantic Similarity Matching
- Skill Extraction Engine

### Email Service

- SMTP Integration
- Automated Email Notifications

### Deployment

- Vercel (Frontend)
- Railway / Render (Backend)


## 🚀 Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/smart-recruit-ai.git

cd smart-recruit-ai
```

---

### 2️⃣ Backend Setup

```bash
cd backend

python -m venv venv
```

#### Activate Virtual Environment

Windows

```bash
venv\Scripts\activate
```

Linux/Mac

```bash
source venv/bin/activate
```

#### Install Dependencies

```bash
pip install -r requirements.txt
```

#### Create Environment Variables

```env
DATABASE_URL=postgresql://username:password@localhost/recruitdb

SECRET_KEY=your_secret_key

SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

#### Run Backend Server

```bash
uvicorn main:app --reload
```

Backend URL:

```bash
http://localhost:8000
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend URL:

```bash
http://localhost:3000
```

---

## 🌐 Environment Variables

### Backend

```env
DATABASE_URL=
SECRET_KEY=

SMTP_USER=
SMTP_PASS=
SMTP_HOST=
SMTP_PORT=
```

### Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Production

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

---

## 🧠 AI Modules

### Resume Intelligence Engine

- Resume Parsing
- Skill Extraction
- Experience Analysis
- Candidate Ranking
- Semantic Matching

### Candidate Matching Engine

- Job Description Analysis
- Similarity Score Generation
- Candidate Recommendations
- Automated Shortlisting

### Aptitude Assessment Engine

- Question Generation
- Automated Evaluation
- Performance Analytics
- Score Calculation

### Proctoring Engine

- Webcam Verification
- Focus Tracking
- Tab Monitoring
- Fullscreen Enforcement
- Violation Detection

---

## 🔒 Security Features

- JWT Authentication
- Password Hashing
- Protected APIs
- Role-Based Authorization
- Secure Email Communication
- Anti-Cheating Monitoring
- Session Management
- Input Validation

---

## 📈 Future Enhancements

- AI Interview Assistant
- Video Interview Analysis
- Voice Emotion Recognition
- AI-Powered Candidate Feedback
- Resume Improvement Suggestions
- LLM-Based Hiring Recommendations
- Advanced Recruiter Analytics
- Real-Time Hiring Dashboard
- Multi-Language Resume Analysis
- Generative AI Interview Questions

---

## 🎯 Project Highlights

✅ End-to-End Recruitment Automation

✅ AI Resume Screening

✅ Semantic Job Matching

✅ Candidate Ranking System

✅ AI Aptitude Assessment

✅ Intelligent Proctoring System

✅ Automated Email Workflow

✅ Modern Responsive UI

✅ Production Ready Architecture

---

## 👨‍💻 Author

### Hetasvi Vaghani

**B.Tech – Artificial Intelligence & Machine Learning**

AI/ML Engineer • Full Stack Developer • NLP & LLM Enthusiast

### Connect With Me

- GitHub: https://github.com/HetasviVaghani
- Email: hetasvivaghani@example.com

---

## ⭐ Support

If you found this project helpful:

⭐ Star the Repository

🍴 Fork the Repository

🚀 Contribute to the Project

📢 Share it with others

---

<p align="center">
  Made with ❤️ using Next.js, FastAPI, PostgreSQL, NLP & Machine Learning
</p>
