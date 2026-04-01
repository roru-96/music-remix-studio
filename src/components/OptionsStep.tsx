import { useState, useEffect } from 'react';
import { Mic, Palette, Search, ChevronLeft, ChevronRight, Loader2, Sparkles, Download, Zap, Wrench, Check } from 'lucide-react';
import { useRemixStore } from '../stores/remixStore';

export function OptionsStep() {
  const store = useRemixStore();
  const [artistInput, setArtistInput] = useState(store.targetArtist);

  // Debounced AI voice search
  useEffect(() => {
    if (!store.voiceSwapEnabled || !artistInput.trim()) return;
    const timer = setTimeout(() => {
      store.setTargetArtist(artistInput.trim());
      store.fetchVoiceOptions(artistInput.trim());
    }, 800);
    return () => clearTimeout(timer);
  }, [artistInput, store.voiceSwapEnabled]);

  // Fetch style ideas when style is enabled
  useEffect(() => {
    if (store.styleEnabled && store.styleIdeas.length === 0 && !store.styleLoading) {
      store.fetchStyleIdeas();
    }
  }, [store.styleEnabled]);

  const trainingDone = store.trainingStatus?.status === 'complete';
  const trainingInProgress = store.trainingJobId && store.trainingStatus?.status === 'processing';

  return (
    <div className="space-y-6">
      {/* Selected song summary */}
      {store.selectedSong && (
        <div className="flex items-center gap-3 bg-dark-700 rounded-lg p-3 max-w-2xl mx-auto">
          {store.selectedSong.thumbnail && (
            <img src={store.selectedSong.thumbnail} alt="" className="w-16 h-10 object-cover rounded" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-dark-100 text-sm font-medium truncate">{store.selectedSong.title}</p>
            <p className="text-dark-400 text-xs">{store.selectedSong.channel}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {/* Voice Swap Card */}
        <div className={`rounded-xl border-2 transition-colors ${
          store.voiceSwapEnabled ? 'border-orange-500 bg-orange-500/5' : 'border-dark-600 bg-dark-700'
        }`}>
          <button
            onClick={() => store.setVoiceSwapEnabled(!store.voiceSwapEnabled)}
            className="flex items-center gap-3 w-full p-4"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              store.voiceSwapEnabled ? 'bg-orange-500/20 text-orange-400' : 'bg-dark-600 text-dark-300'
            }`}>
              <Mic className="w-5 h-5" />
            </div>
            <div className="text-left flex-1">
              <p className="text-dark-100 font-medium">Voice Swap</p>
              <p className="text-dark-400 text-sm">Change the singer's voice</p>
            </div>
            <div className={`w-11 h-6 rounded-full transition-colors ${
              store.voiceSwapEnabled ? 'bg-orange-500' : 'bg-dark-500'
            }`}>
              <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
                store.voiceSwapEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'
              }`} />
            </div>
          </button>

          {store.voiceSwapEnabled && (
            <div className="px-4 pb-4 space-y-3">
              {/* Artist search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="text"
                  value={artistInput}
                  onChange={(e) => setArtistInput(e.target.value)}
                  placeholder="Who should sing this? (e.g. Frank Sinatra)"
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 placeholder-dark-400 text-sm focus:outline-none focus:border-orange-500"
                />
                {store.voiceLoading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400 animate-spin" />
                )}
              </div>

              {/* Mode selector: Quick vs Custom */}
              {store.targetArtist && (
                <div className="flex gap-2">
                  <button
                    onClick={() => store.setVoiceMode('quick')}
                    className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      store.voiceMode === 'quick'
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50'
                        : 'bg-dark-800 text-dark-400 border border-dark-600 hover:border-dark-500'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Quick (pre-trained)
                  </button>
                  <button
                    onClick={() => store.setVoiceMode('custom')}
                    className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      store.voiceMode === 'custom'
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50'
                        : 'bg-dark-800 text-dark-400 border border-dark-600 hover:border-dark-500'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    Custom (train from songs)
                  </button>
                </div>
              )}

              {/* Quick mode: HuggingFace models */}
              {store.voiceMode === 'quick' && store.hfModels.length > 0 && (
                <div>
                  <p className="text-dark-500 text-xs mb-1.5">Pre-trained voice models</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {store.hfModels.map((model) => (
                      <button
                        key={model.model_id}
                        onClick={() => store.setSelectedHFModel(model)}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center gap-2 ${
                          store.selectedHFModel?.model_id === model.model_id
                            ? 'bg-orange-500/20 text-orange-300'
                            : 'text-dark-200 hover:bg-dark-600'
                        }`}
                      >
                        <span className="font-medium truncate flex-1">{model.name}</span>
                        <span className="text-dark-500 text-xs flex items-center gap-1">
                          <Download className="w-3 h-3" />{model.downloads}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {store.voiceMode === 'quick' && store.targetArtist && store.hfModels.length === 0 && !store.voiceLoading && (
                <p className="text-dark-500 text-xs">No pre-trained models found. Try Custom mode to train one from their songs.</p>
              )}

              {/* Custom mode: Train from artist's songs */}
              {store.voiceMode === 'custom' && store.targetArtist && (
                <div className="space-y-2">
                  {!store.trainingJobId && !trainingDone && (
                    <div className="bg-dark-800 rounded-lg p-3 space-y-2">
                      <p className="text-dark-200 text-xs">
                        AI will find {store.targetArtist}'s most popular songs, download them, extract clean vocals, and train a custom voice model.
                      </p>
                      <button
                        onClick={() => store.startTraining(store.targetArtist)}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-medium transition-colors w-full justify-center"
                      >
                        <Sparkles className="w-4 h-4" />
                        Train Custom Voice Model
                      </button>
                    </div>
                  )}

                  {/* Training progress */}
                  {trainingInProgress && store.trainingStatus && (
                    <div className="bg-dark-800 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2 text-orange-400 text-xs">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Training: {store.trainingStatus.stage}</span>
                      </div>
                      <div className="w-full bg-dark-700 rounded-full h-1.5">
                        <div
                          className="bg-orange-500 h-full rounded-full transition-all"
                          style={{ width: `${store.trainingStatus.progress}%` }}
                        />
                      </div>
                      {store.trainingSongs.length > 0 && (
                        <p className="text-dark-500 text-xs">
                          Songs: {store.trainingSongs.map(s => s.title).join(', ')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Training complete */}
                  {trainingDone && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-sm">Voice model trained and ready</span>
                    </div>
                  )}

                  {/* Training error */}
                  {store.trainingStatus?.status === 'error' && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-xs">
                      {store.trainingStatus.error}
                    </div>
                  )}
                </div>
              )}

              {/* AI vocal suggestions */}
              {store.voiceSuggestions.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-orange-400 text-xs mb-2">
                    <Sparkles className="w-3 h-3" />
                    <span>AI vocal approaches</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {store.voiceSuggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => store.setPitchShift(s.pitch_shift)}
                        className="text-left p-2.5 rounded-lg bg-dark-800 border border-dark-600 hover:border-orange-500/50 transition-colors"
                      >
                        <p className="text-dark-100 text-xs font-medium">{s.label}</p>
                        <p className="text-dark-500 text-xs mt-0.5 line-clamp-2">{s.description}</p>
                        <p className="text-orange-400/70 text-xs mt-1">Pitch: {s.pitch_shift > 0 ? '+' : ''}{s.pitch_shift}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pitch shift */}
              <div>
                <label className="text-dark-400 text-xs block mb-1">
                  Pitch Shift: {store.pitchShift > 0 ? '+' : ''}{store.pitchShift} semitones
                </label>
                <input
                  type="range"
                  min={-12}
                  max={12}
                  value={store.pitchShift}
                  onChange={(e) => store.setPitchShift(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Style Transfer Card */}
        <div className={`rounded-xl border-2 transition-colors ${
          store.styleEnabled ? 'border-orange-500 bg-orange-500/5' : 'border-dark-600 bg-dark-700'
        }`}>
          <button
            onClick={() => store.setStyleEnabled(!store.styleEnabled)}
            className="flex items-center gap-3 w-full p-4"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              store.styleEnabled ? 'bg-orange-500/20 text-orange-400' : 'bg-dark-600 text-dark-300'
            }`}>
              <Palette className="w-5 h-5" />
            </div>
            <div className="text-left flex-1">
              <p className="text-dark-100 font-medium">Style Transfer</p>
              <p className="text-dark-400 text-sm">Change the music genre/style</p>
            </div>
            <div className={`w-11 h-6 rounded-full transition-colors ${
              store.styleEnabled ? 'bg-orange-500' : 'bg-dark-500'
            }`}>
              <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
                store.styleEnabled ? 'translate-x-[22px]' : 'translate-x-0.5'
              }`} />
            </div>
          </button>

          {store.styleEnabled && (
            <div className="px-4 pb-4 space-y-3">
              {store.styleLoading ? (
                <div className="flex items-center justify-center gap-2 py-6 text-orange-400 text-sm">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>AI is crafting style ideas for this song...</span>
                </div>
              ) : (
                <>
                  {store.styleIdeas.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {store.styleIdeas.map((idea, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            store.setSelectedStyleIdea(idea);
                            store.setCustomStylePrompt(idea.prompt);
                          }}
                          className={`flex flex-col gap-1 p-2.5 rounded-lg text-left transition-colors ${
                            store.selectedStyleIdea === idea
                              ? 'bg-orange-500/20 border border-orange-500 text-orange-300'
                              : 'bg-dark-800 border border-dark-600 text-dark-200 hover:border-dark-500'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">{idea.icon}</span>
                            <span className="text-xs font-medium">{idea.name}</span>
                          </div>
                          <span className="text-dark-500 text-xs line-clamp-2">{idea.reason}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => store.fetchStyleIdeas()}
                    className="flex items-center gap-1.5 text-orange-400 text-xs hover:text-orange-300 transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    Generate new ideas
                  </button>
                </>
              )}

              <div>
                <label className="text-dark-400 text-xs block mb-1">Style prompt (AI-generated or custom)</label>
                <textarea
                  value={store.customStylePrompt}
                  onChange={(e) => {
                    store.setCustomStylePrompt(e.target.value);
                    store.setSelectedStyleIdea(null);
                  }}
                  placeholder="Describe the instrumentation and style..."
                  className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 placeholder-dark-400 text-sm focus:outline-none focus:border-orange-500 resize-none h-20"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-center gap-3">
        <button
          onClick={() => store.setStep('search')}
          className="flex items-center gap-2 px-5 py-2.5 bg-dark-600 hover:bg-dark-500 text-dark-200 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={() => store.startRemix()}
          className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-medium transition-colors"
        >
          {store.voiceSwapEnabled || store.styleEnabled ? 'Start Remix' : 'Separate Stems'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
