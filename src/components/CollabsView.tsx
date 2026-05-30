import React, { useState, useEffect } from "react";
import { Check, ShieldCheck, Power, FolderLock, Sparkles, GraduationCap, ShieldAlert } from "lucide-react";
import { Match, Profile } from "../types";
import { motion } from "motion/react";

interface CollabsViewProps {
  currentUser: any;
  activeMatches: Match[];
  onSelectPartner: (partner: Profile) => void;
  onCloseMatchSlot: (matchId: string) => void;
  activeMatchCount: number;
  onMatchSuccess: (partner: Profile) => void;
  onRefresh: () => void;
}

export function CollabsView({
  currentUser,
  activeMatches,
  onSelectPartner,
  onCloseMatchSlot,
  activeMatchCount,
  onMatchSuccess,
  onRefresh
}: CollabsViewProps) {
  const [likers, setLikers] = useState<Profile[]>([]);
  const [loadingLikes, setLoadingLikes] = useState(true);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const fetchLikers = async () => {
    try {
      const response = await fetch("/api/likes-received");
      if (response.ok) {
        const data = await response.json();
        setLikers(data.likers || []);
      }
    } catch (err) {
      console.error("Failed to fetch incoming collabs:", err);
    } finally {
      setLoadingLikes(false);
    }
  };

  useEffect(() => {
    fetchLikers();
  }, [currentUser, activeMatchCount]);

  const handleConnect = async (target: Profile) => {
    if (activeMatchCount >= 2) {
      setErrorToast("Match slot limit exceeded! You already have a maximum of 2 active collaborations. Please finalize and close an existing workspace tab before accepting new collab requests.");
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
        setErrorToast(errData.error || "A matching error occurred.");
        setTimeout(() => setErrorToast(null), 5000);
        return;
      }

      const result = await response.json();
      if (result.isMatch) {
        onMatchSuccess(target);
        fetchLikers();
        onRefresh();
      } else {
        // Just single connection requested, refresh listings
        fetchLikers();
        onRefresh();
      }
    } catch (err) {
      console.error("Collab accept failing:", err);
    } finally {
      setConnectingId(null);
    }
  };

  const handleClose = async (matchId: string) => {
    if (!window.confirm("Are you sure you want to finalize and close this joint project workspace? This will release the active slot, allowing you to establish new research matches.")) return;
    setClosingId(matchId);
    try {
      const response = await fetch("/api/matches/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId }),
      });
      if (response.ok) {
        onCloseMatchSlot(matchId);
        onRefresh();
      }
    } catch (err) {
      console.error("Failed to terminate match:", err);
    } finally {
      setClosingId(null);
    }
  };

  const slot1 = activeMatches[0] || null;
  const slot2 = activeMatches[1] || null;
  const reachesLimit = activeMatchCount >= 2;

  return (
    <div className="max-w-md mx-auto py-4 px-4 space-y-6 animate-fade-in pb-16">
      {/* Dynamic Error Toast Notification */}
      {errorToast && (
        <div className="fixed top-20 left-4 right-4 md:max-w-md md:mx-auto bg-slate-900 border border-slate-705 text-white p-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 animate-slide-in">
          <ShieldAlert className="w-5 h-5 text-rose-500 flex-shrink-0" />
          <p className="text-xs font-semibold leading-normal">{errorToast}</p>
          <button
            onClick={() => setErrorToast(null)}
            className="ml-auto text-xs font-bold text-slate-400 hover:text-white px-2 py-1 cursor-pointer border-none bg-transparent"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Header */}
      <header className="space-y-1">
        <h2 className="font-sans font-black text-xl text-slate-900">Your Collaborations</h2>
        <p className="text-xs font-semibold text-slate-500 leading-normal">
          Manage your active research agreements and review incoming collaboration requests. Workspaces are limited to 2 active slots to ensure high co-author speed and engagement.
        </p>
      </header>

      {/* Section 1: Active Workspace Slots */}
      <section className="bg-white border border-slate-200 rounded-[24px] p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Active Workspace Slots (Max 2)</span>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 font-mono">
            {activeMatches.length} / 2 Slots Locked
          </span>
        </div>

        <div className="space-y-4">
          {/* SLOT 1 */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${slot1 ? "bg-emerald-500" : "bg-slate-200"}`} />
            {slot1 ? (
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden border border-slate-250 flex-shrink-0">
                      <img src={slot1.partner.avatar} alt={slot1.partner.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold font-sans text-slate-900 leading-none">{slot1.partner.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 max-w-[180px] truncate">{slot1.partner.institution}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleClose(slot1.matchId)}
                    disabled={closingId === slot1.matchId}
                    className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 border-none cursor-pointer duration-100 flex items-center justify-center bg-transparent"
                    title="Terminate and Free Slot"
                  >
                    <Power className="w-4 h-4 text-rose-500" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100 text-slate-500">
                  <button
                    onClick={() => onSelectPartner(slot1.partner)}
                    className="text-emerald-600 hover:text-emerald-700 font-bold border-none bg-transparent cursor-pointer"
                  >
                    Open Workspace Chat &rarr;
                  </button>
                  <span className="bg-emerald-50 text-emerald-750 font-bold px-2 py-0.5 rounded border border-emerald-100">Active Workspace</span>
                </div>
              </div>
            ) : (
              <div className="py-2 text-center text-slate-400 space-y-2">
                <FolderLock className="w-5 h-5 text-slate-300 mx-auto" />
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Slot 1 Available</p>
                <p className="text-[9px] text-slate-400 font-medium font-mono">Send Collab Requests in Discovery to fill this slot.</p>
              </div>
            )}
          </div>

          {/* SLOT 2 */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${slot2 ? "bg-emerald-500" : "bg-slate-200"}`} />
            {slot2 ? (
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden border border-slate-250 flex-shrink-0">
                      <img src={slot2.partner.avatar} alt={slot2.partner.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold font-sans text-slate-900 leading-none">{slot2.partner.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 max-w-[180px] truncate">{slot2.partner.institution}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleClose(slot2.matchId)}
                    disabled={closingId === slot2.matchId}
                    className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 border-none cursor-pointer duration-100 flex items-center justify-center bg-transparent"
                    title="Terminate and Free Slot"
                  >
                    <Power className="w-4 h-4 text-rose-500" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100 text-slate-500">
                  <button
                    onClick={() => onSelectPartner(slot2.partner)}
                    className="text-emerald-600 hover:text-emerald-700 font-bold border-none bg-transparent cursor-pointer"
                  >
                    Open Workspace Chat &rarr;
                  </button>
                  <span className="bg-emerald-50 text-emerald-750 font-bold px-2 py-0.5 rounded border border-emerald-100">Active Workspace</span>
                </div>
              </div>
            ) : (
              <div className="py-2 text-center text-slate-400 space-y-2">
                <FolderLock className="w-5 h-5 text-slate-300 mx-auto" />
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Slot 2 Available</p>
                <p className="text-[9px] text-slate-400 font-medium font-mono">Send Collab Requests in Discovery to fill this slot.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 2: Inbound Collab Requests */}
      <section className="space-y-4">
        <h3 className="font-sans font-extrabold text-xs text-slate-900 uppercase tracking-wider pl-1">
          Incoming Collab Requests ({likers.length})
        </h3>

        {loadingLikes ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3 bg-white/50 rounded-2xl border border-slate-200">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-semibold text-slate-500">Querying incoming collab requests...</p>
          </div>
        ) : likers.length === 0 ? (
          <div className="text-center py-10 px-6 bg-white border border-slate-200 rounded-[24px] shadow-sm space-y-3">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-200">
              <GraduationCap className="w-5 h-5 text-slate-300" />
            </div>
            <div className="space-y-1">
              <h4 className="font-sans font-bold text-xs text-slate-800">No Pending Requests</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto font-semibold">
                You have no outstanding connection queries. Check back soon, or send collab requests on Discovery to trigger reciprocal agreements!
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
                className="bg-white border border-slate-200 rounded-[20px] p-5 shadow-sm space-y-4 hover:border-slate-300 duration-150 relative overflow-hidden"
              >
                {/* Active vector visual highlights */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/20 rounded-full blur-3xl -z-10" />

                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0">
                    <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-sans font-extrabold text-sm text-slate-900 leading-none">{profile.name}</h4>
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded font-mono">
                        {profile.matchScore}% Synergy
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold">{profile.role}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{profile.institution}</p>
                  </div>
                </div>

                {/* Specific Research Intent Statement */}
                <div className="text-xs text-slate-600 bg-slate-50 border border-slate-150 rounded-xl p-3 leading-relaxed italic">
                  &ldquo;{profile.intent}&rdquo;
                </div>

                {/* Reciprocal Accept Actuation */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-505 animate-pulse text-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Ready to Co-author</span>
                  </div>

                  <button
                    onClick={() => handleConnect(profile)}
                    disabled={connectingId !== null}
                    className={`px-3.5 py-2 border-none text-xs font-black rounded-lg shadow-sm transition-all flex items-center gap-1.5 duration-100 cursor-pointer ${
                      reachesLimit
                        ? "bg-slate-100 text-slate-400 hover:bg-slate-100 cursor-not-allowed"
                        : "bg-emerald-500 hover:bg-emerald-600 text-slate-950"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{reachesLimit ? "Slots Full" : connectingId === profile.id ? "Connecting..." : "Accept Request"}</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Commitment stats / guide */}
      <section className="bg-white border border-slate-200 rounded-[20px] p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="font-sans font-extrabold text-xs text-slate-900 uppercase tracking-wider">Research Commitment Policy</h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
          Restricting active matches to 2 distinct channels forces maximum commitment and ensures that co-author partnerships actually materialize into submitted drafts.
        </p>
      </section>
    </div>
  );
}
