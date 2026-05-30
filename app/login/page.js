'use client';

import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  Sparkles, 
  Github, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Standard login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  
  // Interaction and Feedback states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Pre-seeded hackathon judge persona presets
  const presetJudges = [
    {
      name: 'Dr. Sarah Chen',
      email: 'sarah@test.com',
      password: 'password123',
      role: 'Lead ML Scientist',
      inst: 'Cambridge',
      energy: 'Climate Research Preset'
    },
    {
      name: 'Rahman Al-Haddad',
      email: 'rahman@test.com',
      password: 'password123',
      role: 'CS Master’s Candidate',
      inst: 'MIT Lab',
      energy: 'Medical NLP Preset'
    },
    {
      name: 'Alex Mercer',
      email: 'alex@test.com',
      password: 'password123',
      role: 'Consulting Architect',
      inst: 'Stanford AI',
      energy: 'Scholarly Graph Preset'
    }
  ];

  // 1. Interactive Judge Access Handler
  const handlePresetLogin = async (preset) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: preset.email,
        password: preset.password,
      });

      if (error) throw error;

      // Force instant routing straight to discovery, bypassing onboarding
      router.push('/discovery');
    } catch (err) {
      setErrorMsg(`Pre-seeded login failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 2. Standard Email/Password Login & Signup Form Handler
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please input valid email and password credentials.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;

        // Standard clean state response on successful sign up
        setSuccessMsg('Please check your email to verify your account before logging in.');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Return path redirects appropriately
        router.push('/discovery');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication operation failed.');
    } finally {
      setLoading(false);
    }
  };

  // 3. OAuth Providers integration Handler
  const handleOAuthLogin = async (providerName) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: providerName,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      setErrorMsg(`OAuth failure with ${providerName}: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative font-sans">
      {/* Background vector accents */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px] -z-10" />

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-6 pb-12">
        {/* Left Hand: Title and Judge Persona preset selection */}
        <div className="flex flex-col justify-between space-y-6 bg-[#0f172a] text-white p-8 rounded-[28px] shadow-2xl relative overflow-hidden">
          {/* Subtle grid pattern inside dark dashboard */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 -z-10" />

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider">
              <GraduationCap className="w-4 h-4" />
              <span>ResearchBuddy Auth Portal</span>
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tight text-white leading-none">ResearchBuddy</h1>
              <p className="text-slate-400 text-xs font-semibold">Accelerating breakthroughs through high-commitment peer handshakes.</p>
            </div>
          </div>

          {/* Preset Judge Cards */}
          <div className="py-2 space-y-3">
            <div className="space-y-1">
              <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Instant Hackathon Access</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Click a judge persona below to log in immediately with pre-configured accounts, completely bypassing onboarding.</p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {presetJudges.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetLogin(preset)}
                  disabled={loading}
                  className="w-full text-left p-4 rounded-xl border border-slate-800/80 bg-slate-900 hover:bg-slate-850 hover:border-emerald-500/50 hover:shadow-lg transition-all cursor-pointer group flex justify-between items-center"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-slate-100 group-hover:text-emerald-400 transition-colors">{preset.name}</p>
                    <p className="text-[10px] text-slate-450 font-semibold">{preset.role} • {preset.inst}</p>
                    <span className="inline-block text-[8px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-900 px-1.5 py-0.5 rounded scale-95 origin-left">
                      {preset.energy}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 duration-150" />
                </button>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-mono">
            Suppressed credentials protocol. Bypasses standard verification triggers.
          </div>
        </div>

        {/* Right Hand: OAuth Providers & Standard Email Flow */}
        <div className="bg-white border border-slate-200 p-8 rounded-[28px] shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Access Account Credentials</h2>
            <p className="text-xs font-medium text-slate-500 leading-normal">
              Establish validation links to co-author matching vectors using secure password encryption or federated identity.
            </p>
          </div>

          {/* Feedback states */}
          {errorMsg && (
            <div className="border border-rose-200 bg-rose-50 text-rose-800 p-4 rounded-xl flex items-start gap-2.5 animate-slide-in">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold leading-normal">{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="border border-emerald-250 bg-emerald-50 text-emerald-800 p-4 rounded-xl flex items-start gap-2.5 animate-slide-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold leading-normal">{successMsg}</p>
            </div>
          )}

          {/* Block A: OAuth buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleOAuthLogin('google')}
              disabled={loading}
              className="flex items-center justify-center gap-2 h-11 border border-slate-200 hover:bg-slate-50 text-slate-700 font-sans text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm bg-transparent"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" width="24" height="24">
                <g transform="matrix(1, 0, 0, 1, 0, 0)">
                  <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.05,3.1l3.2,2.48c1.87,-1.72 2.95,-4.26 2.95,-7.22c0,-0.6 -0.05,-1.17 -0.13,-1.7 -0.01,0.64 -0.01,-0.64 0,0Z" fill="#4285F4" />
                  <path d="M12,20.62c2.53,0 4.65,-0.84 6.2,-2.28L14.8,15.86c-0.86,0.58 -1.97,0.92 -3.17,0.92c-2.44,0 -4.51,-1.65 -5.25,-3.87l-3.3,2.56c1.62,3.22 4.96,5.15 8.92,5.15Z" fill="#34A853" />
                  <path d="M6.75,12.91c-0.19,-0.57 -0.3,-1.18 -0.3,-1.81s0.11,-1.24 0.3,-1.81L3.45,6.73c-0.65,1.29 -1.02,2.75 -1.02,4.3c0,1.55 0.37,3.01 1.02,4.3l3.3,-2.56Z" fill="#FBBC05" />
                  <path d="M12,6.95c1.38,0 2.61,0.47 3.59,1.41l2.7,-2.7C16.65,4.24 14.53,3.38 12,3.38c-3.96,0 -7.3,1.93 -8.92,5.15l3.3,2.56c0.74,-2.22 2.81,-3.87 5.25,-3.87Z" fill="#EA4335" />
                </g>
              </svg>
              <span>Google</span>
            </button>
            <button
              onClick={() => handleOAuthLogin('github')}
              disabled={loading}
              className="flex items-center justify-center gap-2 h-11 border border-slate-200 hover:bg-slate-50 text-slate-700 font-sans text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm bg-transparent"
            >
              <Github className="w-4 h-4 flex-shrink-0" />
              <span>GitHub</span>
            </button>
          </div>

          {/* Divider lines */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">Or combine with email</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Block B: Form actions */}
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 font-extrabold uppercase pl-1">Educational Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  disabled={loading}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-250 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-slate-50"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 font-extrabold uppercase pl-1">Security Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-250 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-slate-50"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-sans font-black text-xs rounded-xl shadow-md duration-150 cursor-pointer border-none flex items-center justify-center gap-1.5"
            >
              <span>{loading ? 'Authenticating Transactions...' : mode === 'login' ? 'Secure Log In' : 'Sign Up Academic Account'}</span>
              {!loading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </form>

          {/* Toggle between login or signup modes */}
          <div className="text-center">
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setErrorMsg(null);
                setSuccessMsg(null);
                setMode(mode === 'login' ? 'signup' : 'login');
              }}
              className="text-xs text-slate-500 hover:text-emerald-600 font-semibold border-none bg-transparent cursor-pointer"
            >
              {mode === 'login' 
                ? "Don't have an authentication record? Sign Up here &rarr;" 
                : "Already established peer identity? Standard Log In &rarr;"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
