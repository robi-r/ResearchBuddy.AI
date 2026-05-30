import React, { useState } from "react";
import { CheckCircle2, Building2, Sparkles, X, GraduationCap, ArrowRight, BookOpen, Layers } from "lucide-react";
import { Profile } from "../types";

interface MatchesSectionProps {
  profiles: Profile[];
  onSelectProfile: (profile: Profile) => void;
  onInitiateDialogue: (profile: Profile) => void;
}

export function MatchesSection({ profiles, onSelectProfile, onInitiateDialogue }: MatchesSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (profiles.length === 0) {
    return (
      <div className="text-center py-12 bg-surface-container-low border border-border-light rounded-xl max-w-md mx-auto">
        <p className="text-on-surface-variant font-medium">No matches calculated. Please run onboarding first.</p>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % profiles.length);
  };

  return (
    <div className="max-w-md mx-auto space-y-6 animate-fade-in px-4 py-4">
      {/* Mini Title context */}
      <div className="text-center space-y-1">
        <h2 className="font-sans text-2xl font-extrabold text-slate-900 tracking-tight">Potential Collaborators</h2>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider font-semibold opacity-90">
          Curated specialists for your academic goal
        </p>
      </div>

      {/* Styled Stacked Card Container mimicking the Match flow */}
      <div className="relative aspect-[4/5] w-full flex items-center justify-center">
        {/* Background stack effect card */}
        <div className="absolute w-full h-[95%] bg-white border border-slate-200 rounded-[24px] translate-y-6 scale-[0.93] opacity-40 z-10 shadow-sm pointer-events-none" />
        <div className="absolute w-full h-[98%] bg-white border border-slate-200 rounded-[24px] translate-y-3 scale-[0.97] opacity-75 z-20 shadow-sm pointer-events-none" />

        {/* Top Active Card */}
        <div
          onClick={() => onSelectProfile(currentProfile)}
          className="absolute w-full h-full bg-white border border-slate-200 hover:border-slate-900 duration-200 rounded-[24px] p-6 shadow-md hover:shadow-xl z-30 flex flex-col justify-between cursor-pointer group"
          id={`active-match-${currentProfile.id}`}
        >
          {/* Card Header Profile */}
          <div className="space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="relative">
                <img
                  src={currentProfile.avatar}
                  alt={currentProfile.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm"
                />
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-lg flex items-center justify-center border border-white">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white fill-emerald-500 stroke-2" />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-sans font-extrabold text-lg text-slate-900 group-hover:text-slate-950 duration-150">
                      {currentProfile.name}
                    </h3>
                    <p className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 font-bold uppercase tracking-wider inline-block">
                      {currentProfile.field}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-sans font-extrabold text-emerald-600 text-2xl leading-none">
                      {currentProfile.matchScore}%
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">
                      Match
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-slate-500 mt-2 text-xs font-semibold opacity-90">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate max-w-[180px]">{currentProfile.institution}</span>
                </div>
              </div>
            </div>

            {/* Tags area */}
            <div className="flex flex-wrap gap-1 pt-1">
              {currentProfile.skills.slice(0, 3).map((sk) => (
                <span
                  key={sk}
                  className="bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-600"
                >
                  {sk}
                </span>
              ))}
              {currentProfile.skills.length > 3 && (
                <span className="bg-slate-100 px-2.5 py-1 border border-slate-200/60 rounded-lg text-[10px] font-mono text-slate-500">
                  +{currentProfile.skills.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* AI Collaborator Insight Highlight Box */}
          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl shadow-inner flex flex-col gap-1.5 border-none mt-2">
            <div className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[9px] font-extrabold text-slate-400 tracking-wider uppercase">
                AI Collaboration Insight
              </span>
            </div>
            <p className="text-xs leading-relaxed italic text-slate-200 pl-3 border-l-2 border-emerald-500 py-0.5">
              &ldquo;{currentProfile.aiInsight}&rdquo;
            </p>
          </div>

          {/* Bottom Action Hint */}
          <div className="text-right pt-1 flex items-center justify-end gap-1 text-[11px] font-bold text-slate-900 uppercase tracking-wider group-hover:underline">
            <span>View Detailed Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Swipe Actions Navigation Bar with premium round buttons */}
      <div className="flex justify-center gap-10 pt-2">
        <button
          onClick={handleNext}
          className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg border border-slate-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600 hover:scale-105 active:scale-95 duration-150 cursor-pointer"
          title="Skip candidate"
          id="skip-candidate-btn"
        >
          <X className="w-6 h-6" />
        </button>

        <button
          onClick={() => onInitiateDialogue(currentProfile)}
          className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg hover:bg-emerald-600 shadow-emerald-505/20 hover:scale-[1.08] active:scale-95 duration-150 cursor-pointer border-none"
          title="Request collaboration dialog"
          id="accept-candidate-btn"
        >
          <GraduationCap className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Helper Filters slider at bottom */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 border-t border-slate-200 pt-4">
        <button
          onClick={handleNext}
          className="flex-shrink-0 bg-white border border-slate-200 px-3 py-2 text-[11px] font-mono rounded-lg text-slate-600 hover:bg-slate-50 duration-150 cursor-pointer"
        >
          🎓 PhD Researchers
        </button>
        <button
          onClick={handleNext}
          className="flex-shrink-0 bg-white border border-slate-200 px-3 py-2 text-[11px] font-mono rounded-lg text-slate-600 hover:bg-slate-50 duration-150 cursor-pointer"
        >
          🏛️ Industry Fellows
        </button>
        <button
          onClick={handleNext}
          className="flex-shrink-0 bg-white border border-slate-200 px-3 py-2 text-[11px] font-mono rounded-lg text-slate-600 hover:bg-slate-50 duration-150 cursor-pointer"
        >
          📊 High h-index Match
        </button>
      </div>
    </div>
  );
}
