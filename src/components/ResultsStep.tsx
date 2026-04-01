import { RotateCcw, Music } from 'lucide-react';
import { useRemixStore } from '../stores/remixStore';
import { AudioPlayer } from './AudioPlayer';
import { api } from '../services/api';
import { useState } from 'react';

export function ResultsStep() {
  const { jobStatus, resetToSearch, resetToOptions } = useRemixStore();
  const [stemsOpen, setStemsOpen] = useState(false);

  if (!jobStatus || jobStatus.status !== 'complete') return null;

  const finalUrl = jobStatus.download_url
    ? api.getFileUrl(jobStatus.download_url.replace('/files/', ''))
    : jobStatus.output_path
    ? api.getFileByPathUrl(jobStatus.output_path)
    : null;

  const stemEntries = Object.entries(jobStatus.stems || {}).filter(
    ([, path]) => !!path
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-dark-100">Your Remix is Ready</h2>
        {jobStatus.song_title && (
          <p className="text-dark-400">{jobStatus.song_title}</p>
        )}
      </div>

      {/* Main player */}
      {finalUrl && (
        <AudioPlayer src={finalUrl} label="Final Mix" />
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
      <div className="flex justify-center gap-3 pt-2">
        <button
          onClick={resetToOptions}
          className="flex items-center gap-2 px-5 py-2.5 bg-dark-600 hover:bg-dark-500 text-dark-200 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Remix Again
        </button>
        <button
          onClick={resetToSearch}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-medium transition-colors"
        >
          New Song
        </button>
      </div>
    </div>
  );
}
