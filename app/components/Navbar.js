"use client";

import React, { useState } from "react";
import { Sparkles, Trophy, Check, CreditCard, Shield, Rocket, MessageSquare, Compass, User, Zap } from "lucide-react";

export default function Navbar({ user, onUpgrade, currentTab, setCurrentTab }) {
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [tier, setTier] = useState(user?.subscription_tier || "scholar");

  const isPremium = tier === "premium";

  const handleUpgradeMock = async () => {
    setUpgrading(true);
    try {
      // Mock API trigger
      const res = await fetch("/api/profile/upgrade", { method: "POST" });
      if (res.ok) {
        setTier("premium");
        if (onUpgrade) onUpgrade();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpgrading(false);
      setShowBillingModal(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Branding Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md">
            <Trophy className="h-5 w-5 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-black tracking-tight text-slate-900">
              ResearchBuddy
            </h1>
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-400">
              Joint Lab Network
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        {setCurrentTab && (
          <nav className="hidden md:flex gap-1" id="nav-navbar-tabs">
            <button
              onClick={() => setCurrentTab("discovery")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-sans text-xs font-bold duration-150 ${
                currentTab === "discovery"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Discovery</span>
            </button>

            <button
              onClick={() => setCurrentTab("matches")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-sans text-xs font-bold duration-150 ${
                currentTab === "matches"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Match Center</span>
            </button>

            <button
              onClick={() => setCurrentTab("chat")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-sans text-xs font-bold duration-150 ${
                currentTab === "chat"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Workspace Chat</span>
            </button>

            <button
              onClick={() => setCurrentTab("profile")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-sans text-xs font-bold duration-150 ${
                currentTab === "profile"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Profile</span>
            </button>
          </nav>
        )}

        {/* Subscription Control & Profile Mini */}
        <div className="flex items-center gap-3">
          {/* Glowing Premium Badge/Button */}
          {isPremium ? (
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-3.5 py-1.5 rounded-full font-sans font-bold text-xs shadow-md shadow-amber-500/20">
              <Zap className="h-3 w-3 fill-white" />
              <span>PREMIUM PI</span>
            </div>
          ) : (
            <button
              onClick={() => setShowBillingModal(true)}
              className="group relative flex items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 px-4 py-1.5 font-sans text-xs font-extrabold text-white shadow-md hover:scale-105 duration-150 cursor-pointer"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-amber-400/20 to-pink-500/10 opacity-70 group-hover:opacity-100 transition-opacity"></span>
              <Sparkles className="h-3.5 w-3.5 animate-bounce text-amber-400" />
              <span>Upgrade to Premium</span>
            </button>
          )}

          {/* User Meta */}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop"}
                alt="user avatar"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="hidden sm:block">
              <p className="font-sans text-[11px] font-black text-slate-800 leading-none">
                {user?.name || "Dr. Scholar"}
              </p>
              <p className="font-mono text-[8px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
                {tier} Tier
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bill modal Portal view */}
      {showBillingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-2xl animate-scale-up">
            {/* Header banner glow */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative">
              <div className="absolute top-3 right-4">
                <button
                  onClick={() => setShowBillingModal(false)}
                  className="rounded-full bg-white/10 hover:bg-white/20 p-1 px-2 text-xs font-black"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-amber-400 tracking-widest">
                  <Sparkles className="h-4.5 w-4.5 text-yellow-400 fill-yellow-400" />
                  <span>ResearchBuddy premium tier upgrades</span>
                </div>
                <h3 className="font-serif text-2xl font-bold tracking-tight">
                  Empower Your Multi-User Research Lab
                </h3>
              </div>
            </div>

            {/* Modal Body / Benefit Grid */}
            <div className="p-6 space-y-6">
              <p className="font-sans text-xs text-slate-500 leading-relaxed font-semibold">
                Break free from standard single-user resource caps. Enable Principal Investigator privileges to collaborate in 4-person concurrent workspaces and access next-generation AI Co-pilot ecosystems.
              </p>

              {/* Pricing Cards Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Free Card */}
                <div className="border border-slate-100 rounded-2xl bg-slate-50 p-4 space-y-2 relative">
                  <span className="absolute top-3 right-3 text-[9px] font-mono font-extrabold text-slate-400 uppercase tracking-widest">Active</span>
                  <div className="font-serif text-sm font-bold text-slate-700">Scholar Tier</div>
                  <div className="text-2xl font-mono font-black text-slate-900">$0 <span className="text-[10px] font-sans font-bold text-slate-400">/ forever</span></div>
                  <ul className="space-y-1.5 pt-2 text-[10px] text-slate-500 font-semibold">
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3 w-3 text-emerald-500" />
                      <span>Max 2 joint active workspaces</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3 w-3 text-emerald-500" />
                      <span>Limited dynamic swipe deck</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-red-500">✕</span>
                      <span>No RAG-powered AI Assistant</span>
                    </li>
                  </ul>
                </div>

                {/* Premium Card */}
                <div className="border-2 border-slate-800 rounded-2xl bg-gradient-to-b from-indigo-50/40 to-white p-4 space-y-2 relative shadow-lg">
                  <div className="absolute top-3 right-3 flex items-center gap-0.5 bg-slate-900 text-white rounded px-2 py-0.5 text-[8px] font-mono font-extrabold tracking-widest uppercase">
                    <Rocket className="w-2.5 h-2.5 text-amber-400" />
                    <span>Best Value</span>
                  </div>
                  <div className="font-serif text-sm font-bold text-slate-900 text-indigo-950">Principal Investigator</div>
                  <div className="text-2xl font-mono font-black text-indigo-900">$9 <span className="text-[10px] font-sans font-bold text-slate-400">/ user / mo</span></div>
                  <ul className="space-y-1.5 pt-2 text-[10px] text-slate-600 font-semibold">
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3 w-3 text-indigo-600" />
                      <span>Up to 4 active joint workspaces</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check className="h-3 w-3 text-indigo-600" />
                      <span>Unlimited daily collaborator matches</span>
                    </li>
                    <li className="flex items-center gap-1.5 animate-pulse">
                      <Check className="h-3 w-3 text-indigo-600" />
                      <span className="font-black text-slate-900">RAG AI Assistant ecosystem</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Secure Checkout button */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleUpgradeMock}
                  disabled={upgrading}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-black tracking-wide flex items-center justify-center gap-2 shadow-xl hover:scale-[1.01] duration-150 cursor-pointer disabled:opacity-55"
                >
                  {upgrading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authorizing Sandbox Account Upgrade...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 text-emerald-300" />
                      <span>Pay $9.00 / Month & Unlock Instantly</span>
                    </>
                  )}
                </button>
                <div className="text-[9px] text-slate-400 text-center font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-600" />
                  <span>Sandbox charge. Simulated securely, zero real dollars required</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
