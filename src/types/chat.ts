export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  error?: boolean;
}

export interface SubsidiaryInfo {
  id: string;
  name: string;
  category: string;
  headline: string;
  description: string;
  capabilities: string[];
  parentBrand: string;
  website?: string;
}
