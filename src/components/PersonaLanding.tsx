import React, { useState } from "react";
import { ArrowRight, Sparkles, Terminal, LogIn, Mail, Lock, User, PlusCircle, ShieldAlert, Check } from "lucide-react";
import { Persona } from "../types";

// Pre-defined Judge Personas
export const JUDGE_PERSONAS: Persona[] = [
  {
    id: "sarah",
    name: "Dr. Sarah",
    title: "Senior Climate Scientist",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop",
    background: "PhD in Climatology & Global Dynamics",
    skills: ["Climate Tech", "Python", "Data Visualization", "Fortran"],
    interests: ["Climate Tech", "Quantum Computing", "Applied Robotics"],
    intent: "I am looking for a deep learning expert who can help scale our greenhouse gas prediction transformer models on global climate datasets. Experience with low-latency parallel processing is critical."
  },
  {
    id: "rahman",
    name: "Rahman",
    title: "CS Master's Student",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop",
    background: "BSc Student in Computer Science",
    skills: ["Python", "Machine Learning", "PyTorch", "LaTeX"],
    interests: ["Neural Networks", "Bio-Genetics", "Applied Robotics"],
    intent: "Looking for a healthcare domain expert or medical doctor to help validate the diagnostic outputs of our clinical neural net model for a master's thesis. Need clinical feedback."
  },
  {
    id: "alex",
    name: "Alex",
    title: "Lead NLP Researcher",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&auto=format&fit=crop",
    background: "Senior NLP Data Scientist at BioLab",
    skills: ["R Stats", "NLP", "Data Visualization", "Peer Review"],
    interests: ["Neural Networks", "Climate Tech", "Bio-Genetics"],
    intent: "Looking for an NLP researcher specialized in large-scale sentiment tracking on scientific publications. Strong expertise in data visualization and journal editing is a major plus."
  }
];

interface PersonaLandingProps {
  onSelectPersona: (persona: Persona) => void;
  onCustomStart: () => void;
  onManualAuthSuccess: (userProfile: any) => void;
}

export function PersonaLanding({ onSelectPersona, onCustomStart, onManualAuthSuccess }: PersonaLandingProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [background, setBackground] = useState("");
  const [intent, setIntent] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Map initials for custom avatar aesthetic
  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const endpoint = authMode === "signup" ? "/api/auth/signup" : "/api/auth/login";
    const payload = authMode === "signup" 
      ? { email, password, name, background, intent, skills: ["AI Systems", "Data Analytics"], interests: ["Neural Networks"] }
      : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Authentication procedure failed.");
      }

      const result = await response.json();
      if (result.success) {
        if (authMode === "signup") {
          setSignupSuccess(true);
          setTimeout(() => {
            setShowAuthModal(false);
            onManualAuthSuccess(result.user);
          }, 1500);
        } else {
          setShowAuthModal(false);
          onManualAuthSuccess(result.user);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An authentication connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in max-w-5xl mx-auto px-4 mt-8 pb-16 relative">
      
      {/* Brand Header */}
      <header className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 text-[11px] font-mono text-slate-600 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Simple Mechanics: swipes, limits, & unlocks</span>
        </div>
        <h1 className="font-sans text-4xl md:text-5xl font-extrabold text-slate-905 tracking-tight leading-none">
          Select your persona.
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-base leading-relaxed font-semibold">
          Experience semantic matchmaking through the eyes of our core users. Simulated judge profiles instantly match you with optimal co-authors in our high-dimensional database.
        </p>
      </header>

      {/* Persona Cards Grid */}
      <section className="grid md:grid-cols-3 gap-8 pt-2">
        {JUDGE_PERSONAS.map((p) => (
          <div
            key={p.id}
            onClick={() => onSelectPersona(p)}
            className="group cursor-pointer bg-white border border-slate-200 hover:border-slate-900 transition-all duration-300 rounded-[24px] p-6 flex flex-col justify-between space-y-6 shadow-sm hover:shadow-xl hover:-translate-y-1"
            id={`persona-card-${p.id}`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 shadow-inner flex items-center justify-center bg-slate-100 font-sans font-extrabold text-[#475569]">
                    {getInitials(p.name)}
                  </div>
                  <div>
                    <h3 className="font-sans font-extrabold text-lg text-slate-900 group-hover:text-slate-900">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      {p.title}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/50">
                  {p.id === "sarah" ? "Lead Scientist" : p.id === "rahman" ? "Student" : "Practitioner"}
                </span>
              </div>

              <div className="text-xs text-slate-500 font-medium bg-slate-50 border border-slate-200/60 rounded-lg px-3 py-1.5">
                {p.background}
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                  Current Search Intent
                </span>
                <p className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-emerald-500 pl-4 py-0.5 min-h-[72px] line-clamp-4 font-semibold">
                  &ldquo;{p.intent}&rdquo;
                </p>
              </div>

              <div className="space-y-1 pt-1">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Target Verticals</span>
                <div className="flex flex-wrap gap-1">
                  {p.skills.slice(0, 3).map((s) => (
                    <span
                      key={s}
                      className="text-[10px] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-600 font-mono"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              className="w-full bg-[#0f172a] text-white text-xs font-semibold py-3 px-4 rounded-xl hover:bg-[#1e293b] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 border-none cursor-pointer"
              id={`persona-btn-${p.id}`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Enter as {p.name}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        ))}
      </section>

      {/* Manual option divider */}
      <div className="flex items-center gap-4 py-4 max-w-md mx-auto">
        <div className="h-[1px] bg-slate-200 flex-grow"></div>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
          Or Create Manually
        </span>
        <div className="h-[1px] bg-slate-200 flex-grow"></div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={onCustomStart}
          className="border-2 border-slate-900 text-slate-900 font-bold text-sm py-3.5 px-8 rounded-xl hover:bg-slate-900 hover:text-white transition-all duration-200 shadow-sm active:scale-95 flex items-center gap-2 cursor-pointer bg-white"
          id="custom-setup-btn"
        >
          <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
          <span>Launch Custom Profile Onboarding</span>
        </button>

        {/* Small standard Supabase testing signup link */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => {
              setAuthMode("signup");
              setErrorMsg(null);
              setShowAuthModal(true);
            }}
            className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 underline focus:outline-none cursor-pointer bg-transparent border-none"
          >
            Testing standard email signup
          </button>
          <span className="text-[10px] font-mono text-slate-450">
            Launches simulated Supabase Auth modal container
          </span>
        </div>
      </div>

      {/* Modern High-spec SaaS Tech Footer */}
      <footer className="pt-12 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div>
          &copy; 2026 ResearchBuddy Match Systems. Academic swiping sandbox.
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-slate-100 border border-slate-200 px-2 py-1 rounded text-[10px] font-mono">Supabase Auth</span>
          <span className="bg-slate-100 border border-slate-200 px-2 py-1 rounded text-[10px] font-mono">Row-Level-Security (RLS)</span>
          <span className="bg-slate-100 border border-slate-200 px-2 py-1 rounded text-[10px] font-mono">Dual Swiping Unlock</span>
        </div>
      </footer>

      {/* AUTHENTICATION MODAL DIALOG IN SUPABASE STYLE */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-white space-y-4 animate-scale-up">
            
            {/* Supabase Styled Logo badge and Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest">Supabase Auth Platform</span>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-slate-400 hover:text-white text-xs bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg cursor-pointer leading-none font-bold"
              >
                Close
              </button>
            </div>

            <div className="space-y-1">
              <h2 className="font-sans font-black text-xl text-white">
                {authMode === "signup" ? "Create a ResearchBuddy Account" : "Access Peer Account"}
              </h2>
              <p className="text-xs text-slate-400 leading-normal font-semibold">
                {authMode === "signup" 
                  ? "Initialize your PostgreSQL project schema and claim your active swipe slots."
                  : "Enter your registered email address to restore database profile states."
                }
              </p>
            </div>

            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-550/30 text-rose-400 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {signupSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-xs font-semibold text-center space-y-2">
                <Check className="w-6 h-6 text-emerald-450 mx-auto stroke-[3]" />
                <p>PostgreSQL user registered safely.</p>
                <p className="text-[10px] text-slate-400">Loading your vectors cluster workspaces...</p>
              </div>
            ) : (
              <form onSubmit={handleAuthSubmit} className="space-y-4 pt-1">
                {/* Email address */}
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. peer.reviewer@mit.edu"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-emerald-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Password selection */}
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Secret Password</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters user session validator"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-emerald-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {/* Additional registration inputs */}
                {authMode === "signup" && (
                  <div className="space-y-4 border-t border-slate-800/80 pt-3">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>Scholar Full Name</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Jordan Smith"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-emerald-500"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    {/* Background */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">
                        Primary Title / Affiliation
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Postdoc Scholar, bio-informatics lab"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-emerald-500"
                        value={background}
                        onChange={(e) => setBackground(e.target.value)}
                      />
                    </div>

                    {/* Search intent */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">
                        Co-Author Search Intent
                      </label>
                      <textarea
                        required
                        rows={2}
                        placeholder="e.g. Seeking expert machine learning validators for genome transcriptomics validation."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-emerald-500 resize-none leading-normal"
                        value={intent}
                        onChange={(e) => setIntent(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black rounded-xl duration-150 border-none flex items-center justify-center gap-1.5 cursor-pointer mt-2 shadow-lg"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-950" />
                  <span>{loading ? "Authorizing Supabase Account..." : authMode === "signup" ? "Confirm Registration" : "Enter Dashboard"}</span>
                </button>

                {/* Swap auth flow mode links */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(authMode === "signup" ? "login" : "signup");
                      setErrorMsg(null);
                    }}
                    className="text-[10px] text-slate-400 hover:text-emerald-400 underline font-semibold cursor-pointer bg-transparent border-none"
                  >
                    {authMode === "signup" ? "Already have an account? Sign In" : "Need to register? Sign Up"}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
