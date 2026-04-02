import { useEffect } from 'react';
import { ArrowLeft, Trash2, Clock, Mic, Palette, Disc } from 'lucide-react';
import { useRemixStore } from '../stores/remixStore';
import { AudioPlayer } from './AudioPlayer';
import type { LibraryEntry } from '../types';

const API_BASE = '/api';

function libraryFileUrl(remixId: string, fileKey: string): string {
  return `${API_BASE}/music-remix/library/${remixId}/file/${fileKey}`;
}

function EntryCard({ entry }: { entry: LibraryEntry }) {
  const { deleteFromLibrary } = useRemixStore();
  const date = new Date(entry.created_at);
  const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const stemKeys = Object.keys(entry.files).filter(k => !['final_mix', 'original'].includes(k));

  return (
    <div className="bg-dark-700 rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-dark-100 font-medium">{entry.song_title}</h3>
          <p className="text-dark-400 text-sm">{entry.song_artist}</p>
        </div>
        <div className="flex items-center gap-2">
          {entry.version > 1 && (
            <span className="text-xs bg-dark-600 text-dark-300 px-2 py-0.5 rounded">v{entry.version}</span>
          )}
          <button
            onClick={() => deleteFromLibrary(entry.id)}
            className="text-dark-500 hover:text-red-400 transition-colors p-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {entry.voice_artist && (
          <span className="flex items-center gap-1 text-xs bg-orange-500/10 text-orange-400 px-2 py-1 rounded">
            <Mic className="w-3 h-3" />{entry.voice_artist}
          </span>
        )}
        {entry.style_prompt && (
          <span className="flex items-center gap-1 text-xs bg-orange-500/10 text-orange-400 px-2 py-1 rounded max-w-[200px] truncate">
            <Palette className="w-3 h-3" />{entry.style_prompt.slice(0, 40)}
          </span>
        )}
        <span className="flex items-center gap-1 text-xs text-dark-500">
          <Clock className="w-3 h-3" />{dateStr}
        </span>
      </div>

      {/* Remixed version */}
      {entry.files.final_mix && (
        <div>
          <p className="text-dark-400 text-xs mb-1 font-medium uppercase tracking-wide">Remixed</p>
          <AudioPlayer src={libraryFileUrl(entry.id, 'final_mix')} label="Final Mix" />
        </div>
      )}

      {/* Original */}
      {entry.files.original && (
        <div>
          <p className="text-dark-400 text-xs mb-1 font-medium uppercase tracking-wide flex items-center gap-1">
            <Disc className="w-3 h-3" />Original
          </p>
          <AudioPlayer src={libraryFileUrl(entry.id, 'original')} label="Original" compact />
        </div>
      )}

      {/* Stems */}
      {stemKeys.length > 0 && (
        <details className="group">
          <summary className="text-dark-400 text-xs cursor-pointer hover:text-dark-200">
            Stems ({stemKeys.length})
          </summary>
          <div className="mt-2 space-y-1.5">
            {stemKeys.map((key) => (
              <AudioPlayer
                key={key}
                src={libraryFileUrl(entry.id, key)}
                label={key.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())}
                compact
              />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

export function Library() {
  const { libraryEntries, libraryLoading, loadLibrary, setStep } = useRemixStore();

  useEffect(() => {
    loadLibrary();
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setStep('search')}
          className="p-2 text-dark-400 hover:text-dark-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-semibold text-dark-100">Your Library</h2>
        <span className="text-dark-500 text-sm">{libraryEntries.length} remixes</span>
      </div>

      {libraryLoading && (
        <p className="text-dark-400 text-center py-8">Loading...</p>
      )}

      {!libraryLoading && libraryEntries.length === 0 && (
        <div className="text-center py-12">
          <p className="text-dark-400">No saved remixes yet.</p>
          <p className="text-dark-500 text-sm mt-1">Complete a remix and hit "Save to Library" to keep it.</p>
        </div>
      )}

      <div className="space-y-4">
        {libraryEntries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
