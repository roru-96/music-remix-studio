import { Check, Loader2, X } from 'lucide-react';
import { useRemixStore } from '../stores/remixStore';

const STAGES = [
  { key: 'searching', label: 'Searching' },
  { key: 'downloading', label: 'Downloading audio' },
  { key: 'separating', label: 'Separating stems' },
  { key: 'converting_voice', label: 'Converting voice' },
  { key: 'transferring_style', label: 'Transferring style' },
  { key: 'mixing', label: 'Mixing final audio' },
];

export function ProcessingStep() {
  const { jobStatus, jobError, cancelJob, voiceSwapEnabled, styleEnabled } = useRemixStore();

  const currentStage = jobStatus?.stage || 'searching';
  const progress = jobStatus?.progress || 0;

  // Filter stages based on enabled options
  const activeStages = STAGES.filter((s) => {
    if (s.key === 'converting_voice' && !voiceSwapEnabled) return false;
    if (s.key === 'transferring_style' && !styleEnabled) return false;
    return true;
  });

  const currentIndex = activeStages.findIndex((s) => s.key === currentStage);

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-dark-100">Processing</h2>
        {jobStatus?.song_title && (
          <p className="text-dark-400">{jobStatus.song_title}</p>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-dark-700 rounded-full h-2 overflow-hidden">
        <div
          className="bg-orange-500 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stages */}
      <div className="space-y-3">
        {activeStages.map((stage, i) => {
          const isComplete = i < currentIndex;
          const isCurrent = stage.key === currentStage;

          return (
            <div
              key={stage.key}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isCurrent
                  ? 'bg-orange-500/10 border border-orange-500/30 animate-pulse-orange'
                  : isComplete
                  ? 'bg-dark-700/50'
                  : 'bg-dark-800/30'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                isComplete
                  ? 'bg-green-500/20 text-green-400'
                  : isCurrent
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'bg-dark-700 text-dark-500'
              }`}>
                {isComplete ? (
                  <Check className="w-4 h-4" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="text-xs">{i + 1}</span>
                )}
              </div>
              <span className={`text-sm ${
                isComplete ? 'text-dark-300' : isCurrent ? 'text-dark-100 font-medium' : 'text-dark-500'
              }`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Error */}
      {jobError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
          {jobError}
        </div>
      )}

      {/* Cancel */}
      <div className="flex justify-center">
        <button
          onClick={cancelJob}
          className="flex items-center gap-2 px-5 py-2.5 bg-dark-600 hover:bg-dark-500 text-dark-300 rounded-lg text-sm transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </div>
  );
}
