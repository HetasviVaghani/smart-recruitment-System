"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

// ✅ IMPORTANT: dynamic API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ExamPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any>({});
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [warnings, setWarnings] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalAction, setModalAction] = useState<null | (() => void)>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastLogRef = useRef<number>(0);

  const router = useRouter();
  const params = useSearchParams();
  const jobId = params.get("job_id");

  const MAX_WARNINGS = 3;

  const getToken = () => {
    const match = document.cookie.match(/(^| )token=([^;]+)/);
    return match ? match[2] : null;
  };

  // ================= CHEATING LOGGER =================
  const logCheating = async (reason: string) => {
    const token = getToken();
    if (!token || !jobId) return;

    const now = Date.now();
    if (now - lastLogRef.current < 500) return;
    lastLogRef.current = now;

    try {
      await fetch(`${API_URL}/log-cheating`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          job_id: Number(jobId),
          violation_type: reason,
        }),
      });
    } catch (err) {
      console.error("❌ Logging failed:", err);
    }
  };

  // ================= MODAL =================
  const openModal = (message: string, action?: () => void) => {
    if (modalOpen) return;
    setModalMessage(message);
    setModalAction(() => action || null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    if (modalAction) modalAction();
  };

  // ================= CAMERA =================
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      triggerWarning("Camera access denied");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
  };

  // ================= WARNINGS =================
  const triggerWarning = async (reason: string) => {
    if (submitted) return;

    await logCheating(reason);

    setWarnings((prev) => {
      const newCount = prev + 1;

      if (newCount >= MAX_WARNINGS) {
        openModal("❌ Auto-submitted due to violations", handleSubmit);
      } else {
        openModal(`⚠️ Warning ${newCount}/${MAX_WARNINGS}\n${reason}`);
      }

      return newCount;
    });
  };

  // ================= START =================
  const startExam = async () => {
    const token = getToken();

    try {
      await document.documentElement.requestFullscreen();
    } catch {}

    // ✅ Start exam
    await fetch(`${API_URL}/start-exam?job_id=${jobId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    // ✅ Fetch questions
    const res = await fetch(
      `${API_URL}/exam-questions?job_id=${jobId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await res.json();
    setQuestions(Array.isArray(data) ? data : data.questions || []);
    setStarted(true);

    await startCamera();
  };

  // ================= TIMER =================
  useEffect(() => {
    if (!started || submitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, submitted]);

  // ================= SECURITY =================
  useEffect(() => {
    if (!started || submitted) return;

    const handleBlur = () => triggerWarning("Window unfocused");

    const handleVisibility = () => {
      if (document.visibilityState === "hidden")
        triggerWarning("Tab switched");
    };

    const handleFullscreenExit = () => {
      if (!document.fullscreenElement)
        triggerWarning("Exited fullscreen");
    };

    const cameraCheck = setInterval(() => {
      const track = streamRef.current?.getVideoTracks()[0];
      if (track && track.readyState !== "live") {
        triggerWarning("Camera turned off");
      }
    }, 3000);

    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("fullscreenchange", handleFullscreenExit);

    return () => {
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("fullscreenchange", handleFullscreenExit);
      clearInterval(cameraCheck);
    };
  }, [started, submitted]);

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitted(true);

    stopCamera();

    const token = getToken();

    const res = await fetch(
      `${API_URL}/submit-exam?job_id=${jobId}&time_taken=${600 - timeLeft}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers }),
      }
    );

    const data = await res.json();

    openModal(
      `Final Score: ${data.final_percentage}%\nStatus: ${data.status}`,
      async () => {
        if (document.fullscreenElement)
          await document.exitFullscreen();
        router.push("/candidate/applications");
      }
    );
  };

  const handleAnswer = (qid: string, option: string) => {
    setAnswers((prev: any) => ({ ...prev, [qid]: option }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-white p-6">

      <div className="sticky top-0 flex justify-between mb-6 bg-white/5 p-4 rounded-xl">
        <h1 className="font-bold text-lg">🧠 AI Proctored Exam</h1>
        <div>{timeLeft}s | ⚠ {warnings}/{MAX_WARNINGS}</div>
      </div>

      {!started && (
        <div className="text-center mt-20">
          <button
            onClick={startExam}
            className="px-8 py-3 bg-blue-500 rounded-xl hover:bg-blue-600"
          >
            Start Exam 🚀
          </button>
        </div>
      )}

      <div className="grid gap-6">
        {questions.map((q, i) => (
          <motion.div key={q.id} className="bg-white/5 p-6 rounded-xl">
            <p>Q{i + 1}. {q.question}</p>

            {["A", "B", "C", "D"].map((opt) => (
              <label key={opt} className="block mt-2 cursor-pointer">
                <input
                  type="radio"
                  name={q.id}
                  className="mr-2"
                  onChange={() => handleAnswer(q.id, opt)}
                />
                {opt}: {q[`option_${opt.toLowerCase()}`]}
              </label>
            ))}
          </motion.div>
        ))}
      </div>

      {started && !submitted && (
        <div className="text-center mt-10">
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-green-500 rounded-xl hover:bg-green-600"
          >
            Submit Exam
          </button>
        </div>
      )}

      {started && (
        <div className="fixed bottom-4 right-4 z-40">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-44 rounded-xl border-2 border-green-500 shadow-xl"
          />
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-8 rounded-2xl w-96 shadow-xl text-center">
            <p className="whitespace-pre-line mb-6">{modalMessage}</p>
            <button
              onClick={closeModal}
              className="px-6 py-2 bg-blue-500 rounded-lg hover:bg-blue-600"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}