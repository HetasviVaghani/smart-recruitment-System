# Smart Recruit AI 🚀

> An AI-powered recruitment platform that automates resume screening, candidate ranking, job matching, aptitude assessment, interview workflows, and hiring decisions using Large Language Models (LLMs), NLP, and Machine Learning.

<p align="center">
  <img src="./docs/workflow-diagram.png" alt="Smart Recruit AI Workflow" width="100%">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/FastAPI-Backend-green?style=for-the-badge&logo=fastapi" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-blue?style=for-the-badge&logo=postgresql" />
  <img src="https://img.shields.io/badge/Groq-LLM-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/AI-Recruitment-purple?style=for-the-badge" />
</p>

---

## 📌 Overview

Smart Recruit AI is an intelligent recruitment platform that streamlines the complete hiring lifecycle by combining AI-powered resume screening, semantic candidate matching, aptitude assessment, proctoring, and recruitment automation.

The system helps recruiters identify the most qualified candidates quickly while ensuring a fair and efficient hiring process.

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

### 📄 Resume Management

- PDF Resume Upload
- DOCX Resume Upload
- Resume Parsing
- Text Extraction
- Skill Identification
- Candidate Profile Generation

### 🤖 AI Resume Screening & Matching

- Semantic Resume Analysis
- Skill Extraction
- Job Description Matching
- AI Match Score Calculation
- Automated Candidate Ranking
- Smart Shortlisting

### 💼 Job Management

- Create Job Postings
- Edit Job Details
- Delete Jobs
- Manage Applications
- Track Recruitment Pipeline
- Candidate Status Management

### 📝 AI Aptitude Assessment

- AI-Generated Aptitude Questions
- MCQ-Based Examination
- Timed Assessments
- Instant Evaluation
- Automated Scoring
- Performance Analytics

### 🛡️ AI Proctoring & Cheating Detection

- Fullscreen Monitoring
- Tab Switching Detection
- Window Focus Tracking
- Webcam Monitoring
- Camera Disable Detection
- Violation Logging
- Auto Submission on Excessive Violations

### 📧 Email Automation

- Application Confirmation
- Shortlisting Notification
- Interview Invitations
- Offer Letter Notifications
- Rejection Notifications
- Recruitment Updates

### 📊 Recruiter Dashboard

- Applicant Tracking
- Match Score Analysis
- Aptitude Test Results
- Candidate Ranking
- Recruitment Insights
- Hiring Analytics

---

## 🧠 AI Architecture

Smart Recruit AI leverages Large Language Models (LLMs), NLP techniques, and Machine Learning algorithms to automate candidate evaluation and hiring workflows.

### Resume Intelligence Engine

- Resume Parsing
- Skill Extraction
- Experience Analysis
- Candidate Profiling
- Semantic Similarity Matching

### LLM-Powered Features

- Resume Understanding
- Job Requirement Analysis
- Candidate Evaluation
- Aptitude Question Generation
- Recruitment Recommendations

### AI Models & Services

- Groq API
- Llama 3.3 70B Versatile
- Sentence Transformers
- Scikit-Learn
- Cosine Similarity Matching

---

## 🏗️ Recruitment Workflow

### Admin

1. Create Recruiter Account
2. Generate Company Code
3. Share Recruiter Credentials

### Recruiter

1. Login
2. Create Job Posting
3. Define Required Skills
4. Receive Applications
5. Review AI Rankings
6. Schedule Interviews
7. Select or Reject Candidates

### Candidate

1. Register & Login
2. Upload Resume
3. Browse Available Jobs
4. Apply for Positions
5. Receive Shortlisting Notification
6. Attend AI Aptitude Test
7. Participate in Interviews
8. Receive Offer/Rejection Notification

### AI System

1. Parse Resume
2. Extract Skills & Experience
3. Match Resume with Job Requirements
4. Calculate Match Score
5. Shortlist Candidates
6. Conduct Aptitude Assessment
7. Monitor Candidate Activities
8. Detect Potential Violations
9. Generate Final Candidate Score
10. Provide Hiring Recommendations

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

- Groq API
- Llama 3.3 70B Versatile
- Sentence Transformers
- Scikit-Learn
- NLP-Based Resume Analysis
- Semantic Similarity Matching

### Email Services

- SMTP Integration
- Automated Notifications

### Deployment

- Vercel (Frontend)
- Railway / Render (Backend)


## 🚀 Installation

### Clone Repository

```bash
git clone https://github.com/HetasviVaghani/smart-recruitment-System.git

cd smart-recruit-ai
```

---

## ⚙️ Backend Setup

```bash
cd backend

python -m venv venv
```

### Activate Environment

#### Windows

```bash
venv\Scripts\activate
```

#### Linux / Mac

```bash
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Configure Environment Variables

```env
DATABASE_URL=postgresql://username:password@localhost/recruitdb

SECRET_KEY=your_secret_key

GROQ_API_KEY=your_groq_api_key

MODEL_NAME=llama-3.3-70b-versatile

SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

### Run Backend

```bash
uvicorn main:app --reload
```

Backend URL:

```bash
http://localhost:8000
```

---

## 🎨 Frontend Setup

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

GROQ_API_KEY=
MODEL_NAME=llama-3.3-70b-versatile

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

## 🔒 Security Features

- JWT Authentication
- Secure Password Hashing
- Protected APIs
- Role-Based Access Control
- Email Verification
- AI Proctoring
- Anti-Cheating Monitoring
- Session Security

---

## 📈 Future Enhancements

- AI Interview Assistant
- Video Interview Analysis
- Voice Emotion Detection
- Resume Improvement Suggestions
- LLM-Based Candidate Feedback
- AI Hiring Recommendation Engine
- Advanced Recruiter Analytics
- Real-Time Candidate Insights
- Multi-Language Resume Analysis

---

## 🎯 Project Highlights

✅ AI-Powered Recruitment Platform

✅ Groq Llama 3.3 70B Integration

✅ Semantic Resume Matching

✅ Automated Candidate Ranking

✅ AI Aptitude Assessment

✅ Smart Proctoring System

✅ Automated Recruitment Workflow

✅ FastAPI + Next.js Architecture

✅ Production-Ready Deployment

---

## 👨‍💻 Author

### Hetasvi Vaghani

**B.Tech – Artificial Intelligence & Machine Learning**

AI/ML Engineer • Full Stack Developer • NLP & LLM Enthusiast

### Connect

- GitHub: https://github.com/HetasviVaghani
- Email: hetasvivaghani@example.com

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.

Feel free to fork this repository and submit a pull request.

---

## ⭐ Support

If you found this project useful:

⭐ Star the Repository

🍴 Fork the Repository

🚀 Contribute to the Project

📢 Share it with others

---

<p align="center">
  Built with ❤️ using Next.js, FastAPI, PostgreSQL, Groq LLM, NLP, and Machine Learning
</p>
