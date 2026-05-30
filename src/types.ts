export interface Profile {
  id: string;
  name: string;
  role: string;
  institution: string;
  field: string;
  avatar: string;
  hIndex: number;
  citations: string;
  skills: string[];
  interests: string[];
  about: string;
  matchScore: number;
  aiInsight: string;
  publications: Array<{
    title: string;
    journal: string;
    year: string;
  }>;
  collaborationHistory: Array<{
    project: string;
    role: string;
    synergy: string;
    status: 'ACTIVE' | 'COMPLETED';
  }>;
}

export interface Persona {
  id: string;
  name: string;
  title: string;
  avatar: string;
  background: string;
  skills: string[];
  interests: string[];
  intent: string;
}

export interface MatchRequest {
  id?: string;
  name: string;
  background: string;
  skills: string[];
  interests: string[];
  intent: string;
  commitment?: string;
  avatar?: string;
}

export interface MatchResult {
  profiles: Profile[];
  queryProfile: MatchRequest;
}

export interface Match {
  matchId: string;
  createdAt: string;
  partner: Profile;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}
