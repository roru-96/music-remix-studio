export interface SearchResult {
  video_id: string;
  title: string;
  duration: string;
  duration_seconds: number;
  thumbnail: string;
  channel: string;
}

export interface VoiceModel {
  model_id: string;
  name: string;
  author: string;
  download_url: string;
}

export interface Stems {
  vocals?: string;
  drums?: string;
  bass?: string;
  other?: string;
}

export interface JobStatus {
  status: 'processing' | 'complete' | 'error';
  stage: string;
  progress: number;
  song_title?: string;
  output_path?: string;
  download_url?: string;
  stems?: Stems;
  error?: string;
  voice_conversion_error?: string;
  style_transfer_error?: string;
  // Timing
  stage_started_at?: number;
  estimated_seconds?: number;
  elapsed_seconds?: number;
  total_elapsed_seconds?: number;
  // Training-specific
  current_song?: string;
  vocals_extracted?: number;
  training_minutes?: number;
  model_path?: string;
  training_error?: string;
}

export interface GPUStatus {
  status: string;
  provider: string;
  instance_id?: string;
  ip?: string;
  gpu_name?: string;
  vram_total_gb?: number;
  vram_used_gb?: number;
}

export interface LibraryEntry {
  id: string;
  song_title: string;
  song_artist: string;
  voice_artist: string | null;
  style_prompt: string | null;
  created_at: string;
  version: number;
  parent_id: string | null;
  files: Record<string, string>;
}

export type WizardStep = 'search' | 'options' | 'processing' | 'results' | 'library';
