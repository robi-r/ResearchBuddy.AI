# ResearchBuddy 🎓

ResearchBuddy is a highly polished, gamified academic collaboration matcher tailored for researchers, PhD scholars, and Computer Science fellows. It streamlines the co-author discovery pipeline by matching complementary skill sets, publication histories, and active research intents.

---

## 🚀 Key Features

### 1. Unified Academic Profiles
- **Profile Picture Suite**: Allows seamless updates via local image uploads (converting photos to browser-friendly Base64 strings) or quick-selection from active academic avatars.
- **Core Research Identifiers**: Comprehensive dataset tracking including title, affiliation, research field, interest keys, and granular skill checklists.
- **Scientific Metric Indicators**: Displays live high-fidelity indicators for academic indices such as **H-Index** values and citation counters.
- **Live Publication Portfolio**: Integrated interactive registry allowing users to dynamically reference peer-reviewed records (with journal channels and publication years) directly in their system database.

### 2. High-Efficiency Matcher & Discovery Flow
- **Swipe Card Interface**: Dynamic gesture/button action card structures allowing researchers to review peers easily.
- **Dynamic Collaboration Limits & Unlocks**: Promotes highly intentional networks by introducing maximum pending invites and locking mutual peer reviews until specific alignment benchmarks are cleared.
- **Active Workspace Drawer**: Sidebar organizer to track connection threads, message exchanges, and progress on active co-authorship draft pipelines.

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

## 📦 MCP Server Module (Model Context Protocol)
Located inside the `/mcp-server/` directory, the workspace hosts a model context protocol node server operating over `stdio` transport. It exposes two essential capabilities to local developer LLM agents:
1. `find_collaborators`: Takes unstructured natural language peer search queries, requests an embedding vector from OpenAI (`text-embedding-3-small`), and queries Supabase tables using state-of-the-art vector similarity matches.
2. `get_active_collabs`: Fetches the active approved partner records for any single researcher (bounded strictly to 2 active records).

---

## 🛠️ Tech Stack & Requirements
- **Frontend UI**: React 18, Vite, Tailwind CSS, Lucide icons, Framer Motion transitions.
- **Server Core**: Live Express Node.js application server.
- **AI Matching**: Modern `@google/genai` Integration with `gemini-3.5-flash` for high-fidelity semantic synthesis.

---

## 🌟 GitHub Repository "About" Description
You can copy-paste the following summary into the "About" text box of your GitHub repository:
> 🎓 **ResearchBuddy**: A gamified academic networking & collaboration matcher for PhDs, researchers, and computer scientists. Leverages Gemini 3.5 & OpenAI vector embeddings to run semantic co-author search with built-in Model Context Protocol (MCP) tool exposure.

---

## 📂 Exporting & Pushing to your GitHub Repository

Below is the step-by-step developer guide to export this workspace directly out of Google AI Studio and configure it as a professional public/private GitHub repository.

### Step 1: Download your Project Files
1. Look at the upper-right corner of the **Google AI Studio** workspace.
2. Click on the **Settings Gear Icon** (or click on the **Export/Download** action button).
3. Select **"Export as ZIP"** to download the complete codebase to your computer.
4. Extract the ZIP file into a dedicated local directory of your choice on your computer.

### Step 2: Initialize Git in your Local Project
Open your system command prompt or Terminal in the extracted directory, and run the following commands:
```bash
# Initialize git in the folder
git init

# Register all project files to the staging index
git add .

# Create the initial launch checkpoint
git commit -m "feat: initial commit of ResearchBuddy matching platform"
```

### Step 3: Create a Repository on GitHub
1. Log into your account on **[GitHub](https://github.com/)**.
2. In the top-right corner, click the **`+`** icon and select **New repository**.
3. Name your repository `ResearchBuddy` (or a name of your choice).
4. Set the visibility to **Public** or **Private** as desired.
5. Do **NOT** initialize the repository with a README, `.gitignore`, or License (since your downloaded code folder already contains them).
6. Click **Create repository**.

### Step 4: Link and Push directly to GitHub
In your terminal, copy the remote repository commands from your GitHub page to upload your files:
```bash
# Add your new remote link
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/ResearchBuddy.git

# Set the primary branch to main
git branch -M main

# Upload the complete codebase seamlessly to GitHub
git push -u origin main
```

---

## 🧪 Prompts History Registry
The chronological registry of requirements used to guide this codebase is preserved below for your academic report or documentation records:

1. **Preset Architecture and Layout Alignment**: Configure visual panels, profile fields (H-Index, citations, papers), and core swiping card cards design.
2. **Profile Creation Picture & Upload Upgrades**: Build Base64 local image upload converting logic, unified with selectable ready-made researcher illustration avatars.
3. **Database Performance Safeguards (MatchCache)**: Add a hybrid semantic match memory system to cache candidate scores and prevent redundant generative AI queries on back-and-forth swiping actions.
4. **Resilience Engineering (Local Similarity Coupler)**: Create local backup algorithmic rules to compute matching scores (between 50% and 98%) and write detailed alignment insights if Gemini hits a rate limit (HTTP 429).
5. **Model Context Protocol Exposure**: Create an isolated `/mcp-server` directory exposing database similarity searches (`find_collaborators`) and accepted match indexes (`get_active_collabs`) to standard LLM clients via stdio channel.
6. **Platform Branding Re-alignment**: Cleanse dating-related terminology across comments, banners, and README modules, replacing them with professional peer co-authorship and networking semantics.
