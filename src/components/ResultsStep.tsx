import { RotateCcw, Music, Save, Check, Clock, Disc } from 'lucide-react';
import { useRemixStore } from '../stores/remixStore';
import { AudioPlayer } from './AudioPlayer';
import { api } from '../services/api';
import { useState } from 'react';

function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}m ${s}s`;
}

export function ResultsStep() {
  const { jobStatus, jobId, resetToSearch, resetToOptions,
          saveToLibrary, lastSavedId } = useRemixStore();
  const [stemsOpen, setStemsOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!jobStatus || jobStatus.status !== 'complete') return null;

  const finalUrl = jobStatus.download_url
    ? api.getFileUrl(jobStatus.download_url.replace('/files/', ''))
    : jobStatus.output_path
    ? api.getFileByPathUrl(jobStatus.output_path)
    : null;

  const originalUrl = jobStatus.original_audio
    ? api.getFileByPathUrl(jobStatus.original_audio)
    : null;

  const stemEntries = Object.entries(jobStatus.stems || {}).filter(
    ([, path]) => !!path
  );

  const handleSave = async () => {
    if (!jobId) return;
    setSaving(true);
    await saveToLibrary();
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-dark-100">Your Remix is Ready</h2>
        {jobStatus.song_title && (
          <p className="text-dark-400">{jobStatus.song_title}</p>
        )}
        {jobStatus.total_elapsed_seconds && (
          <p className="flex items-center justify-center gap-1 text-dark-500 text-xs">
            <Clock className="w-3 h-3" />
            Completed in {formatTime(jobStatus.total_elapsed_seconds)}
          </p>
        )}
      </div>

      {/* Remix (final mix) */}
      {finalUrl && (
        <div>
          <p className="text-dark-400 text-xs mb-1.5 font-medium uppercase tracking-wide">Remixed Version</p>
          <AudioPlayer src={finalUrl} label="Final Mix" />
        </div>
      )}

      {/* Original song */}
      {originalUrl && (
        <div>
          <p className="text-dark-400 text-xs mb-1.5 font-medium uppercase tracking-wide flex items-center gap-1">
            <Disc className="w-3 h-3" />Original Song
          </p>
          <AudioPlayer src={originalUrl} label="Original" />
        </div>
      )}

      {/* Warnings */}
      {jobStatus.voice_conversion_error && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-yellow-400 text-sm">
          Voice conversion skipped: {jobStatus.voice_conversion_error}
        </div>
      )}
      {jobStatus.style_transfer_error && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-yellow-400 text-sm">
          Style transfer skipped: {jobStatus.style_transfer_error}
        </div>
      )}

      {/* Stems */}
      {stemEntries.length > 0 && (
        <div>
          <button
            onClick={() => setStemsOpen(!stemsOpen)}
            className="flex items-center gap-2 text-dark-300 hover:text-dark-100 text-sm transition-colors"
          >
            <Music className="w-4 h-4" />
            Individual Stems ({stemEntries.length})
            <span className={`transition-transform ${stemsOpen ? 'rotate-90' : ''}`}>&#9654;</span>
          </button>

          {stemsOpen && (
            <div className="mt-3 space-y-2">
              {stemEntries.map(([name, path]) => (
                <AudioPlayer
                  key={name}
                  src={api.getFileByPathUrl(path)}
                  label={name.charAt(0).toUpperCase() + name.slice(1)}
                  compact
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving || !!lastSavedId}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${
            lastSavedId
              ? 'bg-green-500/10 text-green-400 border border-green-500/30'
              : 'bg-orange-600 hover:bg-orange-500 text-white'
          }`}
        >
          {lastSavedId ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {lastSavedId ? 'Saved' : saving ? 'Saving...' : 'Save to Library'}
        </button>

        <button
          onClick={resetToOptions}
          className="flex items-center gap-2 px-5 py-2.5 bg-dark-600 hover:bg-dark-500 text-dark-200 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Remix Again
        </button>

        <button
          onClick={resetToSearch}
          className="flex items-center gap-2 px-5 py-2.5 bg-dark-600 hover:bg-dark-500 text-dark-200 rounded-lg transition-colors"
        >
          New Song
        </button>
      </div>
    </div>
  );
}
