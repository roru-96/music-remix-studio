import { create } from 'zustand';
import type { SearchResult, JobStatus, WizardStep, LibraryEntry } from '../types';
import { api } from '../services/api';
import type { VoiceSuggestion, HFModel, StyleIdea } from '../services/api';

interface RemixState {
  // Wizard
  step: WizardStep;
  setStep: (step: WizardStep) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: SearchResult[];
  searchLoading: boolean;
  searchError: string | null;
  aiBestIndex: number | null;
  aiReason: string;
  aiCleanQuery: string;
  searchSongs: (query: string) => Promise<void>;

  // Selected song
  selectedSong: SearchResult | null;
  selectSong: (song: SearchResult) => void;

  // Voice swap options
  voiceSwapEnabled: boolean;
  setVoiceSwapEnabled: (v: boolean) => void;
  targetArtist: string;
  setTargetArtist: (a: string) => void;
  voiceSuggestions: VoiceSuggestion[];
  hfModels: HFModel[];
  selectedHFModel: HFModel | null;
  setSelectedHFModel: (m: HFModel | null) => void;
  voiceLoading: boolean;
  fetchVoiceOptions: (artist: string) => Promise<void>;
  pitchShift: number;
  setPitchShift: (p: number) => void;
  voiceMode: 'quick' | 'custom';
  setVoiceMode: (m: 'quick' | 'custom') => void;
  trainingJobId: string | null;
  trainingStatus: JobStatus | null;
  trainingSongs: { title: string; video_id: string }[];
  startTraining: (artist: string) => Promise<void>;
  pollTraining: () => Promise<void>;
  _trainingPollTimer: ReturnType<typeof setInterval> | null;

  // Style transfer options
  styleEnabled: boolean;
  setStyleEnabled: (v: boolean) => void;
  styleIdeas: StyleIdea[];
  styleLoading: boolean;
  selectedStyleIdea: StyleIdea | null;
  setSelectedStyleIdea: (s: StyleIdea | null) => void;
  customStylePrompt: string;
  setCustomStylePrompt: (p: string) => void;
  fetchStyleIdeas: (genreHint?: string) => Promise<void>;

  // Processing
  jobId: string | null;
  jobStatus: JobStatus | null;
  jobError: string | null;
  startRemix: () => Promise<void>;
  pollJob: () => Promise<void>;
  cancelJob: () => void;
  _pollTimer: ReturnType<typeof setInterval> | null;

  // Library
  libraryEntries: LibraryEntry[];
  libraryLoading: boolean;
  lastSavedId: string | null;
  parentRemixId: string | null;
  loadLibrary: () => Promise<void>;
  saveToLibrary: () => Promise<void>;
  deleteFromLibrary: (id: string) => Promise<void>;

  // GPU
  gpuStatus: string;
  gpuDetails: import('../types').GPUStatus | null;
  gpuLoading: boolean;
  gpuBootStarted: number | null;
  checkGPU: () => Promise<void>;
  bootGPU: () => Promise<void>;
  shutdownGPU: () => Promise<void>;

  // Reset
  resetToSearch: () => void;
  resetToOptions: () => void;
}

export const useRemixStore = create<RemixState>((set, get) => ({
  // Wizard
  step: 'search',
  setStep: (step) => set({ step }),

  // Search
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
  searchResults: [],
  searchLoading: false,
  searchError: null,
  aiBestIndex: null,
  aiReason: '',
  aiCleanQuery: '',
  searchSongs: async (query) => {
    set({ searchLoading: true, searchResults: [], searchError: null, aiBestIndex: null, aiReason: '', aiCleanQuery: '' });
    try {
      const data = await api.smartSearch(query);
      set({
        searchResults: data.results,
        aiBestIndex: data.best_index,
        aiReason: data.reason,
        aiCleanQuery: data.clean_query,
        searchLoading: false,
      });
    } catch (e) {
      set({ searchLoading: false, searchError: e instanceof Error ? e.message : 'Search failed' });
    }
  },

  // Selected song
  selectedSong: null,
  selectSong: (song) => set({ selectedSong: song }),

  // Voice swap
  voiceSwapEnabled: false,
  setVoiceSwapEnabled: (v) => set({ voiceSwapEnabled: v }),
  targetArtist: '',
  setTargetArtist: (a) => set({ targetArtist: a }),
  voiceSuggestions: [],
  hfModels: [],
  selectedHFModel: null,
  setSelectedHFModel: (m) => set({ selectedHFModel: m }),
  voiceLoading: false,
  fetchVoiceOptions: async (artist) => {
    set({ voiceLoading: true, voiceSuggestions: [], hfModels: [] });
    try {
      const song = get().selectedSong;
      const data = await api.aiVoiceOptions(artist, song?.title);
      set({ voiceSuggestions: data.suggestions, hfModels: data.models, voiceLoading: false });
    } catch {
      set({ voiceLoading: false });
    }
  },
  pitchShift: 0,
  setPitchShift: (p) => set({ pitchShift: p }),
  voiceMode: 'quick',
  setVoiceMode: (m) => set({ voiceMode: m }),
  trainingJobId: null,
  trainingStatus: null,
  trainingSongs: [],
  _trainingPollTimer: null,
  startTraining: async (artist) => {
    set({ trainingJobId: null, trainingStatus: null, trainingSongs: [] });
    try {
      const data = await api.trainVoice(artist, 5);
      set({ trainingJobId: data.job_id });
      const timer = setInterval(() => get().pollTraining(), 3000);
      set({ _trainingPollTimer: timer });
    } catch (e) {
      set({ trainingStatus: { status: 'error', stage: '', progress: 0, error: e instanceof Error ? e.message : 'Training failed' } });
    }
  },
  pollTraining: async () => {
    const { trainingJobId, _trainingPollTimer } = get();
    if (!trainingJobId) return;
    try {
      const data = await api.getTrainingJobStatus(trainingJobId);
      const status = data as unknown as JobStatus;
      set({ trainingStatus: status });
      if (data.songs) set({ trainingSongs: data.songs as { title: string; video_id: string }[] });
      if (status.status === 'complete' || status.status === 'error') {
        if (_trainingPollTimer) clearInterval(_trainingPollTimer);
        set({ _trainingPollTimer: null });
      }
    } catch { /* keep polling */ }
  },

  // Style transfer
  styleEnabled: false,
  setStyleEnabled: (v) => set({ styleEnabled: v }),
  styleIdeas: [],
  styleLoading: false,
  selectedStyleIdea: null,
  setSelectedStyleIdea: (s) => set({ selectedStyleIdea: s }),
  customStylePrompt: '',
  setCustomStylePrompt: (p) => set({ customStylePrompt: p }),
  fetchStyleIdeas: async (genreHint) => {
    const song = get().selectedSong;
    if (!song) return;
    set({ styleLoading: true, styleIdeas: [] });
    try {
      const data = await api.aiStyleIdeas(song.title, song.channel, genreHint);
      set({ styleIdeas: data.ideas, styleLoading: false });
    } catch {
      set({ styleLoading: false });
    }
  },

  // Processing
  jobId: null,
  jobStatus: null,
  jobError: null,
  _pollTimer: null,

  startRemix: async () => {
    const state = get();
    if (!state.selectedSong) return;

    set({ step: 'processing', jobError: null, jobStatus: null, lastSavedId: null });

    try {
      const params: Record<string, unknown> = {
        song_query: `${state.selectedSong.title} ${state.selectedSong.channel}`,
      };
      if (state.voiceSwapEnabled && state.targetArtist) {
        params.target_artist = state.targetArtist;
        if (state.selectedHFModel) {
          params.target_model_url = state.selectedHFModel.url;
        }
        params.pitch_shift = state.pitchShift;
      }
      if (state.styleEnabled && state.customStylePrompt) {
        params.target_style = state.customStylePrompt;
      }

      const data = await api.startRemix(params as Parameters<typeof api.startRemix>[0]);
      set({ jobId: data.job_id });

      const timer = setInterval(() => get().pollJob(), 2000);
      set({ _pollTimer: timer });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to start remix';
      console.error('startRemix failed:', msg);
      set({ jobError: msg });
      // Stay on processing page to show the error, don't bounce back
    }
  },

  pollJob: async () => {
    const { jobId, _pollTimer } = get();
    if (!jobId) return;
    try {
      const status = await api.getJobStatus(jobId);
      set({ jobStatus: status });
      if (status.status === 'complete') {
        if (_pollTimer) clearInterval(_pollTimer);
        set({ _pollTimer: null, step: 'results' });
      } else if (status.status === 'error') {
        if (_pollTimer) clearInterval(_pollTimer);
        set({ _pollTimer: null, jobError: status.error || 'Pipeline failed' });
      }
    } catch { /* keep polling */ }
  },

  cancelJob: () => {
    const { _pollTimer } = get();
    if (_pollTimer) clearInterval(_pollTimer);
    set({ _pollTimer: null, jobId: null, jobStatus: null, step: 'options' });
  },

  // Library
  libraryEntries: [],
  libraryLoading: false,
  lastSavedId: null,
  parentRemixId: null,

  loadLibrary: async () => {
    set({ libraryLoading: true });
    try {
      const data = await api.getLibrary();
      set({ libraryEntries: data.remixes, libraryLoading: false });
    } catch {
      set({ libraryLoading: false });
    }
  },

  saveToLibrary: async () => {
    const state = get();
    if (!state.jobId || !state.selectedSong) return;
    try {
      const result = await api.saveToLibrary({
        job_id: state.jobId,
        song_title: state.selectedSong.title,
        song_artist: state.selectedSong.channel,
        voice_artist: state.voiceSwapEnabled ? state.targetArtist : undefined,
        style_prompt: state.styleEnabled ? state.customStylePrompt : undefined,
        parent_id: state.parentRemixId || undefined,
      });
      set({ lastSavedId: result.id, parentRemixId: result.id });
    } catch (e) {
      console.error('Save failed:', e);
    }
  },

  deleteFromLibrary: async (id) => {
    try {
      await api.deleteFromLibrary(id);
      set({ libraryEntries: get().libraryEntries.filter(e => e.id !== id) });
    } catch (e) {
      console.error('Delete failed:', e);
    }
  },

  // GPU
  gpuStatus: 'unknown',
  gpuDetails: null,
  gpuLoading: false,
  gpuBootStarted: null,
  checkGPU: async () => {
    try {
      const data = await api.getGPUStatus();
      set({ gpuStatus: data.status, gpuDetails: data });
      if (data.status === 'online') {
        set({ gpuLoading: false, gpuBootStarted: null });
      }
    } catch {
      set({ gpuStatus: 'offline', gpuDetails: null });
    }
  },
  bootGPU: async () => {
    set({ gpuLoading: true, gpuBootStarted: Date.now() });
    try {
      await api.bootGPU();
      const poll = setInterval(async () => {
        try {
          const data = await api.getGPUStatus();
          set({ gpuDetails: data });
          if (data.status === 'online') {
            clearInterval(poll);
            set({ gpuStatus: 'online', gpuLoading: false, gpuBootStarted: null });
          }
        } catch { /* keep polling */ }
      }, 5000);
      setTimeout(() => { clearInterval(poll); set({ gpuLoading: false }); }, 300000);
    } catch {
      set({ gpuLoading: false, gpuBootStarted: null });
    }
  },
  shutdownGPU: async () => {
    try {
      await api.shutdownGPU();
      set({ gpuStatus: 'offline', gpuDetails: null, gpuLoading: false, gpuBootStarted: null });
    } catch { /* ignore */ }
  },

  // Reset
  resetToSearch: () => set({
    step: 'search',
    selectedSong: null,
    searchResults: [],
    searchQuery: '',
    voiceSwapEnabled: false,
    targetArtist: '',
    voiceSuggestions: [],
    hfModels: [],
    selectedHFModel: null,
    pitchShift: 0,
    voiceMode: 'quick' as const,
    trainingJobId: null,
    trainingStatus: null,
    trainingSongs: [],
    styleEnabled: false,
    styleIdeas: [],
    selectedStyleIdea: null,
    customStylePrompt: '',
    jobId: null,
    jobStatus: null,
    jobError: null,
    lastSavedId: null,
    parentRemixId: null,
  }),

  resetToOptions: () => {
    const state = get();
    // If current remix was saved, set it as parent for next version
    const parentId = state.lastSavedId || state.parentRemixId;
    set({
      step: 'options',
      jobId: null,
      jobStatus: null,
      jobError: null,
      lastSavedId: null,
      parentRemixId: parentId,
    });
  },
}));
