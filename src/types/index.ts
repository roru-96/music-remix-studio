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
  original_audio?: string;
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
  cloud_provider?: string;
  gpu_type?: string;
  instance_ip?: string;
  loaded_model?: string | null;
  idle_seconds?: number | null;
  auto_shutdown_remaining_seconds?: number | null;
  gpu_info?: string | null;
  gpu_price_per_hour?: number | null;
  boot_log?: string[];
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
