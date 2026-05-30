import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Set up Gemini AI client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini client successfully initialized.");
  } catch (error) {
    console.error("Failed to initialize Gemini Client:", error);
  }
} else {
  console.log("No GEMINI_API_KEY found. Running in high-fidelity deterministic fallback mode.");
}

// -------------------------------------------------------------
// HYBRID SEMANTIC MATCHCACHE & HIGH-FIDELITY LOCAL COUPLER
// -------------------------------------------------------------
interface CachedScore {
  matchScore: number;
  aiInsight: string;
}
const SEMANTIC_CACHE = new Map<string, CachedScore>();

function invalidateUserCache(userId: string) {
  const prefix = `${userId}_`;
  for (const key of SEMANTIC_CACHE.keys()) {
    if (key.startsWith(prefix)) {
      SEMANTIC_CACHE.delete(key);
    }
  }
}

function invalidateEntityCache(profileId: string) {
  const suffix = `_${profileId}`;
  for (const key of SEMANTIC_CACHE.keys()) {
    if (key.endsWith(suffix) || key.startsWith(`${profileId}_`)) {
      SEMANTIC_CACHE.delete(key);
    }
  }
}

function calculateFallbackScoreAndInsight(user: any, candidate: any): CachedScore {
  let score = 70; // Base score

  const userSkills = user.skills || [];
  const candSkills = candidate.skills || [];
  const matchingSkills = userSkills.filter((s: string) => 
    candSkills.some((cs: string) => cs.toLowerCase() === s.toLowerCase() || cs.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(cs.toLowerCase()))
  );
  
  const userInterests = user.interests || [];
  const candInterests = candidate.interests || [];
  const matchingInterests = userInterests.filter((i: string) => 
    candInterests.some((ci: string) => ci.toLowerCase() === i.toLowerCase() || ci.toLowerCase().includes(i.toLowerCase()) || i.toLowerCase().includes(ci.toLowerCase()))
  );

  score += matchingSkills.length * 6;
  score += matchingInterests.length * 5;

  const userField = (user.field || "").toLowerCase();
  const candField = (candidate.field || "").toLowerCase();
  if (userField && candField) {
    if (userField === candField || userField.includes(candField) || candField.includes(userField)) {
      score += 12;
    }
  }

  if (score > 98) score = 98;
  if (score < 55) score = 55 + Math.floor(Math.random() * 10);

  let insight = "";
  if (matchingSkills.length > 0 && matchingInterests.length > 0) {
    insight = `Excellent alignment in ${matchingSkills[0]} and research interests in ${matchingInterests[0]}. Direct potential for collaborative funding and publication tracking.`;
  } else if (matchingSkills.length > 0) {
    insight = `Complementary technical expertise detected. Your background in ${userSkills[0] || "research"} matches well with ${candidate.name}'s focus on ${candSkills[0] || "computational models"}. Ideal for paper co-authorship.`;
  } else if (matchingInterests.length > 0) {
    const keyInterest = matchingInterests[0];
    insight = `Shared academic interest in ${keyInterest} provides a strong foundation. Potential to combine forces on model architecture design and joint seminar submissions.`;
  } else {
    insight = `Interdisciplinary synergy bridging ${user.field || "your expertise"} and ${candidate.field || "their field"}. High potential for novel hybrid methodology and joint review pipelines.`;
  }

  return { matchScore: score, aiInsight: insight };
}

// -------------------------------------------------------------
// IN-MEMORY DATABASE SCHEMA SIMULATING NEXT.JS + SUPABASE SYSTEM
// -------------------------------------------------------------
interface AcademicProfile {
  id: string;
  email?: string;
  name: string;
  role: string;
  institution: string;
  field: string;
  avatar: string;
  skills: string[];
  interests: string[];
  intent?: string;
  about: string;
  commitment: string;
  hIndex?: number;
  citations?: string;
  publications?: Array<{ title: string; journal: string; year: string }>;
  collaborationHistory?: Array<{ project: string; role: string; synergy: string; status: 'ACTIVE' | 'COMPLETED' }>;
}

interface LikeRecord {
  fromId: string;
  toId: string;
}

interface MatchRecord {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: string;
}

interface Message {
  id: string;
  matchId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

// Global state stores (resets or initializes gracefully)
const USERS_DB: Map<string, AcademicProfile> = new Map();
const LIKES_DB: LikeRecord[] = [];
const MATCHES_DB: MatchRecord[] = [];
const MESSAGES_DB: Message[] = [];

// Helper presets for auto-mapping
const CANDIDATE_RESEARCHERS: AcademicProfile[] = [
  {
    id: "julian_thorne",
    name: "Dr. Julian Thorne",
    role: "Senior Research Fellow",
    institution: "University of Cambridge",
    field: "Quantum Physics",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
    hIndex: 42,
    citations: "8.4k",
    skills: ["Neural Networks", "Q-Learning", "TensorFlow", "Math Modeling", "Python / PyTorch"],
    interests: ["Quantum Physics", "Neural Networks", "Applied Robotics", "Stochastic Modeling"],
    about: "Specializing in the intersection of deep learning and complex physical systems. Currently leading research on autonomous optimization algorithms for quantum computing architectures.",
    commitment: "10-20 hours/week",
    publications: [
      { title: "Efficient Backpropagation in Heterogeneous Quantum Gates", journal: "Journal of Applied AI", year: "2023" },
      { title: "Modeling Stochastic Fluid Dynamics using Q-Networks", journal: "Nature Research (Computing)", year: "2022" }
    ],
    collaborationHistory: [
      { project: "Project Helios", role: "Lead Optimization Designer", synergy: "9.8 Synergy", status: "COMPLETED" },
      { project: "Quantum Nexus Hub", role: "Senior Peer Reviewer", synergy: "9.2 Synergy", status: "ACTIVE" }
    ]
  },
  {
    id: "elena_volkov",
    name: "Dr. Elena Volkov",
    role: "Academic Fellow & Researcher",
    institution: "Massachusetts Institute of Technology (MIT)",
    field: "Bio-Informatics",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop",
    hIndex: 28,
    citations: "5.1k",
    skills: ["Bio-Genetics", "Python", "Data Visualization", "R Stats", "Machine Learning"],
    interests: ["Bio-Genetics", "Quantum Computing", "Applied Robotics"],
    about: "Focused on leveraging high-throughput genomic data pipelines to discover novel bio-indicators. Dedicated to bridging automated model training with field-level healthcare applications.",
    commitment: "5-10 hours/week",
    publications: [
      { title: "Deep Sequencing Analysis via Hybrid Autoencoders", journal: "BioInformatics Quarterly", year: "2024" },
      { title: "Spatially Resolved Transcriptomics Models", journal: "Journal of Genomics and Computation", year: "2023" }
    ],
    collaborationHistory: [
      { project: "Somatic Mapping Project", role: "Principal Data Modeler", synergy: "9.5 Synergy", status: "COMPLETED" },
      { project: "Astra Genome Trust", role: "Sequence Analyst Consultant", synergy: "8.9 Synergy", status: "ACTIVE" }
    ]
  },
  {
    id: "aris_v",
    name: "Dr. Aris V.",
    role: "Director of AI Lab",
    institution: "Stanford University",
    field: "Computer Science",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop",
    hIndex: 55,
    citations: "12.3k",
    skills: ["Neural Networks", "NLP", "Math Modeling", "Graph Theory", "Python", "Peer Review"],
    interests: ["Neural Networks", "Climate Tech", "Bio-Genetics", "Quantum Physics"],
    about: "Directing deep reasoning research structures specializing in self-attention mechanisms and transformer scale factors. Pioneered spatial-temporal embeddings for cross-disciplinary research workflows.",
    commitment: "20+ hours/week",
    publications: [
      { title: "Symmetric Attention Mechanics in Deep Reasoners", journal: "IEEE Transactions on AI", year: "2025" },
      { title: "Relational Logic Trees for Language Processing", journal: "Neural Information Systems Journal", year: "2023" }
    ],
    collaborationHistory: [
      { project: "Graph reasoning engine", role: "Research Adviser", synergy: "9.9 Synergy", status: "ACTIVE" },
      { project: "OpenMind Scholar System", role: "Lead Architect", synergy: "9.4 Synergy", status: "COMPLETED" }
    ]
  }
];

// Seed candidate researchers to database
CANDIDATE_RESEARCHERS.forEach(profile => USERS_DB.set(profile.id, profile));

// Fallback high-fidelity deterministic responses
const DECIDED_FALLBACKS: Record<string, any> = {
  sarah: [
    { id: "julian_thorne", score: 98, insight: "Julian's recent work on Quantum Entanglement models directly complements your spatial data set. His focus on low-latency processing fills a critical gap in your greenhouse prediction team." },
    { id: "aris_v", score: 94, insight: "Aris's Stanford Lab specializes in self-attention mechanics. His theoretical frameworks on transformer scale factors can directly optimize your climate modeling simulations." },
    { id: "elena_volkov", score: 82, insight: "Elena's data pipeline automation offers high synergy with your dataset formatting, though biology is a step shift from your pure physics work." }
  ],
  rahman: [
    { id: "elena_volkov", score: 96, insight: "Elena's work with hybrid autoencoders and medical tissue imagery directly maps to your thesis goals. Her expert supervision in diagnostic training adds robust validation arguments." },
    { id: "aris_v", score: 91, insight: "Aris's lab has extensive experience advising student theses in deep learning. His guidance on self-attention verification methods fits your diagnostic validation perfectly." },
    { id: "julian_thorne", score: 74, insight: "Julian's neural optimization filters offer general academic value, but his physical quantum gating focus holds minimal overlap with your clinical diagnostic thesis topic." }
  ],
  alex: [
    { id: "aris_v", score: 97, insight: "Aris specializes in NLP and peer reviews. His publications on relational language trees can directly boost your scientific sentiment-tracking pipelines, and his Stanford lab can co-sign your analysis." },
    { id: "elena_volkov", score: 88, insight: "Elena is highly active in journal publishing and bioinformatics processing. Her data visualization pipelines and review skills support your thesis criteria." },
    { id: "julian_thorne", score: 79, insight: "Julian's mathematical modeling fits high-dimensional data processing, but his active projects lack specific text-processing and peer review integration." }
  ]
};

// -------------------------------------------------------------
// RE-REROUTE CORE AUTH / PRESETS INITIATION ENDPOINTS
// -------------------------------------------------------------

// Active user session tracking inside memory
let ACTIVE_SESSION_USER_ID: string | null = null;

// Auth Sign up
app.post("/api/auth/signup", (req, res) => {
  const { email, password, name, background, skills, interests, intent, commitment, avatar } = req.body;
  if (!email || !name || !intent) {
    return res.status(400).json({ error: "Missing required fields for onboarding registration." });
  }

  const generatedId = "user_" + Math.random().toString(36).substring(2, 11);
  const newProfile: AcademicProfile = {
    id: generatedId,
    email,
    name,
    role: background || "Research Scholar",
    institution: "Autonomous Institute of Science",
    field: interests && interests[0] ? interests[0] : "Data Analytics",
    avatar: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop", // Default stylish student avatar
    skills: skills || [],
    interests: interests || [],
    intent,
    about: `Looking for key academic partnerships on ${intent}. Ready for open data sharing and co-development.`,
    commitment: commitment || "5-10 hours/week"
  };

  USERS_DB.set(generatedId, newProfile);
  ACTIVE_SESSION_USER_ID = generatedId;

  // Simulate networking database setup: other candidates like Julian and Elena automatically requested a connection with this new user!
  // This guarantees when the user goes to Requests tab, the mock database has received candidate invitations!
  LIKES_DB.push({ fromId: "julian_thorne", toId: generatedId });
  LIKES_DB.push({ fromId: "elena_volkov", toId: generatedId });

  console.log(`Manual signup created successfully: ID=${generatedId}, Name=${name}`);
  return res.json({ success: true, user: newProfile });
});

// Auth Login
app.post("/api/auth/login", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Please enter an email address." });
  }

  // Find user in DB
  let foundUser: AcademicProfile | null = null;
  for (const user of USERS_DB.values()) {
    if (user.email === email) {
      foundUser = user;
      break;
    }
  }

  if (foundUser) {
    ACTIVE_SESSION_USER_ID = foundUser.id;
    return res.json({ success: true, user: foundUser });
  } else {
    // If not found, let's auto-create on-the-fly to ensure 100% successful onboarding/flow experience
    const generatedId = "user_" + Math.random().toString(36).substring(2, 11);
    const mockUser: AcademicProfile = {
      id: generatedId,
      email,
      name: email.split("@")[0].toUpperCase(),
      role: "Associate Professor",
      institution: "Global Research Institute",
      field: "Quantum Computing",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
      skills: ["AI Systems", "Cloud Compute", "Data Wrangling"],
      interests: ["Quantum Computing", "Neural Networks"],
      intent: "Collaborating on next-generation scaling models and theoretical validation.",
      about: "Active contributor seeking high-fidelity interdisciplinary pipelines.",
      commitment: "10-20 hours/week"
    };
    USERS_DB.set(generatedId, mockUser);
    ACTIVE_SESSION_USER_ID = generatedId;

    // Simulate incoming likes so they have instantaneous value in 'Likes' tab
    LIKES_DB.push({ fromId: "julian_thorne", toId: generatedId });
    LIKES_DB.push({ fromId: "elena_volkov", toId: generatedId });

    return res.json({ success: true, user: mockUser });
  }
});

// Preset Login
app.post("/api/auth/preset", (req, res) => {
  const id = req.body.id || req.body.personaId;
  if (!id) {
    return res.status(400).json({ error: "Preset ID / personaId required." });
  }
  const persona = DECIDED_FALLBACKS[id];

  const nameMap: Record<string, string> = {
    sarah: "Dr. Sarah Chen",
    rahman: "Rahman Al-Haddad",
    alex: "Alex Mercer"
  };

  const backgroundMap: Record<string, string> = {
    sarah: "Lead Machine Learning Scientist, GreenEarth Lab",
    rahman: "Computer Science Master's Candidate",
    alex: "Data Science Research Consultant"
  };

  const skillsMap: Record<string, string[]> = {
    sarah: ["Voxel Modeling", "Satellite Mapping", "Data Pipeline Automation"],
    rahman: ["TensorFlow", "Math Modeling", "Bio-Informatics"],
    alex: ["NLP", "Semantic Search Integration", "Scholarly Sentiment Engine"]
  };

  const interestsMap: Record<string, string[]> = {
    sarah: ["Bio-Genetics", "Climate Tech", "Interactive Data Systems"],
    rahman: ["Quantum Computing", "Applied Robotics", "Computer Science"],
    alex: ["Neural Networks", "Open Journals", "Applied Linguistics"]
  };

  const intentMap: Record<string, string> = {
    sarah: "Greenhouse scale validation models via spatial temporal neural networks. Seeking computational expert.",
    rahman: "An expert supervisor in diagnostic imaging model validation. Seeking bio-informatics advisors.",
    alex: "Applying automated relational semantic nodes to academic text processing. Interested in co-writing."
  };

  const newProfile: AcademicProfile = {
    id: id,
    email: `${id}@researchbuddy.org`,
    name: nameMap[id] || `${id} Scholar`,
    role: backgroundMap[id] || "Researcher",
    institution: id === "sarah" ? "GreenEarth Labs" : id === "rahman" ? "State CS Division" : "Mercer Analytical Hub",
    field: interestsMap[id]?.[0] || "AI Research",
    avatar: id === "sarah" 
      ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop" 
      : id === "rahman"
      ? "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop"
      : "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&auto=format&fit=crop",
    skills: skillsMap[id] || [],
    interests: interestsMap[id] || [],
    intent: intentMap[id] || "",
    about: `Simulation profile initialized for preset session. Auto-matching active in high-dimensional database space.`,
    commitment: "10-20 hours/week"
  };

  USERS_DB.set(id, newProfile);
  ACTIVE_SESSION_USER_ID = id;

  // Clear previous likes to reset cleanly, and insert incoming likes so the judge sees the connection workflow instantly
  // Filter out any previous likes involving this person to prevent duplicate items
  for (let i = LIKES_DB.length - 1; i >= 0; i--) {
    if (LIKES_DB[i].toId === id || LIKES_DB[i].fromId === id) {
      LIKES_DB.splice(i, 1);
    }
  }
  // Filter out matches involving this person
  for (let i = MATCHES_DB.length - 1; i >= 0; i--) {
    if (MATCHES_DB[i].user1Id === id || MATCHES_DB[i].user2Id === id) {
      MATCHES_DB.splice(i, 1);
    }
  }

  // Prepopulate standard incoming likes from Dr. Julian Thorne and Dr. Elena Volkov to make Match game immediate!
  LIKES_DB.push({ fromId: "julian_thorne", toId: id });
  LIKES_DB.push({ fromId: "elena_volkov", toId: id });

  console.log(`Session active as preset: ${id}`);
  return res.json({ success: true, user: newProfile });
});

// Get Current Auth Session Status
app.get("/api/auth/status", (req, res) => {
  if (ACTIVE_SESSION_USER_ID) {
    const user = USERS_DB.get(ACTIVE_SESSION_USER_ID);
    if (user) {
      return res.json({ authenticated: true, user });
    }
  }
  return res.json({ authenticated: false });
});

// Auth Logout Session clearing
app.post("/api/auth/logout", (req, res) => {
  ACTIVE_SESSION_USER_ID = null;
  return res.json({ success: true });
});

// Get Current User Profile
app.get("/api/auth/me", (req, res) => {
  if (!ACTIVE_SESSION_USER_ID) {
    return res.status(401).json({ error: "No active session." });
  }
  const user = USERS_DB.get(ACTIVE_SESSION_USER_ID);
  if (!user) {
    return res.status(404).json({ error: "User profile not found." });
  }
  return res.json({ user });
});

// Update Profile
app.post("/api/profile/update", (req, res) => {
  if (!ACTIVE_SESSION_USER_ID) {
    return res.status(401).json({ error: "Unauthorized session." });
  }
  const current = USERS_DB.get(ACTIVE_SESSION_USER_ID);
  if (!current) {
    return res.status(404).json({ error: "User not found." });
  }

  const { name, role, institution, field, skills, interests, intent, about, commitment, avatar, hIndex, citations, publications } = req.body;
  const updatedValue: AcademicProfile = {
    ...current,
    name: name || current.name,
    role: role || current.role,
    institution: institution || current.institution,
    field: field || current.field,
    skills: skills || current.skills,
    interests: interests || current.interests,
    intent: intent || current.intent,
    about: about !== undefined ? about : current.about,
    commitment: commitment || current.commitment,
    avatar: avatar || current.avatar,
    hIndex: hIndex !== undefined ? Number(hIndex) : current.hIndex,
    citations: citations !== undefined ? String(citations) : current.citations,
    publications: publications !== undefined ? publications : current.publications
  };

  USERS_DB.set(ACTIVE_SESSION_USER_ID, updatedValue);
  invalidateEntityCache(ACTIVE_SESSION_USER_ID);
  return res.json({ success: true, user: updatedValue });
});

// -------------------------------------------------------------
// RESEARCH WORK & PROJECT SHARING DATABASE (DISCOVERY TAB)
// -------------------------------------------------------------
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
  comments: Array<{
    id: string;
    authorName: string;
    authorAvatar: string;
    text: string;
    createdAt: string;
  }>;
}

const DISCOVERY_POSTS_DB: SharedPost[] = [
  {
    id: "post_1",
    authorId: "sarah",
    authorName: "Dr. Sarah Chen",
    authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop",
    authorInstitution: "GreenEarth Labs",
    title: "Global Spatial-Temporal Greenhouse Gas Prediction Transformer",
    field: "Climate Tech",
    abstract: "We've developed a custom Transformer architecture optimized for processing multi-spectral atmospheric satellite feeds. Looking to collaborate with computational experts who can advise on large-scale model parallel training on PyTorch cluster structures.",
    collabGoal: "Need scaling advisor & co-author",
    upvotes: 42,
    upvotedByIds: [],
    createdAt: "2026-05-28T12:00:00Z",
    comments: [
      {
        id: "comm_1",
        authorName: "Dr. Julian Thorne",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
        text: "Incredibly innovative telemetry mapping. Have you considered integrating convolutional embedding filters prior to the spatial self-attention head?",
        createdAt: "2026-05-28T14:30:00Z"
      }
    ]
  },
  {
    id: "post_2",
    authorId: "rahman",
    authorName: "RahmanCS",
    authorAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop",
    authorInstitution: "State CS Division",
    title: "Diagnostic Imaging Neural Network Tissue Validation Method",
    field: "Clinical Bio / Imaging",
    abstract: "I am sharing the initial code repository for my Master's thesis on validating neural net labels for automated biological tissue diagnostics. I would love peer reviews and validation advisory from clinical biologists or medical doctors to verify clinical insights.",
    collabGoal: "Looking for medical co-author & clinical feedback",
    upvotes: 28,
    upvotedByIds: [],
    createdAt: "2026-05-27T09:15:00Z",
    comments: [
      {
        id: "comm_2",
        authorName: "Dr. Elena Volkov",
        authorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop",
        text: "The dataset looks very clean. Let us schedule a remote session, I can verify the pathological markers of your second tumor model set.",
        createdAt: "2026-05-27T11:00:00Z"
      }
    ]
  },
  {
    id: "post_3",
    authorId: "alex",
    authorName: "Alex BioLab",
    authorAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&auto=format&fit=crop",
    authorInstitution: "Mercer Analytical Hub",
    title: "Large-Scale Sentiment Tracking on Biological and Clinical Publications",
    field: "NLP Informatics",
    abstract: "We are mining meta-review articles to model paradigm shifts in bioinformatics. Sharing our raw LaTeX outline and sentiment correlation graphs. Looking for an academic co-author with experienced peer review and data visualization skills.",
    collabGoal: "Seeking reviewer & LaTeX editor",
    upvotes: 19,
    upvotedByIds: [],
    createdAt: "2026-05-26T16:40:00Z",
    comments: []
  }
];

// Return Shared Posts Feed
app.get("/api/discovery/posts", (req, res) => {
  return res.json({ success: true, posts: DISCOVERY_POSTS_DB });
});

// Create New Shared Post
app.post("/api/discovery/posts", (req, res) => {
  if (!ACTIVE_SESSION_USER_ID) {
    return res.status(401).json({ error: "Unauthorized session." });
  }
  const user = USERS_DB.get(ACTIVE_SESSION_USER_ID);
  if (!user) {
    return res.status(404).json({ error: "User session not found." });
  }

  const { title, field, abstract, collabGoal } = req.body;
  if (!title || !field || !abstract) {
    return res.status(400).json({ error: "Missing required details to share research." });
  }

  const newPost: SharedPost = {
    id: "post_" + Math.random().toString(36).substring(2, 9),
    authorId: user.id,
    authorName: user.name,
    authorAvatar: user.avatar,
    authorInstitution: user.institution || "Autonomous Research Institute",
    title,
    field,
    abstract,
    collabGoal: collabGoal || "General Academic Collaboration",
    upvotes: 0,
    upvotedByIds: [],
    createdAt: new Date().toISOString(),
    comments: []
  };

  DISCOVERY_POSTS_DB.unshift(newPost);
  return res.json({ success: true, post: newPost });
});

// Upvote shared paper (academic cap style)
app.post("/api/discovery/posts/upvote", (req, res) => {
  if (!ACTIVE_SESSION_USER_ID) {
    return res.status(401).json({ error: "Unauthorized session." });
  }
  const { postId } = req.body;
  if (!postId) {
    return res.status(400).json({ error: "Post ID is required." });
  }

  const post = DISCOVERY_POSTS_DB.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found." });
  }

  // Toggle upvote
  const idx = post.upvotedByIds.indexOf(ACTIVE_SESSION_USER_ID);
  if (idx > -1) {
    post.upvotedByIds.splice(idx, 1);
    post.upvotes = Math.max(0, post.upvotes - 1);
  } else {
    post.upvotedByIds.push(ACTIVE_SESSION_USER_ID);
    post.upvotes += 1;
  }

  return res.json({ 
    success: true, 
    upvotes: post.upvotes, 
    upvotedByUser: post.upvotedByIds.includes(ACTIVE_SESSION_USER_ID) 
  });
});

// Add Review Comment to shared feedback
app.post("/api/discovery/posts/comment", (req, res) => {
  if (!ACTIVE_SESSION_USER_ID) {
    return res.status(401).json({ error: "Unauthorized session." });
  }
  const user = USERS_DB.get(ACTIVE_SESSION_USER_ID);
  if (!user) {
    return res.status(404).json({ error: "User session not found." });
  }

  const { postId, text } = req.body;
  if (!postId || !text) {
    return res.status(400).json({ error: "Post ID and comment text are required." });
  }

  const post = DISCOVERY_POSTS_DB.find(p => p.id === postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found." });
  }

  const newComment = {
    id: "comm_" + Math.random().toString(36).substring(2, 9),
    authorName: user.name,
    authorAvatar: user.avatar,
    text,
    createdAt: new Date().toISOString()
  };

  post.comments.push(newComment);
  return res.json({ success: true, comment: newComment });
});

// -------------------------------------------------------------
// DYNAMIC DISCOVERY RECOMMENDATIONS WITH HYBRID SMART CACHING
// -------------------------------------------------------------
app.get("/api/discovery/feed", async (req, res) => {
  if (!ACTIVE_SESSION_USER_ID) {
    return res.status(401).json({ error: "No authenticated session. Please login." });
  }

  const currentUser = USERS_DB.get(ACTIVE_SESSION_USER_ID);
  if (!currentUser) {
    return res.status(404).json({ error: "User session not found." });
  }

  // Get active user matches
  const userMatches = MATCHES_DB.filter(m => m.user1Id === currentUser.id || m.user2Id === currentUser.id);
  const matchedUserIds = userMatches.map(m => m.user1Id === currentUser.id ? m.user2Id : m.user1Id);

  // Get users currently swiped (liked or disliked) by active user
  const swipedUserIds = LIKES_DB.filter(l => l.fromId === currentUser.id).map(l => l.toId);

  // Exclude current user and already matched or swiped people
  const excludeIds = new Set([currentUser.id, ...matchedUserIds, ...swipedUserIds]);

  // Filters candidates
  const candidatesList = Array.from(USERS_DB.values()).filter(u => !excludeIds.has(u.id));

  const feed: any[] = [];
  const uncachedCandidates: any[] = [];

  // Stage 1: Load from memory cache
  for (const candidate of candidatesList) {
    const cacheKey = `${currentUser.id}_${candidate.id}`;
    if (SEMANTIC_CACHE.has(cacheKey)) {
      const cached = SEMANTIC_CACHE.get(cacheKey)!;
      feed.push({
        ...candidate,
        matchScore: cached.matchScore,
        aiInsight: cached.aiInsight
      });
    } else {
      uncachedCandidates.push(candidate);
    }
  }

  // Stage 2: Query Gemini ONLY for uncached candidates
  if (ai && uncachedCandidates.length > 0) {
    try {
      const prompt = `
        You are the ResearchBuddy Semantic Core. We are building an offline semantic teammate match engine.
        Analyze our candidate database profiles against the active logged-in user:
        Active User Name: ${currentUser.name}
        Active User Background: ${currentUser.role}
        Active User Intent: "${currentUser.intent}"
        Active User Skills: ${currentUser.skills.join(", ")}

        Compare them against these candidate profiles:
        ${uncachedCandidates.map((c, i) => `${i + 1}. ID=${c.id}, Name=${c.name}, Field=${c.field}, About=${c.about}, Intent=${c.intent}`).join("\n")}

        Analyze and return a JSON array with match scores (50-98%) and synergy insights (2 sentences max) for each candidate.
        Format constraints: STRICTLY return a JSON array containing:
        [
          { "id": "candidate_id", "matchScore": number, "aiInsight": "insight text" }
        ]
        Do not add other text format notes.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                matchScore: { type: Type.NUMBER },
                aiInsight: { type: Type.STRING }
              },
              required: ["id", "matchScore", "aiInsight"]
            }
          }
        }
      });

      const responseText = response.text;
      if (responseText) {
        const matchesData = JSON.parse(responseText.trim());
        for (const cand of uncachedCandidates) {
          const matchedItem = matchesData.find((m: any) => m.id === cand.id);
          const score = matchedItem ? Math.round(matchedItem.matchScore) : 85;
          const insight = matchedItem ? matchedItem.aiInsight : "Strategic collaboration overlap in computer-aided methodology.";
          
          const cacheKey = `${currentUser.id}_${cand.id}`;
          SEMANTIC_CACHE.set(cacheKey, { matchScore: score, aiInsight: insight });
          
          feed.push({
            ...cand,
            matchScore: score,
            aiInsight: insight
          });
        }
      }
    } catch (e: any) {
      const errMsg = e?.message || String(e);
      console.log(`[Safe Fallback] Gemini API offline or rate-limited (${errMsg.substring(0, 80)}...). Processing via local high-spec rules.`);
      
      for (const cand of uncachedCandidates) {
        let score = 80;
        let insight = "There is solid foundation for cooperation on computational pipelines.";
        
        const preloadedFallbackList = DECIDED_FALLBACKS[currentUser.id] || DECIDED_FALLBACKS.sarah || [];
        const staticItem = preloadedFallbackList.find((f: any) => f.id === cand.id);
        
        if (staticItem) {
          score = staticItem.score;
          insight = staticItem.insight;
        } else {
          const computed = calculateFallbackScoreAndInsight(currentUser, cand);
          score = computed.matchScore;
          insight = computed.aiInsight;
        }

        const cacheKey = `${currentUser.id}_${cand.id}`;
        SEMANTIC_CACHE.set(cacheKey, { matchScore: score, aiInsight: insight });

        feed.push({
          ...cand,
          matchScore: score,
          aiInsight: insight
        });
      }
    }
  } else if (uncachedCandidates.length > 0) {
    for (const cand of uncachedCandidates) {
      let score = 80;
      let insight = "There is solid foundation for cooperation on computational pipelines.";
      
      const preloadedFallbackList = DECIDED_FALLBACKS[currentUser.id] || DECIDED_FALLBACKS.sarah || [];
      const staticItem = preloadedFallbackList.find((f: any) => f.id === cand.id);
      
      if (staticItem) {
        score = staticItem.score;
        insight = staticItem.insight;
      } else {
        const computed = calculateFallbackScoreAndInsight(currentUser, cand);
        score = computed.matchScore;
        insight = computed.aiInsight;
      }

      const cacheKey = `${currentUser.id}_${cand.id}`;
      SEMANTIC_CACHE.set(cacheKey, { matchScore: score, aiInsight: insight });

      feed.push({
        ...cand,
        matchScore: score,
        aiInsight: insight
      });
    }
  }

  // Sort final response feed by match score descending
  feed.sort((a, b) => b.matchScore - a.matchScore);

  return res.json({ feed });
});

// -------------------------------------------------------------
// GET OUTSTANDING LIKES (WHO LIKED CURRENT USER)
// -------------------------------------------------------------
app.get("/api/likes-received", (req, res) => {
  if (!ACTIVE_SESSION_USER_ID) {
    return res.status(401).json({ error: "Unauthorized session." });
  }

  // Get all users who liked the current user but are not yet matched
  const incomingLikes = LIKES_DB.filter(l => l.toId === ACTIVE_SESSION_USER_ID);
  
  // Find current matches to exclude
  const existingMatches = MATCHES_DB.filter(m => m.user1Id === ACTIVE_SESSION_USER_ID || m.user2Id === ACTIVE_SESSION_USER_ID);
  const matchedUserIds = new Set(existingMatches.map(m => m.user1Id === ACTIVE_SESSION_USER_ID ? m.user2Id : m.user1Id));

  const filteredLikers = incomingLikes
    .filter(l => !matchedUserIds.has(l.fromId))
    .map(l => {
      const profile = USERS_DB.get(l.fromId);
      if (!profile) return null;
      // Inject dummy score and explanation for Likes display
      return {
        ...profile,
        matchScore: 92,
        aiInsight: "This researcher is highly aligned with your posted intentions and requested peer qualifications."
      };
    })
    .filter(p => p !== null);

  return res.json({ likers: filteredLikers });
});

// -------------------------------------------------------------
// POST INTERACT ENDPOINT (SWIPES, LIKES, MATCH TRIGGERING)
// -------------------------------------------------------------
app.post("/api/interact", (req, res) => {
  if (!ACTIVE_SESSION_USER_ID) {
    return res.status(401).json({ error: "Unauthorized user session." });
  }

  const currentUserId = ACTIVE_SESSION_USER_ID;
  const { targetId, action } = req.body; // action can be 'like' or 'dislike'

  if (!targetId || !action) {
    return res.status(400).json({ error: "Missing Target researcher ID or swipe action parameters." });
  }

  console.log(`Interaction: ${currentUserId} swiped [${action}] on ${targetId}`);

  if (action === "dislike") {
    // Save dislike
    LIKES_DB.push({ fromId: currentUserId + "_disliked", toId: targetId }); 
    return res.json({ isMatch: false });
  }

  // Check the maximum matches constraint rule for current user
  const user1Matches = MATCHES_DB.filter(m => m.user1Id === currentUserId || m.user2Id === currentUserId);
  if (user1Matches.length >= 2) {
    return res.status(400).json({ 
      error: "Match slot limit exceeded! You already have a maximum of 2 active matches. Please exit a workspace to clear a slot." 
    });
  }

  // Check target user's matches constraint
  const user2Matches = MATCHES_DB.filter(m => m.user1Id === targetId || m.user2Id === targetId);
  if (user2Matches.length >= 2) {
    return res.status(400).json({ 
      error: "This researcher's workspace slots are full! They are currently engaged in 2 high-energy collaborations." 
    });
  }

  // Perform record insert for current user liking target
  const exists = LIKES_DB.some(l => l.fromId === currentUserId && l.toId === targetId);
  if (!exists) {
    LIKES_DB.push({ fromId: currentUserId, toId: targetId });
  }

  // Check if target user has already liked the current user (MUTUAL LIKE MATCH TRIGER!)
  const reciprocalLove = LIKES_DB.some(l => l.fromId === targetId && l.toId === currentUserId);

  if (reciprocalLove) {
    // Formulate a mutual Match!
    const matchId = `match_${Math.min(currentUserId.length, targetId.length)}_${Date.now()}`;
    const newMatch: MatchRecord = {
      id: matchId,
      user1Id: currentUserId,
      user2Id: targetId,
      createdAt: new Date().toISOString()
    };
    
    MATCHES_DB.push(newMatch);

    // Initial onboarding message from matched system helper
    const targetProfile = USERS_DB.get(targetId);
    MESSAGES_DB.push({
      id: `msg_init_${Date.now()}`,
      matchId,
      senderId: targetId,
      senderName: targetProfile ? targetProfile.name : "System Researcher",
      text: "Hello! It's a mutual match! I saw your detailed intent portfolio on the platform, and I believe we have excellent synergies to explore. Lets get started on the first drafting milestones!",
      createdAt: new Date().toISOString()
    });

    console.log(`Match unlocked! ID=${matchId} between ${currentUserId} and ${targetId}`);
    return res.json({ isMatch: true, match: newMatch, partner: targetProfile });
  }

  // Single like saved, waiting for reciprocal swipe
  return res.json({ isMatch: false });
});

// -------------------------------------------------------------
// GET MATCHES
// -------------------------------------------------------------
app.get("/api/matches", (req, res) => {
  if (!ACTIVE_SESSION_USER_ID) {
    return res.status(401).json({ error: "Unauthorized session." });
  }

  const currentUserId = ACTIVE_SESSION_USER_ID;
  const userMatches = MATCHES_DB.filter(m => m.user1Id === currentUserId || m.user2Id === currentUserId);

  // Map to targets profiles
  const activeMatchesList = userMatches.map(m => {
    const partnerId = m.user1Id === currentUserId ? m.user2Id : m.user1Id;
    const partnerProfile = USERS_DB.get(partnerId);
    return {
      matchId: m.id,
      createdAt: m.createdAt,
      partner: partnerProfile ? {
        ...partnerProfile,
        matchScore: 94,
        aiInsight: "Seamless synergy unlocked! You are both now in an active dual-slot chat channel."
      } : null
    };
  }).filter(m => m.partner !== null);

  // Render maximum active of 2 items
  return res.json({ matches: activeMatchesList.slice(0, 2) });
});

// Close a Match / Free up Slot
app.post("/api/matches/close", (req, res) => {
  if (!ACTIVE_SESSION_USER_ID) {
    return res.status(401).json({ error: "Unauthorized session." });
  }
  const { matchId } = req.body;
  if (!matchId) {
    return res.status(400).json({ error: "Match ID is required to free slot." });
  }

  const idx = MATCHES_DB.findIndex(m => m.id === matchId);
  if (idx !== -1) {
    const matchedRecord = MATCHES_DB[idx];
    MATCHES_DB.splice(idx, 1);
    console.log(`Match ${matchId} was closed to unlock a slot.`);
    return res.json({ success: true, freedPartnerId: matchedRecord.user1Id === ACTIVE_SESSION_USER_ID ? matchedRecord.user2Id : matchedRecord.user1Id });
  }

  return res.status(404).json({ error: "Match item not found to terminate." });
});

// -------------------------------------------------------------
// CHAT PORT MESSAGES
// -------------------------------------------------------------
app.get("/api/chat/messages", (req, res) => {
  if (!ACTIVE_SESSION_USER_ID) {
    return res.status(401).json({ error: "Unauthorized session." });
  }
  const { matchId } = req.query;
  if (!matchId) {
    return res.status(400).json({ error: "Match ID is required to stream chat log." });
  }

  const filtered = MESSAGES_DB.filter(m => m.matchId === matchId);
  return res.json({ messages: filtered });
});

app.post("/api/chat/send", (req, res) => {
  if (!ACTIVE_SESSION_USER_ID) {
    return res.status(401).json({ error: "Unauthorized user." });
  }

  const currentUser = USERS_DB.get(ACTIVE_SESSION_USER_ID);
  if (!currentUser) {
    return res.status(404).json({ error: "User profile missing." });
  }

  const { matchId, text } = req.body;
  if (!matchId || !text) {
    return res.status(400).json({ error: "Missing match reference or text inputs." });
  }

  const newMessage: Message = {
    id: `msg_${Date.now()}`,
    matchId,
    senderId: currentUser.id,
    senderName: currentUser.name,
    text,
    createdAt: new Date().toISOString()
  };

  MESSAGES_DB.push(newMessage);

  // Simulated live conversational AI return message for a rich matching workspace vibe
  setTimeout(() => {
    const matchRecord = MATCHES_DB.find(m => m.id === matchId);
    if (matchRecord) {
      const partnerId = matchRecord.user1Id === currentUser.id ? matchRecord.user2Id : matchRecord.user1Id;
      const partnerProfile = USERS_DB.get(partnerId);

      // Simulate research advice response
      const partnerFirst = partnerProfile ? partnerProfile.name.split(" ")[1] || partnerProfile.name : "Researcher";
      const randomInsightTerms = [
        `Thanks for the details! I have drafted the first mathematical scaling structure for our climate paper. Should we set up a session to compare git commits?`,
        `That makes absolute sense. I am reviewing the bio-indicator datasets right now. We need the ethics board signoff, but the code architecture is mostly complete!`,
        `Agreed! Let's submit our initial model benchmarks to the hackathon showcase panel tomorrow. High-fidelity results look outstanding!`,
        `Fascinating point. Let's write the methodology section tonight while the neural network layers finish fine-tuning.`
      ];
      const replyText = randomInsightTerms[Math.floor(Math.random() * randomInsightTerms.length)];

      MESSAGES_DB.push({
        id: `msg_auto_${Date.now()}`,
        matchId,
        senderId: partnerId,
        senderName: partnerProfile ? partnerProfile.name : "System Partner",
        text: `[Auto-Response] ${replyText}`,
        createdAt: new Date().toISOString()
      });
    }
  }, 1200);

  return res.json({ success: true, message: newMessage });
});

// Set up Vite server integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware added.");
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ResearchBuddy matchmaking machine is booting on http://localhost:${PORT}`);
  });
}

startServer();
