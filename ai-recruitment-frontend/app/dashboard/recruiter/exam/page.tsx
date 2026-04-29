"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ExamPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [warnings, setWarnings] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const params = useSearchParams();
  const router = useRouter();
  const jobId = params.get("job_id");

  // ==============================
  // 🚀 LOAD QUESTIONS
  // ==============================
  useEffect(() => {
    if (!jobId) return;

    fetch(`http://127.0.0.1:8000/exam-questions?job_id=${jobId}&mode=manual`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Questions:", data);
        setQuestions(data || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [jobId]);

  // ==============================
  // ⏱ TIMER
  // ==============================
  useEffect(() => {
    if (submitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submitted]);

  // ==============================
  // 🚨 WARNING SYSTEM
  // ==============================
  const triggerWarning = (reason: string) => {
    setWarnings((prev) => {
      const newWarnings = prev + 1;
      alert(`⚠ Warning ${newWarnings}/3: ${reason}`);

      if (newWarnings >= 3) {
        alert("❌ Auto submitting due to violations");
        handleSubmit();
      }

      return newWarnings;
    });
  };

  // ==============================
  // 🖥 FULLSCREEN + TAB DETECTION
  // ==============================
  useEffect(() => {
    document.documentElement.requestFullscreen().catch(() => {});

    const handleFullscreen = () => {
      if (!document.fullscreenElement) {
        triggerWarning("Exited Fullscreen");
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        triggerWarning("Switched Tab");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreen);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreen);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // ==============================
  // 🎥 CAMERA (SAFE FIX)
  // ==============================
  useEffect(() => {
    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices) return;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.log("Camera permission denied");
        // ❌ DO NOT trigger warning here
      }
    };

    startCamera();
  }, []);

  // ==============================
  // 📸 CAPTURE FRAME
  // ==============================
  const captureFrame = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return null;

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx?.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg");
  };

  // ==============================
  // 🤖 PROCTORING FIX
  // ==============================
  useEffect(() => {
    const interval = setInterval(async () => {
      const image = captureFrame();
      if (!image) return;

      try {
        const res = await fetch("http://127.0.0.1:8000/proctor-frame", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
          body: JSON.stringify({ image }),
        });

        const data = await res.json();

        if (
          data?.status?.includes("❌") ||
          data?.status?.includes("🚨")
        ) {
          triggerWarning(data.status);
        }
      } catch {
        console.log("Proctor error");
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // ==============================
  // ✍ ANSWER
  // ==============================
  const handleAnswer = (qid: number, option: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: option }));
  };

  // ==============================
  // 📤 SUBMIT
  // ==============================
  const handleSubmit = async () => {
    if (submitted) return;

    setSubmitted(true);

    console.log("Submitting:", answers);

    await fetch(
      `http://127.0.0.1:8000/submit-exam?job_id=${jobId}&time_taken=${600 - timeLeft}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({ answers }),
      }
    );

    alert("✅ Exam Submitted!");

    router.push("/candidate/applications");
  };

  // ==============================
  // 📊 PROGRESS BAR
  // ==============================
  const progress = ((600 - timeLeft) / 600) * 100;

  // ==============================
  // UI
  // ==============================
  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4 text-center">
        🧠 AI Proctored Exam
      </h1>

      {/* PROGRESS */}
      <div className="w-full bg-gray-200 h-2 rounded mb-4">
        <div
          className="bg-green-500 h-2 rounded"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* TIMER + WARNINGS */}
      <div className="flex justify-between mb-4">
        <p>⏱ {timeLeft}s</p>
        <p className="text-red-600">Warnings: {warnings}/3</p>
      </div>

      {/* LOADING */}
      {loading && <p>Loading questions...</p>}

      {/* EMPTY */}
      {!loading && questions.length === 0 && (
        <p className="text-gray-500">No questions found</p>
      )}

      {/* QUESTIONS */}
      {questions.map((q: any) => (
        <div key={q.id} className="mb-4 border p-3 rounded shadow">
          <p className="font-semibold">{q.question}</p>

          {["A", "B", "C", "D"].map((opt) => (
            <label key={opt} className="block mt-1">
              <input
                type="radio"
                name={`q-${q.id}`}
                onChange={() => handleAnswer(q.id, opt)}
              />
              {opt}: {(q as any)[`option_${opt.toLowerCase()}`]}
            </label>
          ))}
        </div>
      ))}

      {/* SUBMIT */}
      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-6 py-2 rounded mt-4 hover:bg-green-700"
      >
        Submit Exam
      </button>

      {/* CAMERA */}
      <video
        ref={videoRef}
        autoPlay
        muted
        className="fixed bottom-4 right-4 w-40 h-32 border rounded shadow"
      />

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}