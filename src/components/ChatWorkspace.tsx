import React, { useState } from "react";
import { MessageSquare, Folder, Award, FileText, Send, CheckSquare, Square, Check, Clipboard, Search, PlusCircle, Paperclip } from "lucide-react";
import { Profile, MatchRequest } from "../types";

interface ChatWorkspaceProps {
  profile: Profile;
  userProfile?: MatchRequest;
  onBack: () => void;
}

interface Message {
  sender: string;
  senderRole: string;
  avatar?: string;
  text: string;
  time: string;
  isAi?: boolean;
  actions?: Array<{ label: string; id: string }>;
}

export function ChatWorkspace({ profile, userProfile, onBack }: ChatWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "intel">("chat");
  const [inputValue, setInputValue] = useState("");
  const [uploadToast, setUploadToast] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: profile.name,
      senderRole: profile.role,
      avatar: profile.avatar,
      text: "I've just uploaded the Quantum_Model_V2.pdf draft. It includes the revised calibration data from Batch 04.",
      time: "10:42 AM"
    },
    {
      sender: "Jordan S.",
      senderRole: "Lab Consultant",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop",
      text: "Great. Does this affect the ethics board submission? We need that finalized before the weekend.",
      time: "10:45 AM"
    },
    {
      sender: "ResearchBuddy AI",
      senderRole: "Assistant",
      text: "I've analyzed the new model. Calibration data for Batch 04 shows a 12% improvement in hypothesis stability. Would you like me to update the Milestone Tracker?",
      time: "Just now",
      isAi: true,
      actions: [
        { label: "Update Tracker", id: "update_tracker" },
        { label: "Explain Stats", id: "explain_stats" }
      ]
    }
  ]);

  // Project Intel checklist state
  const [tasks, setTasks] = useState([
    { id: 1, text: "Finalize Literature Review", done: true },
    { id: 2, text: "Run Batch 04 simulations", done: false },
    { id: 3, text: "Ethics Board Approval Submission", done: false }
  ]);

  // Milestone tracking percentages
  const [milestones, setMilestones] = useState([
    { name: "Data Collection", date: "Completed Jun 12", done: true, progress: 100 },
    { name: "Hypothesis Testing", date: "In Progress", done: false, progress: 78 },
    { name: "Paper Drafting", date: "Pending", done: false, progress: 0 }
  ]);

  // Uploaded files list
  const [files, setFiles] = useState([
    { name: "Quantum_Model_V2.pdf", size: "2.4 MB", date: "2h ago", color: "text-rose-500" },
    { name: "Batch_04_Results.csv", size: "15 KB", date: "5h ago", color: "text-emerald-500" },
    { name: "Ethical_Protocol.docx", size: "48 KB", date: "Yesterday", color: "text-blue-500" }
  ]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const userMsg: Message = {
      sender: userProfile?.name || "You",
      senderRole: userProfile?.background || "Teammate",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop",
      text: inputValue,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");

    // Simulate conversational AI response
    setTimeout(() => {
      const isAskingTracker = inputValue.toLowerCase().includes("tracker") || inputValue.toLowerCase().includes("milestone") || inputValue.toLowerCase().includes("update");
      
      let aiText = `Understood. I've logged your message in our research thread with ${profile.name.split(" ")[1]}. Is there anything else you want to edit inside our manuscript draft?`;
      if (isAskingTracker) {
        aiText = "Acknowledge! I have recalculated our neural alignment simulations and marked 'Hypothesis Testing' up to 84%. I will compile a PDF draft of the updated tracker progress.";
        setMilestones(prev => prev.map(m => m.name === "Hypothesis Testing" ? { ...m, progress: 84 } : m));
      }

      setMessages(prev => [...prev, {
        sender: "ResearchBuddy AI",
        senderRole: "Assistant",
        text: aiText,
        time: "Just now",
        isAi: true
      }]);
    }, 1200);
  };

  const handleAction = (actionId: string) => {
    if (actionId === "update_tracker") {
      setMilestones(prev => prev.map(m => m.name === "Hypothesis Testing" ? { ...m, progress: 100, done: true, date: "Completed Today" } : m));
      setTasks(prev => prev.map(t => t.id === 2 ? { ...t, done: true } : t));
      
      setMessages(prev => [...prev, {
        sender: "ResearchBuddy AI",
        senderRole: "Assistant",
        text: "Tracker updated successfully! Milestone 'Hypothesis Testing' has been set to 100% and 'Run Batch 04 simulations' task has been checked.",
        time: "Just now",
        isAi: true
      }]);
    } else if (actionId === "explain_stats") {
      setMessages(prev => [...prev, {
        sender: "ResearchBuddy AI",
        senderRole: "Assistant",
        text: "Statistical Overview: Batch 04 simulations achieved spatial stability peaks under high-dimensional attention modeling, improving mean absolute decay error from 0.045 to 0.038. This makes the model compliant under international academic verification bounds.",
        time: "Just now",
        isAi: true
      }]);
    }
  };

  const toggleTask = (taskId: number) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: !t.done } : t));
  };

  const simulateUpload = () => {
    const freshFile = {
      name: `Sim_Spectrum_Analysis_${Math.floor(Math.random() * 90) + 10}.csv`,
      size: "180 KB",
      date: "Just now",
      color: "text-emerald-500"
    };
    setFiles(prev => [...prev, freshFile]);
    setUploadToast(`"${freshFile.name}" successfully uploaded & mapped to distance vectors.`);
    setTimeout(() => {
      setUploadToast(null);
    }, 4000);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)] bg-slate-50 relative">
      {/* Selector Header workspace tabs */}
      <nav className="flex px-4 pt-3 border-b border-slate-200 bg-white justify-between items-center rounded-t-2xl shadow-sm">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("chat")}
            className={`pb-2.5 font-sans text-xs font-bold border-b-2 px-1 focus:outline-none transition-all cursor-pointer ${
              activeTab === "chat"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-800"
            }`}
            id="workspace-chat-tab"
          >
            Chat Forum
          </button>
          <button
            onClick={() => setActiveTab("intel")}
            className={`pb-2.5 font-sans text-xs font-bold border-b-2 px-1 focus:outline-none transition-all cursor-pointer ${
              activeTab === "intel"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-800"
            }`}
            id="workspace-intel-tab"
          >
            Project Intel
          </button>
        </div>
        <button
          onClick={onBack}
          className="text-xs text-slate-700 font-bold border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 duration-150 cursor-pointer"
          id="exit-workspace-btn"
        >
          Exit Workspace
        </button>
      </nav>

      {/* Main Container Panel Body */}
      <div className="flex-1 overflow-hidden relative">
        {/* Floating Upload Notification instead of window.alert */}
        {uploadToast && (
          <div className="absolute top-4 left-4 right-4 bg-slate-900 text-white border border-slate-800 rounded-xl px-4 py-3 text-xs font-medium shadow-2xl z-50 flex items-center justify-between animate-slide-in">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{uploadToast}</span>
            </div>
            <button
              onClick={() => setUploadToast(null)}
              className="text-slate-400 hover:text-white px-2 py-1 font-bold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* VIEW 1: CHAT FEED */}
        <div
          className={`absolute inset-0 flex flex-col transition-all duration-300 ${
            activeTab === "chat" ? "opacity-100 translate-x-0" : "opacity-0 pointer-events-none translate-x-[-20px]"
          }`}
        >
          {/* Scrollable Chat Area */}
          <div className="flex-grow overflow-y-auto p-4 space-y-5 bg-slate-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 items-start max-w-[85%] ${msg.sender === "You" ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                {/* Avatar */}
                {msg.sender === "ResearchBuddy AI" ? (
                  <div className="w-9 h-9 rounded-lg bg-[#0f172a] flex items-center justify-center text-white shadow shadow-slate-900/10 flex-shrink-0 border border-slate-800">
                    <span className="material-symbols-outlined text-[18px] text-emerald-400">auto_awesome</span>
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 bg-white flex-shrink-0">
                    <img src={msg.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop"} alt={msg.sender} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Body Text Card */}
                <div className="flex flex-col gap-1">
                  <div className={`flex items-baseline gap-2 ${msg.sender === "You" ? "flex-row-reverse" : ""}`}>
                    <span className={`text-xs font-bold font-sans ${msg.isAi ? "text-emerald-600" : "text-slate-800"}`}>
                      {msg.sender}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold opacity-80">
                      {msg.time}
                    </span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed ${
                      msg.isAi
                        ? "bg-slate-900 text-slate-100 rounded-tl-none shadow border border-slate-800"
                        : msg.sender === "You"
                        ? "bg-[#0f172a] text-white rounded-tr-none"
                        : "bg-white border border-slate-200 rounded-tl-none shadow-sm text-slate-700"
                    }`}
                  >
                    <p className="font-sans">{msg.text}</p>
                    
                    {/* Render action items for AI helper */}
                    {msg.actions && (
                      <div className="mt-3 flex gap-1.5 flex-wrap">
                        {msg.actions.map((act) => (
                          <button
                            key={act.id}
                            onClick={() => handleAction(act.id)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-lg text-[10px] font-sans font-bold transition-all border-none cursor-pointer"
                          >
                            {act.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Typing Input Box Footer */}
          <div className="p-3 bg-white border-t border-slate-200 flex gap-2 rounded-b-2xl shadow-inner z-10">
            <div className="flex-grow flex items-center bg-slate-50 border border-slate-200 focus-within:border-slate-800 rounded-xl px-3 py-1 gap-2">
              <button className="text-slate-400 hover:text-slate-800 transition-colors p-1 flex items-center justify-center">
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                type="text"
                placeholder="Discuss simulation calibration data..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="w-full bg-transparent border-none text-xs font-medium font-sans focus:outline-none focus:ring-0 p-1.5 text-slate-800"
              />
              <button
                onClick={handleSendMessage}
                className="bg-[#0f172a] text-white p-2 rounded-lg flex items-center justify-center hover:bg-slate-800 transition-all shadow-sm active:scale-95 border-none cursor-pointer"
                id="send-message-btn"
              >
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* VIEW 2: PROJECT INTEL PANEL */}
        <div
          className={`absolute inset-0 overflow-y-auto p-4 space-y-6 transition-all duration-300 ${
            activeTab === "intel" ? "opacity-100 translate-x-0" : "opacity-0 pointer-events-none translate-x-[20px]"
          }`}
        >
          {/* Milestone Tracker Section */}
          <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-emerald-500">reorder</span>
              <h3 className="font-sans font-extrabold text-xs text-slate-850 uppercase tracking-wider">Milestone Progress Core</h3>
            </div>
            <div className="space-y-4 pt-1">
              {milestones.map((m, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                        m.progress === 100
                          ? "bg-emerald-50 border-emerald-500 text-emerald-600"
                          : "border-slate-300 bg-white text-slate-700"
                      }`}
                    >
                      {m.progress === 100 ? <Check className="w-3.5 h-3.5" /> : <span>{index + 1}</span>}
                    </div>
                    {index < milestones.length - 1 && <div className="w-[1px] h-10 bg-slate-200 mt-1" />}
                  </div>
                  <div className="flex-grow pb-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-xs font-bold font-sans ${m.done ? "text-slate-405 line-through" : "text-slate-800"}`}>
                          {m.name}
                        </span>
                        <p className="text-[10px] text-slate-400 font-bold">{m.date}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-705">{m.progress}%</span>
                    </div>
                    {/* Linear progress bar */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${m.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Checklist Task Manager */}
          <section className="space-y-3">
            <div className="flex justify-between items-center bg-transparent">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-slate-800">checklist</span>
                <h3 className="font-sans font-extrabold text-xs text-slate-850 uppercase tracking-wider">Research Tasks Grid</h3>
              </div>
              <span className="text-xs font-bold text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-205">
                {tasks.filter(t => t.done).length} / {tasks.length} Done
              </span>
            </div>

            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-150 ${
                    task.done
                      ? "bg-slate-50 border-slate-200 opacity-60"
                      : "bg-white border-slate-200 shadow-sm hover:border-slate-400"
                  }`}
                >
                  <button className="border-none bg-transparent p-0 text-slate-700">
                    {task.done ? (
                      <CheckSquare className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  <span className={`text-xs font-sans font-semibold ${task.done ? "line-through text-slate-400" : "text-slate-800"}`}>
                    {task.text}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Shared Files Repository */}
          <section className="space-y-3">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-slate-800">folder_open</span>
              <h3 className="font-sans font-extrabold text-xs text-slate-850 uppercase tracking-wider">Shared Manuscripts Library</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {files.map((file, idx) => (
                <div key={idx} className="bg-white border border-slate-200 hover:border-slate-400 duration-150 rounded-xl p-3 flex flex-col justify-between h-24 shadow-sm cursor-pointer">
                  <FileText className={`w-5 h-5 ${file.color}`} />
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 block truncate">{file.name}</span>
                    <span className="text-[10px] text-slate-400 block font-semibold opacity-85">{file.size} • {file.date}</span>
                  </div>
                </div>
              ))}

              {/* simulated upload card target with dynamic file generation state update instead of alert */}
              <div
                onClick={simulateUpload}
                className="bg-slate-50 border-2 border-dashed border-slate-200 hover:border-slate-800 hover:bg-white duration-150 rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 h-24 cursor-pointer"
              >
                <PlusCircle className="w-5 h-5 text-slate-400" />
                <span className="text-xs font-bold text-slate-500">Upload File</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
