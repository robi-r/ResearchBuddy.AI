"use client";

import React, { useState, useEffect } from "react";
import { Compass, Sparkles, BookOpen, User, Flame, TrendingUp, RefreshCw, MessageSquare, Plus, Check } from "lucide-react";

export default function DiscoveryPage() {
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [swipingIndex, setSwipingIndex] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [isMatchGlow, setIsMatchGlow] = useState(false);
  const [matchedPartner, setMatchedPartner] = useState(null);

  // Fetch initial profile & potential candidates
  const bootstrapSession = async () => {
    setLoading(true);
    try {
      // Get current user session
      const meRes = await fetch("/api/auth/me");
      if (meRes.ok) {
        const data = await meRes.json();
        setUserProfile(data.user);
      }

      // Fetch prospective academic collaborators from discovery endpoint
      const peersRes = await fetch("/api/explore/candidates");
      if (peersRes.ok) {
        const data = await peersRes.json();
        setCandidates(data.profiles || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bootstrapSession();
  }, []);

  const handleCollabInteract = async (targetId) => {
    try {
      setStatusMsg("Submitting collaboration invitation...");
      const res = await fetch("/api/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId, action: "like" }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setStatusMsg(errData.error || "Workspace transaction limit exceeded.");
        setTimeout(() => setStatusMsg(""), 4000);
        return;
      }

      const outcome = await res.json();
      if (outcome.isMatch) {
        setMatchedPartner(outcome.partner);
        setIsMatchGlow(true);
        setStatusMsg("Mutual Handshake Made! Joint Multi-User Workspace Spawned!");
      } else {
        setStatusMsg("Invitation delivered to collaborator's queue! Waiting for endorsement.");
        setTimeout(() => {
          setStatusMsg("");
          setSwipingIndex((prev) => prev + 1);
        }, 1500);
      }
    } catch (ex) {
      console.error(ex);
      setStatusMsg("Failed to synchronize interact state.");
    }
  };

  const handleSkipInteract = () => {
    setStatusMsg("Skipping candidate card...");
    setTimeout(() => {
      setStatusMsg("");
      setSwipingIndex((prev) => prev + 1);
    }, 500);
  };

  const activeCard = candidates[swipingIndex];

  return (
    <div className="mx-auto max-w-4xl py-8 px-6 space-y-8 animate-fade-in pb-20">
      {/* Search and Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="font-serif text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="h-7 w-7 text-indigo-600 animate-spin-slow" />
            <span>Discover High-Energy Peers</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Browse verified academic researchers sorted dynamically via high-dimensional semantic alignment scores.
          </p>
        </div>

        {/* Semantic filter controls mock */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Filter by skill, field, or journal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
          />
          <button
            onClick={bootstrapSession}
            className="p-1 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition duration-150"
            title="Refresh candidate indices"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Transaction status notifications */}
      {statusMsg && (
        <div className="mx-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-center text-xs font-bold text-slate-705 shadow-inner">
          {statusMsg}
        </div>
      )}

      {/* Mutual Match Animation Overlay */}
      {isMatchGlow && matchedPartner && (
        <div className="rounded-3xl border-2 border-amber-400 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white p-6 shadow-2xl flex flex-col md:flex-row items-center gap-6 animate-pulse">
          <div className="flex -space-x-4">
            <img
              src={userProfile?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop"}
              alt="Me"
              className="w-16 h-16 rounded-full border-2 border-slate-900 object-cover"
            />
            <img
              src={matchedPartner.avatar}
              alt={matchedPartner.name}
              className="w-16 h-16 rounded-full border-2 border-slate-900 object-cover"
            />
          </div>
          <div className="flex-grow text-center md:text-left space-y-1">
            <h4 className="font-serif text-lg font-bold text-yellow-300">
              Joint research lab established!
            </h4>
            <p className="text-xs text-slate-300 font-medium">
              You and <strong>{matchedPartner.name}</strong> are now linked. A multi-user workspace (including up to 2 other high-similarity contributing observers) was successfully created.
            </p>
          </div>
          <button
            onClick={() => {
              setIsMatchGlow(false);
              setMatchedPartner(null);
              setSwipingIndex((prev) => prev + 1);
            }}
            className="bg-yellow-400 text-slate-950 font-sans text-xs font-black px-5 py-2.5 rounded-xl hover:bg-yellow-300 active:scale-95 duration-100"
          >
            Launch workspace chat
          </button>
        </div>
      )}

      {/* Discovery Deck Slot Card */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activeCard ? (
        <div className="overflow-hidden rounded-3xl border border-slate-205 bg-white shadow-xl grid grid-cols-1 md:grid-cols-12">
          {/* Left panel: Portrait and metrics */}
          <div className="md:col-span-4 bg-slate-50 p-6 flex flex-col items-center justify-between border-r border-slate-100 space-y-6">
            <div className="text-center space-y-3">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-300 shadow-md">
                <img
                  src={activeCard.avatar}
                  alt={activeCard.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-serif text-lg font-extrabold text-slate-900">
                  {activeCard.name}
                </h3>
                <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5 tracking-wider">
                  {activeCard.role}
                </p>
                <p className="text-[10px] text-indigo-700 font-bold">
                  {activeCard.institution}
                </p>
              </div>
            </div>

            {/* UPGRADED CARD COMPONENT: Academic metric chips directly populated */}
            <div className="w-full bg-white rounded-xl border border-slate-200/60 p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold">Academic Impact</span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-2 rounded-lg text-center">
                  <div className="font-mono text-xs font-black text-slate-800">
                    {activeCard.hIndex || 28}
                  </div>
                  <div className="text-[8px] font-bold text-slate-400 uppercase mt-0.5 tracking-wider">
                    h-Index
                  </div>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg text-center">
                  <div className="font-mono text-xs font-black text-slate-800">
                    {activeCard.citations || "3.4k"}
                  </div>
                  <div className="text-[8px] font-bold text-slate-400 uppercase mt-0.5 tracking-wider">
                    Citations
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: Intention, Publications list and actions */}
          <div className="md:col-span-8 p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-sans font-extrabold text-indigo-700 uppercase tracking-widest bg-indigo-55 px-2.5 py-1 rounded-full">
                  {activeCard.field || "Applied Science"}
                </span>
                <div className="font-mono text-[10px] font-bold text-slate-400">
                  Alignment Score: <span className="text-indigo-600 font-black">{activeCard.matchScore || 85}%</span>
                </div>
              </div>

              {/* Research Intent Synthesis section */}
              <div className="space-y-1">
                <h4 className="font-serif text-sm font-bold text-slate-900">
                  Detailed Intent & Target Hypotheses
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  {activeCard.intent || activeCard.about}
                </p>
              </div>

              {/* Verified publications references */}
              <div className="space-y-1.5 pt-1.5">
                <h5 className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Verified Publication References</span>
                </h5>
                <div className="space-y-2 bg-slate-50/50 rounded-xl p-3 border border-slate-100 max-h-40 overflow-y-auto">
                  {activeCard.publications && activeCard.publications.length > 0 ? (
                    activeCard.publications.slice(0, 3).map((pub, i) => (
                      <div key={i} className="text-[10px] border-b border-slate-200/40 pb-1.5 last:border-b-0 last:pb-0">
                        <div className="font-extrabold text-slate-800 leading-snug">
                          {pub.title}
                        </div>
                        <div className="text-slate-500 font-medium mt-0.5">
                          {pub.journal} • <span className="font-mono">{pub.year}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-[10px] text-slate-400 font-semibold italic text-center py-4">
                      No publication references submitted.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Core Swiping actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={handleSkipInteract}
                className="w-1/3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-700 font-sans text-xs font-extrabold transition cursor-pointer"
              >
                Skip Candidate
              </button>
              <button
                onClick={() => handleCollabInteract(activeCard.id)}
                className="w-2/3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-black tracking-wide flex items-center justify-center gap-1.5 duration-150 hover:scale-[1.01]"
              >
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse fill-amber-400" />
                <span>Endorse Collaborative Partnership</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 p-12 text-center bg-white space-y-4 max-w-lg mx-auto">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-slate-900">
            End of Prospective Deck Pool
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
            You have parsed your maximum available match alignment scores. Please alter your intent bio or refine keywords to force the database pipeline to calculate updated vector spaces.
          </p>
          <button
            onClick={() => setSwipingIndex(0)}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-bold"
          >
            Restart Index Loop
          </button>
        </div>
      )}
    </div>
  );
}
