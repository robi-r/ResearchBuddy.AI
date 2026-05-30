import React, { useState, useEffect } from "react";
import { GraduationCap, Database, RefreshCw, LogOut, Compass, MessageSquare, UserCheck, Sparkles, Check, Users } from "lucide-react";

import { Profile, Persona, Match, Message } from "./types";
import { PersonaLanding } from "./components/PersonaLanding";
import { OnboardingForm } from "./components/OnboardingForm";
import { MatchSectionView } from "./components/MatchSectionView";
import { DiscoveryView } from "./components/DiscoveryView";
import { CollabsView } from "./components/CollabsView";
import { ChatView } from "./components/ChatView";
import { ProfileView } from "./components/ProfileView";
import { DatabaseMigrations } from "./components/DatabaseMigrations";
import { ResearchBuddyLogo } from "./components/ResearchBuddyLogo";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [userSession, setUserSession] = useState<any | null>(null);
  const [currentTab, setCurrentTab] = useState<"match" | "discovery" | "collabs" | "chat" | "profile">("match");
  const [activeMatches, setActiveMatches] = useState<Match[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Match Success Visual overlay state
  const [matchedPartner, setMatchedPartner] = useState<Profile | null>(null);

  // Check auth session on startup
  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/status");
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setUserSession(data.user);
          await refreshMatchesAndLikes();
        }
      }
    } catch (err) {
      console.error("Session sync failed:", err);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const refreshMatchesAndLikes = async () => {
    try {
      // Load active matches
      const matchesRes = await fetch("/api/matches");
      if (matchesRes.ok) {
        const matchesData = await matchesRes.json();
        setActiveMatches(matchesData.matches || []);
      }

      // Load pending likes received
      const likesRes = await fetch("/api/likes-received");
      if (likesRes.ok) {
        const likesData = await likesRes.json();
        setLikesCount(likesData.likers?.length || 0);
      }
    } catch (err) {
      console.error("Telemetry refresh failed:", err);
    }
  };

  // Poll server state every 7 seconds to keep chat and match logs synced active
  useEffect(() => {
    if (!userSession) return;
    refreshMatchesAndLikes();
    const interval = setInterval(refreshMatchesAndLikes, 7000);
    return () => clearInterval(interval);
  }, [userSession]);

  const handleSelectPersona = async (persona: Persona) => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/preset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaId: persona.id })
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setUserSession(result.user);
          await refreshMatchesAndLikes();
          setCurrentTab("match");
        }
      }
    } catch (err) {
      console.error("Preset log-in failing:", err);
    } finally {
      setLoading(false);
    }
  };

  // Custom onboarding / detailed profile creation completion
  const handleOnboardingSubmit = async (onboardingData: any) => {
    setLoading(true);
    try {
      const isUpdating = !!userSession;
      const url = isUpdating ? "/api/profile/update" : "/api/auth/signup";
      
      const payload = isUpdating
        ? {
            name: onboardingData.name,
            role: onboardingData.background,
            skills: onboardingData.skills,
            interests: onboardingData.interests,
            intent: onboardingData.intent,
            commitment: onboardingData.commitment,
            avatar: onboardingData.avatar
          }
        : {
            email: `${onboardingData.name.toLowerCase().replace(/\s+/g, "")}@researchbuddy.edu`,
            password: "customOnboardPassword123",
            name: onboardingData.name,
            background: onboardingData.background,
            intent: onboardingData.intent,
            skills: onboardingData.skills,
            interests: onboardingData.interests,
            commitment: onboardingData.commitment,
            avatar: onboardingData.avatar
          };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        setUserSession(result.user);
        setShowOnboarding(false);
        await refreshMatchesAndLikes();
        setCurrentTab("match");
      }
    } catch (err) {
      console.error("Onboarding / profile update failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Manual Auth Modal completion - redirects directly to detailed profile setup gate!
  const handleManualAuthSuccess = (updatedUser: any) => {
    setUserSession(updatedUser);
    refreshMatchesAndLikes();
    setShowOnboarding(true);
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.warn("Express server signout sync warning:", err);
    }
    setUserSession(null);
    setShowOnboarding(false);
  };

  const handleMatchSuccessTrigger = (partner: Profile) => {
    setMatchedPartner(partner);
    refreshMatchesAndLikes();
  };

  const handleCloseMatchSuccessModal = () => {
    setMatchedPartner(null);
    setCurrentTab("chat");
  };

  const handleMatchSlotTerminated = (matchId: string) => {
    setActiveMatches(prev => prev.filter(m => m.matchId !== matchId));
    refreshMatchesAndLikes();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white pb-10 relative">
      <div className="grid-overlay" />

      {/* Persistence Global Navigation Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200/80 z-40 transition-all shadow-sm">
        <div className="flex h-16 justify-between items-center max-w-7xl mx-auto px-4 w-full">
          <div className="flex items-center gap-2.5">
            <ResearchBuddyLogo size={42} className="shrink-0" />
            <div className="flex flex-col">
              <span className="font-sans font-black text-lg text-slate-950 tracking-tight leading-none">ResearchBuddy</span>
              <span className="text-[9px] font-mono text-slate-400 mt-0.5 tracking-wider uppercase bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-full w-fit">Co-Author Match</span>
            </div>
          </div>

          {/* Core navigation links when logged-in */}
          {userSession && (
            <nav className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setCurrentTab("match")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer border-none ${
                  currentTab === "match" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-805"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Match</span>
              </button>

              <button
                onClick={() => setCurrentTab("discovery")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer border-none ${
                  currentTab === "discovery" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-805"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Discovery</span>
              </button>

              <button
                onClick={() => setCurrentTab("collabs")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer border-none relative ${
                  currentTab === "collabs" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-805"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Collabs</span>
                {likesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-[8px] font-black text-white px-1.5 py-0.5 rounded-full ring-2 ring-white">
                    {likesCount}
                  </span>
                )}
                <span className="ml-1.5 bg-slate-200 text-slate-700 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded leading-none">
                  {activeMatches.length} / 2
                </span>
              </button>

              <button
                onClick={() => setCurrentTab("chat")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer border-none ${
                  currentTab === "chat" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-805"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat</span>
              </button>

              <button
                onClick={() => setCurrentTab("profile")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer border-none ${
                  currentTab === "profile" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-805"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Profile</span>
              </button>
            </nav>
          )}

          {/* Right Action Widgets */}
          <div className="flex items-center gap-2.5">
            {userSession ? (
              <div className="flex items-center gap-2.5">
                <span className="hidden lg:inline bg-slate-100 border border-slate-200 text-slate-700 font-bold px-3 py-1 rounded-lg text-[10px] font-mono leading-none font-sans">
                  User: {userSession.name}
                </span>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg duration-150 border-none cursor-pointer flex items-center justify-center bg-transparent"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-sans font-black text-xs px-3.5 py-2.5 rounded-xl border border-emerald-150 duration-150 cursor-pointer shadow-sm"
              >
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                <span>SQL Specs</span>
              </button>
            )}
          </div>
        </div>

        {/* Persistent bottom mobile safe nav indicator bar */}
        {userSession && (
          <div className="md:hidden border-t border-slate-200 grid grid-cols-5 text-center bg-white py-1.5">
            <button
              onClick={() => setCurrentTab("match")}
              className={`flex flex-col items-center justify-center py-1 bg-transparent border-none cursor-pointer ${
                currentTab === "match" ? "text-slate-950 font-black" : "text-slate-400 font-semibold"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span className="text-[9px] mt-0.5">Match</span>
            </button>

            <button
              onClick={() => setCurrentTab("discovery")}
              className={`flex flex-col items-center justify-center py-1 bg-transparent border-none cursor-pointer ${
                currentTab === "discovery" ? "text-slate-950 font-black" : "text-slate-400 font-semibold"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span className="text-[9px] mt-0.5">Discovery</span>
            </button>

            <button
              onClick={() => setCurrentTab("collabs")}
              className={`flex flex-col items-center justify-center py-1 bg-transparent border-none cursor-pointer relative ${
                currentTab === "collabs" ? "text-slate-950 font-black" : "text-slate-400 font-semibold"
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="text-[9px] mt-0.5">Collabs</span>
              {likesCount > 0 && (
                <span className="absolute top-1 right-2.5 bg-emerald-500 text-[7px] font-black text-white px-1 py-0.5 rounded-full animate-pulse">
                  {likesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab("chat")}
              className={`flex flex-col items-center justify-center py-1 bg-transparent border-none cursor-pointer ${
                currentTab === "chat" ? "text-slate-950 font-black" : "text-slate-400 font-semibold"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-[9px] mt-0.5">Chat</span>
            </button>

            <button
              onClick={() => setCurrentTab("profile")}
              className={`flex flex-col items-center justify-center py-1 bg-transparent border-none cursor-pointer ${
                currentTab === "profile" ? "text-slate-950 font-black" : "text-slate-400 font-semibold"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span className="text-[9px] mt-0.5">Profile</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Sandbox Layout Area router */}
      <main className="flex-grow pt-4 relative z-10 w-full">
        
        {/* SQL migrations spec drawer dialog modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-[28px] max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl relative space-y-4 text-slate-900">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-sans text-lg font-black text-slate-950">Supabase Integration Specifications</h2>
                  <p className="text-xs text-slate-500 font-semibold">PostgreSQL pgvector definitions & cosine matching triggers</p>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 duration-150 rounded-lg text-xs font-bold text-slate-700 cursor-pointer border-none"
                >
                  Close
                </button>
              </div>
              <DatabaseMigrations />
            </div>
          </div>
        )}

        {/* LOADING INDICATOR PANEL */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 max-w-md mx-auto">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-slate-500">Processing database security transactions...</p>
          </div>
        )}

        {/* Dynamic Views Rendering based on Login Phase */}
        {!loading && (
          <div className="w-full">
            {!userSession ? (
              // Not Signed In Phase
              showOnboarding ? (
                <OnboardingForm
                  onSubmit={handleOnboardingSubmit}
                  onBack={() => setShowOnboarding(false)}
                  loading={loading}
                />
              ) : (
                <PersonaLanding
                  onSelectPersona={handleSelectPersona}
                  onCustomStart={() => setShowOnboarding(true)}
                  onManualAuthSuccess={handleManualAuthSuccess}
                />
              )
            ) : (
              // Signed In Core Channels routing map
              <div className="px-2">
                {showOnboarding ? (
                  <OnboardingForm
                    onSubmit={handleOnboardingSubmit}
                    onBack={handleSignOut}
                    loading={loading}
                    initialData={userSession}
                  />
                ) : (
                  <>
                    {currentTab === "match" && (
                      <MatchSectionView
                        currentUser={userSession}
                        activeMatchCount={activeMatches.length}
                        onMatchSuccess={handleMatchSuccessTrigger}
                      />
                    )}

                    {currentTab === "discovery" && (
                      <DiscoveryView
                        currentUser={userSession}
                      />
                    )}

                    {currentTab === "collabs" && (
                      <CollabsView
                        currentUser={userSession}
                        activeMatches={activeMatches}
                        onSelectPartner={(p) => setCurrentTab("chat")}
                        onCloseMatchSlot={handleMatchSlotTerminated}
                        activeMatchCount={activeMatches.length}
                        onMatchSuccess={handleMatchSuccessTrigger}
                        onRefresh={refreshMatchesAndLikes}
                      />
                    )}
                  </>
                )}

                {currentTab === "chat" && (
                  <ChatView
                    currentUser={userSession}
                    activeMatches={activeMatches}
                  />
                )}

                {currentTab === "profile" && (
                  <ProfileView
                    currentUser={userSession}
                    onUpdateUser={(updatedUser) => {
                      setUserSession(updatedUser);
                    }}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* FULL SCREEN RESEARCH MATCH CELEBRATION MODAL OVERLAY */}
      <AnimatePresence>
        {matchedPartner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 text-center text-white"
          >
            {/* Ambient Background Glow Layer */}
            <div className="absolute w-[350px] h-[350px] bg-emerald-500/20 rounded-full blur-[120px] -z-10 animate-pulse" />

            <div className="max-w-md space-y-8 animate-scale-up">
              
              {/* Badge label */}
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-widest mx-auto">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                <span>Mutual Handshake Established</span>
              </div>

              {/* Title description */}
              <div className="space-y-2">
                <h1 className="font-sans text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
                  It's a Research Match!
                </h1>
                <p className="text-slate-400 text-sm max-w-sm mx-auto font-semibold">
                  Co-author workspaces unlocked. Shared telemetry records are synchronization-ready.
                </p>
              </div>

              {/* Side-by-Side Avatars with Connector line */}
              <div className="flex justify-center items-center gap-6 py-6 font-semibold">
                {/* Me Avatar */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-emerald-400 hover:border-white duration-150 shadow-2xl relative">
                    <img
                      src={userSession?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop"}
                      alt={userSession?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs text-slate-300 font-bold max-w-[100px] truncate">{userSession?.name}</span>
                </div>

                {/* Dashed connector vector line */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-emerald-400 font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 animate-pulse">
                    94% Fit
                  </span>
                  <div className="w-16 h-0.5 border-t border-dashed border-emerald-500 my-2" />
                </div>

                {/* Partner Avatar */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-emerald-400 hover:border-white duration-150 shadow-2xl relative">
                    <img
                      src={matchedPartner.avatar}
                      alt={matchedPartner.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs text-slate-300 font-bold max-w-[100px] truncate">{matchedPartner.name}</span>
                </div>
              </div>

              {/* Match description text */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs italic text-slate-300 leading-relaxed max-w-sm mx-auto">
                &ldquo;{matchedPartner.intent}&ldquo;
              </div>

              {/* Call to actions trigger */}
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleCloseMatchSuccessModal}
                  className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-sans font-black text-xs rounded-xl shadow-lg hover:shadow-xl duration-150 border-none cursor-pointer"
                >
                  Enter Joint Project Workspace Chat
                </button>
                <button
                  onClick={() => setMatchedPartner(null)}
                  className="w-full h-11 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white font-sans font-extrabold text-xs rounded-xl duration-150 border-none cursor-pointer"
                >
                  Continue Reviewing Peers
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
