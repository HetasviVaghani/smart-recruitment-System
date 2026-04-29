"use client";

import { useState } from "react";

export default function ScheduleInterview() {
  const [candidateId, setCandidateId] = useState("");
  const [jobId, setJobId] = useState("");
  const [time, setTime] = useState("");
  const [interviewer, setInterviewer] = useState("");
  const [round, setRound] = useState("technical");

  const schedule = async () => {
    const res = await fetch("http://127.0.0.1:8000/schedule-interview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({
        candidate_id: Number(candidateId),
        job_id: Number(jobId),
        slot_time: time,
        interviewer,
        round,
      }),
    });

    const data = await res.json();
    alert(data.message);
  };

  return (
    <div className="p-6 max-w-xl mx-auto card">
      <h1 className="text-2xl font-bold mb-4">📅 Schedule Interview</h1>

      <input placeholder="Candidate ID" onChange={(e)=>setCandidateId(e.target.value)} className="input"/>
      <input placeholder="Job ID" onChange={(e)=>setJobId(e.target.value)} className="input"/>

      <input type="datetime-local" onChange={(e)=>setTime(e.target.value)} className="input"/>

      <input placeholder="Interviewer Name" onChange={(e)=>setInterviewer(e.target.value)} className="input"/>

      <select onChange={(e)=>setRound(e.target.value)} className="input">
        <option value="technical">Technical</option>
        <option value="hr">HR</option>
      </select>

      <button onClick={schedule} className="btn-primary mt-4 w-full">
        Schedule Interview
      </button>
    </div>
  );
}