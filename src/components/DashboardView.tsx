import React, { useState, useEffect } from "react";
import { ShieldCheck, Calendar, Power, BadgeAlert, Sparkles, FolderLock, PlusCircle, CheckCircle2 } from "lucide-react";
import { Match, Profile } from "../types";
import { motion } from "motion/react";

interface DashboardViewProps {
  currentUser: any;
  activeMatches: Match[];
  onSelectPartner: (partner: Profile) => void;
  onCloseMatchSlot: (matchId: string) => void;
}

export function DashboardView({ currentUser, activeMatches, onSelectPartner, onCloseMatchSlot }: DashboardViewProps) {
  const [closingId, setClosingId] = useState<string | null>(null);

  const handleClose = async (matchId: string) => {
    if (!window.confirm("Are you sure you want to finalize and archive this collaborative workspace? Doing so will release a slot, allowing you to establish other active matches.")) return;
    setClosingId(matchId);
    try {
      const response = await fetch("/api/matches/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId }),
      });
      if (response.ok) {
        onCloseMatchSlot(matchId);
      }
    } catch (err) {
      console.error("Failed to terminate match:", err);
    } finally {
      setClosingId(null);
    }
  };

  const slot1 = activeMatches[0] || null;
  const slot2 = activeMatches[1] || null;

  return (
    <div className="max-w-md mx-auto py-4 px-4 space-y-6 animate-fade-in pb-16">
      <header className="space-y-1">
        <h2 className="font-sans font-black text-xl text-slate-900">Research Workspace Dashboard</h2>
        <p className="text-xs font-semibold text-slate-500 leading-normal">
          Manage your high-commitment research agreements. To guarantee high co-author engagement, limits are set strictly to 2 active workspaces.
        </p>
      </header>

      {/* Grid status overview cards */}
      <section className="bg-white border border-slate-200 rounded-[24px] p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Active Slot Quota (Max 2)</span>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono">
            {activeMatches.length} / 2 Slots Assigned
          </span>
        </div>

        <div className="space-y-4">
          {/* SLOT 1 */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 bg-emerald-500 h-full" />
            {slot1 ? (
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden border border-slate-250">
                      <img src={slot1.partner.avatar} alt={slot1.partner.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold font-sans text-slate-900 leading-none">{slot1.partner.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">{slot1.partner.institution}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleClose(slot1.matchId)}
                    disabled={closingId === slot1.matchId}
                    className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-505 border-none cursor-pointer duration-100 flex items-center justify-center bg-transparent"
                    title="Terminate and Free Slot"
                  >
                    <Power className="w-4 h-4 text-rose-500" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100 text-slate-500">
                  <span className="font-mono">ID: {slot1.matchId.slice(0, 12)}</span>
                  <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-100">Active Workspace</span>
                </div>
              </div>
            ) : (
              <div className="py-2 text-center text-slate-400 space-y-2">
                <FolderLock className="w-5 h-5 text-slate-300 mx-auto" />
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Slot 1 Available</p>
                <p className="text-[9px] text-slate-400 font-medium">Swipe on Discovery to bind a researcher here.</p>
              </div>
            )}
          </div>

          {/* SLOT 2 */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 bg-emerald-500 h-full" />
            {slot2 ? (
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden border border-slate-250">
                      <img src={slot2.partner.avatar} alt={slot2.partner.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold font-sans text-slate-900 leading-none">{slot2.partner.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">{slot2.partner.institution}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleClose(slot2.matchId)}
                    disabled={closingId === slot2.matchId}
                    className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-505 border-none cursor-pointer duration-100 flex items-center justify-center bg-transparent"
                    title="Terminate and Free Slot"
                  >
                    <Power className="w-4 h-4 text-rose-500" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100 text-slate-500">
                  <span className="font-mono">ID: {slot2.matchId.slice(0, 12)}</span>
                  <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-100">Active Workspace</span>
                </div>
              </div>
            ) : (
              <div className="py-2 text-center text-slate-400 space-y-2">
                <FolderLock className="w-5 h-5 text-slate-300 mx-auto" />
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Slot 2 Available</p>
                <p className="text-[9px] text-slate-400 font-medium">Swipe on Discovery to bind a researcher here.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Helpful educational component describing standard rules */}
      <section className="bg-white border border-slate-200 rounded-[20px] p-5 shadow-sm space-y-3.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-slate-800" />
          <h3 className="font-sans font-extrabold text-xs text-slate-900 uppercase tracking-wider">Commitment Guarantee Policy</h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
          High-performance research laboratories report that limit-bounded relationships result in a <strong>42% higher probability of paper finalization</strong>. Limit noise and stay aligned on current milestones.
        </p>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-[10px] font-semibold text-slate-500">
          <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span>Both researchers must hold vacant slots before handshakes lock.</span>
        </div>
      </section>
    </div>
  );
}
