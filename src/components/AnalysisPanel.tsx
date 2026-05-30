import React from "react";
import { ArrowLeft, Share2, MoreVertical, MessageSquare, Flame, Check, Scale } from "lucide-react";
import { Profile, MatchRequest } from "../types";

interface AnalysisPanelProps {
  profile: Profile;
  userProfile?: MatchRequest;
  onBack: () => void;
  onStartChat: () => void;
}

export function AnalysisPanel({ profile, userProfile, onBack, onStartChat }: AnalysisPanelProps) {
  // Extract user strength vs candidate strength
  const userStrength = userProfile?.skills?.[0] || "Python";
  const candidateStrength = profile.skills.find(sk => sk !== userStrength) || "Math Modeling";

  // Calculate generic friction stats
  const frictionList = [
    { label: "Scheduling Match", val: "Low Mismatch", status: "low" },
    { label: "Comms Style", val: "Neutral Sync", status: "neutral" }
  ];

  return (
    <div className="max-w-md mx-auto space-y-8 animate-fade-in px-4 py-4">
      {/* Top action header bar */}
      <header className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div className="flex items-center gap-1">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
            id="analysis-back-btn"
          >
            <ArrowLeft className="w-5 h-5 text-slate-800" />
          </button>
          <span className="font-sans font-extrabold text-lg text-slate-900 tracking-tight">Compatibility Analysis</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
            <Share2 className="w-4 h-4 text-slate-500" />
          </button>
          <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
            <MoreVertical className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </header>

      {/* Hero compatibility circular gauge */}
      <section className="flex flex-col items-center justify-center space-y-4">
        <div className="relative w-40 h-40 flex items-center justify-center">
          {/* Circular SVG track */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-slate-105 stroke-slate-200"
              cx="50"
              cy="50"
              fill="transparent"
              r="40"
              strokeWidth="6"
            />
            <circle
              className="text-emerald-500 stroke-current"
              cx="50"
              cy="50"
              fill="transparent"
              r="40"
              strokeDasharray={251}
              strokeDashoffset={251 - (251 * profile.matchScore) / 100}
              strokeLinecap="round"
              strokeWidth="6"
            />
          </svg>
          <div className="flex flex-col items-center justify-center">
            <span className="font-sans font-black text-3xl text-slate-900">{profile.matchScore}%</span>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Synergy
            </span>
          </div>
        </div>
        <p className="text-center text-xs font-medium text-slate-500 leading-relaxed max-w-[280px]">
          Exceptional cognitive workflow alignment and complementary domain specialties calculated.
        </p>
      </section>

      {/* Comparison visual connector board */}
      <section className="bg-white border border-slate-200 rounded-[24px] p-5 shadow-sm">
        <div className="flex justify-between items-center relative py-2">
          {/* Left: You */}
          <div className="flex flex-col items-center gap-1.5 z-10">
            <div className="w-14 h-14 rounded-full border border-slate-250 overflow-hidden bg-slate-100 p-0.5 shadow-sm flex items-center justify-center font-sans font-extrabold text-slate-600">
              {userProfile?.name ? userProfile.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "ME"}
            </div>
            <span className="text-xs font-bold text-slate-800 font-sans">
              {userProfile?.name ? userProfile.name.split(" ")[0] : "You"}
            </span>
          </div>

          {/* Core line connector */}
          <div className="flex-1 relative flex items-center justify-center px-4">
            <div className="w-full h-[1px] bg-slate-200 border-dashed border-b border-slate-300" />
            <div className="absolute text-[9px] font-extrabold bg-emerald-500 text-white px-2.5 py-0.5 rounded-full tracking-wider uppercase">
              Distance 0.12
            </div>
          </div>

          {/* Right: Partner */}
          <div className="flex flex-col items-center gap-1.5 z-10">
            <div className="w-14 h-14 rounded-full border border-slate-250 overflow-hidden bg-slate-100 p-0.5 shadow-sm flex items-center justify-center font-sans font-extrabold text-slate-700">
              {profile.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <span className="text-xs font-bold text-slate-800 font-sans">{profile.name.split(" ")[1]}</span>
          </div>
        </div>
      </section>

      {/* Overlapping shared fields */}
      <section className="space-y-2">
        <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">
          Shared Research Intersections
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {profile.interests.map((inter) => (
            <span
              key={inter}
              className="bg-white hover:bg-slate-50 duration-150 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-sans font-semibold flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
              <span>{inter}</span>
            </span>
          ))}
        </div>
      </section>

      {/* Balance complimentary skills board */}
      <section className="space-y-2">
        <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
          Complementary Skills
        </h3>
        <div className="bg-white border border-slate-200 rounded-[18px] p-4 flex items-center justify-between shadow-sm">
          <div className="flex-1 text-center">
            <div className="text-slate-900 font-extrabold text-sm tracking-tight">{userStrength}</div>
            <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Your Strength</div>
          </div>
          <div className="w-[1px] h-8 bg-slate-200" />
          <div className="flex-1 text-center">
            <div className="text-slate-900 font-extrabold text-sm tracking-tight">{candidateStrength}</div>
            <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Their Strength</div>
          </div>
          <div className="p-2 bg-slate-100 rounded-full ml-2">
            <Scale className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
      </section>

      {/* Friction Indicators */}
      <section className="space-y-2">
        <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
          Friction Analysis
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {frictionList.map((f) => (
            <div key={f.label} className="bg-white border border-slate-200/85 rounded-xl p-3 flex items-center gap-2.5">
              <div
                className={`w-2 h-2 rounded-full ${f.status === "low" ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`}
              />
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 block leading-none">{f.label}</span>
                <span className="text-[10px] text-slate-400 font-semibold">{f.val}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Opportunity recommendations cards */}
      <section className="space-y-2">
        <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
          Suggested Project Tracks
        </h3>
        <div className="space-y-3">
          <div className="bg-white border border-slate-200 hover:border-slate-900 duration-150 rounded-[20px] p-5 space-y-1.5 shadow-sm group cursor-pointer">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full uppercase">
                Primary Opportunity
              </span>
            </div>
            <h4 className="font-sans font-extrabold text-base text-slate-900">
              High-Dimensional Multi-Scale Modeling
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Combine your computational deployment expertise with {profile.name.split(" ")[1]}&apos;s specific mathematical frameworks.
            </p>
          </div>

          <div className="bg-white border border-slate-200 hover:border-slate-400 duration-150 rounded-[20px] p-5 space-y-1 shadow-sm cursor-pointer">
            <h4 className="font-sans font-extrabold text-base text-slate-900">
              Cross-Disciplinary Analytical Framework
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Applying automated model sequences to physical systems, yielding faster joint paper drafting.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION BUTTON */}
      <section className="pt-2">
        <button
          onClick={onStartChat}
          className="w-full h-12 bg-[#0f172a] hover:bg-[#1e293b] text-white font-sans font-bold text-xs rounded-xl shadow-lg hover:shadow-xl duration-150 flex items-center justify-center gap-2 border-none cursor-pointer"
          id="initiate-dialogue-btn"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Initiate Dialogue</span>
        </button>
      </section>
    </div>
  );
}
