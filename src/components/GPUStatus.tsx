import { useEffect } from 'react';
import { Cpu, Loader2 } from 'lucide-react';
import { useRemixStore } from '../stores/remixStore';

export function GPUStatus() {
  const { gpuStatus, gpuLoading, checkGPU, bootGPU } = useRemixStore();

  useEffect(() => {
    // Check status, auto-boot if offline
    checkGPU().then(() => {
      const s = useRemixStore.getState().gpuStatus;
      if (s !== 'online' && !useRemixStore.getState().gpuLoading) {
        bootGPU();
      }
    });
    const interval = setInterval(checkGPU, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${
        gpuStatus === 'online' ? 'bg-green-400' :
        gpuLoading ? 'bg-yellow-400 animate-pulse' :
        'bg-dark-500'
      }`} />

      <span className="text-dark-400 text-sm">
        GPU {gpuStatus === 'online' ? 'Online' : gpuLoading ? 'Booting...' : 'Offline'}
      </span>

      {gpuStatus !== 'online' && !gpuLoading && (
        <button
          onClick={bootGPU}
          className="flex items-center gap-1.5 px-3 py-1 bg-dark-600 hover:bg-dark-500 text-dark-200 rounded text-xs transition-colors"
        >
          <Cpu className="w-3 h-3" />
          Boot
        </button>
      )}

      {gpuLoading && (
        <Loader2 className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
      )}
    </div>
  );
}
