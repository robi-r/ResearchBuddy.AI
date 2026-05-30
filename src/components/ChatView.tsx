import React, { useState, useEffect, useRef } from "react";
import { Check, Send, Paperclip, FileText, PlusCircle, CheckSquare, Square, FolderOpen, ArrowLeft, MoreVertical, MessageSquare } from "lucide-react";
import { Match, Message } from "../types";
import { motion } from "motion/react";

interface ChatViewProps {
  currentUser: any;
  activeMatches: Match[];
}

export function ChatView({ currentUser, activeMatches }: ChatViewProps) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(activeMatches[0] || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "intel">("chat");
  const [uploadToast, setUploadToast] = useState<string | null>(null);

  // Files attachment library lists state simulation
  const [files, setFiles] = useState([
    { name: "Draft_Protocol_V3.pdf", size: "1.8 MB", date: "Just now", color: "text-rose-500" },
    { name: "Validation_Dataset_Sim.csv", size: "740 KB", date: "2h ago", color: "text-emerald-500" }
  ]);

  // Tasks verification list
  const [tasks, setTasks] = useState([
    { id: "t1", text: "Validate scaling factors in model layers", done: false },
    { id: "t2", text: "Review journal co-authorship guidelines", done: false },
    { id: "t3", text: "Commit model weights to local cluster", done: true }
  ]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async (matchId: string) => {
    setLoadingMsgs(true);
    try {
      const response = await fetch(`/api/chat/messages?matchId=${matchId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Failed to load conversation logs:", err);
    } finally {
      setLoadingMsgs(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  useEffect(() => {
    if (selectedMatch) {
      fetchMessages(selectedMatch.matchId);
    } else if (activeMatches.length > 0) {
      setSelectedMatch(activeMatches[0]);
    } else {
      setSelectedMatch(null);
    }
  }, [selectedMatch, activeMatches]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedMatch) return;
    const bodyText = inputValue;
    setInputValue("");

    // Temporary optimistic insert to guarantee zero latency feeling
    const tempMsg: Message = {
      id: `temp_${Date.now()}`,
      matchId: selectedMatch.matchId,
      senderId: currentUser?.id || "You",
      senderName: currentUser?.name || "You",
      text: bodyText,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);
    setTimeout(scrollToBottom, 50);

    try {
      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: selectedMatch.matchId, text: bodyText }),
      });

      if (response.ok) {
        // Poll for fresh message log list (including potential simulated response) shortly after
        setTimeout(() => {
          fetchMessages(selectedMatch.matchId);
        }, 1500);
      }
    } catch (err) {
      console.error("Error sending response message:", err);
    }
  };

  // Document upload simulation
  const handleUploadFile = () => {
    const filename = `Dataset_Index_Collab_${Math.floor(Math.random() * 80) + 10}.csv`;
    const newFile = {
      name: filename,
      size: "420 KB",
      date: "Just now",
      color: "text-emerald-500"
    };
    setFiles(prev => [...prev, newFile]);
    setUploadToast(`"${filename}" successfully synchronized and cataloged in your active workspace.`);
    setTimeout(() => setUploadToast(null), 4000);
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: !t.done } : t));
  };

  return (
    <div className="max-w-6xl mx-auto py-2 px-4 animate-fade-in pb-16">
      <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm grid grid-cols-1 md:grid-cols-12 h-[calc(100vh-160px)] overflow-hidden relative">
        
        {/* Toast Alert Notice for standard attachments feedback */}
        {uploadToast && (
          <div className="absolute top-4 right-4 bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-3 text-xs font-semibold z-50 flex items-center justify-between gap-3 shadow-2xl animate-slide-in max-w-sm">
            <span>{uploadToast}</span>
            <button onClick={() => setUploadToast(null)} className="text-slate-400 hover:text-white px-2 py-0.5 font-bold cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* LEFT PANEL: ACTIVE MATCHED PARTNERS list (MAX 2 items) */}
        <section className="md:col-span-4 border-r border-slate-200 bg-slate-50/50 flex flex-col h-full">
          <div className="p-4 border-b border-slate-200 bg-white">
            <h3 className="font-sans font-black text-xs text-slate-850 uppercase tracking-wider">Matched Channels (Max 2)</h3>
            <p className="text-[10px] text-slate-400 font-medium">Click a collaborator to open workspace</p>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {activeMatches.length === 0 ? (
              <div className="py-12 px-4 text-center text-slate-400 space-y-2">
                <FolderOpen className="w-5 h-5 text-slate-300 mx-auto" />
                <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Lock slots vacant</p>
                <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
                  No active co-authors bound yet. Explore available peers on the Discovery page to unlock.
                </p>
              </div>
            ) : (
              activeMatches.map((m) => {
                const isActive = selectedMatch?.matchId === m.matchId;
                return (
                  <div
                    key={m.matchId}
                    onClick={() => setSelectedMatch(m)}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer duration-150 ${
                      isActive
                        ? "bg-[#0f172a] border-[#0f172a] text-white shadow"
                        : "bg-white border-slate-205 text-slate-900 hover:border-slate-350"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden flex-shrink-0 bg-slate-100">
                      <img src={m.partner.avatar} alt={m.partner.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-0.5 overflow-hidden flex-grow">
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-sans font-extrabold text-xs truncate max-w-[120px]">{m.partner.name}</h4>
                        <span className={`text-[8px] font-mono leading-none ${isActive ? "text-slate-300 animate-pulse" : "text-slate-400"}`}>
                          ● connected
                        </span>
                      </div>
                      <p className={`text-[10px] font-semibold truncate ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                        {m.partner.field}
                      </p>
                      <p className={`text-[9px] font-medium truncate ${isActive ? "text-slate-400" : "text-slate-400"}`}>
                        {m.partner.institution}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* RIGHT PANEL: LIVE CHAT AND INTERACTION WORKSPACE */}
        <section className="md:col-span-8 flex flex-col h-full bg-white">
          {selectedMatch ? (
            <div className="flex flex-col h-full overflow-hidden">
              
              {/* Workspace Selector Bar headers */}
              <nav className="flex px-4 pt-3 border-b border-slate-200 bg-white justify-between items-center flex-shrink-0">
                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveTab("chat")}
                    className={`pb-2.5 font-sans text-xs font-black border-b-2 px-1 focus:outline-none transition-all cursor-pointer ${
                      activeTab === "chat"
                        ? "border-slate-900 text-slate-900"
                        : "border-transparent text-slate-400 hover:text-slate-850"
                    }`}
                  >
                    Workspace Chat
                  </button>
                  <button
                    onClick={() => setActiveTab("intel")}
                    className={`pb-2.5 font-sans text-xs font-black border-b-2 px-1 focus:outline-none transition-all cursor-pointer ${
                      activeTab === "intel"
                        ? "border-slate-900 text-slate-900"
                        : "border-transparent text-slate-400 hover:text-slate-850"
                    }`}
                  >
                    Shared Documents & Tasks
                  </button>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 shadow-sm leading-none">
                  Synergy 94%
                </div>
              </nav>

              {/* VIEW 1: CHAT TIMELINE STREAM */}
              {activeTab === "chat" && (
                <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
                  {/* Messages log */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loadingMsgs && messages.length === 0 ? (
                      <div className="flex items-center justify-center p-12">
                        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      messages.map((msg, i) => {
                        const isMe = msg.senderId === currentUser?.id;
                        return (
                          <div
                            key={msg.id || i}
                            className={`flex gap-3 items-start max-w-[85%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                          >
                            <div className="w-8 h-8 rounded-full border border-slate-200 overflow-hidden bg-slate-100 flex-shrink-0">
                              <img
                                src={isMe ? currentUser?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop" : selectedMatch.partner.avatar}
                                alt={msg.senderName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="space-y-1">
                              <div className={`flex items-baseline gap-1.5 ${isMe ? "flex-row-reverse" : ""}`}>
                                <span className="text-[10px] font-bold text-slate-800 leading-none">{msg.senderName}</span>
                                <span className="text-[8px] font-bold text-slate-400 opacity-80 leading-none">
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div
                                className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed shadow-sm ${
                                  isMe
                                    ? "bg-[#0f172a] text-white rounded-tr-none"
                                    : "bg-white border border-slate-200 text-slate-700 rounded-tl-none"
                                }`}
                              >
                                {msg.text}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Message Input container */}
                  <div className="p-3.5 bg-white border-t border-slate-200 flex gap-2">
                    <div className="flex-grow flex items-center bg-slate-50 border border-slate-200 focus-within:border-slate-800 rounded-xl px-3 py-1 gap-2">
                      <button className="text-slate-400 hover:text-slate-800 p-1 flex items-center justify-center bg-transparent border-none cursor-pointer">
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <input
                        type="text"
                        placeholder="Compose message... [Submit triggers live partner simulation answer]"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        className="w-full bg-transparent border-none text-xs font-semibold font-sans focus:outline-none focus:ring-0 py-2.5 text-slate-800"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="bg-[#0f172a] text-white p-2.5 rounded-lg flex items-center justify-center hover:bg-slate-800 transition-all border-none cursor-pointer scale-100 active:scale-95 duration-100"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 2: COLLABORATIVE FILES AND TASKS INTEL */}
              {activeTab === "intel" && (
                <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50 space-y-6">
                  {/* Task list Tracker */}
                  <section className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-emerald-500" />
                        <h4 className="font-sans font-black text-xs text-slate-850 uppercase tracking-widest leading-none">Joint Research Milestones</h4>
                      </div>
                      <span className="text-[10px] font-extrabold bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded">
                        {tasks.filter(t => t.done).length} / {tasks.length} Completed
                      </span>
                    </div>

                    <div className="space-y-2 pt-1 font-semibold text-xs">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => toggleTask(task.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer duration-100 ${
                            task.done
                              ? "bg-slate-50 border-slate-200 text-slate-400 opacity-60"
                              : "bg-white border-slate-200 hover:border-slate-400 text-slate-800"
                          }`}
                        >
                          <button className="border-none bg-transparent p-0 flex items-center justify-center">
                            {task.done ? (
                              <CheckSquare className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                          <span className={task.done ? "line-through" : ""}>{task.text}</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Shared materials list */}
                  <section className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-5 h-5 text-slate-800" />
                        <h4 className="font-sans font-black text-xs text-slate-850 uppercase tracking-widest leading-none">Shared Materials & Models</h4>
                      </div>
                      <button
                        onClick={handleUploadFile}
                        className="text-[10px] bg-[#0f172a] hover:bg-[#1e293b] text-white px-3 py-1.5 font-bold rounded-lg border-none flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {files.map((file, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between h-24 hover:border-slate-400 duration-150 relative shadow-sm">
                          <FileText className={`w-5 h-5 ${file.color}`} />
                          <div className="space-y-0.5 mt-2">
                            <span className="text-xs font-bold text-slate-800 block truncate">{file.name}</span>
                            <span className="text-[10px] text-slate-400 block font-semibold">{file.size} • {file.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
              <MessageSquare className="w-12 h-12 text-slate-300" />
              <div className="space-y-1">
                <h3 className="font-sans font-bold text-sm text-slate-800">No Chat Channel Open</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-normal">
                  Select an active matched co-author from the left panel to initialize your project discussion and milestone synchronization track.
                </p>
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
