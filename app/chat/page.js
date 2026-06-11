"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  FolderLock, MessagesSquare, Send, Paperclip, Sparkles, BookOpen, 
  HelpCircle, Shield, Rocket, ArrowRight, CheckCircle2, ChevronRight,
  GraduationCap, ClipboardList, Lightbulb, Sliders, Play, Lock
} from "lucide-react";

export default function ChatWorkspacesCenter() {
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [sharedFiles, setSharedFiles] = useState([
    { name: "Simulation_Validation_Weights.pt", size: "44 MB", type: "tensor" },
    { name: "Draft_Methods_Section.docx", size: "120 KB", type: "document" }
  ]);

  // AI Panel states
  const [aiActiveTab, setAiActiveTab] = useState("summarizer");
  const [aiOutputText, setAiOutputText] = useState("");
  const [aiRunning, setAiRunning] = useState(false);

  const messagesEndRef = useRef(null);

  // Bootstrap session and fetch active workspaces
  const loadWorkspaceData = async () => {
    setLoading(true);
    try {
      const userRes = await fetch("/api/auth/me");
      if (userRes.ok) {
        const uData = await userRes.json();
        setUserProfile(uData.user);
      }

      onFetchWorkspaces();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onFetchWorkspaces = async () => {
    try {
      const wsRes = await fetch("/api/workspaces");
      if (wsRes.ok) {
        const wData = await wsRes.json();
        const list = wData.workspaces || [];
        setWorkspaces(list);
        if (list.length > 0 && !selectedWorkspaceId) {
          setSelectedWorkspaceId(list[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Get active selected workspace profile
  const activeWorkspace = workspaces.find(w => w.id === selectedWorkspaceId);
  const userTier = userProfile?.subscription_tier || "scholar";
  const isPremium = userTier === "premium";

  // Fetch messages of this channel
  const loadMessagesForWorkspace = async (wsId) => {
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

  useEffect(() => {
    loadWorkspaceData();
  }, []);

  useEffect(() => {
    if (selectedWorkspaceId) {
      loadMessagesForWorkspace(selectedWorkspaceId);
    }
  }, [selectedWorkspaceId]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedWorkspaceId) return;
    const text = inputValue;
    setInputValue("");

    // Optimistic message append
    const tempMsg = {
      id: `temp_${Date.now()}`,
      matchId: selectedWorkspaceId,
      senderId: userProfile?.id || "Me",
      senderName: userProfile?.name || "Me",
      text,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: selectedWorkspaceId, text })
      });

      if (res.ok) {
        setTimeout(() => loadMessagesForWorkspace(selectedWorkspaceId), 1500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // PREMIUM AI ASSISTANT PANEL SIMULATORS
  const triggerSummarizer = () => {
    setAiRunning(true);
    setAiOutputText("Running high-fidelity RAG comparison indices against shared dataset files inside this channel...");
    setTimeout(() => {
      setAiOutputText(
        `[Literature Review extraction complete]
Found active citations in: "Voxel temporal scales on satellite mapping..."
  1. Author Chen (2025) validates the 0.08 scaling parameters.
  2. Thorne, J. (2024) asserts and proves quantum stability.
Recommendation: Prioritize cross-correlation matching against standard spatial grids early.`
      );
      setAiRunning(false);
    }, 1800);
  };

  const triggerOutliner = () => {
    setAiRunning(true);
    setAiOutputText("Analyzing current research hypothesis parameters...");
    setTimeout(() => {
      setAiOutputText(
        `[Hypothesis robustness checklist compiled]
Active claim: ${activeWorkspace?.research_hypothesis || "No specific hypothesis found."}
  ● STRENGTH (HIGH): Combines two advanced peer-level expert methodologies.
  ● CRITICAL GAP (LOW-FIDELITY): Model fails to state the exact limit constraints or physical hardware required.
Advice: Formulate a parameter block detailing scaling benchmarks for cloud hardware.`
      );
      setAiRunning(false);
    }, 1500);
  };

  const triggerMilestone = () => {
    setAiRunning(true);
    setAiOutputText("Calculating predictive roadmap trajectories...");
    setTimeout(() => {
      setAiOutputText(
        `[Predictive milestone roadmap]
  ● STEP 1: Consolidate shared spatial weights with co-authors.
  ● STEP 2: Format draft methods segment matching Nature specification rules.
  ● STEP 3: Initiate secondary peer review evaluation round.
Target Submission: 14 business days from parameters commit.`
      );
      setAiRunning(false);
    }, 1200);
  };

  const handleDocumentSimulation = () => {
    const filename = `Peer_Review_Manuscript_Rev${Math.floor(Math.random() * 90) + 10}.pdf`;
    setSharedFiles(prev => [...prev, { name: filename, size: "1.4 MB", type: "document" }]);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-6 pb-20 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl h-[calc(100vh-175px)] min-h-[500px]">
        
        {/* PANEL 1: WORKSPACES SIDEBAR (Lax 2 count for free users, 4 for Premium) */}
        <section className="md:col-span-3 border-r border-slate-100 bg-slate-50/50 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-white">
            <h3 className="font-sans font-black text-xs text-slate-800 uppercase tracking-widest flex items-center justify-between">
              <span>My Labs</span>
              <span className="font-mono text-[9px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-full uppercase">
                {workspaces.length} / {isPremium ? "4 max" : "2 max"}
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-1 font-semibold leading-relaxed">
              {isPremium ? "Premium PI privileges unlocked" : "Scholar account workspace limit"}
            </p>
          </div>

          <div className="flex-grow overflow-y-auto p-2 space-y-2.5">
            {workspaces.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-3 px-3">
                <FolderLock className="w-8 h-8 text-slate-350 mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Lock vacant</p>
                <p className="text-[9px] text-slate-400 font-semibold leading-relaxed">
                  No active collaborative spaces found. Establish a mutual match in match center to unlock.
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
                        ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/10"
                        : "bg-white border-slate-200/80 hover:border-slate-350"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-serif text-xs font-extrabold truncate max-w-[150px]">
                        {w.project_name}
                      </h4>
                      <span className={`text-[8px] font-mono whitespace-nowrap leading-none ${isActive ? "text-amber-400" : "text-slate-405"}`}>
                        ● online
                      </span>
                    </div>
                    <p className={`text-[9px] truncate font-medium ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                      {w.research_hypothesis}
                    </p>

                    {/* Member counts overlapping icons */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-350/10">
                      <span className="text-[8px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                        {w.members?.length || 2} active scholars
                      </span>
                      <div className="flex -space-x-1.5">
                        {w.members?.slice(0, 4).map((member, i) => (
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

        {/* PANEL 2: MAIN GROUP CHAT INTERFACE */}
        <section className="md:col-span-6 flex flex-col h-full bg-white overflow-hidden">
          {activeWorkspace ? (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Dynamic Header with MULTIPARTICIPANT overlapping avatars */}
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-white">
                <div className="space-y-0.5">
                  <h3 className="font-serif text-sm font-black text-slate-900 truncate">
                    {activeWorkspace.project_name}
                  </h3>
                  <p className="text-[10px] text-indigo-700 font-semibold truncate max-w-[280px]">
                    {activeWorkspace.research_hypothesis}
                  </p>
                </div>

                {/* Overlapping Participant Avatar row (scales up to 4 neatly grouped) */}
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {activeWorkspace.members?.map((member, idx) => (
                      <div 
                        key={idx}
                        className="w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow bg-slate-150 hover:scale-105 duration-100 relative group"
                        title={`${member.name} - ${member.role}`}
                      >
                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className="hidden lg:block text-right">
                    <span className="block text-[8px] font-serif font-black text-emerald-600 uppercase tracking-widest animate-pulse">
                      Live lab session
                    </span>
                    <span className="block text-[8px] font-mono text-slate-400 mt-0.5 font-bold">
                      {activeWorkspace.members?.length || 4} authors connected
                    </span>
                  </div>
                </div>
              </div>

              {/* Message History Timeline Stream */}
              <div className="flex-grow overflow-y-auto p-4 bg-slate-50/50 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-16">
                    <MessagesSquare className="w-7 h-7 text-slate-300 mx-auto" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2">
                      New Lab Stream
                    </p>
                    <p className="text-[9px] text-slate-400 font-semibold max-w-sm mx-auto leading-relaxed mt-1">
                      Joint research channel spawned. Share data files, upvote insights, and activate the AI literature reviewer on the panel.
                    </p>
                  </div>
                ) : (
                  messages.map((m, idx) => {
                    const isMe = m.senderId === userProfile?.id;
                    return (
                      <div key={idx} className={`flex gap-3 max-w-[85%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                        <div className="w-7.5 h-7.5 rounded-full border border-slate-250 overflow-hidden flex-shrink-0">
                          <img src={isMe ? userProfile?.avatar : activeWorkspace.members?.find(mem => mem.profileId === m.senderId)?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop"} alt={m.senderName} className="w-full h-full object-cover" />
                        </div>
                        <div className="space-y-0.5">
                          <div className={`flex items-baseline gap-1.5 ${isMe ? "flex-row-reverse" : ""}`}>
                            <span className="text-[9px] font-serif font-bold text-slate-800 leading-none">{m.senderName}</span>
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

              {/* Message inputs and attachment upload */}
              <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
                <div className="flex-grow flex items-center bg-slate-50 border border-slate-200 focus-within:border-slate-800 rounded-2xl px-3.5 py-1 gap-2">
                  <button 
                    onClick={handleDocumentSimulation}
                    className="p-1 text-slate-400 hover:text-slate-800 hover:scale-105 duration-100 bg-transparent border-none cursor-pointer"
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
                  className="bg-slate-900 border-none hover:bg-slate-800 p-2.5 rounded-2xl text-white shadow-md active:scale-95 duration-150"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 h-full text-center space-y-4">
              <MessagesSquare className="w-12 h-12 text-slate-300 animate-pulse animate-bounce" />
              <h3 className="font-serif text-lg font-bold text-slate-800">
                Lobby Terminal Vacant
              </h3>
              <p className="text-xs text-slate-500 font-semibold max-w-sm leading-relaxed">
                Choose an active collaborative project workspace tab container on your left side-menu to initialize standard multi-user group chat.
              </p>
            </div>
          )}
        </section>

        {/* PANEL 3: PREMIUM AI RESEARCH ASSISTANT ECOSYSTEM PANEL */}
        <section className="md:col-span-3 border-l border-slate-100 bg-slate-50/30 flex flex-col h-full overflow-hidden relative">
          
          {/* ELEGANT BLUR OVERLAY FOR NON-PREMIUM USERS */}
          {!isPremium && (
            <div className="absolute inset-0 z-10 bg-slate-100/65 backdrop-blur-md flex flex-col items-center justify-center p-5 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-purple-500/10">
                <Lock className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-md font-bold tracking-tight text-slate-900">
                  AI Research Ecosystem locked
                </h4>
                <p className="text-[10px] text-slate-550 leading-relaxed font-bold px-2">
                  Upgrade your account to Principal Investigator privileges to unlock RAG Literature Reviews, Hypothesis Robustness evaluations, and dynamic Milestone calculations directly inside active lab clusters.
                </p>
              </div>

              <div className="border border-slate-200/80 rounded-2xl p-3 bg-white w-full space-y-2 max-w-[200px]">
                <div className="flex items-center gap-1 text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  <span>Premium Benefit</span>
                </div>
                <div className="text-[9px] font-sans font-extrabold text-slate-700">
                   ● 4 Concurrent Joint Labs<br/>
                   ● Multi-Author AI co-pilot<br/>
                   ● Unrestricted matcher swipes
                </div>
              </div>

              <p className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                Click Upgrade in top nav bar to unlock
              </p>
            </div>
          )}

          {/* ACTIVE ASSISTANT SUITE (UNBLURRED FOR PREMIUMS) */}
          <div className="p-4 border-b border-slate-205 bg-white flex-shrink-0">
            <h3 className="font-sans font-black text-xs text-indigo-950 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse fill-amber-500" />
              <span>AI Workspace Assistant</span>
            </h3>
            <p className="text-[9px] text-slate-400 mt-0.5 font-bold">
              Dynamic multi-author project co-pilot tools
            </p>
          </div>

          {/* Tabs header for AI features */}
          <div className="grid grid-cols-3 text-center border-b border-slate-100 flex-shrink-0">
            <button
              onClick={() => { setAiActiveTab("summarizer"); setAiOutputText(""); }}
              className={`py-2 text-[9px] font-mono uppercase font-black tracking-wider transition cursor-pointer ${
                aiActiveTab === "summarizer" ? "bg-white text-indigo-700 font-extrabold border-b-2 border-indigo-700" : "text-slate-400"
              }`}
            >
              RAG Sum
            </button>
            <button
              onClick={() => { setAiActiveTab("outliner"); setAiOutputText(""); }}
              className={`py-2 text-[9px] font-mono uppercase font-black tracking-wider transition cursor-pointer ${
                aiActiveTab === "outliner" ? "bg-white text-indigo-700 font-extrabold border-b-2 border-indigo-700" : "text-slate-400"
              }`}
            >
              Evaluate Case
            </button>
            <button
              onClick={() => { setAiActiveTab("milestone"); setAiOutputText(""); }}
              className={`py-2 text-[9px] font-mono uppercase font-black tracking-wider transition cursor-pointer ${
                aiActiveTab === "milestone" ? "bg-white text-indigo-700 font-extrabold border-b-2 border-indigo-700" : "text-slate-400"
              }`}
            >
              Milestones
            </button>
          </div>

          {/* AI Task Area */}
          <div className="flex-1 p-4 flex flex-col justify-between overflow-hidden">
            <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-380px)]">
              {aiActiveTab === "summarizer" && (
                <div className="space-y-3">
                  <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-sm space-y-1.5">
                    <h4 className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                      <span>RAG Literature Summarizer</span>
                    </h4>
                    <p className="text-[9px] text-slate-500 leading-relaxed font-semibold">
                      Perform vector spatial intersections against shared manuscrips inside this workspace channel folder index.
                    </p>
                  </div>
                  <button
                    onClick={triggerSummarizer}
                    disabled={aiRunning || !activeWorkspace}
                    className="w-full py-1.5 rounded-lg bg-[#0f172a] text-white hover:bg-slate-800 text-[10px] font-mono font-black border-none uppercase cursor-pointer"
                  >
                    {aiRunning ? "Mapping Embeddings..." : "▶ Compile citation summaries"}
                  </button>
                </div>
              )}

              {aiActiveTab === "outliner" && (
                <div className="space-y-3">
                  <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-sm space-y-1.5">
                    <h4 className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                      <ClipboardList className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Hypothesis Evaluator</span>
                    </h4>
                    <p className="text-[9px] text-slate-500 leading-relaxed font-semibold">
                      Assess the current active hypothesis against simulated journal guidelines.
                    </p>
                  </div>
                  <button
                    onClick={triggerOutliner}
                    disabled={aiRunning || !activeWorkspace}
                    className="w-full py-1.5 rounded-lg bg-[#0f172a] text-white hover:bg-slate-800 text-[10px] font-mono font-black border-none uppercase cursor-pointer"
                  >
                    {aiRunning ? "Evaluating Hypothesis..." : "▶ Measure claim strength"}
                  </button>
                </div>
              )}

              {aiActiveTab === "milestone" && (
                <div className="space-y-3">
                  <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-sm space-y-1.5">
                    <h4 className="text-[10px] font-bold text-slate-800 flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Suggested Milestones</span>
                    </h4>
                    <p className="text-[9px] text-slate-500 leading-relaxed font-semibold">
                      Chart dynamic academic tasks for active authors inside the workspace to align efforts.
                    </p>
                  </div>
                  <button
                    onClick={triggerMilestone}
                    disabled={aiRunning || !activeWorkspace}
                    className="w-full py-1.5 rounded-lg bg-[#0f172a] text-white hover:bg-slate-800 text-[10px] font-mono font-black border-none uppercase cursor-pointer"
                  >
                    {aiRunning ? "Predicting Roadmaps..." : "▶ Predict Next Milestones"}
                  </button>
                </div>
              )}

              {/* Console log Output panel */}
              {aiOutputText && (
                <div className="space-y-1">
                  <span className="text-[8px] font-mono uppercase tracking-widest text-slate-400 px-1 font-black">AI Terminal Console</span>
                  <div className="bg-slate-900 text-slate-100 rounded-xl p-3 border border-slate-850 shadow-inner max-h-[140px] overflow-y-auto">
                    <pre className="font-mono text-[9px] font-normal leading-relaxed whitespace-pre-wrap">
                      {aiOutputText}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Folder Shared Assets lists at the bottom of panel */}
            <div className="border-t border-slate-100 pt-3 space-y-1.5" id="nav-workspace-shared-files">
              <div className="flex justify-between items-center px-1">
                <span className="text-[8px] font-mono uppercase tracking-widest text-slate-400 font-black">Workspace Files</span>
                <span className="text-[8px] font-mono text-indigo-600 font-extrabold">{sharedFiles.length} files</span>
              </div>
              <div className="space-y-1.5 max-h-[100px] overflow-y-auto">
                {sharedFiles.map((f, i) => (
                  <div key={i} className="flex justify-between items-center p-1.5 bg-white border border-slate-150 rounded-lg text-[9px] font-semibold text-slate-650">
                    <span className="truncate max-w-[130px] font-sans text-slate-800">{f.name}</span>
                    <span className="font-mono text-[8px] text-slate-400 bg-slate-50 px-1 rounded whitespace-nowrap">{f.size}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
