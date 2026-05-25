"use client";
import { useState, useRef } from "react";

export default function InterviewCanvas({ status }: { status: "listening" | "speaking" }) {
  return (
    <div className="relative w-full h-[500px] bg-black rounded-xl overflow-hidden">
      {/* Recruiter Video */}
      <video
        key={status}
        autoPlay
        loop
        muted
        className="w-full h-full object-cover transition-opacity duration-500"
      >
        <source src={status === "listening" ? "/recruiter_idle.mp4" : "/recruiter_talk.mp4"} type="video/mp4" />
      </video>

      {/* Candidate Overlay (Small window) */}
      <div className="absolute bottom-4 right-4 w-48 h-32 border-2 border-white rounded-lg overflow-hidden">
          {/* User's webcam stream goes here */}
          <video id="user-video" autoPlay muted className="w-full h-full object-cover" />
      </div>
    </div>
  );
}