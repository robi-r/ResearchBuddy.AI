import React, { useState, useEffect } from "react";
import { GraduationCap, Send, PlusCircle, MessageSquare, Award, Orbit, Info, Lightbulb, Sparkles } from "lucide-react";

interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

interface SharedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorInstitution: string;
  title: string;
  field: string;
  abstract: string;
  collabGoal: string;
  upvotes: number;
  upvotedByIds: string[];
  createdAt: string;
  comments: Comment[];
}

interface DiscoveryViewProps {
  currentUser: any;
  onViewProfile?: (id: string) => void;
}

export function DiscoveryView({ currentUser, onViewProfile }: DiscoveryViewProps) {
  const [posts, setPosts] = useState<SharedPost[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Post Creator form
  const [showCreator, setShowCreator] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newField, setNewField] = useState("");
  const [newAbstract, setNewAbstract] = useState("");
  const [newCollabGoal, setNewCollabGoal] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // AI Ideas Spark Generator state
  const [ideasMode, setIdeasMode] = useState<"discover" | "improve">("discover");
  const [ideasConcept, setIdeasConcept] = useState("");
  const [ideasResult, setIdeasResult] = useState("");
  const [ideasRunning, setIdeasRunning] = useState(false);
  const [showIncubator, setShowIncubator] = useState(false);

  // Comments state per post Id
  const [commentTextMap, setCommentTextMap] = useState<{ [postId: string]: string }>({});

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/discovery/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error("Failed to fetch discovery posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newField || !newAbstract) {
      alert("Please enter a Title, Field, and Project Abstract.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/discovery/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          field: newField,
          abstract: newAbstract,
          collabGoal: newCollabGoal
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPosts([data.post, ...posts]);
        // Reset
        setNewTitle("");
        setNewField("");
        setNewAbstract("");
        setNewCollabGoal("");
        setShowCreator(false);
      }
    } catch (err) {
      console.error("Creating project failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (postId: string) => {
    try {
      const response = await fetch("/api/discovery/posts/upvote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId })
      });

      if (response.ok) {
        const data = await response.json();
        
        setPosts(posts.map(post => {
          if (post.id === postId) {
            const hasUpvoted = post.upvotedByIds.includes(currentUser?.id || "session_host");
            const updatedUpvotedIds = hasUpvoted
              ? post.upvotedByIds.filter(id => id !== (currentUser?.id || "session_host"))
              : [...post.upvotedByIds, (currentUser?.id || "session_host")];
            
            return {
              ...post,
              upvotes: data.upvotes,
              upvotedByIds: updatedUpvotedIds
            };
          }
          return post;
        }));
      }
    } catch (err) {
      console.error("Upvoting research post failed:", err);
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = commentTextMap[postId];
    if (!text || !text.trim()) return;

    try {
      const response = await fetch("/api/discovery/posts/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, text })
      });

      if (response.ok) {
        const data = await response.json();
        
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [...post.comments, data.comment]
            };
          }
          return post;
        }));

        setCommentTextMap({
          ...commentTextMap,
          [postId]: ""
        });
      }
    } catch (err) {
      console.error("Post comment failed:", err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Are you sure you want to permanently remove this representative research abstract from the cluster discovery feed?")) {
      return;
    }

    try {
      const response = await fetch("/api/discovery/posts/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId })
      });

      if (response.ok) {
        setPosts(posts.filter(p => p.id !== postId));
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete post");
      }
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-4 px-4 space-y-6 animate-fade-in pb-20">
      {/* Tab Header Banner */}
      <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-10">
          <Orbit className="w-64 h-64 text-indigo-100" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full w-fit">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300">Scholarly Workspace</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight leading-none text-slate-50">Co-Author Discovery</h2>
          <p className="text-xs text-slate-300 font-medium max-w-md leading-relaxed">
            Publish ongoing project abstracts, draft papers, or open publications. Call for peer review or query specialized teams directly in the cluster feed.
          </p>
        </div>
      </div>

      {/* AI RESEARCH IDEA SPARK & INCUBATOR GENERATOR */}
      <div className="bg-slate-50 border border-slate-205 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-805">
            <Lightbulb className="w-5 h-5 text-indigo-600 animate-pulse" />
            <div>
              <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">AI Idea Spark Tool</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide leading-none">Discover or Improve academic ideas</p>
            </div>
          </div>
          <button
            onClick={() => setShowIncubator(!showIncubator)}
            className="text-xs font-black text-indigo-600 bg-white border border-slate-200 hover:bg-slate-100 px-3 py-1 rounded-xl shadow-xs cursor-pointer duration-150"
            type="button"
          >
            {showIncubator ? "Hide Tool" : "Open Incubator"}
          </button>
        </div>

        {showIncubator && (
          <div className="space-y-4 pt-1 animate-fade-in">
            {/* Mode Selector */}
            <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => { setIdeasMode("discover"); setIdeasResult(""); }}
                className={`flex-1 py-1.5 text-[9px] font-mono font-black uppercase rounded-lg border-none cursor-pointer duration-100 ${
                  ideasMode === "discover" ? "bg-white text-indigo-700 shadow-xs animate-fade-in" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Discover Concept
              </button>
              <button
                type="button"
                onClick={() => { setIdeasMode("improve"); setIdeasResult(""); }}
                className={`flex-1 py-1.5 text-[10px] font-mono font-black uppercase rounded-lg border-none cursor-pointer duration-100 ${
                  ideasMode === "improve" ? "bg-white text-indigo-700 shadow-xs animate-fade-in" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Improve / Polish Draft
              </button>
            </div>

            <div className="space-y-2">
              <label htmlFor="incubator-concept" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {ideasMode === "discover" ? "Concept Field/Domain" : "Your Draft Project Abstract/Hypothesis"}
              </label>
              <textarea
                id="incubator-concept"
                placeholder={
                  ideasMode === "discover" 
                    ? "e.g. Spatio-temporal graph networks, continuous fluid dynamics, carbon prediction..."
                    : "e.g. Paste your draft study concept outline to receive constructive upgrades & suggestions..."
                }
                value={ideasConcept}
                onChange={(e) => setIdeasConcept(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl p-3 text-xs outline-none focus:border-slate-800 focus:bg-white text-slate-900 font-semibold shadow-2xs font-sans"
                rows={3}
              />
            </div>

            <button
              type="button"
              onClick={async () => {
                setIdeasRunning(true);
                setIdeasResult("");
                try {
                  const response = await fetch("/api/ai/ideas", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ concept: ideasConcept, mode: ideasMode })
                  });
                  if (response.ok) {
                    const data = await response.json();
                    setIdeasResult(data.result);
                  } else {
                    const errData = await response.json();
                    setIdeasResult(`Error requesting Spark: ${errData.error || "Please try again later."}`);
                  }
                } catch (err) {
                  console.error(err);
                  setIdeasResult("Network error. Please try again.");
                } finally {
                  setIdeasRunning(false);
                }
              }}
              disabled={ideasRunning}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-mono font-black uppercase cursor-pointer border-none shadow duration-150 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-white fill-white" />
              <span>{ideasRunning ? "Sieving data archives..." : ideasMode === "discover" ? "Generate Cutting-edge Ideas" : "Peer Review & Polish"}</span>
            </button>

            {/* Generated results console */}
            {ideasResult && (
              <div className="space-y-1.5 animate-fade-in pt-1">
                <span className="text-[8.5px] font-mono uppercase tracking-widest text-slate-400 font-extrabold block">AI Spark Output</span>
                <div className="bg-slate-950 border border-slate-800 p-4.5 rounded-2xl text-slate-100 text-xs font-mono leading-relaxed whitespace-pre-wrap max-h-[280px] overflow-y-auto shadow-inner">
                  {ideasResult}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Share / Creative publishing trigger box */}
      {!showCreator ? (
        <button
          onClick={() => setShowCreator(true)}
          className="w-full bg-white border border-dashed border-slate-300 hover:border-slate-900 rounded-2xl p-4 flex items-center justify-between text-left transition duration-150 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <PlusCircle className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-xs font-bold text-slate-900">Publish Ongoing Research Spec / Draft</p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Open to semantic search and handshakes</p>
            </div>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">Draft Post</span>
        </button>
      ) : (
        <form onSubmit={handleCreatePost} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">Draft New Research Abstract</h3>
            <button
              type="button"
              onClick={() => setShowCreator(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold border-none bg-transparent cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider" htmlFor="new-title">
                Research Project Title
              </label>
              <input
                type="text"
                id="new-title"
                placeholder="e.g. Nonlinear Dynamics in Distributed Graph State Databases"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 outline-none focus:border-slate-950 focus:bg-white transition-all text-xs text-slate-900 font-sans font-semibold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider" htmlFor="new-field">
                  Domain Field / Badges
                </label>
                <input
                  type="text"
                  id="new-field"
                  placeholder="e.g. Bioinformatics / NLP"
                  value={newField}
                  onChange={(e) => setNewField(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 outline-none focus:border-slate-950 focus:bg-white transition-all text-xs text-slate-900 font-sans"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider" htmlFor="new-goal">
                  Co-Author Collaboration Needs
                </label>
                <input
                  type="text"
                  id="new-goal"
                  placeholder="e.g. Seeking expert to scale Python backend"
                  value={newCollabGoal}
                  onChange={(e) => setNewCollabGoal(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 outline-none focus:border-slate-950 focus:bg-white transition-all text-xs text-slate-900 font-sans"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider" htmlFor="new-abstract">
                Project Abstract & Current Methods
              </label>
              <textarea
                id="new-abstract"
                rows={3}
                placeholder="Describe what your research group is working on, the paradigm model, or the specific dataset you want to review together..."
                value={newAbstract}
                onChange={(e) => setNewAbstract(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 outline-none focus:border-slate-950 focus:bg-white transition-all text-xs text-slate-900 font-sans"
                required
              />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-indigo-500 mt-0.5" />
            <p className="text-[9px] text-slate-500 font-medium leading-relaxed">
              Once published, this abstract will automatically be appended to the local feed of all active scholars inside your vector neighborhood. Matches can upvote and comment.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-indigo-600 hover:bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider transition border-none cursor-pointer"
          >
            {submitting ? "Publishing Abstract..." : "Broadcasting Research Spec"}
          </button>
        </form>
      )}

      {/* Discovery posts feed layout list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-mono mt-3 animate-pulse">Syncing feed journals...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white border border-slate-200 p-8 text-center rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase">No shared papers published on your cluster yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const upvoted = post.upvotedByIds.includes(currentUser?.id || "session_host");
            return (
              <div key={post.id} className="bg-white border border-slate-250/90 hover:border-slate-350 rounded-3xl p-5 shadow-sm space-y-4 transition-all duration-150">
                
                {/* Author context line */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 cursor-pointer hover:scale-105 duration-100"
                      onClick={() => onViewProfile && onViewProfile(post.authorId)}
                      title="Inspect researcher profile stats"
                    >
                      <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p 
                        className="text-xs font-black text-slate-900 leading-tight cursor-pointer hover:underline hover:text-indigo-600"
                        onClick={() => onViewProfile && onViewProfile(post.authorId)}
                      >
                        {post.authorName}
                      </p>
                      <p className="text-[9px] text-slate-400 font-semibold uppercase">{post.authorInstitution}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-15">
                    {post.authorId === currentUser?.id && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="px-2 py-0.5 text-[9px] font-black tracking-wide text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 rounded-lg border border-rose-200 duration-150 cursor-pointer shadow-sm uppercase shrink-0"
                        title="Permanently remove your post from feed"
                      >
                        🗑 Delete
                      </button>
                    )}
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full uppercase">
                      {post.field}
                    </span>
                  </div>
                </div>

                {/* Main post contents */}
                <div className="space-y-2">
                  <h4 className="text-sm font-extrabold text-slate-950 tracking-tight leading-snug">
                    {post.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium whitespace-pre-wrap">
                    {post.abstract}
                  </p>
                </div>

                {/* Collab goal sticker */}
                {post.collabGoal && (
                  <div className="bg-orange-50/50 border border-orange-100/80 rounded-xl px-3 py-2 flex items-center gap-2">
                    <Award className="w-4 h-4 text-orange-500" />
                    <span className="text-[10px] font-bold text-orange-800 leading-none">
                      HANDSHAKE TARGET: {post.collabGoal}
                    </span>
                  </div>
                )}

                {/* Upvoting and Review Counts Line */}
                <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
                  {/* Academic Hat upvoter - Requirement 4 */}
                  <button
                    onClick={() => handleUpvote(post.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border transition-all text-xs font-bold cursor-pointer border-none ${
                      upvoted
                        ? "bg-indigo-600 text-white hover:bg-slate-900"
                        : "bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <GraduationCap className={`w-4 h-4 ${upvoted ? "fill-white" : ""}`} />
                    <span>{post.upvotes} Support</span>
                  </button>

                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold font-mono">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments.length} REVIEW NOTES</span>
                  </div>
                </div>

                {/* Inline comment board */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3.5 space-y-3 pt-3">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-200/60 pb-1.5">
                    Peer Reviews & Comments
                  </span>

                  {post.comments.length === 0 ? (
                    <p className="text-[10px] text-slate-400 font-semibold italic">No peer reviews logged. Be the first to advise!</p>
                  ) : (
                    <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
                      {post.comments.map((comm) => (
                        <div key={comm.id} className="flex gap-2 text-xs leading-normal">
                          <img src={comm.authorAvatar} alt={comm.authorName} className="w-5.5 h-5.5 rounded-full object-cover border border-slate-200 self-start" />
                          <div className="flex-1 bg-white border border-slate-200/50 rounded-xl p-2.5">
                            <span className="font-bold text-slate-900 block text-[10px] leading-tight mb-0.5">{comm.authorName}</span>
                            <p className="text-slate-600 text-xs font-medium">{comm.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Input form */}
                  <div className="flex gap-1.5 mt-2">
                    <input
                      type="text"
                      placeholder="Type research query or peer validation advice..."
                      value={commentTextMap[post.id] || ""}
                      onChange={(e) => setCommentTextMap({ ...commentTextMap, [post.id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddComment(post.id);
                        }
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:border-slate-800 transition-all text-xs text-slate-900"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="p-1.5 bg-slate-900 hover:bg-slate-950 text-white rounded-xl transition border-none cursor-pointer flex items-center justify-center"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
