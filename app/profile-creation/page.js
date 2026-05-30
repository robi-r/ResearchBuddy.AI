'use client';

import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  Sparkles, 
  Terminal, 
  Tag, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Cpu, 
  Check 
} from 'lucide-react';

export default function ProfileCreationPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Onboarding form states
  const [fullName, setFullName] = useState('');
  const [background, setBackground] = useState('');
  const [skillsRaw, setSkillsRaw] = useState('');
  const [intentText, setIntentText] = useState('');

  // Status and Flow states
  const [submitting, setSubmitting] = useState(false);
  const [stepMessage, setStepMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  // Live Skill Pills preview generator
  const getSkillsArray = () => {
    if (!skillsRaw.trim()) return [];
    return skillsRaw
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    const skills = getSkillsArray();
    if (!fullName || !background || !intentText || skills.length === 0) {
      setErrorMsg('Please complete all fields, and input at least one technical skill tag.');
      return;
    }

    setSubmitting(true);
    
    try {
      // Step 1: Request 1536-dimensional vector embedding from secure server proxy endpoint
      setStepMessage('Contacting Gemini API: Synthesizing intent portfolio and generating 1536-dimensional vector coordinate matrix...');
      
      const embeddingRes = await fetch('/api/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `${fullName} | ${background} | Skills: ${skills.join(', ')} | Intent: ${intentText}`
        })
      });

      if (!embeddingRes.ok) {
        throw new Error('Could not obtain vector embedding payload. Check if your backend embedding endpoint is configured.');
      }

      const { embedding } = await embeddingRes.json();
      
      // Step 2: Establish connection and insert profile with embedding string into Supabase
      setStepMessage('Connecting to Supabase: Inserting authorship record columns and binding Postgres vector models...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Authenticated user session not detected. Please log in first.');
      }

      const { error: insertError } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            name: fullName,
            role: background,
            field: skills[0] || 'AI Research',
            skills: skills,
            interests: skills.slice(0, 3), // seed interests using first technical skills
            intent: intentText,
            about: `Onboarding preset completed for ${fullName}. Ready for co-author handshakes.`,
            avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop`,
            embedding: embedding // Postgres vector array formatted as '[0.111, -0.222, 0.333, ...]'
          }
        ]);

      if (insertError) throw insertError;

      // Step 3: Reroute to peer Discovery catalog view
      setStepMessage('Handshake system initialized. Directing to peer discovery feed...');
      router.push('/discovery');

    } catch (err) {
      setErrorMsg(err.message || 'Onboarding submission transaction failed.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative font-sans">
      {/* Background canvas styling */}
      <div className="absolute top-0 left-0 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-indigo-505/10 bg-indigo-500/10 rounded-full blur-[90px] -z-10" />

      <div className="max-w-2xl w-full bg-white border border-slate-200 rounded-[28px] shadow-xl p-8 md:p-10 space-y-8 relative overflow-hidden">
        
        {/* Visual loader overlay block */}
        {submitting && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center shadow-inner relative animate-pulse">
              <Cpu className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
            <div className="space-y-2 max-w-sm">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Syncing Author Metrics</h3>
              <p className="text-xs text-slate-500 leading-normal font-semibold font-mono animate-fade-in">
                {stepMessage}
              </p>
            </div>
          </div>
        )}

        <header className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center shadow shadow-emerald-400">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="text-[10px] font-mono text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">Author Onboarding Program</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-910 text-slate-900 tracking-tight leading-none">Create Your Academic Intent Profile</h1>
            <p className="text-xs font-medium text-slate-500 leading-normal">
              Provide information so that our Cosine Similarity Matching index can rank you correctly against incoming peer collab intents.
            </p>
          </div>
        </header>

        {errorMsg && (
          <div className="border border-rose-200 bg-rose-50 text-rose-800 p-4 rounded-xl flex items-start gap-2.5 animate-slide-in">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-semibold leading-normal">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Item 1: Name */}
          <div className="space-y-1.5 hover:border-slate-300 transition-colors">
            <label className="text-[10px] font-mono text-slate-400 font-extrabold uppercase tracking-wide flex items-center gap-1.5 pl-0.5">
              <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
              <span>Full Name (with honorifics if applicable)</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Dr. Eleanor Vance, PhD"
              className="w-full h-12 px-4 rounded-xl border border-slate-250 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-slate-50"
              required
            />
          </div>

          {/* Item 2: Background */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-slate-400 font-extrabold uppercase tracking-wide flex items-center gap-1.5 pl-0.5">
              <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
              <span>Academic / Professional Background</span>
            </label>
            <input
              type="text"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              placeholder="Fellow Researcher at MIT Bio-Genetics Lab"
              className="w-full h-12 px-4 rounded-xl border border-slate-250 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-slate-50"
              required
            />
          </div>

          {/* Item 3: Technical Skills tags */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-slate-400 font-extrabold uppercase tracking-wide flex items-center gap-1.5 pl-0.5">
              <Tag className="w-3.5 h-3.5 text-emerald-500" />
              <span>Technical Skills (comma-separated list)</span>
            </label>
            <input
              type="text"
              value={skillsRaw}
              onChange={(e) => setSkillsRaw(e.target.value)}
              placeholder="PyTorch, Bioinformatics, Sequence Mapping, R Stats, NumPy"
              className="w-full h-12 px-4 rounded-xl border border-slate-250 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-slate-50"
              required
            />
            {/* Live pills display preview */}
            {getSkillsArray().length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1.5 pl-1.5">
                {getSkillsArray().map((skill, index) => (
                  <span 
                    key={`${index}-${skill}`} 
                    className="inline-flex items-center text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-2 py-0.5 font-mono"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Item 4: Research Intent rich textarea */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-slate-400 font-extrabold uppercase tracking-wide flex items-center gap-1.5 pl-0.5">
              <FileText className="w-3.5 h-3.5 text-emerald-500" />
              <span>Co-Authorship Research Intent Statement</span>
            </label>
            <textarea
              value={intentText}
              onChange={(e) => setIntentText(e.target.value)}
              rows={4}
              placeholder="We are developing high-precision CRISPR modeling models requiring Python pipeline scaling assistance and mathematical verification from bio-informatics co-signers."
              className="w-full p-4 rounded-xl border border-slate-250 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-slate-50 leading-relaxed resize-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full h-12 bg-[#0f172a] hover:bg-[#1e293b] text-white font-sans font-black text-xs rounded-xl shadow-lg hover:shadow-xl duration-150 border-none cursor-pointer flex items-center justify-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4 text-emerald-450" />
            <span>Verify & Compile Vector Matching Index</span>
          </button>
        </form>

        {/* Footer info showing complete API code design */}
        <section className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-slate-504 text-slate-500" />
            <span className="text-[10px] font-mono font-black text-slate-600 uppercase">Production Hint: /api/embeddings/route.js</span>
          </div>
          <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">
            In Next.js, create the endpoint to safely query Gemini for embeddings without exposing API keys:
          </p>
          <pre className="text-[9px] font-mono text-slate-600 leading-normal p-2.5 bg-slate-100 rounded-lg overflow-x-auto border border-slate-200 select-all">
{`import { GoogleGenAI } from '@google/genai';

export async function POST(req) {
  const { text } = await req.json();
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.embedContent({
    model: 'text-embedding-004',
    contents: text
  });
  return Response.json({ embedding: response.embedding.values });
}`}
          </pre>
        </section>

      </div>
    </div>
  );
}
