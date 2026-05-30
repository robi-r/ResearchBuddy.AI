# ResearchBuddy 🎓

ResearchBuddy is a highly polished, gamified academic matchup platform ("Dating App for Scientists") that helps researchers, PhD scholars, and CS fellows find complementary co-authors and collaborators.

---

## 🚀 Key Features

### 1. Unified Academic Profiles
- **Profile Picture Suite**: Supports local file uploading (automatically converting photos to lightweight Base64 strings) alongside carefully selected academic avatar presets (e.g., Dr. Sarah, CS Fellow, Lead NLP Research).
- **Core Research Attributes**: Includes name, academic role, institution, research field, skills (comma-separated keys), and research interests.
- **Academic Metrics Integration**: Tracks **H-Index** values and arbitrary citation counts (e.g., `1.5k`, `420`).
- **Dynamic Portfolios**: Integrated interactive publication registry allowing researchers to live-add peer-reviewed papers (with custom titles, journal venues, and publication years) and sync them straight to the profile database.

### 2. Matching Engine & Swiping UX
- **Swipe Cards Interface**: Standard, beautifully rounded deck structures enabling immediate visual like/pass mechanics.
- **Dynamic Lock Counters & Premium Unlock Loops**: Recreates Tinder/dating mechanics tailored for science—setting swipe limits, unlocks, and direct connection prompts.
- **Intelligent Sidebar Drawer**: Accessible workspace directory to trace matched partnerships, chat prompts, and active co-authorship pipelines.

---

## 🧠 Smart Hybrid Matching Architecture (Server Engine)

The feed calculation endpoint (`/api/discovery/feed`) represents a robust, highly resilient full-stack coordination design that protects user experience even during underlying cloud constraints.

### 🛡️ High-Performance MatchCache
By computing a unique memory cache key (`${activeUserId}_${candidateId}`), the engine implements **MatchCache**:
- Matches that have been processed previously are immediately loaded from `SEMANTIC_CACHE`.
- Prevents database redundancy and saves Gemini API quota.
- Automatic invalidation hooks (`invalidateEntityCache`, `invalidateUserCache`) run whenever a researcher updates their profile data, ensuring the cache stays perfectly synchronized.

### 🌐 Safe Fallback Local Coupler (Gemini 429 Recovery)
If the upstream Gemini API returns a `429 (Resource Exhausted)` rate limit error or goes offline, the server instantly triggers a **Safe Fallback**:
- Rather than throwing errors or serving empty data, it runs a proprietary local similarity engine (`calculateFallbackScoreAndInsight`).
- Synthesizes overlapping skills, intersecting interests, and domain fields into a customized mathematical score (between 50% and 98%) and crafts a contextual synthesis insight sentence dynamically.

---

## 🛠️ Stack & Dependencies
- **Frontend**: React 18 with Vite, styled with Tailwind CSS, Lucide icons, and React Motion layouts.
- **Backend**: Express hybrid server supporting full-stack middleware pipelines.
- **AI Core**: Modern `@google/genai` Node.js SDK leveraging `gemini-3.5-flash` for high-quality semantic matches.

---

## 💾 Local MCP Server Integration (Model Context Protocol)
Located inside the `/mcp-server/` workspace, the app features an enterprise-grade MCP server running on standard input/output (`stdio`) transport:
1. `find_collaborators`: Takes an unstructured researcher intent search string, converts it to deep vector dimensions using OpenAI embeddings `text-embedding-3-small`, and executes a vector similarity query against Supabase tables.
2. `get_active_collabs`: Fetches the caller's active collaborator slots (limited dynamically to 2 active entries).
