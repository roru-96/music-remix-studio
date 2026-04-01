import { useState } from 'react';
import { Search, Clock, ChevronRight, Loader2, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { useRemixStore } from '../stores/remixStore';
import type { SearchResult } from '../types';

export function SearchStep() {
  const {
    searchQuery, setSearchQuery, searchResults, searchLoading, searchError,
    aiBestIndex, aiReason, aiCleanQuery,
    searchSongs, selectedSong, selectSong, setStep,
  } = useRemixStore();

  const [inputValue, setInputValue] = useState(searchQuery);
  const [confirmed, setConfirmed] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = inputValue.trim();
    if (!q) return;
    setConfirmed(false);
    setSearchQuery(q);
    searchSongs(q);
  };

  const handleConfirm = (song: SearchResult) => {
    selectSong(song);
    setConfirmed(true);
  };

  const handleProceed = () => {
    if (selectedSong) setStep('options');
  };

  const aiPick = aiBestIndex !== null ? searchResults[aiBestIndex] : null;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-dark-100">Find a Song</h2>
        <p className="text-dark-400">Search by song name, artist, or both</p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="e.g. Viva La Vida, Bohemian Rhapsody, Kendrick..."
          className="w-full pl-12 pr-16 py-4 bg-dark-700 border border-dark-600 rounded-xl text-dark-100 placeholder-dark-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-lg"
          autoFocus
        />
        <button
          type="submit"
          disabled={searchLoading || !inputValue.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white rounded-lg transition-colors"
        >
          {searchLoading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Search className="w-4 h-4" />
          }
        </button>
      </form>

      {/* Corrected query notice */}
      {aiCleanQuery && aiCleanQuery !== searchQuery && (
        <div className="flex items-center justify-center gap-2 text-sm text-orange-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Searched for: <strong>{aiCleanQuery}</strong></span>
        </div>
      )}

      {/* Error */}
      {searchError && (
        <div className="flex items-center gap-2 max-w-2xl mx-auto bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {searchError}
        </div>
      )}

      {/* AI recommendation */}
      {aiPick && !confirmed && (
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="flex items-center gap-2 text-orange-400 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Best match</span>
            {aiReason && <span className="text-dark-400">— {aiReason}</span>}
          </div>
          <button
            onClick={() => handleConfirm(aiPick)}
            className="w-full flex items-center gap-3 p-4 bg-orange-500/10 border-2 border-orange-500 rounded-xl text-left hover:bg-orange-500/15 transition-colors group"
          >
            {aiPick.thumbnail && (
              <img src={aiPick.thumbnail} alt="" className="w-28 h-18 object-cover rounded-lg flex-shrink-0" style={{ height: '72px' }} />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-dark-100 font-semibold truncate">{aiPick.title}</p>
              <p className="text-dark-400 text-sm mt-0.5">{aiPick.channel}</p>
              <div className="flex items-center gap-1 mt-1.5 text-dark-400 text-xs">
                <Clock className="w-3 h-3" />
                <span>{aiPick.duration}</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0 pr-1">
              <div className="px-3 py-1.5 bg-orange-600 group-hover:bg-orange-500 text-white text-sm rounded-lg transition-colors font-medium">
                Use this
              </div>
            </div>
          </button>

          {/* Other results */}
          {searchResults.length > 1 && (
            <div>
              <p className="text-dark-500 text-xs mb-2">Other results</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {searchResults
                  .filter((_, i) => i !== aiBestIndex)
                  .map((result) => (
                    <button
                      key={result.video_id}
                      onClick={() => handleConfirm(result)}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg text-left bg-dark-700 border border-dark-600 hover:border-dark-500 transition-colors"
                    >
                      {result.thumbnail && (
                        <img src={result.thumbnail} alt="" className="w-20 h-14 object-cover rounded flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-dark-200 text-xs font-medium truncate">{result.title}</p>
                        <p className="text-dark-500 text-xs mt-0.5">{result.channel}</p>
                        <div className="flex items-center gap-1 mt-1 text-dark-500 text-xs">
                          <Clock className="w-3 h-3" />
                          <span>{result.duration}</span>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmed selection */}
      {confirmed && selectedSong && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-3 p-4 bg-dark-700 border border-dark-600 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            {selectedSong.thumbnail && (
              <img src={selectedSong.thumbnail} alt="" className="w-20 h-14 object-cover rounded flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-dark-100 font-medium truncate">{selectedSong.title}</p>
              <p className="text-dark-400 text-sm">{selectedSong.channel} · {selectedSong.duration}</p>
            </div>
            <button
              onClick={() => setConfirmed(false)}
              className="text-dark-400 hover:text-dark-200 text-xs underline flex-shrink-0"
            >
              Change
            </button>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleProceed}
              className="flex items-center gap-2 px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-medium transition-colors text-lg"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
