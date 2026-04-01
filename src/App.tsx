import { Music } from 'lucide-react';
import { useRemixStore } from './stores/remixStore';
import { SearchStep } from './components/SearchStep';
import { OptionsStep } from './components/OptionsStep';
import { ProcessingStep } from './components/ProcessingStep';
import { ResultsStep } from './components/ResultsStep';
import { GPUStatus } from './components/GPUStatus';

const STEPS = ['search', 'options', 'processing', 'results'] as const;
const STEP_LABELS = ['Find Song', 'Options', 'Processing', 'Results'];

function App() {
  const step = useRemixStore((s) => s.step);
  const currentIndex = STEPS.indexOf(step);

  return (
    <div className="min-h-screen bg-dark-900 text-dark-100">
      {/* Header */}
      <header className="border-b border-dark-700 bg-dark-800/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
              <Music className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg">Remix Studio</span>
          </div>
          <GPUStatus />
        </div>
      </header>

      {/* Step indicator */}
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-2">
        <div className="flex items-center justify-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
                i === currentIndex
                  ? 'bg-orange-500/15 text-orange-400 font-medium'
                  : i < currentIndex
                  ? 'text-dark-300'
                  : 'text-dark-500'
              }`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  i === currentIndex
                    ? 'bg-orange-500 text-white'
                    : i < currentIndex
                    ? 'bg-dark-500 text-dark-200'
                    : 'bg-dark-700 text-dark-500'
                }`}>
                  {i + 1}
                </span>
                <span className="hidden sm:inline">{STEP_LABELS[i]}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-px mx-1 ${
                  i < currentIndex ? 'bg-dark-500' : 'bg-dark-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {step === 'search' && <SearchStep />}
        {step === 'options' && <OptionsStep />}
        {step === 'processing' && <ProcessingStep />}
        {step === 'results' && <ResultsStep />}
      </main>
    </div>
  );
}

export default App;
