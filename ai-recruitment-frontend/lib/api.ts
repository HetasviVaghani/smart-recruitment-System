import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const API = axios.create({
  baseURL: BASE_URL,
});

// ✅ Get token from cookies
const getToken = () => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(^| )token=([^;]+)/);
  return match ? match[2] : null;
};

// ✅ Request interceptor for auth
API.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Response interceptor
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      document.cookie = "token=; Max-Age=0";
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);
export const getMe = async () => {
  const res = await API.get("/me");
  return res.data;
};
// =======================================================
// ================= COMMON APIs ==========================
// =======================================================

// ✅ Get user profile (includes company info)
export const getProfile = async () => {
  const res = await API.get("/profile"); // matches FastAPI route
  return res.data;
};

// =======================================================
// ================= COMPANY APIs ========================
// =======================================================

// ✅ Get company info (recruiter)
export const getCompany = async () => {
  const res = await API.get("/company/me");
  return res.data;
};

// ✅ Update company profile
export const updateCompany = async (data: {
  name: string;
  description: string;
  website: string;
  company_code: string;
}) => {
  const res = await API.put("/company/update", data);
  return res.data;
};

// ✅ Setup company (first time)
export const setupCompany = async (data: {
  name: string;
  description: string;
  website: string;
  company_code: string;
}) => {
  const res = await API.post("/company/setup", data);
  return res.data;
};

// =======================================================
// ================= JOBS / CANDIDATE APIs ===============
// =======================================================

// My Applications
export const getMyApplications = async () => {
  const res = await API.get("/my-applications");
  return res.data;
};

// Upload Resume
export const uploadResume = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await API.post("/upload-resume", formData);
  return res.data;
};

// Apply Job
export const applyJob = async (jobId: number, resumeId: number) => {
  const res = await API.post(`/apply-job?job_id=${jobId}&resume_id=${resumeId}`);
  return res.data;
};

// Match Resume
export const matchResume = async (jobId: number, resumeId: number) => {
  const res = await API.post(`/match-resume?job_id=${jobId}&resume_id=${resumeId}`);
  return res.data;
};

// Exam Questions
export const getExamQuestions = async (jobId: number) => {
  const res = await API.get(`/exam-questions?job_id=${jobId}`);
  return res.data;
};
export const getcandidateAnalytics = async () => {
  const res = await API.get("/candidate-dashboard");
  return res.data;
};

// =======================================================
// ================= RECRUITER / ADMIN APIs =============
// =======================================================

// Ranking
export const getRanking = async (jobId: number) => {
  const res = await API.get(`/rank-candidates?job_id=${jobId}`);
  return res.data;
};

// All Applications
export const getAllApplications = async () => {
  const res = await API.get("/all-applications");
  return res.data;
};

// Shortlist Candidates
export const shortlistCandidates = async (jobId: number) => {
  const res = await API.post(`/shortlist/${jobId}`);
  return res.data;
};

// =======================================================
// ================= ADMIN ONLY =========================
// =======================================================

// Create Recruiter
export const createRecruiter = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const res = await API.post("/admin/create-recruiter", data);
  return res.data;
};

export const getAdminDashboardAnalytics = async () => {
  const res = await API.get("/admin-analytics");
  return res.data;
}; 



export default API;