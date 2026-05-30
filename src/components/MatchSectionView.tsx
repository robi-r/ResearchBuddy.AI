import React, { useState, useEffect } from "react";
import { X, GraduationCap, Sparkles, CheckCircle2 } from "lucide-react";
import { Profile } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface MatchSectionViewProps {
  currentUser: any;
  activeMatchCount: number;
  onMatchSuccess: (partner: Profile) => void;
}

export function MatchSectionView({ currentUser, activeMatchCount, onMatchSuccess }: MatchSectionViewProps) {
  const [feed, setFeed] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState<"like" | "dislike" | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/discovery/feed");
      if (response.ok) {
        const data = await response.json();
        setFeed(data.feed || []);
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error("Failed to fetch match feed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [currentUser, activeMatchCount]);

  const handleInteract = async (action: "like" | "dislike") => {
    if (currentIndex >= feed.length) return;
    const target = feed[currentIndex];

    if (action === "like" && activeMatchCount >= 2) {
      setErrorToast("Match Limit Reached! Active slots are locked at a maximum of 2 handshakes to guarantee high-commitment collaboration.");
      setTimeout(() => setErrorToast(null), 5000);
      return;
    }

    setSwiping(action);

    try {
      const response = await fetch("/api/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: target.id, action }),
      });

      if (!response.ok) {
        const errData = await response.json();
        setErrorToast(errData.error || "A connection request error occurred.");
        setSwiping(null);
        setTimeout(() => setErrorToast(null), 5000);
        return;
      }

      const result = await response.json();
      
      // Delay card transition to show fancy swipe animation
      setTimeout(() => {
        if (action === "like" && result.isMatch) {
          onMatchSuccess(target);
        }
        setCurrentIndex(prev => prev + 1);
        setSwiping(null);
      }, 400);

    } catch (err) {
      console.error("Interaction failed:", err);
      setSwiping(null);
    }
  };

  const currentProfile = feed[currentIndex];
  const reachesLimit = activeMatchCount >= 2;

  return (
    <div className="max-w-md mx-auto py-4 px-4 space-y-6 animate-fade-in pb-16">
      {/* Toast alert notice */}
      {errorToast && (
        <div className="fixed top-20 left-4 right-4 md:max-w-md md:mx-auto bg-slate-900 text-white p-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 border border-slate-705 animate-slide-in">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />
          <p className="text-xs font-semibold leading-normal">{errorToast}</p>
          <button onClick={() => setErrorToast(null)} className="ml-auto text-xs font-bold text-slate-400 hover:text-white px-2 py-1 cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Stats microbar */}
      <div className="flex justify-between items-center bg-white border border-slate-200 rounded-[14px] px-4 py-2.5 shadow-sm text-xs">
        <span className="font-semibold text-slate-400">Collaboration Slots:</span>
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-750">{activeMatchCount} / 2 workspaces locked</span>
          <span className={`w-2.5 h-2.5 rounded-full ${reachesLimit ? "bg-amber-400" : "bg-emerald-500"}`} />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-white/50 rounded-[24px] border border-slate-200">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500 animate-pulse font-mono">Calculating semantic compatibility scores...</p>
        </div>
      ) : currentIndex >= feed.length ? (
        <div className="text-center py-16 px-6 bg-white border border-slate-200 rounded-[28px] shadow-sm space-y-4">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-200">
            <GraduationCap className="w-8 h-8 text-indigo-500" />
          </div>
          <div className="space-y-1">
            <h3 className="font-sans font-extrabold text-lg text-slate-950">Primary Fit Feed Completed</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto font-medium">
              You've swiped on all available profiles in this vector cluster. Try updating your intent profile keywords inside Profile section to discover high-synergy scholars!
            </p>
          </div>
          <button
            onClick={fetchFeed}
            className="text-xs text-indigo-600 font-extrabold bg-indigo-50 hover:bg-indigo-100 duration-150 border border-indigo-150 rounded-xl px-5 py-2.5 cursor-pointer"
          >
            Re-align Semantic Cluster
          </button>
        </div>
      ) : (
        <div className="relative">
          {/* Swiping direction label indicators */}
          <AnimatePresence>
            {swiping === "like" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.9, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-12 right-6 z-20 bg-emerald-550 border border-emerald-400 text-emerald-900 rounded-xl px-4 py-2 font-black text-xs tracking-wide uppercase rotate-12 shadow-lg bg-emerald-100"
              >
                REQUEST HANDSHAKE
              </motion.div>
            )}
            {swiping === "dislike" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.9, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-12 left-6 z-20 bg-rose-100 border border-rose-300 text-rose-800 rounded-xl px-4 py-2 font-black text-xs tracking-wide uppercase -rotate-12 shadow-lg"
              >
                PASS WORK
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentProfile.id}
              initial={{ scale: 0.96, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ 
                x: swiping === "like" ? 350 : swiping === "dislike" ? -350 : 0, 
                rotate: swiping === "like" ? 15 : swiping === "dislike" ? -15 : 0,
                opacity: 0, 
                transition: { duration: 0.3 } 
              }}
              className="bg-white border-2 border-slate-200/95 rounded-[28px] shadow-sm hover:shadow-md transition-shadow p-6 space-y-6"
            >
              {/* Profile Header Block */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full border border-slate-200 overflow-hidden bg-slate-50 flex-shrink-0">
                    <img src={currentProfile.avatar} alt={currentProfile.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-lg text-slate-950 leading-tight">
                      {currentProfile.name}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-550 max-w-[190px] truncate leading-normal">
                      {currentProfile.role}
                    </p>
                    <span className="text-[10px] font-bold text-slate-405 block">
                      {currentProfile.institution}
                    </span>
                  </div>
                </div>

                {/* Match Vector Metric */}
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-extrabold text-[#745c00] bg-[#fef9c3] px-2.5 py-1 rounded-full border border-[#fef08a]">
                    🏆 {currentProfile.matchScore}% Synergy
                  </span>
                  <p className="text-[9px] font-mono text-slate-400 mt-1 uppercase">
                    Cosine Diff 0.{currentProfile.matchScore}
                  </p>
                </div>
              </div>

              {/* Publication Highlight / Journal metrics */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-200/60 rounded-[14px] p-3 text-center">
                <div>
                  <div className="text-slate-950 font-black text-sm">{currentProfile.hIndex || 18}</div>
                  <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">H-INDEX SCORE</div>
                </div>
                <div className="border-l border-slate-200">
                  <div className="text-slate-950 font-black text-sm">{currentProfile.citations || "2.1k"}</div>
                  <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">CITATIONS</div>
                </div>
              </div>

              {/* Research Intent Block */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-widest block">Collaborator Search Criteria</span>
                <p className="text-xs text-slate-700 leading-relaxed font-semibold italic border-l-2 border-indigo-505 pl-4 py-0.5">
                  &ldquo;{currentProfile.intent}&rdquo;
                </p>
              </div>

              {/* AI Synergy insight report */}
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-[18px] p-4 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <span className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wider">AI Co-Author Handshake Compatibility</span>
                </div>
                <p className="text-xs text-emerald-950 leading-relaxed font-semibold">
                  {currentProfile.aiInsight || "High-dimensional overlap found in physical state telemetry optimization frameworks."}
                </p>
              </div>

              {/* Verticals Skill Tags */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[9px] text-slate-405 font-extrabold uppercase tracking-wider block">Domain Skills & Tools</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentProfile.skills.map((s) => (
                    <span key={s} className="text-[10px] bg-slate-50 border border-slate-200 px-2.5 py-1 rounded text-slate-700 font-mono font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Core Interactive Action Buttons */}
          <div className="flex justify-center items-center gap-6 pt-6 bg-transparent">
            {/* Pass / Dislike */}
            <button
              onClick={() => handleInteract("dislike")}
              className="w-14 h-14 bg-white hover:bg-red-50 text-red-500 border border-slate-200 rounded-full flex items-center justify-center shadow hover:shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border-none"
              title="Pass Candidate"
            >
              <X className="w-6 h-6 stroke-[3]" />
            </button>

            {/* Like / Connect - academic hat style! */}
            <button
              onClick={() => handleInteract("like")}
              disabled={reachesLimit}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow transition-all duration-150 relative border-none ${
                reachesLimit 
                  ? "bg-slate-100 border border-slate-200 text-slate-300 cursor-not-allowed" 
                  : "bg-emerald-500 hover:bg-emerald-600 text-white hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              }`}
              title={reachesLimit ? "Locked (Slot limit reached)" : "Request Handshake"}
            >
              <GraduationCap className="w-7 h-7 text-white" />
              {reachesLimit && (
                <div className="absolute -top-1.5 bg-slate-900 border border-slate-600 text-[8px] font-extrabold text-white px-2 py-0.5 rounded-full shadow tracking-wider uppercase">
                  Locked
                </div>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
