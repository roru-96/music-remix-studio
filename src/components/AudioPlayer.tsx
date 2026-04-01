import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Download } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  label: string;
  compact?: boolean;
}

export function AudioPlayer({ src, label, compact = false }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => setPlaying(false);

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnd);

    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnd);
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * duration;
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-3 ${compact ? 'p-2' : 'p-3'} bg-dark-700 rounded-lg`}>
      <audio ref={audioRef} src={src} preload="metadata" />

      <button
        onClick={toggle}
        className={`flex-shrink-0 ${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-full bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center transition-colors`}
      >
        {playing ? <Pause className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} /> : <Play className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} ml-0.5`} />}
      </button>

      <div className="flex-1 min-w-0">
        {!compact && <p className="text-dark-200 text-sm font-medium truncate mb-1">{label}</p>}
        <div className="flex items-center gap-2">
          <span className="text-dark-400 text-xs w-9 text-right">{fmt(currentTime)}</span>
          <div
            className="flex-1 h-1.5 bg-dark-600 rounded-full cursor-pointer"
            onClick={seek}
          >
            <div
              className="h-full bg-orange-500 rounded-full transition-[width] duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-dark-400 text-xs w-9">{fmt(duration)}</span>
        </div>
      </div>

      <a
        href={src}
        download
        className="flex-shrink-0 p-2 text-dark-400 hover:text-dark-200 transition-colors"
        title="Download"
      >
        <Download className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      </a>
    </div>
  );
}
