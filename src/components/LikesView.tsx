import React, { useState, useEffect } from "react";
import { Check, Heart, ShieldAlert, Sparkles, User, HelpCircle } from "lucide-react";
import { Profile } from "../types";
import { motion } from "motion/react";

interface LikesViewProps {
  currentUser: any;
  activeMatchCount: number;
  onMatchSuccess: (partner: Profile) => void;
}

export function LikesView({ currentUser, activeMatchCount, onMatchSuccess }: LikesViewProps) {
  const [likers, setLikers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const fetchLikers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/likes-received");
      if (response.ok) {
        const data = await response.json();
        setLikers(data.likers || []);
      }
    } catch (err) {
      console.error("Failed to fetch incoming likes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikers();
  }, [currentUser, activeMatchCount]);

  const handleConnect = async (target: Profile) => {
    if (activeMatchCount >= 2) {
      setErrorToast("Match limit reached! You are already committed to 2 active collaborations. Please close an existing match to unlock a new connection.");
      setTimeout(() => setErrorToast(null), 5000);
      return;
    }

    setConnectingId(target.id);
    try {
      const response = await fetch("/api/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: target.id, action: "like" }),
      });

      if (!response.ok) {
        const errData = await response.json();
        setErrorToast(errData.error || "An interaction error occurred.");
        setConnectingId(null);
        setTimeout(() => setErrorToast(null), 5000);
        return;
      }

      const result = await response.json();
      if (result.isMatch) {
        onMatchSuccess(target);
        // Refresh likes received lists
        fetchLikers();
      }
    } catch (err) {
      console.error("Matching error:", err);
    } finally {
      setConnectingId(null);
    }
  };

  const reachesLimit = activeMatchCount >= 2;

  return (
    <div className="max-w-md mx-auto py-4 px-4 space-y-6 animate-fade-in pb-16">
      {/* Toast alert notice */}
      {errorToast && (
        <div className="fixed top-20 left-4 right-4 md:max-w-md md:mx-auto bg-slate-900 border border-slate-700 text-white p-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-slide-in">
          <ShieldAlert className="w-5 h-5 text-rose-500 flex-shrink-0" />
          <p className="text-xs font-semibold leading-normal">{errorToast}</p>
          <button onClick={() => setErrorToast(null)} className="ml-auto text-xs font-bold text-slate-400 hover:text-white px-2 py-1 cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      <header className="space-y-1">
        <h2 className="font-sans font-black text-xl text-slate-900">Incoming Research Requests</h2>
        <p className="text-xs font-medium text-slate-500 leading-normal">
          The following peer researchers have review-evaluated your academic intent statements and initiated custom connection handshakes.
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-white/50 rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Querying incoming swipes metadata...</p>
        </div>
      ) : likers.length === 0 ? (
        <div className="text-center py-12 px-6 bg-white border border-slate-200 rounded-[24px] shadow-sm space-y-4">
          <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-200">
            <Heart className="w-6 h-6 text-slate-300" />
          </div>
          <div className="space-y-1">
            <h3 className="font-sans font-bold text-sm text-slate-800">No Pending Requests</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto font-semibold">
              You have no outstanding connection queries. Check back soon, or swipe in Discovery to trigger new reciprocals!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {likers.map((profile) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-[20px] p-5 shadow-sm space-y-4 hover:border-slate-350 duration-150 relative overflow-hidden"
            >
              {/* Highlight background light element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/40 rounded-full blur-3xl -z-10" />

              <div className="flex start gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-sans font-extrabold text-sm text-slate-900 leading-none">{profile.name}</h3>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">Sim. 0.{profile.matchScore}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold">{profile.role}</p>
                  <p className="text-[10px] text-slate-450 font-medium">{profile.institution}</p>
                </div>
              </div>

              {/* Specific need */}
              <div className="text-xs text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-200/50 leading-relaxed italic">
                &ldquo;{profile.intent}&rdquo;
              </div>

              {/* Reciprocal Accept Action */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide">Excellent Semantic Fit</span>
                </div>

                <button
                  onClick={() => handleConnect(profile)}
                  disabled={connectingId !== null}
                  className={`px-4 py-2 border-none text-xs font-extrabold rounded-lg shadow-sm transition-all flex items-center gap-1.5 duration-100 cursor-pointer ${
                    reachesLimit
                      ? "bg-slate-100 border border-slate-200 text-slate-400 hover:bg-slate-100"
                      : "bg-[#0f172a] hover:bg-[#1e293b] text-white"
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  <span>{reachesLimit ? "Slots Full" : connectingId === profile.id ? "Connecting..." : "Match Back"}</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
