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
import { ProfileModal } from "./components/ProfileModal";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [userSession, setUserSession] = useState<any | null>(null);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [currentTab, setCurrentTab] = useState<"match" | "discovery" | "collabs" | "chat" | "profile">("match");
  const [activeMatches, setActiveMatches] = useState<Match[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [viewProfileId, setViewProfileId] = useState<string | null>(null);

  // Match Success Visual overlay state
  const [matchedPartner, setMatchedPartner] = useState<Profile | null>(null);

  const handleUpgrade = async (tier: "scholar" | "gold" | "platinum") => {
    setUpgrading(true);
    try {
      const res = await fetch("/api/profile/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier })
      });
      if (res.ok) {
        const result = await res.json();
        setUserSession(result.user);
        await refreshMatchesAndLikes();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpgrading(false);
      setShowBillingModal(false);
    }
  };

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
            avatar: onboardingData.avatar,
            institution: onboardingData.institution,
            field: onboardingData.field,
            hIndex: onboardingData.hIndex,
            citations: onboardingData.citations,
            publications: onboardingData.publications
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
            avatar: onboardingData.avatar,
            institution: onboardingData.institution,
            field: onboardingData.field,
            hIndex: onboardingData.hIndex,
            citations: onboardingData.citations,
            publications: onboardingData.publications
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
                  {activeMatches.length} / {userSession?.subscription_tier === "platinum" ? 4 : userSession?.subscription_tier === "gold" ? 3 : 2}
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
              <div className="flex items-center gap-2">
                {userSession.subscription_tier === "platinum" ? (
                  <button
                    onClick={() => setShowBillingModal(true)}
                    className="flex items-center gap-1 bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-600 text-white px-3 py-1.5 rounded-full text-[10px] font-mono font-black scale-95 shadow-md shrink-0 cursor-pointer border-none hover:scale-100 duration-150 animate-pulse"
                    title="Click to manage subscription tier / Downgrade / Upgrade"
                  >
                    <Sparkles className="w-3 h-3 text-white fill-white animate-spin-slow" />
                    <span>PLATINUM PI</span>
                  </button>
                ) : userSession.subscription_tier === "gold" ? (
                  <button
                    onClick={() => setShowBillingModal(true)}
                    className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-3 py-1.5 rounded-full text-[10px] font-mono font-black scale-95 shadow-md shrink-0 cursor-pointer border-none hover:scale-100 duration-150"
                    title="Click to manage subscription tier / Downgrade / Upgrade"
                  >
                    <Sparkles className="w-3 h-3 text-white fill-white animate-spin-slow" />
                    <span>GOLD PI</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowBillingModal(true)}
                    className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 px-3.5 py-1.5 rounded-full text-[10px] font-sans font-black scale-95 hover:scale-100 duration-150 border-none cursor-pointer shadow animate-bounce shrink-0"
                    title="Click to upgrade"
                  >
                    <Sparkles className="w-3 h-3 text-slate-950 fill-slate-950" />
                    <span>Upgrade</span>
                  </button>
                )}
                <button
                  onClick={() => setViewProfileId(userSession.id)}
                  className="flex items-center gap-1.5 hover:bg-slate-100 p-0.5 px-2 py-1 rounded-xl border border-slate-200 duration-150 cursor-pointer bg-slate-50 text-left text-slate-705 shrink-0"
                  title="Click to view your profile and stats"
                >
                  <img
                    src={userSession.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop"}
                    alt={userSession.name}
                    className="w-5.5 h-5.5 rounded-full object-cover border border-slate-300"
                  />
                  <span className="hidden lg:inline text-[9px] font-mono leading-none uppercase font-black text-slate-700">
                    {userSession.name}
                  </span>
                </button>
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

        {/* PREMIUM SUBSCRIPTION BILLING UPGRADE MODAL */}
        {showBillingModal && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-[28px] max-w-2xl w-full overflow-hidden shadow-2xl relative animate-scale-up text-slate-900">
              
              <div className="bg-slate-900 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative">
                <button
                  onClick={() => setShowBillingModal(false)}
                  className="absolute top-4 right-4 text-white hover:text-slate-200 text-xs font-bold bg-white/10 hover:bg-white/20 p-1.5 px-3 rounded-full cursor-pointer border-none"
                >
                  ✕ Close
                </button>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest leading-none">
                    <Sparkles className="w-4 h-4 fill-amber-400" />
                    <span>PI Subscription Hub</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold">ResearchBuddy Tier Upgrades</h3>
                  <p className="text-[11px] text-slate-350">Choose between Gold and Platinum tiers for maximum co-author matching scaling.</p>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  Unlock dynamic workspace limits, custom scaling capacity constraints up to 4 co-authors, and activate the complete RAG-powered AI Research Assistant Ecosystem directly.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Scholar */}
                  <div className="border border-slate-150 rounded-2xl bg-slate-50 p-4 space-y-2 relative flex flex-col justify-between">
                    <div>
                      <span className="text-[8px] font-mono font-extrabold text-slate-400 uppercase tracking-widest">Active</span>
                      <div className="font-serif text-sm font-bold text-slate-755 mt-1">Scholar (Free)</div>
                      <div className="text-lg font-mono font-black text-slate-900">$0<span className="text-[9px] font-sans font-bold text-slate-400"> / forever</span></div>
                      <ul className="space-y-1 pt-1.5 text-[9px] text-slate-500 font-bold list-none pl-0">
                        <li>• Max 2 joint active laboratories</li>
                        <li>• Hardlocked size limit of 2</li>
                        <li>• AI Assistant is blurred/locked</li>
                      </ul>
                    </div>
                    {userSession?.subscription_tier === "scholar" || !userSession?.subscription_tier ? (
                      <div className="text-[10px] text-slate-400 bg-slate-100 border border-slate-200 py-1.5 rounded-lg font-bold text-center mt-4">Current Active Tier</div>
                    ) : (
                      <button
                        onClick={async () => handleUpgrade("scholar")}
                        disabled={upgrading}
                        className="w-full mt-4 py-2 bg-slate-200 hover:bg-slate-350 text-slate-700 rounded-lg text-[10px] font-mono font-black uppercase cursor-pointer border-none shadow duration-150 disabled:opacity-50"
                      >
                        {upgrading ? "Switching..." : "Demote to Scholar"}
                      </button>
                    )}
                  </div>

                  {/* Gold */}
                  <div className="border-2 border-amber-500/40 rounded-2xl bg-amber-50/5 p-4 space-y-2 relative flex flex-col justify-between shadow-sm">
                    <div>
                      <span className="absolute top-2.5 right-2 px-1.5 py-0.5 bg-amber-100/90 text-amber-800 rounded font-mono text-[8px] font-extrabold tracking-widest uppercase">Popular</span>
                      <div className="font-serif text-sm font-black text-slate-850 mt-1">Gold PI</div>
                      <div className="text-lg font-mono font-black text-amber-700">$6 <span className="text-[10px] text-amber-600 font-sans font-medium hover:underline">(~700 BDT)</span><span className="text-[9px] font-sans font-bold text-slate-400"> / user / mo</span></div>
                      <ul className="space-y-1 pt-1.5 text-[9px] text-slate-600 font-bold list-none pl-0">
                        <li className="text-amber-805">✓ 3 active joint workspaces</li>
                        <li className="text-amber-805">✓ Team capacity scaling up to 3</li>
                        <li className="text-emerald-700 animate-pulse">✓ Paper Sum + Dataset tools</li>
                      </ul>
                    </div>

                    {userSession?.subscription_tier === "gold" ? (
                      <div className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 py-1.5 rounded-lg font-mono font-black text-center mt-4">Current Active Tier</div>
                    ) : (
                      <button
                        onClick={async () => handleUpgrade("gold")}
                        disabled={upgrading}
                        className="w-full mt-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-mono font-black uppercase cursor-pointer border-none shadow duration-150 disabled:opacity-50"
                      >
                        {upgrading ? "Upgrading..." : userSession?.subscription_tier === "platinum" ? "Downgrade to Gold" : "Select Gold"}
                      </button>
                    )}
                  </div>

                  {/* Platinum */}
                  <div className="border-2 border-indigo-500/50 rounded-2xl bg-indigo-50/10 p-4 space-y-2 relative flex flex-col justify-between shadow-md">
                    <div>
                      <span className="absolute top-2.5 right-2 px-1.5 py-0.5 bg-indigo-100 text-indigo-750 rounded font-mono text-[8px] font-extrabold tracking-widest uppercase">Elite</span>
                      <div className="font-serif text-sm font-black text-indigo-950 mt-1">Platinum PI</div>
                      <div className="text-lg font-mono font-black text-indigo-700">$10 <span className="text-[10px] text-indigo-600 font-sans font-medium hover:underline">(~1,170 BDT)</span><span className="text-[9px] font-sans font-bold text-slate-400"> / user / mo</span></div>
                      <ul className="space-y-1 pt-1.5 text-[9px] text-slate-600 font-bold list-none pl-0">
                        <li className="text-indigo-850 font-black">✓ 4 active joint workspaces</li>
                        <li className="text-indigo-850 font-black">✓ Max capacity scaling to 4</li>
                        <li className="text-indigo-850 font-black">✓ ALL AI Copilot tools unlocked</li>
                        <li className="text-emerald-700 font-bold">✓ Global review coverage</li>
                      </ul>
                    </div>

                    {userSession?.subscription_tier === "platinum" ? (
                      <div className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 py-1.5 rounded-lg font-mono font-black text-center mt-4">Current Active Tier</div>
                    ) : (
                      <button
                        onClick={async () => handleUpgrade("platinum")}
                        disabled={upgrading}
                        className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-mono font-black uppercase cursor-pointer border-none shadow duration-150 disabled:opacity-50"
                      >
                        {upgrading ? "Upgrading..." : "Select Platinum"}
                      </button>
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}
        
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
                        onViewProfile={setViewProfileId}
                      />
                    )}

                    {currentTab === "discovery" && (
                      <DiscoveryView
                        currentUser={userSession}
                        onViewProfile={setViewProfileId}
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
                        onSwipeJoin={() => setCurrentTab("match")}
                        onViewProfile={setViewProfileId}
                      />
                    )}

                    {currentTab === "chat" && (
                      <ChatView
                        currentUser={userSession}
                        activeMatches={activeMatches}
                        onViewProfile={setViewProfileId}
                        onTriggerUpgrade={() => setShowBillingModal(true)}
                        onCloseMatchSlot={handleMatchSlotTerminated}
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
                  </>
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

      <ProfileModal profileId={viewProfileId} onClose={() => setViewProfileId(null)} />

    </div>
  );
}
