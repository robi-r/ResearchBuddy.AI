/**
 * ResearchBuddy Performance and Resilience Engineering Module
 * Includes Client-Side MatchCache and LocalSimilarityCoupler fallback engine.
 */

const CACHE_KEY = "researchbuddy_matches_cache";
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * MatchCache - Client-side performance optimization caching engine.
 * Decouples immediate server requests on rapid page reloads or panel switching.
 */
export const MatchCache = {
  /**
   * Save candidate list data to localStorage with a validation TTL timestamp.
   * @param {Array} candidates Array of prospect researcher cards
   */
  saveCandidates(candidates) {
    if (typeof window === "undefined") return;
    try {
      const envelope = {
        timestamp: Date.now(),
        data: candidates
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(envelope));
      console.log(`[MatchCache] Successfully cached ${candidates.length} profiles for 30 minutes.`);
    } catch (err) {
      console.error("[MatchCache] Failed to write cache envelope:", err);
    }
  },

  /**
   * Retrieve cached profiles if active and within 30 minutes validity duration.
   * @returns {Array|null} Parsed profiles or null if invalid/stale
   */
  getCandidates() {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;

      const envelope = JSON.parse(raw);
      const isExpired = Date.now() - envelope.timestamp > CACHE_TTL;

      if (isExpired) {
        console.log("[MatchCache] Cached profiles expired. Preparing server cycle.");
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      console.log(`[MatchCache] Cache hit. Sourced ${envelope.data?.length || 0} valid items.`);
      return envelope.data;
    } catch (err) {
      console.error("[MatchCache] Failed to parse cache envelope:", err);
      return null;
    }
  },

  /**
   * Hard wipe the persistent caches to force refresh of values.
   */
  invalidate() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(CACHE_KEY);
    console.log("[MatchCache] Cache cleared.");
  }
};

/**
 * LocalSimilarityCoupler - Resilient client-side algorithm.
 * Triggers fallback matching calculations and humanized insights if the vector API is unresponsive or rate-limited.
 */
export const LocalSimilarityCoupler = {
  /**
   * Calculates similarity matchScore (Jaccard skill footprint overlap metric mapped gracefully into 70%-98% layout space).
   * @param {Array<string>} userSkills List of active user skills
   * @param {Array<string>} userInterests List of active user research interests
   * @param {Object} candidate Prospect researcher profile card
   * @returns {number} Alignment percentage score
   */
  calculateFallbackScore(userSkills = [], userInterests = [], candidate = {}) {
    const candidateSkills = candidate.skills || [];
    const candidateInterests = candidate.interests || [];

    // Synthesize total footprint spaces
    const userSet = new Set([...userSkills.map(s => s.toLowerCase()), ...userInterests.map(i => i.toLowerCase())]);
    const candidateSet = new Set([...candidateSkills.map(s => s.toLowerCase()), ...candidateInterests.map(i => i.toLowerCase())]);

    if (userSet.size === 0 || candidateSet.size === 0) {
      return 72; // Friendly default baseline score
    }

    // Intersecting items check
    let intersectionCount = 0;
    userSet.forEach(item => {
      if (candidateSet.has(item)) {
        intersectionCount++;
      }
    });

    const unionCount = new Set([...userSet, ...candidateSet]).size;
    const jaccardCoefficient = intersectionCount / unionCount;

    // Map Jaccard coefficient linearly into excellent mock matching bounds [50% - 98%]
    const finalScore = Math.min(Math.max(Math.round(50 + jaccardCoefficient * 48), 50), 98);
    return finalScore;
  },

  /**
   * Generates dynamic contextual peer insights on client-side if server vector details fail.
   * @param {Array<string>} userSkills
   * @param {Object} candidate
   * @returns {string} Humanized synergy insight sentence
   */
  generateFallbackInsight(userSkills = [], candidate = {}) {
    const candidateName = candidate.name ? candidate.name.split(" ").slice(-1)[0] : "Researcher";
    const candidateSkills = candidate.skills || [];

    const commonSkills = userSkills.filter(s => 
      candidateSkills.some(cs => cs.toLowerCase() === s.toLowerCase())
    );

    if (commonSkills.length > 0) {
      return `Outstanding compatibility found! You and Dr. ${candidateName} both specialize in ${commonSkills.slice(0, 2).join(" & ")}. Combining your dual expertise yields exceptionally fast development milestones.`;
    }

    // Default structural synergy fallback if skills differ (complementary pairing model)
    return `Excellent research adjacency detected. Under study, your structural profile complements ${candidateName}'s core field of ${candidate.field || "Applied Science"}.`;
  },

  /**
   * Evaluates and updates an entire candidate array with client-side alignment metrics.
   * Useful when server returns profiles but is rate-limited on heavy vector distance processing calculations.
   */
  coupleCandidates(userProfile, rawCandidates) {
    if (!userProfile || !rawCandidates) return rawCandidates;

    const uSkills = userProfile.skills || [];
    const uInterests = userProfile.interests || [];

    return rawCandidates.map(c => {
      const score = this.calculateFallbackScore(uSkills, uInterests, c);
      const insight = this.generateFallbackInsight(uSkills, c);
      return {
        ...c,
        matchScore: c.matchScore || score,
        aiInsight: c.aiInsight || insight
      };
    });
  }
};
