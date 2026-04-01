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

export type WizardStep = 'search' | 'options' | 'processing' | 'results';

export interface StylePreset {
  id: string;
  name: string;
  icon: string;
  prompt: string;
}

export const STYLE_PRESETS: StylePreset[] = [
  { id: 'jazz', name: 'Jazz', icon: '🎷', prompt: 'Jazz quartet with upright bass, brushed drums, piano trio, warm analog tone' },
  { id: 'classical', name: 'Classical', icon: '🎻', prompt: 'Classical orchestral arrangement with strings, woodwinds, and French horn' },
  { id: 'electronic', name: 'Electronic', icon: '🎛️', prompt: 'Electronic dance music with synthesizers, 808 drums, and deep bass' },
  { id: 'acoustic', name: 'Acoustic', icon: '🎸', prompt: 'Acoustic arrangement with fingerpicked guitar, light percussion, and warm vocals' },
  { id: 'lofi', name: 'Lo-fi', icon: '📻', prompt: 'Lo-fi hip hop with vinyl crackle, mellow piano chords, and relaxed drums' },
  { id: 'orchestral', name: 'Orchestral', icon: '🎼', prompt: 'Full symphony orchestra with sweeping strings, brass fanfares, and timpani' },
  { id: 'rock', name: 'Rock', icon: '🎸', prompt: 'Rock band with electric guitar, driving drums, and distorted bass' },
  { id: 'metal', name: 'Metal', icon: '🤘', prompt: 'Heavy metal with distorted guitars, double kick drums, and aggressive bass' },
  { id: 'rnb', name: 'R&B', icon: '🎤', prompt: 'Smooth R&B with neo-soul keys, muted guitar, and groovy bass' },
  { id: 'reggae', name: 'Reggae', icon: '🌴', prompt: 'Reggae with off-beat guitar skank, deep bass, and one-drop drums' },
  { id: 'latin', name: 'Latin', icon: '💃', prompt: 'Latin music with congas, bongos, brass section, and rhythmic acoustic guitar' },
  { id: 'country', name: 'Country', icon: '🤠', prompt: 'Country arrangement with steel guitar, fiddle, acoustic guitar, and train-beat drums' },
];
