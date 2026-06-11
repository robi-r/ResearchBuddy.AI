import React, { useState, useEffect, useRef } from "react";
import { 
  Send, Paperclip, Sparkles, BookOpen, Lock, Shield, 
  HelpCircle, GraduationCap, ClipboardList, Lightbulb, Check, 
  FolderLock, MessagesSquare, CheckSquare, Square, FolderOpen,
  Users, Sliders, Globe, Layers, FileText
} from "lucide-react";
import { Match, Message } from "../types";

interface ChatViewProps {
  currentUser: any;
  activeMatches: Match[];
  onViewProfile?: (id: string) => void;
  onTriggerUpgrade?: () => void;
  onCloseMatchSlot?: (matchId: string) => void;
}

export function ChatView({ currentUser, activeMatches, onViewProfile, onTriggerUpgrade, onCloseMatchSlot }: ChatViewProps) {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Team Structure Modal states
  const [showTeamStructure, setShowTeamStructure] = useState(false);
  const [capacityVal, setCapacityVal] = useState(2);
  const [savingCapacity, setSavingCapacity] = useState(false);

  // Dynamic AI Tab Prompt Inputs
  const [summarizerPrompt, setSummarizerPrompt] = useState("");
  const [datasetPrompt, setDatasetPrompt] = useState("");
  const [methodologyPrompt, setMethodologyPrompt] = useState("");
  const [literaturePrompt, setLiteraturePrompt] = useState("");

  const [sharedFiles, setSharedFiles] = useState([
    { name: "Simulation_Validation_Weights.pt", size: "44 MB" },
    { name: "Draft_Methods_Section.docx", size: "120 KB" }
  ]);

  // Paper Summarizer Custom States
  const [selectedPaperToSummarize, setSelectedPaperToSummarize] = useState("Draft_Methods_Section.docx");
  const [summarizationHistory, setSummarizationHistory] = useState<Array<{
    id: string;
    paperName: string;
    promptUsed: string;
    summary: string;
    date: string;
  }>>([
    {
      id: "hist_1",
      paperName: "Draft_Methods_Section.docx",
      promptUsed: "Standard core abstraction check",
      summary: "[ResearchBuddy Academic Core - Safe Local Engine]\nEvaluated draft methods section. Standard spatial grid formulation is suitable, but we suggest verifying temporal anomaly convergence speeds prior to compilation.",
      date: "11:24 AM"
    }
  ]);

  // AI Panel states
  const [aiActiveTab, setAiActiveTab] = useState<"summarizer" | "datasets" | "methodology" | "literature" | "ideas">("summarizer");
  const [aiOutputText, setAiOutputText] = useState("");
  const [aiRunning, setAiRunning] = useState(false);
  const [ideasPrompt, setIdeasPrompt] = useState("");
  const [ideasMode, setIdeasMode] = useState<"discover" | "improve">("discover");

  // Journey tracker state
  const [journey, setJourney] = useState<any>(null);
  const [journeyLoading, setJourneyLoading] = useState(false);
  const [journeyAuditResult, setJourneyAuditResult] = useState("");
  const [auditLoading, setAuditLoading] = useState(false);
  const [showJourneyAuditModal, setShowJourneyAuditModal] = useState(false);

  // Active user details
  const userTier = currentUser?.subscription_tier || "scholar";
  const isPremium = userTier === "gold" || userTier === "platinum";

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch active workspaces from API
  const fetchWorkspaces = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/workspaces");
      if (res.ok) {
        const data = await res.json();
        const list = data.workspaces || [];
        setWorkspaces(list);
        if (list.length > 0 && !selectedWorkspaceId) {
          setSelectedWorkspaceId(list[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load workspaces:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, [currentUser]);

  // Fetch conversations and journey tracker
  const loadMessages = async (wsId: string) => {
    if (!wsId) return;
    try {
      const res = await fetch(`/api/chat/messages?matchId=${wsId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchJourney = async (wsId: string) => {
    if (!wsId) return;
    setJourneyLoading(true);
    try {
      const res = await fetch(`/api/workspaces/journey?workspaceId=${wsId}`);
      if (res.ok) {
        const data = await res.json();
        setJourney(data.journey);
      }
    } catch (err) {
      console.error("Failed to load workspace journey:", err);
    } finally {
      setJourneyLoading(false);
    }
  };

  useEffect(() => {
    if (selectedWorkspaceId) {
      loadMessages(selectedWorkspaceId);
      fetchJourney(selectedWorkspaceId);
    }
  }, [selectedWorkspaceId]);

  // Journey actions: check/uncheck tasks
  const handleToggleJourneyTask = async (milestoneId: string, taskId: string) => {
    if (!journey) return;
    const updatedMilestones = journey.milestones.map((m: any) => {
      if (m.id === milestoneId) {
        const updatedTasks = m.tasks.map((t: any) => {
          if (t.id === taskId) {
            return { ...t, isCompleted: !t.isCompleted };
          }
          return t;
        });
        const allCompleted = updatedTasks.every((t: any) => t.isCompleted);
        return { ...m, tasks: updatedTasks, isCompleted: allCompleted };
      }
      return m;
    });

    const updatedJourney = {
      ...journey,
      milestones: updatedMilestones
    };
    setJourney(updatedJourney);

    try {
      await fetch("/api/workspaces/journey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: selectedWorkspaceId,
          currentMilestoneIndex: journey.currentMilestoneIndex,
          milestones: updatedMilestones
        })
      });
    } catch (err) {
      console.error("Failed to sync journey task toggle:", err);
    }
  };

  // Change active milestone phase
  const handleChangeMilestonePhase = async (newIdx: number) => {
    if (!journey) return;
    const updatedJourney = {
      ...journey,
      currentMilestoneIndex: newIdx
    };
    setJourney(updatedJourney);

    try {
      await fetch("/api/workspaces/journey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: selectedWorkspaceId,
          currentMilestoneIndex: newIdx,
          milestones: journey.milestones
        })
      });
    } catch (err) {
      console.error("Failed to sync milestone phase change:", err);
    }
  };

  // Trigger AI audit for current milestone
  const handleTriggerJourneyAudit = async () => {
    if (!journey) return;
    setAuditLoading(true);
    setJourneyAuditResult("");
    setShowJourneyAuditModal(true);

    const activeMilestone = journey.milestones[journey.currentMilestoneIndex];
    if (!activeMilestone) return;

    const completed = activeMilestone.tasks.filter((t: any) => t.isCompleted).map((t: any) => t.text);
    const pending = activeMilestone.tasks.filter((t: any) => !t.isCompleted).map((t: any) => t.text);

    try {
      const response = await fetch("/api/ai/journey-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: selectedWorkspaceId,
          activeMilestoneTitle: activeMilestone.title,
          completedTasks: completed,
          pendingTasks: pending
        })
      });

      if (response.ok) {
        const data = await response.json();
        setJourneyAuditResult(data.result);
      }
    } catch (err) {
      console.error("Audit request failed:", err);
      setJourneyAuditResult("Audit failed. Please try again.");
    } finally {
      setAuditLoading(false);
    }
  };

  // Handle Capacity slider dynamic changes
  const activeWorkspace = workspaces.find(w => w.id === selectedWorkspaceId);

  useEffect(() => {
    if (activeWorkspace) {
      setCapacityVal(activeWorkspace.max_capacity || 2);
    }
  }, [activeWorkspace]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLeaveOrCloseWorkspace = async () => {
    if (!selectedWorkspaceId) return;
    const desc = "Are you sure you want to finalize and leave/close this joint project workspace? This will release the active slot, allowing you to establish new research matches.";
    if (!window.confirm(desc)) return;

    try {
      const response = await fetch("/api/matches/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: selectedWorkspaceId }),
      });
      if (response.ok) {
        setShowTeamStructure(false);
        const removedId = selectedWorkspaceId;
        setSelectedWorkspaceId("");
        
        // Refresh local workspaces list
        const res = await fetch("/api/workspaces");
        if (res.ok) {
          const data = await res.json();
          const list = data.workspaces || [];
          setWorkspaces(list);
          if (list.length > 0) {
            setSelectedWorkspaceId(list[0].id);
          }
        }
        
        if (onCloseMatchSlot) {
          onCloseMatchSlot(removedId);
        }
      }
    } catch (err) {
      console.error("Failed to leave workspace:", err);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedWorkspaceId) return;
    const text = inputValue;
    setInputValue("");

    // Optimistic insert
    const tempMsg: Message = {
      id: `temp_${Date.now()}`,
      matchId: selectedWorkspaceId,
      senderId: currentUser?.id || "Me",
      senderName: currentUser?.name || "Me",
      text,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: selectedWorkspaceId, text })
      });

      if (res.ok) {
        setTimeout(() => loadMessages(selectedWorkspaceId), 1500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCapacityChange = async (val: number) => {
    setCapacityVal(val);
    await updateCapacityOnServer(val);
  };

  const updateCapacityOnServer = async (val: number) => {
    if (!selectedWorkspaceId) return;
    setSavingCapacity(true);
    try {
      const res = await fetch("/api/workspaces/capacity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: selectedWorkspaceId, maxCapacity: val })
      });
      if (res.ok) {
        fetchWorkspaces();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingCapacity(false);
    }
  };

  // PREMIUM AI ECOSYSTEM TRIGGER SIMULATORS
  const triggerPaperSummarizer = async () => {
    setAiRunning(true);
    setAiOutputText(`Consulting Gemini to analyze paper "${selectedPaperToSummarize}"...\nPrompt: "${summarizerPrompt || "Analyze core contributions"}"`);
    try {
      const response = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: summarizerPrompt,
          fileName: selectedPaperToSummarize,
          fileContent: "Spatial raster analysis methodologies, covariance mapping, and dynamic coordinates."
        })
      });
      if (response.ok) {
        const data = await response.json();
        setAiOutputText(data.result);
        
        // Push summary into history
        const newHistItem = {
          id: `hist_${Date.now()}`,
          paperName: selectedPaperToSummarize,
          promptUsed: summarizerPrompt || "Direct Academic Summary",
          summary: data.result,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setSummarizationHistory(prev => [newHistItem, ...prev]);
      } else {
        const errData = await response.json();
        setAiOutputText(`Error: ${errData.error || "Unable to retrieve paper analysis"}`);
      }
    } catch (err) {
      console.error(err);
      setAiOutputText(`Network Failure: ${String(err)}`);
    } finally {
      setAiRunning(false);
    }
  };

  const triggerDatasetRecommendations = async () => {
    setAiRunning(true);
    setAiOutputText(`Querying open data repositories & indexes for: "${datasetPrompt || "latest spatial observational database packages"}"...`);
    try {
      const response = await fetch("/api/ai/datasets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: datasetPrompt })
      });
      if (response.ok) {
        const data = await response.json();
        setAiOutputText(data.result);
      } else {
        const errData = await response.json();
        setAiOutputText(`Error: ${errData.error || "Unable to reach recommender backend"}`);
      }
    } catch (err) {
      console.error(err);
      setAiOutputText(`Network Failure: ${String(err)}`);
    } finally {
      setAiRunning(false);
    }
  };

  const triggerMethodologySuggesting = async () => {
    setAiRunning(true);
    setAiOutputText(`Synthesizing logical peer-reviewed workflows fitting: "${methodologyPrompt || "Standard physical scaling laws"}"...`);
    try {
      const response = await fetch("/api/ai/methodology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: methodologyPrompt })
      });
      if (response.ok) {
        const data = await response.json();
        setAiOutputText(data.result);
      } else {
        const errData = await response.json();
        setAiOutputText(`Error: ${errData.error || "Unable to retrieve methodology steps"}`);
      }
    } catch (err) {
      console.error(err);
      setAiOutputText(`Network Failure: ${String(err)}`);
    } finally {
      setAiRunning(false);
    }
  };

  const triggerLiteratureSupport = async () => {
    setAiRunning(true);
    setAiOutputText(`Compiling chronological publication milestones for: "${literaturePrompt || "Consolidating spatial grids outline"}"...`);
    try {
      const response = await fetch("/api/ai/literature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: literaturePrompt })
      });
      if (response.ok) {
        const data = await response.json();
        setAiOutputText(data.result);
      } else {
        const errData = await response.json();
        setAiOutputText(`Error: ${errData.error || "Unable to map milestone path"}`);
      }
    } catch (err) {
      console.error(err);
      setAiOutputText(`Network Failure: ${String(err)}`);
    } finally {
      setAiRunning(false);
    }
  };

  const handlePaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${Math.round(file.size / 1024)} KB`;
      const newFile = { name: file.name, size: sizeStr };
      setSharedFiles(prev => [...prev, newFile]);
      setSelectedPaperToSummarize(file.name);
      alert(`"${file.name}" uploaded successfully, and has been auto-selected for immediate summarizing!`);
    }
  };

  const handleSimulateUpload = () => {
    const filename = `Validated_Dataset_Rev${Math.floor(Math.random() * 9) + 1}.csv`;
    setSharedFiles(prev => [...prev, { name: filename, size: "380 KB" }]);
  };

  const getWorkspaceSlotLimit = () => {
    if (userTier === "platinum") return "4 max";
    if (userTier === "gold") return "3 max";
    return "2 max";
  };

  const isTabLocked = (tab: "summarizer" | "datasets" | "methodology" | "literature") => {
    return false; // Live trial bypass: All AI elements unlocked and run naturally!
  };

  return (
    <div className="max-w-6xl mx-auto py-2 px-4 animate-fade-in pb-16">
      <div className="bg-white border border-slate-205 rounded-[24px] shadow-sm grid grid-cols-1 md:grid-cols-12 h-[calc(100vh-160px)] overflow-hidden relative">
        
        {/* PANEL 1: WORKSPACES SIDEBAR */}
        <section className="md:col-span-3 border-r border-slate-200 bg-slate-50/50 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-white">
            <h3 className="font-sans font-black text-xs text-slate-800 uppercase tracking-widest flex items-center justify-between">
              <span>My Labs</span>
              <span className="font-mono text-[9px] text-indigo-700 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase">
                {workspaces.length} / {getWorkspaceSlotLimit()}
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold leading-relaxed uppercase tracking-wider">
              {userTier === "platinum" 
                ? "Platinum tier co-author slots" 
                : userTier === "gold" 
                ? "Gold tier co-author slots" 
                : "Scholar account workspace limit"}
            </p>
          </div>

          <div className="flex-grow overflow-y-auto p-2 space-y-2.5">
            {workspaces.length === 0 ? (
              <div className="py-24 text-center text-slate-400 space-y-3 px-3">
                <FolderLock className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Lock vacant</p>
                <p className="text-[9px] text-slate-400 font-semibold leading-relaxed">
                  Establish a mutual match to automatically spawn workspaces.
                </p>
              </div>
            ) : (
              workspaces.map((w) => {
                const isActive = w.id === selectedWorkspaceId;
                return (
                  <div
                    key={w.id}
                    onClick={() => setSelectedWorkspaceId(w.id)}
                    className={`p-3 rounded-2xl border cursor-pointer duration-150 relative overflow-hidden flex flex-col gap-1.5 ${
                      isActive
                        ? "bg-slate-900 border-slate-900 text-white shadow-md"
                        : "bg-white border-slate-200 hover:border-slate-350"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-serif text-xs font-extrabold truncate max-w-[150px]">
                        {w.project_name}
                      </h4>
                      <span className={`text-[8px] font-mono whitespace-nowrap leading-none ${isActive ? "text-amber-400 font-bold" : "text-slate-400"}`}>
                        ● online
                      </span>
                    </div>
                    <p className={`text-[9px] truncate font-medium ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                      {w.research_hypothesis}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-300/10">
                      <span className="text-[8px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                        {w.members?.length || 2} members
                      </span>
                      <div className="flex -space-x-1.5">
                        {w.members?.slice(0, 4).map((member: any, i: number) => (
                          <div 
                            key={i} 
                            className="w-4 h-4 rounded-full border border-slate-900 overflow-hidden bg-slate-200"
                            title={member.name}
                          >
                            <img src={member.avatar} alt="avatar" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* PANEL 2: MIDDLE CHAT TIMELINE (Header is live Click to open Structure Modal) */}
        <section className="md:col-span-6 flex flex-col h-full bg-white overflow-hidden">
          {activeWorkspace ? (
            <div className="flex flex-col h-full overflow-hidden">
              
              {/* INTERACTIVE HEADER DRAWER TRIGGER */}
              <div 
                onClick={() => setShowTeamStructure(true)}
                className="px-5 py-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-slate-50/40 hover:bg-slate-50 cursor-pointer transition duration-150 relative group"
                title="Click to view Team Structure & Capacity controls"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1">
                    <h3 className="font-serif text-sm font-black text-slate-900 truncate max-w-[190px]">
                      {activeWorkspace.project_name}
                    </h3>
                    <span className="text-[8px] bg-indigo-50 text-indigo-700 font-mono font-bold px-1 py-0.2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      Manage Team
                    </span>
                  </div>
                  <p className="text-[9px] text-indigo-700 font-semibold truncate max-w-[200px]">
                    {activeWorkspace.research_hypothesis}
                  </p>
                </div>

                {/* Overlapping Avatar Row */}
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-2">
                    {activeWorkspace.members?.map((member: any, idx: number) => (
                      <div 
                        key={idx}
                        className="w-7 h-7 rounded-full border-2 border-white overflow-hidden shadow bg-slate-100 group-hover:scale-105 duration-150"
                        title={`${member.name} - ${member.role}`}
                      >
                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className="text-right hidden lg:block">
                    <span className="block text-[8px] font-serif font-black text-emerald-600 uppercase tracking-widest animate-pulse">
                      Active Lab
                    </span>
                    <span className="block text-[8px] font-mono text-slate-400 font-bold">
                      {activeWorkspace.members?.length || 4} authors / capacity {activeWorkspace.max_capacity || 2}
                    </span>
                  </div>
                </div>
              </div>

              {/* RESEARCH JOURNEY & SUBMISSION TRACKER CARD (Collapsible) */}
              {journey && (
                <div className="border-b border-slate-200 bg-white shadow-xs">
                  {/* Card Trigger/Summary Row */}
                  <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-indigo-600 animate-pulse" />
                      <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-700">
                        Research Journey Tracker
                      </span>
                      <div className="h-4 w-px bg-slate-200" />
                      <span className="text-[9px] font-sans font-black text-indigo-700 px-2 py-0.5 bg-indigo-50 rounded">
                        Stage {journey.currentMilestoneIndex + 1}/5: {journey.milestones[journey.currentMilestoneIndex]?.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleTriggerJourneyAudit}
                        className="px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-lg text-[9px] font-mono font-black uppercase border-none cursor-pointer shadow-xs hover:opacity-95 duration-100 flex items-center gap-1"
                        title="Run an AI expert review audit over your checked tasks for this stage"
                      >
                        <Sparkles className="w-3 h-3 fill-white" />
                        AI Progress Audit
                      </button>
                    </div>
                  </div>

                  {/* Horizontal linear milestone stages connector */}
                  <div className="px-5 py-3 bg-white border-b border-slate-100 overflow-x-auto">
                    <div className="flex items-center justify-between relative min-w-[400px]">
                      <div className="absolute left-6 right-6 top-1/2 h-[2px] bg-slate-100 -translate-y-1/2 z-0" />
                      {journey.milestones.map((m: any, idx: number) => {
                        const isActive = idx === journey.currentMilestoneIndex;
                        const isCompleted = m.tasks && m.tasks.every((t: any) => t.isCompleted);
                        return (
                          <button
                            key={m.id}
                            onClick={() => handleChangeMilestonePhase(idx)}
                            className="bg-transparent border-none cursor-pointer p-0 z-10 flex flex-col items-center group focus:outline-none"
                            title={`Switch to stage: ${m.title}`}
                          >
                            <div 
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[9px] font-black tracking-tighter leading-none border-2 duration-150 ${
                                isActive 
                                  ? "bg-slate-900 border-slate-900 text-white shadow-md scale-110" 
                                  : isCompleted 
                                    ? "bg-emerald-500 border-emerald-500 text-white" 
                                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-400"
                              }`}
                            >
                              {isCompleted ? <Check className="w-3 h-3 font-extrabold stroke-[3px]" /> : idx + 1}
                            </div>
                            <span 
                              className={`text-[8px] font-sans font-bold uppercase mt-1 tracking-tight group-hover:text-slate-950 duration-150 max-w-[70px] text-center truncate ${
                                isActive ? "text-slate-900 font-extrabold" : "text-slate-400"
                              }`}
                            >
                              {m.title && m.title.split(". ")[1]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active stage tasks checklist */}
                  <div className="p-3 bg-slate-50/25 grid grid-cols-1 md:grid-cols-3 gap-2.5">
                    {journey.milestones[journey.currentMilestoneIndex]?.tasks?.map((task: any) => (
                      <button
                        key={task.id}
                        onClick={() => handleToggleJourneyTask(journey.milestones[journey.currentMilestoneIndex].id, task.id)}
                        className="flex items-start gap-2 text-left border bg-white p-2.5 rounded-xl border-slate-200 hover:bg-slate-50 hover:border-slate-350 duration-100 cursor-pointer shadow-2xs text-slate-800"
                      >
                        <div className="mt-0.5 shrink-0">
                          {task.isCompleted ? (
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-650" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-300" />
                          )}
                        </div>
                        <span className={`text-[9px] leading-tight font-medium ${task.isCompleted ? "line-through text-slate-400 font-normal" : "text-slate-700"}`}>
                          {task.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Stream */}
              <div className="flex-grow overflow-y-auto p-4 bg-slate-50/50 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-20">
                    <MessagesSquare className="w-7 h-7 text-slate-300 mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mt-2">
                      New Workspace Chat
                    </p>
                    <p className="text-[9px] text-slate-400 max-w-xs mx-auto leading-relaxed mt-1 font-semibold">
                      Joint research channel initialized. Click on any researcher's name or avatar to slide open their stats instantly.
                    </p>
                  </div>
                ) : (
                  messages.map((m, idx) => {
                    const isMe = m.senderId === currentUser?.id;
                    const memberProfile = activeWorkspace.members?.find((mem: any) => mem.profileId === m.senderId);
                    return (
                      <div key={idx} className={`flex gap-3 max-w-[85%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                        <div 
                          className="w-7 h-7 rounded-full border border-slate-200 overflow-hidden flex-shrink-0 cursor-pointer hover:scale-110 duration-150"
                          onClick={() => onViewProfile && onViewProfile(m.senderId)}
                          title={`Inspect ${m.senderName}'s stats`}
                        >
                          <img 
                            src={isMe ? currentUser?.avatar : memberProfile?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop"} 
                            alt={m.senderName} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="space-y-0.5">
                          <div className={`flex items-baseline gap-1.5 ${isMe ? "flex-row-reverse" : ""}`}>
                            <span 
                              onClick={() => onViewProfile && onViewProfile(m.senderId)}
                              className="text-[9px] font-serif font-black text-slate-800 leading-none cursor-pointer hover:underline hover:text-indigo-600"
                            >
                              {m.senderName}
                            </span>
                            <span className="text-[8px] font-medium text-slate-400 leading-none">
                              {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <div className={`p-2.5 rounded-xl text-[11px] font-semibold leading-relaxed shadow-sm ${
                            isMe 
                              ? "bg-slate-900 text-white rounded-tr-none"
                              : "bg-white border border-slate-200 text-slate-700 rounded-tl-none"
                          }`}>
                            {m.text}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message inputs */}
              <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
                <div className="flex-grow flex items-center bg-slate-50 border border-slate-200 focus-within:border-slate-800 rounded-2xl px-3.5 py-1 gap-2">
                  <button 
                    onClick={handleSimulateUpload}
                    className="p-1 text-slate-400 hover:text-slate-800 bg-transparent border-none cursor-pointer"
                    title="Simulate paper upload inside channel"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    placeholder="Message lab colleagues or query AI..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-grow bg-transparent text-[11px] py-2 focus:outline-none placeholder-slate-400 text-slate-800 font-semibold"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  className="bg-slate-900 border-none hover:bg-slate-800 p-2.5 rounded-2xl text-white shadow shadow-slate-950/20 active:scale-95 duration-150 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 h-full text-center space-y-4">
              <MessagesSquare className="w-12 h-12 text-slate-350 animate-bounce" />
              <h3 className="font-serif text-lg font-bold text-slate-800">
                Lobby Active Hub Vacant
              </h3>
              <p className="text-xs text-slate-500 font-semibold max-w-sm leading-relaxed">
                Choose a matched channel laboratory on your left sidebar panel to open up standard group discussions and AI integrations.
              </p>
            </div>
          )}
        </section>

        {/* PANEL 3: PREMIUM AI RESEARCH ASSISTANT PANEL */}
        <section className="md:col-span-3 border-l border-slate-200 bg-slate-50/20 flex flex-col h-full overflow-hidden relative">
          
          {/* SANDBOX RUNTIME INDICATOR */}
          <div className="bg-indigo-950 text-white p-2 text-[8.5px] font-mono uppercase tracking-widest text-center font-bold flex items-center justify-center gap-1.5 flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
            <span>Sandbox Mode: All Tools Unlocked!</span>
          </div>

          {/* Assistant Header block */}
          <div className="p-4 border-b border-slate-200 bg-white flex-shrink-0">
            <h3 className="font-sans font-black text-xs text-indigo-950 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>AI Lab Assistant</span>
            </h3>
            <p className="text-[9px] text-slate-400 mt-0.5 font-bold uppercase tracking-wider">
              {userTier === "platinum" ? "Platinum Suite (All tools)" : "Gold Suite (Summarizer & Datasets)"}
            </p>
          </div>

          {/* AI 5-Tab Selectors with padlock displays */}
          <div className="grid grid-cols-5 text-center border-b border-slate-100 flex-shrink-0 bg-white">
            <button
              onClick={() => { setAiActiveTab("summarizer"); setAiOutputText(""); }}
              className={`py-3 text-[8.5px] font-mono uppercase font-black transition cursor-pointer border-none flex flex-col items-center justify-center gap-1 ${
                aiActiveTab === "summarizer" ? "bg-slate-50 text-indigo-700 font-extrabold border-b-2 border-indigo-700" : "text-slate-400"
              }`}
            >
              <span>Paper Sum</span>
            </button>
            
            <button
              onClick={() => { setAiActiveTab("datasets"); setAiOutputText(""); }}
              className={`py-3 text-[8.5px] font-mono uppercase font-black transition cursor-pointer border-none flex flex-col items-center justify-center gap-1 ${
                aiActiveTab === "datasets" ? "bg-slate-50 text-indigo-700 font-extrabold border-b-2 border-indigo-700" : "text-slate-400"
              }`}
            >
              <span>Datasets</span>
            </button>

            <button
              onClick={() => {
                if (isTabLocked("methodology")) {
                  alert("Methodology Suggesting is restricted to Platinum members. Upgrade to unlock direct access!");
                  return;
                }
                setAiActiveTab("methodology");
                setAiOutputText("");
              }}
              className={`py-3 text-[8.5px] font-mono uppercase font-black transition cursor-pointer border-none flex flex-col items-center justify-center gap-1 ${
                aiActiveTab === "methodology" 
                  ? "bg-slate-50 text-indigo-700 font-extrabold border-b-2 border-indigo-700" 
                  : isTabLocked("methodology") ? "text-slate-300 opacity-60 bg-slate-50/20" : "text-slate-400"
              }`}
            >
              <span className="flex items-center gap-0.5 text-center leading-none justify-center">
                {isTabLocked("methodology") && <Lock className="w-2 h-2 text-slate-400" />}
                Method
              </span>
            </button>

            <button
              onClick={() => {
                if (isTabLocked("literature")) {
                  alert("Literature Support & Structuring is restricted to Platinum members. Upgrade to unlock today!");
                  return;
                }
                setAiActiveTab("literature");
                setAiOutputText("");
              }}
              className={`py-3 text-[8.5px] font-mono uppercase font-black transition cursor-pointer border-none flex flex-col items-center justify-center gap-1 ${
                aiActiveTab === "literature" 
                  ? "bg-slate-50 text-indigo-700 font-extrabold border-b-2 border-indigo-700" 
                  : isTabLocked("literature") ? "text-slate-300 opacity-60 bg-slate-50/20" : "text-slate-400"
              }`}
            >
              <span className="flex items-center gap-0.5 text-center leading-none justify-center">
                {isTabLocked("literature") && <Lock className="w-2 h-2 text-slate-400" />}
                Lit Support
              </span>
            </button>

            <button
              onClick={() => { setAiActiveTab("ideas"); setAiOutputText(""); }}
              className={`py-3 text-[8.5px] font-mono uppercase font-black transition cursor-pointer border-none flex flex-col items-center justify-center gap-1 ${
                aiActiveTab === "ideas" ? "bg-slate-50 text-indigo-700 font-extrabold border-b-2 border-indigo-700" : "text-slate-400"
              }`}
              title="Formulate or refine core research ideas and hypotheses"
            >
              <span className="flex items-center gap-0.5 text-center leading-none justify-center">
                Ideas
              </span>
            </button>
          </div>

          {/* AI Body & Active Prompt Input layout */}
          <div className="flex-grow p-4 flex flex-col justify-between overflow-hidden">
            <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-385px)] pr-1">
              
              {aiActiveTab === "summarizer" && (
                <div className="space-y-3">
                  <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm space-y-1.5">
                    <h4 className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-indigo-505 text-indigo-600" />
                      <span>Paper Summarizer</span>
                    </h4>
                    <p className="text-[9px] text-slate-500 leading-relaxed font-semibold">
                      Evaluate and summarize citation overlaps across your channel folder index dynamically.
                    </p>
                  </div>

                  {/* Active target selection and Upload custom papers */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[8px] font-mono uppercase tracking-widest text-slate-400 font-bold">Select Active Paper:</label>
                      <select
                        value={selectedPaperToSummarize}
                        onChange={(e) => setSelectedPaperToSummarize(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-[10px] outline-none font-semibold text-slate-700 focus:border-slate-400"
                      >
                        {sharedFiles.map((f, idx) => (
                          <option key={idx} value={f.name}>{f.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => document.getElementById("local-paper-sum-upload")?.click()}
                        className="w-full py-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-[9px] font-bold text-slate-600 flex items-center justify-center gap-1 cursor-pointer transition"
                      >
                        <Paperclip className="w-3 h-3 text-indigo-600" />
                        <span>Upload Local Paper</span>
                      </button>
                      <input
                        type="file"
                        id="local-paper-sum-upload"
                        className="hidden"
                        onChange={handlePaperUpload}
                        accept=".pdf,.docx,.doc,.txt,.sci,.csv"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <textarea
                      placeholder="e.g. Summarize Thorne, Sarah Chen observations"
                      value={summarizerPrompt}
                      onChange={(e) => setSummarizerPrompt(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-[10px] outline-none font-semibold text-slate-705 focus:border-slate-800 focus:bg-white"
                      rows={2}
                    />
                    <button
                      onClick={triggerPaperSummarizer}
                      disabled={aiRunning}
                      className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-mono font-black uppercase cursor-pointer border-none shadow-sm"
                    >
                      {aiRunning ? "Cross-referencing..." : "▶ Formulate Summary"}
                    </button>
                  </div>

                  {/* Summarization History */}
                  {summarizationHistory.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between items-center bg-slate-100/50 p-1 px-2 rounded-md">
                        <span className="text-[8px] font-mono uppercase tracking-widest text-slate-400 font-black">History</span>
                        <button
                          onClick={() => setSummarizationHistory([])}
                          className="text-[8.5px] font-mono text-slate-400 hover:text-red-500 font-bold bg-transparent border-none cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                        {summarizationHistory.map((hist) => (
                          <button
                            key={hist.id}
                            onClick={() => {
                              setSelectedPaperToSummarize(hist.paperName);
                              setAiOutputText(hist.summary);
                            }}
                            className="w-full text-left bg-white hover:bg-slate-100 border border-slate-200 rounded-lg p-1.5 text-[9px] flex flex-col transition duration-150 cursor-pointer space-y-0.5"
                          >
                            <div className="flex justify-between items-center text-slate-400 font-mono text-[7.5px] w-full">
                              <span className="truncate max-w-[120px] font-bold text-slate-500">{hist.paperName}</span>
                              <span className="text-[7px] text-slate-400">{hist.date}</span>
                            </div>
                            <p className="text-slate-800 font-semibold truncate w-full">{hist.promptUsed}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {aiActiveTab === "datasets" && (
                <div className="space-y-3">
                  <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm space-y-1.5">
                    <h4 className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                      <CheckSquare className="w-3.5 h-3.5 text-indigo-505 text-emerald-500" />
                      <span>Dataset Recommendations</span>
                    </h4>
                    <p className="text-[9px] text-slate-500 leading-relaxed font-semibold">
                      Assess claim bounds and open archive suggestions fitted to intent.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <textarea
                      placeholder="e.g. Find open global observation grids"
                      value={datasetPrompt}
                      onChange={(e) => setDatasetPrompt(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-[10px] outline-none font-semibold text-slate-705 focus:border-slate-800 focus:bg-white"
                      rows={2}
                    />
                    <button
                      onClick={triggerDatasetRecommendations}
                      disabled={aiRunning}
                      className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-mono font-black uppercase cursor-pointer border-none shadow-sm"
                    >
                      {aiRunning ? "Sieving records..." : "▶ Query Database recommendations"}
                    </button>
                  </div>
                </div>
              )}

              {aiActiveTab === "methodology" && (
                <div className="space-y-3 animate-fade-in">
                  <div className="bg-white rounded-xl p-3 border border-slate-205 shadow-sm space-y-1.5">
                    <h4 className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Methodology Suggesting</span>
                    </h4>
                    <p className="text-[9px] text-slate-500 leading-relaxed font-semibold">
                      Formulate structural mathematical pipelines and gating outlines.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <textarea
                      placeholder="e.g. Model high-dimensional physical scaling laws"
                      value={methodologyPrompt}
                      onChange={(e) => setMethodologyPrompt(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-[10px] outline-none font-semibold text-slate-705 focus:border-slate-800 focus:bg-white"
                      rows={2}
                    />
                    <button
                      onClick={triggerMethodologySuggesting}
                      disabled={aiRunning}
                      className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-mono font-black uppercase cursor-pointer border-none shadow-sm"
                    >
                      {aiRunning ? "Integrating parameters..." : "▶ Map Methodology Plan"}
                    </button>
                  </div>
                </div>
              )}

              {aiActiveTab === "literature" && (
                <div className="space-y-3 animate-fade-in">
                  <div className="bg-white rounded-xl p-3 border border-slate-205 shadow-sm space-y-1.5">
                    <h4 className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Literature Support & Structuring</span>
                    </h4>
                    <p className="text-[9px] text-slate-500 leading-relaxed font-semibold">
                      Predict chronological milestone roadmaps and structural publication drafts.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <textarea
                      placeholder="e.g. Suggest final abstract draft section outline"
                      value={literaturePrompt}
                      onChange={(e) => setLiteraturePrompt(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-[10px] outline-none font-semibold text-slate-705 focus:border-slate-800 focus:bg-white"
                      rows={2}
                    />
                    <button
                      onClick={triggerLiteratureSupport}
                      disabled={aiRunning}
                      className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-mono font-black uppercase cursor-pointer border-none shadow-sm"
                    >
                      {aiRunning ? "Synthesizing roadmaps..." : "▶ Output Structural Support"}
                    </button>
                  </div>
                </div>
              )}

              {aiActiveTab === "ideas" && (
                <div className="space-y-3 animate-fade-in">
                  <div className="bg-white rounded-xl p-3 border border-slate-205 shadow-sm space-y-1.5">
                    <h4 className="text-[10px] font-bold text-slate-805 flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                      <span>Idea Spark & Discovery Room</span>
                    </h4>
                    <p className="text-[9px] text-slate-500 leading-relaxed font-semibold">
                      Brainstorm extreme novel study questions or refine joint draft paper ideas into top-tier journal quality.
                    </p>
                  </div>

                  {/* Mode select toggle buttons */}
                  <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setIdeasMode("discover")}
                      className={`flex-1 py-1 text-[8.5px] font-mono font-black uppercase rounded-lg border-none cursor-pointer duration-100 ${
                        ideasMode === "discover" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Discover Concept
                    </button>
                    <button
                      type="button"
                      onClick={() => setIdeasMode("improve")}
                      className={`flex-1 py-1 text-[8.5px] font-mono font-black uppercase rounded-lg border-none cursor-pointer duration-100 ${
                        ideasMode === "improve" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Improve / Polish
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <textarea
                      placeholder={
                        ideasMode === "discover" 
                          ? "e.g. Enter domain (e.g. quantum physics, graph database grids) for novel project ideas..."
                          : "e.g. Paste your draft hypothesis/abstract to formulate publication-tier upgrades..."
                      }
                      value={ideasPrompt}
                      onChange={(e) => setIdeasPrompt(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-[10px] outline-none font-semibold text-slate-705 focus:border-slate-800 focus:bg-white animate-fade-in"
                      rows={3}
                    />
                    <button
                      onClick={async () => {
                        setAiRunning(true);
                        setAiOutputText(`Consulting deep research databases for idea formulation: "${ideasPrompt || "Autonomous Grid systems"}"...`);
                        try {
                          const res = await fetch("/api/ai/ideas", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ concept: ideasPrompt, mode: ideasMode })
                          });
                          if (res.ok) {
                            const data = await res.json();
                            setAiOutputText(data.result);
                          } else {
                            const errVal = await res.json();
                            setAiOutputText(`Error: ${errVal.error || "System error generating proposal"}`);
                          }
                        } catch (err) {
                          console.error(err);
                          setAiOutputText("Failed resolving connection pipeline.");
                        } finally {
                          setAiRunning(false);
                        }
                      }}
                      disabled={aiRunning}
                      className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-mono font-black uppercase cursor-pointer border-none shadow-sm flex items-center justify-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-white fill-white" />
                      <span>{aiRunning ? "Consulting..." : ideasMode === "discover" ? "Brainstorm Cutting-edge Ideas" : "Polish & Upgrade Idea"}</span>
                    </button>
                  </div>
                </div>
              )}

              {aiOutputText && (
                <div className="space-y-1 animate-fade-in">
                  <span className="text-[8px] font-mono uppercase tracking-widest text-slate-400 font-extrabold block">AI Console</span>
                  <div className="bg-slate-900 text-slate-100 rounded-xl p-3 border border-slate-950 max-h-[140px] overflow-y-auto shadow-inner">
                    <pre className="font-mono text-[9px] font-medium leading-relaxed whitespace-pre-wrap text-slate-200">
                      {aiOutputText}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Shared file list */}
            <div className="border-t border-slate-150 pt-3 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-mono uppercase tracking-widest text-slate-400 font-black">Workspace Materials</span>
                <span className="text-[8px] font-mono text-indigo-600 font-bold">{sharedFiles.length} files</span>
              </div>
              <div className="space-y-1 max-h-[100px] overflow-y-auto">
                {sharedFiles.map((file, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-lg p-1.5 flex justify-between items-center text-[9px] font-semibold text-slate-705 shadow-sm">
                    <span className="truncate max-w-[130px] font-sans">{file.name}</span>
                    <span className="font-mono text-[8px] text-slate-400 bg-slate-50 px-1 rounded whitespace-nowrap">{file.size}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* TEAM STRUCTURE MODAL OVERLAY */}
      {showTeamStructure && activeWorkspace && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up text-slate-900">
            
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white relative bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900">
              <h3 className="font-serif text-lg font-black tracking-tight">{activeWorkspace.project_name}</h3>
              <p className="text-xs text-indigo-300 font-semibold">{activeWorkspace.research_hypothesis}</p>
              
              <button 
                onClick={() => setShowTeamStructure(false)}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white border-none p-1.5 rounded-full cursor-pointer duration-150 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6">
              
              {/* Dynamic Capacity Constraint Control */}
              <div className="border border-indigo-100 rounded-2xl p-4 bg-indigo-50/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase text-slate-905 flex items-center gap-1">
                      <Sliders className="w-4 h-4 text-indigo-600" />
                      <span>Dynamic Team Capacity Constraint</span>
                    </h4>
                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                      Control the absolute maximum roster size for this collaborative workspace channel.
                    </p>
                  </div>
                  <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl">
                    {capacityVal} Members Max
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-slate-400 font-black">2 Slots</span>
                    <input
                      type="range"
                      min="2"
                      max={userTier === "platinum" ? "4" : userTier === "gold" ? "3" : "2"}
                      value={capacityVal}
                      onChange={(e) => handleCapacityChange(Number(e.target.value))}
                      disabled={userTier === "scholar" || savingCapacity}
                      className="flex-grow h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="text-[10px] font-mono text-slate-400 font-black">
                      {userTier === "platinum" ? "4 Slots" : userTier === "gold" ? "3 Slots" : "2 Slots"}
                    </span>
                  </div>

                  {/* Lock/Upsell display for free scholars */}
                  {userTier === "scholar" ? (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 flex items-start gap-2.5 text-slate-805">
                      <Shield className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="block text-[10px] font-black uppercase tracking-wider text-amber-600 leading-none">Capacity locked at 2</span>
                        <p className="text-[9px] text-slate-500 font-semibold leading-relaxed">
                          Upgrade to Gold (up to 3) or Platinum (up to 4) to dynamically adjust co-author roster scaling!
                        </p>
                        <button
                          onClick={() => { setShowTeamStructure(false); onTriggerUpgrade?.(); }}
                          className="mt-1.5 text-[8.5px] font-mono font-black uppercase text-indigo-700 hover:underline cursor-pointer border-none bg-transparent"
                        >
                          &rarr; Upgrade to gold/platinum today
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[9px] text-slate-400 font-bold">
                      {savingCapacity ? "Persisting workspace constraint limits..." : `Verified PI guidelines: ${userTier.toUpperCase()} credentials authorized.`}
                    </p>
                  )}
                </div>
              </div>

              {/* Active Roster List */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Authors ({activeWorkspace.members?.length || 2})</h4>
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {activeWorkspace.members?.map((member: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-200/65 rounded-xl p-2.5 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-205 flex-shrink-0">
                          <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h5 className="text-[11px] font-extrabold text-slate-900 leading-none">{member.name}</h5>
                          <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{member.role}</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          setShowTeamStructure(false);
                          onViewProfile?.(member.profileId);
                        }}
                        className="text-[9px] font-mono font-black text-indigo-600 hover:text-indigo-800 uppercase px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm cursor-pointer hover:bg-slate-50 transition"
                      >
                        Stats Profile
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <button
                onClick={handleLeaveOrCloseWorkspace}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 duration-150 rounded-xl text-[10px] font-mono font-black uppercase cursor-pointer border border-rose-200 shadow-sm"
              >
                🗑 Terminate & Leave Lab
              </button>
              <button
                onClick={() => setShowTeamStructure(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-sans font-black uppercase cursor-pointer hover:bg-slate-800 transition border-none shadow"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

      {/* AI JOURNEY AUDIT CRITIQUE MODAL OVERLAY */}
      {showJourneyAuditModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[120] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-scale-up text-slate-900 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 bg-gradient-to-tr from-emerald-900 to-teal-950 text-white relative flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-300 fill-emerald-300 animate-pulse animate-spin-slow" />
                <div>
                  <h3 className="font-serif text-sm font-black tracking-tight uppercase">AI Research Journey Appraisal</h3>
                  <p className="text-[10px] text-emerald-200 font-mono font-medium">ResearchBuddy Academic Peer Auditor</p>
                </div>
              </div>
              <button 
                onClick={() => setShowJourneyAuditModal(false)}
                className="bg-white/10 hover:bg-white/20 text-white border-none w-7 h-7 rounded-full cursor-pointer flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Content Audit Report */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="block text-[8px] font-mono uppercase tracking-widest text-slate-400 font-bold">Appraised Stage</span>
                  <span className="text-[11px] font-sans font-black text-slate-800">
                    {journey && journey.milestones[journey.currentMilestoneIndex]?.title}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[8px] font-mono uppercase tracking-widest text-slate-400 font-bold">Audit Status</span>
                  <span className="text-[10px] font-mono font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    {auditLoading ? "Auditing..." : "Analysis Synthesized"}
                  </span>
                </div>
              </div>

              {auditLoading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="w-10 h-10 border-4 border-slate-250 border-t-emerald-600 rounded-full animate-spin" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono font-black uppercase text-slate-500 tracking-wider animate-pulse">Compiling active logs & parameters...</p>
                    <p className="text-[9px] text-slate-400 max-w-sm leading-relaxed font-semibold">
                      Critiquing completed hypothesis milestones and formulating dynamic peer suggestions. Please wait.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-slate-100 font-mono text-[10px] sm:text-xs leading-relaxed whitespace-pre-wrap max-h-[350px] overflow-y-auto">
                  {journeyAuditResult}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowJourneyAuditModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-mono font-black uppercase cursor-pointer hover:bg-slate-800 transition border-none shadow"
              >
                Dismiss Audit report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
