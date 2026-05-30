import React, { useState } from "react";
import { Check, User, Save, Building, Award, Heart, HelpCircle, Briefcase, Sparkles, Camera, Upload, Plus, Trash, BookOpen } from "lucide-react";

interface ProfileViewProps {
  currentUser: any;
  onUpdateUser: (newUser: any) => void;
}

const AVATAR_PRESETS = [
  { url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop", name: "Dr. Sarah" },
  { url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop", name: "PhD Scholar" },
  { url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop", name: "Dr. Elena" },
  { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop", name: "Dr. Julian" },
  { url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop", name: "CS Fellow" },
  { url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=150&auto=format&fit=crop", name: "Lead NLP Research" }
];

export function ProfileView({ currentUser, onUpdateUser }: ProfileViewProps) {
  const [name, setName] = useState(currentUser?.name || "Dr. Alex");
  const [role, setRole] = useState(currentUser?.role || "Associate Fellow");
  const [institution, setInstitution] = useState(currentUser?.institution || "Autonomous University");
  const [field, setField] = useState(currentUser?.field || "Computer Science");
  const [commitment, setCommitment] = useState(currentUser?.commitment || "10-20 hours/week");
  const [intent, setIntent] = useState(currentUser?.intent || "");
  const [about, setAbout] = useState(currentUser?.about || "");
  const [skillsText, setSkillsText] = useState(currentUser?.skills?.join(", ") || "Python, PyTorch, SQL");
  const [interestsText, setInterestsText] = useState(currentUser?.interests?.join(", ") || "Neural Networks, Bioinformatics");

  const [avatar, setAvatar] = useState(currentUser?.avatar || AVATAR_PRESETS[1].url);
  const [customAvatarUrl, setCustomAvatarUrl] = useState(currentUser?.avatar?.startsWith("data:") ? currentUser.avatar : "");
  const [hIndex, setHIndex] = useState(currentUser?.hIndex || 0);
  const [citations, setCitations] = useState(currentUser?.citations || "0");
  const [publications, setPublications] = useState<Array<{ title: string; journal: string; year: string }>>(currentUser?.publications || []);

  const [newPubTitle, setNewPubTitle] = useState("");
  const [newPubJournal, setNewPubJournal] = useState("");
  const [newPubYear, setNewPubYear] = useState("");

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDeviceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Selected image is too large. Please select an image under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setCustomAvatarUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPublication = () => {
    if (!newPubTitle.trim()) return;
    setPublications([
      ...publications,
      {
        title: newPubTitle.trim(),
        journal: newPubJournal.trim() || "arXiv Preprints",
        year: newPubYear.trim() || new Date().getFullYear().toString()
      }
    ]);
    setNewPubTitle("");
    setNewPubJournal("");
    setNewPubYear("");
  };

  const handleRemovePublication = (index: number) => {
    setPublications(publications.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    const skills = skillsText.split(",").map(s => s.trim()).filter(Boolean);
    const interests = interestsText.split(",").map(i => i.trim()).filter(Boolean);

    try {
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          role,
          institution,
          field,
          commitment,
          intent,
          about,
          skills,
          interests,
          avatar: customAvatarUrl || avatar,
          hIndex: Number(hIndex),
          citations,
          publications
        }),
      });

      if (response.ok) {
        const result = await response.json();
        onUpdateUser(result.user);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-4 px-4 space-y-6 animate-fade-in pb-16">
      <header className="space-y-1">
        <h2 className="font-sans font-black text-xl text-slate-900">Research Portfolio Intent</h2>
        <p className="text-xs font-semibold text-slate-500 leading-normal">
          Refine your co-author matching vectors. Adjusting your skills or research need triggers real-time cosine similarity re-indexing on our Express database.
        </p>
      </header>

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm space-y-5">
        {/* Profile Picture Card Selector Block */}
        <div className="bg-slate-50 border border-slate-200 rounded-[20px] p-4 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-emerald-50 rounded-lg">
              <Camera className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">Customize Profile Picture</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Upload from device or select an academic preset</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
            {/* Active Display Avatar with glow */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500 shadow-sm bg-slate-100 flex items-center justify-center">
                <img
                  src={customAvatarUrl || avatar}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop";
                  }}
                />
              </div>
              <span className="text-[8px] font-mono text-slate-400 font-bold">Preview</span>
            </div>

            {/* Presets Grid */}
            <div className="flex-1 space-y-3 w-full">
              <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                {AVATAR_PRESETS.map((preset, idx) => {
                  const isSelected = !customAvatarUrl && avatar === preset.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAvatar(preset.url);
                        setCustomAvatarUrl("");
                      }}
                      className={`relative w-8 h-8 rounded-full overflow-hidden border transition-all cursor-pointer ${
                        isSelected 
                          ? "border-emerald-500 ring-2 ring-emerald-500/20 scale-105" 
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                      title={preset.name}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>

              {/* Upload or paste */}
              <div className="grid grid-cols-1 gap-2 pt-1">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Add Photo From Device
                  </span>
                  <div className="flex gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200 cursor-pointer rounded-xl text-[11px] font-bold transition-all duration-150 flex-1 justify-center">
                      <Upload className="w-3 h-3 text-emerald-600" />
                      <span>Upload local image...</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleDeviceUpload}
                      />
                    </label>
                    {(customAvatarUrl || avatar) && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomAvatarUrl("");
                          setAvatar(AVATAR_PRESETS[0].url);
                        }}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg text-[10px] font-bold text-rose-600 transition border-none cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Name section */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Full Name</span>
          </label>
          <input
            type="text"
            required
            className="w-full bg-slate-50 border border-slate-250 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-800"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Academic Role */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span>Academic Title / Role</span>
          </label>
          <input
            type="text"
            required
            className="w-full bg-slate-50 border border-slate-250 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-800"
            placeholder="e.g. Senior Postdoc, Lead AI Engineer"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </div>

        {/* University institution */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <span>Affiliation / Institution</span>
          </label>
          <input
            type="text"
            required
            className="w-full bg-slate-50 border border-slate-250 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-800"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
          />
        </div>

        {/* Primary Field */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-slate-400" />
            <span>Primary Research Field</span>
          </label>
          <select
            className="w-full h-11 bg-slate-50 border border-slate-250 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-800 cursor-pointer"
            value={field}
            onChange={(e) => setField(e.target.value)}
          >
            <option value="Computer Science">Computer Science & Deep Learning</option>
            <option value="Quantum Physics">Quantum Computing & Gating</option>
            <option value="Bio-Informatics">Bio-Informatics & Genomics</option>
            <option value="Climate Tech">Climate Earth Systems</option>
          </select>
        </div>

        {/* Academic Metrics Row */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-[20px] p-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-slate-400" />
              <span>H-Index</span>
            </label>
            <input
              type="number"
              min="0"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-800"
              value={hIndex}
              onChange={(e) => setHIndex(Number(e.target.value))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-slate-400" />
              <span>Citations</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 1.5k"
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-800"
              value={citations}
              onChange={(e) => setCitations(e.target.value)}
            />
          </div>
        </div>

        {/* Weekly commitment */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-slate-400" />
            <span>Weekly Commitment Quota</span>
          </label>
          <select
            className="w-full h-11 bg-slate-50 border border-slate-250 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-800 cursor-pointer"
            value={commitment}
            onChange={(e) => setCommitment(e.target.value)}
          >
            <option value="5-10 hours/week">5-10 hours/week (Low intensity)</option>
            <option value="10-20 hours/week">10-20 hours/week (High commitment)</option>
            <option value="20+ hours/week">20+ hours/week (Partner/Co-author finalization)</option>
          </select>
        </div>

        {/* Search Intent */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">
            Co-author Match Search Intent criteria
          </label>
          <textarea
            required
            rows={3}
            placeholder="Describe exactly what technical/academic contributions your optimal teammate must bring to the table."
            className="w-full bg-slate-50 border border-slate-250 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-800 leading-normal"
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
          />
        </div>

        {/* About Me / Bio section */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">
            About Me / Short Bio
          </label>
          <textarea
            rows={3}
            placeholder="Type your background, history, or academic achievements here..."
            className="w-full bg-slate-50 border border-slate-250 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-800 leading-normal"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
          />
        </div>

        {/* Skill Keywords */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">
            My Skill Keywords (comma separated)
          </label>
          <input
            type="text"
            className="w-full bg-slate-50 border border-slate-250 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-800 font-mono"
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
          />
        </div>

        {/* Interests Keywords */}
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">
            My Research Interests (comma separated)
          </label>
          <input
            type="text"
            className="w-full bg-slate-50 border border-slate-250 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-800 font-mono"
            value={interestsText}
            onChange={(e) => setInterestsText(e.target.value)}
          />
        </div>

        {/* Publications List Manager */}
        <div className="space-y-3 bg-slate-50 border border-slate-250/80 rounded-[20px] p-4">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">Publications Portfolio</h3>
          </div>

          {/* Current list */}
          {publications.length === 0 ? (
            <p className="text-[10.5px] italic text-slate-400 text-center py-2">No key publications added yet.</p>
          ) : (
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {publications.map((pub, index) => (
                <div key={index} className="bg-white border border-slate-200 p-2.5 rounded-xl flex items-start justify-between gap-3 text-[11px]">
                  <div className="flex-1 space-y-0.5">
                    <p className="font-bold text-slate-800 leading-tight">{pub.title}</p>
                    <p className="text-[10px] text-slate-500 font-mono italic">
                      {pub.journal} • {pub.year}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePublication(index)}
                    className="p-1 hover:bg-rose-50 text-rose-500 hover:text-rose-600 rounded transition duration-150 border-none cursor-pointer"
                    title="Delete publication entry"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add a Publication Form */}
          <div className="bg-white border border-slate-200 p-3 rounded-xl space-y-2">
            <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Add Publication</p>
            <input
              type="text"
              placeholder="Paper Title (e.g., Attention Is All You Need)"
              className="w-full bg-slate-50 border border-slate-205 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-800 focus:outline-none focus:border-slate-800"
              value={newPubTitle}
              onChange={(e) => setNewPubTitle(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Journal / Venue (e.g., NeurIPS)"
                className="w-full bg-slate-50 border border-slate-205 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-800 focus:outline-none focus:border-slate-800"
                value={newPubJournal}
                onChange={(e) => setNewPubJournal(e.target.value)}
              />
              <input
                type="text"
                placeholder="Year (e.g., 2024)"
                className="w-full bg-slate-50 border border-slate-205 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-800 focus:outline-none focus:border-slate-800"
                value={newPubYear}
                onChange={(e) => setNewPubYear(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={handleAddPublication}
              className="w-full h-8 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase tracking-wider rounded-lg flex items-center justify-center gap-1 transition-colors border-none cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Append Publication</span>
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full h-12 bg-[#0f172a] hover:bg-slate-800 text-white font-sans font-bold text-xs rounded-xl shadow hover:shadow-md duration-155 flex items-center justify-center gap-2 border-none cursor-pointer animate-pulse-slow"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span>{saving ? "Updating match coordinates..." : "Save Match Settings"}</span>
          </button>
        </div>

        {success && (
          <div className="flex items-center gap-2 justify-center text-xs text-emerald-600 font-extrabold animate-fade-in bg-emerald-50 py-2 rounded-xl border border-emerald-100">
            <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
            <span>Vector Match Profile Saved Successfully!</span>
          </div>
        )}
      </form>
    </div>
  );
}
