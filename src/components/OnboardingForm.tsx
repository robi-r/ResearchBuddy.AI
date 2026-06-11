import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Beaker, Terminal, BookOpen, Clock, Users, Camera, Upload } from "lucide-react";
import { MatchRequest } from "../types";

interface OnboardingFormProps {
  onSubmit: (data: MatchRequest) => void;
  onBack: () => void;
  loading: boolean;
  initialData?: Partial<MatchRequest>;
}

const AVATAR_PRESETS = [
  { url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop", name: "Dr. Sarah" },
  { url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop", name: "PhD Scholar" },
  { url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop", name: "Dr. Elena" },
  { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop", name: "Dr. Julian" },
  { url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=150&auto=format&fit=crop", name: "CS Fellow" },
  { url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=150&auto=format&fit=crop", name: "Lead NLP Research" }
];

const INTERESTS_PRESETS = [
  "Quantum Computing",
  "Neural Networks",
  "Bio-Genetics",
  "Climate Tech",
  "Applied Robotics",
  "Stochastic Modeling"
];

const SKILLS_PRESETS = [
  "Python",
  "Data Visualization",
  "Peer Review",
  "LaTeX",
  "R Stats",
  "PyTorch",
  "Math Modeling"
];

export function OnboardingForm({ onSubmit, onBack, loading, initialData }: OnboardingFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [background, setBackground] = useState(initialData?.background || "");
  const [intent, setIntent] = useState(initialData?.intent || "");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(initialData?.interests || []);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialData?.skills || []);
  const [commitment, setCommitment] = useState("");
  const [collabGoal, setCollabGoal] = useState("Join a Team");
  const [avatar, setAvatar] = useState(initialData?.avatar || AVATAR_PRESETS[1].url);
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");

  // Pro customization fields
  const [institution, setInstitution] = useState(initialData?.institution || "Stanford University");
  const [field, setField] = useState(initialData?.field || "Computer Science");
  const [hIndex, setHIndex] = useState(initialData?.hIndex !== undefined ? String(initialData.hIndex) : "15");
  const [citations, setCitations] = useState(initialData?.citations || "2.1k");
  const [publications, setPublications] = useState<Array<{ title: string; journal: string; year: string }>>(
    initialData?.publications || [
      { title: "High-Dimensional Spatial Learning Networks", journal: "Journal of Computer Science", year: "2024" }
    ]
  );
  const [newPubTitle, setNewPubTitle] = useState("");
  const [newPubJournal, setNewPubJournal] = useState("");
  const [newPubYear, setNewPubYear] = useState("");

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

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddPublication = () => {
    if (!newPubTitle || !newPubJournal || !newPubYear) {
      alert("Please enter a Title, Journal/Conference name, and Publication Year.");
      return;
    }
    setPublications([...publications, { title: newPubTitle, journal: newPubJournal, year: newPubYear }]);
    setNewPubTitle("");
    setNewPubJournal("");
    setNewPubYear("");
  };

  const handleRemovePublication = (index: number) => {
    setPublications(publications.filter((_, idx) => idx !== index));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !background || !intent) {
      alert("Please fill in Name, Background, and Research Intent.");
      return;
    }
    onSubmit({
      name,
      background,
      skills: selectedSkills,
      interests: selectedInterests,
      intent,
      commitment: commitment ? `${commitment} hours/week` : undefined,
      avatar: customAvatarUrl || avatar,
      institution,
      field,
      hIndex: Number(hIndex) || 0,
      citations,
      publications
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 space-y-8 animate-fade-in py-6">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-bold uppercase tracking-wider transition-colors duration-150 cursor-pointer"
          id="onboarding-back-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing</span>
        </button>
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
          Onboarding Session
        </span>
      </div>

      {/* Intro Context */}
      <div className="space-y-2">
        <h2 className="font-sans text-3xl font-extrabold text-slate-900 tracking-tight">Personalize your journey</h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          Tell our semantic matcher about your skills, interests, and what kind of collaborator you are searching for.
        </p>
      </div>

      {/* Form Area */}
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Profile Picture Card Selector Block */}
        <div className="bg-white border border-slate-200/90 rounded-[22px] p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 rounded-lg">
              <Camera className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">Select Academic Profile Picture</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Choose from professional scholar presets or provide your own URL</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 pt-1">
            {/* Active Display Avatar with glow */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-emerald-500 shadow-md relative group bg-slate-50 flex items-center justify-center">
                <img
                  src={customAvatarUrl || avatar}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop";
                  }}
                />
              </div>
              <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded uppercase">Active Preview</span>
            </div>

            {/* Presets List and Custom Input */}
            <div className="flex-1 space-y-3.5 w-full">
              <div className="grid grid-cols-6 gap-2">
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
                      className={`relative aspect-square rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                        isSelected 
                          ? "border-emerald-500 ring-2 ring-emerald-500/20 scale-105" 
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                      title={preset.name}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* URL Overrider or Device Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider" htmlFor="custom-avatar-input">
                    Paste Custom Image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      id="custom-avatar-input"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={customAvatarUrl.startsWith("data:") ? "" : customAvatarUrl}
                      onChange={(e) => setCustomAvatarUrl(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:border-slate-900 focus:bg-white transition-all text-xs text-slate-800 font-mono"
                    />
                    {customAvatarUrl && !customAvatarUrl.startsWith("data:") && (
                      <button
                        type="button"
                        onClick={() => setCustomAvatarUrl("")}
                        className="px-2.5 py-1.5 bg-slate-150 hover:bg-slate-200 rounded-lg text-[10px] font-bold text-slate-600 transition border-none cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Or Add Photo From Device
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200/85 cursor-pointer rounded-xl text-xs font-bold transition-all duration-150 w-full justify-center">
                      <Upload className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Upload local image...</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleDeviceUpload}
                      />
                    </label>
                    {customAvatarUrl.startsWith("data:") && (
                      <button
                        type="button"
                        onClick={() => setCustomAvatarUrl("")}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg text-[10px] font-bold text-rose-600 transition border-none cursor-pointer"
                        title="Remove uploaded image"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Profile */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider" htmlFor="user-name">
              Full Name
            </label>
            <input
              type="text"
              id="user-name"
              placeholder="e.g. Dr. Julian Thorne"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-slate-900 focus:bg-white transition-all text-sm font-sans text-slate-900"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider" htmlFor="user-bg">
              Academic Background
            </label>
            <input
              type="text"
              id="user-bg"
              placeholder="e.g. Postdoc in Computational Biology"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-slate-900 focus:bg-white transition-all text-sm font-sans text-slate-900"
              required
            />
          </div>
        </div>

        {/* Academic Affiliations & Metrics */}
        <div className="bg-slate-50 border border-slate-200 rounded-[22px] p-5 space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-950 tracking-wider flex items-center gap-1.5">
            <span className="text-indigo-600 font-extrabold text-sm font-mono">🏆</span>
            <span>Scholarly Metrics & Affiliations</span>
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-505 uppercase tracking-wider" htmlFor="user-institution">
                Affiliated Institution / Lab
              </label>
              <input
                type="text"
                id="user-institution"
                placeholder="e.g. Stanford University or GreenEarth Lab"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-slate-900 focus:bg-white transition-all text-sm font-sans text-slate-900"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-505 uppercase tracking-wider" htmlFor="user-field">
                Core Research Field
              </label>
              <input
                type="text"
                id="user-field"
                placeholder="e.g. Computer Science, Climate Tech, Neural Networks"
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-slate-900 focus:bg-white transition-all text-sm font-sans text-slate-900"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-505 uppercase tracking-wider" htmlFor="user-hindex">
                h-Index
              </label>
              <input
                type="number"
                id="user-hindex"
                placeholder="e.g. 15"
                value={hIndex}
                onChange={(e) => setHIndex(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-slate-900 focus:bg-white transition-all text-sm font-sans text-slate-900"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-505 uppercase tracking-wider" htmlFor="user-citations">
                Google Scholar Citations
              </label>
              <input
                type="text"
                id="user-citations"
                placeholder="e.g. 2.5k"
                value={citations}
                onChange={(e) => setCitations(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-slate-900 focus:bg-white transition-all text-sm font-sans text-slate-900"
              />
            </div>
          </div>

          {/* Dynamic Publications List */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="text-[10px] font-black uppercase text-slate-505 tracking-wider">Top Representative Publications</h4>
            
            {publications.length > 0 && (
              <div className="space-y-2">
                {publications.map((pub, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-start gap-4 text-xs font-semibold">
                    <div className="space-y-0.5">
                      <p className="font-extrabold text-slate-800">“{pub.title}”</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">{pub.journal} • {pub.year}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePublication(idx)}
                      className="text-[10px] text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2 py-1 rounded-lg border-none bg-transparent cursor-pointer font-bold uppercase transition"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Quick add publication fields */}
            <div className="bg-white/80 p-3 rounded-xl border border-dashed border-slate-250 min-w-0 space-y-3">
              <p className="text-[9px] font-bold text-indigo-500 uppercase">Add New Publication Record</p>
              <div className="grid gap-2.5">
                <input
                  type="text"
                  placeholder="Paper Title (e.g. Robust Real-time BCI Neurocontrollers)"
                  value={newPubTitle}
                  onChange={(e) => setNewPubTitle(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-905 outline-none focus:border-indigo-500 font-medium"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Journal / Conference Name"
                    value={newPubJournal}
                    onChange={(e) => setNewPubJournal(e.target.value)}
                    className="col-span-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-905 outline-none focus:border-indigo-500 font-medium"
                  />
                  <input
                    type="text"
                    placeholder="Year"
                    value={newPubYear}
                    onChange={(e) => setNewPubYear(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-905 outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddPublication}
                  className="py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-black uppercase tracking-wider transition border-none cursor-pointer self-end w-full"
                >
                  + Append Scientific Publication
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Skills Grid */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-emerald-500">science</span>
            <span>Research Interests</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS_PRESETS.map((interest) => {
              const selected = selectedInterests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-full border text-xs font-sans font-semibold transition-all cursor-pointer ${
                    selected
                      ? "bg-[#0f172a] text-white border-slate-950 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        {/* Skills preset selection */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-emerald-500">terminal</span>
            <span>Technical Skills</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {SKILLS_PRESETS.map((skill) => {
              const selected = selectedSkills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-4 py-2 rounded-full border text-xs font-sans font-semibold transition-all cursor-pointer ${
                    selected
                      ? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </div>

        {/* TEXTAREA: Research Intent */}
        <div className="flex flex-col gap-1.5 pt-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider" htmlFor="user-intent">
            Detailed Collaboration Intent (Teammate Search Parameters)
          </label>
          <textarea
            id="user-intent"
            rows={4}
            placeholder="Type who you want to find. e.g.: &quot;Looking for a Machine learning researcher with strong NLP experience to co-write our climate paper and advise on model scale-up.&quot;"
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-slate-900 focus:bg-white transition-all text-sm font-sans resize-none leading-relaxed text-slate-900"
            required
          />
          <span className="text-[11px] text-slate-400 italic font-medium mt-0.5">
            This paragraph will be analyzed by real Gemini Semantic Embeddings to match physical profile vectors in database!
          </span>
        </div>

        {/* Extra Goals Options */}
        <div className="grid md:grid-cols-2 gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Collaboration Goal
            </label>
            <div className="flex flex-col gap-2">
              {["Join a Team", "Independent Research", "Peer Reviewing"].map((goal) => {
                const active = collabGoal === goal;
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setCollabGoal(goal)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border text-left transition-all cursor-pointer ${
                      active
                        ? "bg-emerald-50/50 border-emerald-500 text-emerald-800 shadow-sm font-bold"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${active ? 'border-emerald-500' : 'border-slate-300'}`}>
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    </span>
                    <span>{goal}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider" htmlFor="user-hours">
              Commitment Availability
            </label>
            <select
              id="user-hours"
              value={commitment}
              onChange={(e) => setCommitment(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 h-11 outline-none text-xs font-sans text-slate-700 focus:border-slate-900"
            >
              <option value="">Select commitment level</option>
              <option value="1-5">1-5 hours / week</option>
              <option value="5-10">5-10 hours / week</option>
              <option value="10-20">10-20 hours / week</option>
              <option value="20+">20+ hours / week</option>
            </select>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-[#0f172a] hover:bg-[#1e293b] text-white font-sans text-xs font-bold rounded-xl shadow duration-150 active:scale-[0.98] flex items-center justify-center gap-2 border-none mt-4 disabled:opacity-50 cursor-pointer"
          id="onboarding-submit-btn"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Embedding Vector Analysis...</span>
            </>
          ) : (
            <>
              <span>Calculate Co-Author Matching</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
