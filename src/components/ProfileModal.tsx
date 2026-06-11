import React, { useState, useEffect } from "react";
import { User, Award, FileText, Sparkles, X, Brain, BookOpen } from "lucide-react";

interface ProfileModalProps {
  profileId: string | null;
  onClose: () => void;
}

export function ProfileModal({ profileId, onClose }: ProfileModalProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profileId) {
      setProfile(null);
      return;
    }

    const fetchProfileData = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/profile?id=${profileId}`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data.profile);
        } else {
          setError("Failed to load researcher profile coordinates.");
        }
      } catch (err) {
        console.error("Error fetching researcher metadata:", err);
        setError("Network error fetching scholarly stats.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [profileId]);

  if (!profileId) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="h-full w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between animate-slide-over text-slate-900 overflow-hidden">
        
        {/* Profile Card Header banner */}
        <div>
          <div className="bg-slate-900 text-white p-6 relative bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-300 hover:text-white bg-white/10 p-1.5 rounded-full border-none cursor-pointer duration-150"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-4 mt-2">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-400 bg-slate-800 shadow">
                <img
                  src={profile?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop"}
                  alt={profile?.name || "Researcher"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest leading-none bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    {profile?.subscription_tier?.toUpperCase() || "SCHOLAR"}
                  </span>
                  {profile?.subscription_tier && profile?.subscription_tier !== "scholar" && (
                    <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                  )}
                </div>
                <h3 className="font-serif text-lg font-black tracking-tight leading-none text-white">
                  {profile?.name || "Loading Researcher..."}
                </h3>
                <p className="text-[10px] text-slate-300 font-semibold truncate max-w-[250px]">
                  {profile?.institution || "Autonomous University"}
                </p>
              </div>
            </div>
          </div>

          {/* Loader or Details */}
          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400 font-mono">Quering index nodes...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-rose-500 font-semibold text-xs leading-relaxed">
              {error}
            </div>
          ) : profile ? (
            <div className="p-6 space-y-5">
              
              {/* Core Analytics Blocks: H-Index, Citations, Commitment */}
              <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 border border-slate-200/80 rounded-2xl p-3">
                <div className="border-r border-slate-200/60">
                  <span className="block text-[9px] font-mono text-slate-400 uppercase font-black tracking-wider">H-Index</span>
                  <span className="block text-sm font-sans font-black text-slate-900 mt-0.5">
                    {profile.hIndex || profile.h_index || 12}
                  </span>
                </div>
                <div className="border-r border-slate-200/60">
                  <span className="block text-[9px] font-mono text-slate-400 uppercase font-black tracking-wider">Citations</span>
                  <span className="block text-sm font-sans font-black text-slate-900 mt-0.5">
                    {profile.citations || "450"}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] font-mono text-slate-400 uppercase font-black tracking-wider">Commitment</span>
                  <span className="block text-[9px] font-sans font-extrabold text-slate-800 mt-1 truncate">
                    {profile.commitment || "10h / week"}
                  </span>
                </div>
              </div>

              {/* Background block (Profile.role) */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-black flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Academic Background</span>
                </span>
                <p className="text-xs text-slate-700 font-bold leading-relaxed bg-slate-50 border border-slate-100 rounded-xl p-3">
                  {profile.role || "Graduate CS Scholar / Assistant Researcher"}
                </p>
              </div>

              {/* Skills checklist */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-black flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Verified Domain Expertise</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills && profile.skills.length > 0 ? (
                    profile.skills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="text-[9px] font-mono font-bold text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded"
                      >
                        ✓ {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-400 font-semibold italic">No direct skills annotated.</span>
                  )}
                </div>
              </div>

              {/* Research Intent explicit statement */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-black flex items-center gap-1">
                  <Brain className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Explicit Research Intent</span>
                </span>
                <div className="text-xs text-indigo-950 font-serif font-black bg-gradient-to-r from-indigo-55/40 to-slate-50 border border-indigo-150/70 rounded-2xl p-4 leading-relaxed italic relative">
                  &ldquo;{profile.intent || "Collaborating on next-generation scaling models and theoretical validation."}&rdquo;
                </div>
              </div>

              {/* Representative Publications */}
              {profile.publications && profile.publications.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-black flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    <span>Representative Publications</span>
                  </span>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {profile.publications.map((pub: any, index: number) => (
                      <div key={index} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-[11px] leading-normal font-semibold">
                        <p className="font-extrabold text-slate-850">“{pub.title}”</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{pub.journal} • {pub.year}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* About summary */}
              {profile.about && (
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-black flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Lab coordinates & bio</span>
                  </span>
                  <p className="text-xs font-semibold text-slate-500 leading-relaxed pl-1">
                    {profile.about}
                  </p>
                </div>
              )}

            </div>
          ) : null}
        </div>

        {/* Action footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex gap-2 w-full">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 text-slate-700 rounded-xl font-sans text-xs font-black transition cursor-pointer"
          >
            Collapse Drawer
          </button>
        </div>

      </div>
    </div>
  );
}
