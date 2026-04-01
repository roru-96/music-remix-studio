import { useEffect, useState, useRef } from 'react';
import { Cpu, Loader2, Power, ChevronDown, Clock, Server } from 'lucide-react';
import { useRemixStore } from '../stores/remixStore';

function formatElapsed(ms: number): string {
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s}s`;
}

export function GPUStatus() {
  const { gpuStatus, gpuDetails, gpuLoading, gpuBootStarted, checkGPU, bootGPU, shutdownGPU } = useRemixStore();
  const [open, setOpen] = useState(false);
  const [bootElapsed, setBootElapsed] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkGPU().then(() => {
      const s = useRemixStore.getState().gpuStatus;
      if (s !== 'online' && !useRemixStore.getState().gpuLoading) {
        bootGPU();
      }
    });
    const interval = setInterval(checkGPU, 10000);
    return () => clearInterval(interval);
  }, []);

  // Boot elapsed timer
  useEffect(() => {
    if (!gpuBootStarted) { setBootElapsed(0); return; }
    const interval = setInterval(() => {
      setBootElapsed(Date.now() - gpuBootStarted);
    }, 1000);
    return () => clearInterval(interval);
  }, [gpuBootStarted]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const provider = gpuDetails?.cloud_provider || 'unknown';
  const gpuType = gpuDetails?.gpu_type || null;
  const ip = gpuDetails?.instance_ip || null;
  const bootLog = gpuDetails?.boot_log || [];
  const isOnline = gpuStatus === 'online';

  return (
    <div className="relative" ref={panelRef}>
      {/* Clickable status chip */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-dark-700 transition-colors"
      >
        <div className={`w-2 h-2 rounded-full ${
          isOnline ? 'bg-green-400' :
          gpuLoading ? 'bg-yellow-400 animate-pulse' :
          'bg-dark-500'
        }`} />
        <span className="text-dark-400 text-sm">
          {isOnline ? 'GPU Online' : gpuLoading ? 'Booting...' : 'GPU Off'}
        </span>
        {gpuLoading && bootElapsed > 0 && (
          <span className="text-dark-500 text-xs">{formatElapsed(bootElapsed)}</span>
        )}
        {gpuLoading && <Loader2 className="w-3.5 h-3.5 text-yellow-400 animate-spin" />}
        <ChevronDown className={`w-3 h-3 text-dark-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-dark-700 border border-dark-600 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-dark-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-400' : gpuLoading ? 'bg-yellow-400 animate-pulse' : 'bg-dark-500'}`} />
                <span className="text-dark-100 font-medium text-sm">
                  {isOnline ? 'Online' : gpuLoading ? 'Booting' : 'Offline'}
                </span>
              </div>
              {isOnline && (
                <button
                  onClick={() => { shutdownGPU(); setOpen(false); }}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-xs transition-colors"
                >
                  <Power className="w-3 h-3" />
                  Shut Down
                </button>
              )}
              {!isOnline && !gpuLoading && (
                <button
                  onClick={() => bootGPU()}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded text-xs transition-colors"
                >
                  <Cpu className="w-3 h-3" />
                  Boot
                </button>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="px-4 py-3 space-y-2.5 text-xs">
            {/* Provider */}
            <div className="flex items-center justify-between">
              <span className="text-dark-400 flex items-center gap-1.5">
                <Server className="w-3 h-3" />Provider
              </span>
              <span className="text-dark-200 capitalize">{provider}</span>
            </div>

            {/* GPU type */}
            {gpuType && (
              <div className="flex items-center justify-between">
                <span className="text-dark-400 flex items-center gap-1.5">
                  <Cpu className="w-3 h-3" />GPU
                </span>
                <span className="text-dark-200">{gpuType}</span>
              </div>
            )}

            {/* IP */}
            {ip && (
              <div className="flex items-center justify-between">
                <span className="text-dark-400">IP</span>
                <span className="text-dark-300 font-mono">{ip}</span>
              </div>
            )}

            {/* Music service status */}
            {isOnline && (
              <div className="flex items-center justify-between">
                <span className="text-dark-400">Remix Service</span>
                <span className="text-dark-300">Port 8193</span>
              </div>
            )}

            {/* Boot timer */}
            {gpuLoading && bootElapsed > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-dark-400 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />Boot time
                </span>
                <span className="text-yellow-400">{formatElapsed(bootElapsed)}</span>
              </div>
            )}

            {/* Estimated boot time */}
            {gpuLoading && (
              <div className="flex items-center justify-between">
                <span className="text-dark-400">Estimated</span>
                <span className="text-dark-300">~2-4 min</span>
              </div>
            )}

            {/* Boot log */}
            {bootLog.length > 0 && (
              <div className="pt-1.5 border-t border-dark-600">
                <span className="text-dark-500 text-xs">Boot log</span>
                <div className="mt-1 space-y-0.5 max-h-24 overflow-y-auto">
                  {bootLog.map((line, i) => (
                    <p key={i} className={`text-xs font-mono leading-tight ${
                      line.includes('success') ? 'text-green-400' :
                      line.includes('failed') ? 'text-dark-500' :
                      'text-dark-400'
                    }`}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Auto-shutdown info */}
            {isOnline && (
              <div className="pt-1.5 border-t border-dark-600 text-dark-500">
                Auto-shuts down after 20 min idle
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
