import type { SearchResult, JobStatus, GPUStatus } from '../types';

const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const resp = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(body || `Request failed: ${resp.status}`);
  }
  return resp.json();
}

export interface VoiceSuggestion {
  label: string;
  description: string;
  pitch_shift: number;
  reason: string;
}

export interface HFModel {
  model_id: string;
  name: string;
  author: string;
  downloads: number;
  url: string;
}

export interface StyleIdea {
  name: string;
  icon: string;
  prompt: string;
  reason: string;
}

export const api = {
  // GPU
  async getGPUStatus(): Promise<GPUStatus> {
    return request('/gpu/status');
  },

  async bootGPU(): Promise<{ status: string }> {
    return request('/gpu/boot', { method: 'POST' });
  },

  // Smart search — runs on GCP backend, no GPU needed, AI picks best match
  async smartSearch(query: string): Promise<{
    results: SearchResult[];
    best_index: number | null;
    clean_query: string;
    reason: string;
  }> {
    return request('/music-remix/smart-search', {
      method: 'POST',
      body: JSON.stringify({ query, max_results: 8 }),
    });
  },

  // AI voice options — diverse vocal approach suggestions + HuggingFace models
  async aiVoiceOptions(artistName: string, songTitle?: string): Promise<{
    models: HFModel[];
    suggestions: VoiceSuggestion[];
    artist: string;
  }> {
    return request('/music-remix/ai-voice-options', {
      method: 'POST',
      body: JSON.stringify({ artist_name: artistName, song_title: songTitle }),
    });
  },

  // AI style ideas — creative instrumental arrangement suggestions
  async aiStyleIdeas(songTitle: string, artist: string, genreHint?: string): Promise<{
    ideas: StyleIdea[];
    song_title: string;
    artist: string;
  }> {
    return request('/music-remix/ai-style-ideas', {
      method: 'POST',
      body: JSON.stringify({ song_title: songTitle, artist, genre_hint: genreHint }),
    });
  },

  // Train custom voice model from artist's songs
  async trainVoice(artistName: string, numSongs?: number): Promise<{
    job_id: string;
    songs_found: number;
    songs: { title: string; video_id: string }[];
    artist: string;
  }> {
    return request('/music-remix/train-voice', {
      method: 'POST',
      body: JSON.stringify({ artist_name: artistName, num_songs: numSongs || 5 }),
    });
  },

  // Full remix pipeline
  async startRemix(params: {
    song_query: string;
    target_artist?: string;
    target_style?: string;
    target_model_url?: string;
    pitch_shift?: number;
  }): Promise<{ job_id: string }> {
    return request('/music-remix/remix', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Poll job
  async getJobStatus(jobId: string): Promise<JobStatus> {
    return request(`/music-remix/jobs/${jobId}`);
  },

  // File URLs
  getFileUrl(filename: string): string {
    return `${API_BASE}/music-remix/files/${filename}`;
  },

  getFileByPathUrl(path: string): string {
    return `${API_BASE}/music-remix/files-by-path?path=${encodeURIComponent(path)}`;
  },
};
