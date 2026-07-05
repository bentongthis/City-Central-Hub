import { useEffect, useState } from 'react';
import { fetchCityLogs } from '../../services/api';
import { AlertTriangle, Radio, Terminal } from 'lucide-react';

const MAX_LOG_ENTRIES = 50;

export default function CentralLogs() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      const { data, error: err } = await fetchCityLogs({ signal: controller.signal });
      if (err === 'Request aborted') return;

      if (err) {
        setError("Connecting to Joaron's API Node...");
      } else if (data) {
        setError(null);
        const incoming = Array.isArray(data) ? data : [data];

        setLogs(prev => {
          const existingIds = new Set(prev.map(l => l._id));
          const uniqueNew = incoming.filter(l => !existingIds.has(l._id));
          return [...uniqueNew, ...prev].slice(0, MAX_LOG_ENTRIES);
        });
      }
      setLoading(false);
    };

    loadData();
    const interval = setInterval(loadData, 3000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  const getModuleColor = (module) => {
    const mod = (module || '').toUpperCase();
    switch (mod) {
      case 'HOSPITAL': return 'text-teal-400 border-teal-400/30 bg-teal-400/10';
      case 'SCHOOL':   return 'text-indigo-400 border-indigo-400/30 bg-indigo-400/10';
      case 'BUSINESS': return 'text-amber-400 border-amber-400/30 bg-amber-400/10';
      case 'TRANSIT':  return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10';
      default:         return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
    }
  };

  return (
    <div className="hub-card central-logs bg-black/40 border-t-4 border-t-primary" data-testid="central-logs">
      <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-2">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Terminal className="w-5 h-5 text-primary" />
          Central Audit Log Stream
        </h2>

        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-2 text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded border border-red-500/20 tracking-widest uppercase shadow-[0_0_10px_rgba(239,68,68,0.2)]"
            data-testid="logs-live-indicator"
          >
            <Radio className="w-3 h-3 animate-pulse" />
            LIVE
          </div>
          <div className="text-xs text-muted-foreground font-mono bg-black/30 px-2 py-1 rounded border border-border/30" data-testid="logs-count">
            {logs.length} / {MAX_LOG_ENTRIES} RECORDS
          </div>
        </div>
      </div>

      {loading && logs.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-4" data-testid="logs-loading">
          <Terminal className="w-8 h-8 opacity-20" />
          <span className="font-mono text-sm animate-pulse">Initializing secure connection to primary node...</span>
        </div>
      ) : error ? (
        <div className="fallback-badge my-2 w-fit" data-testid="logs-fallback">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar" data-testid="logs-stream">
          {logs.map((log) => (
            <div key={log._id} className="log-row" data-testid={`log-entry-${log._id}`}>
              <span className="text-muted-foreground/60 w-[180px] shrink-0 font-mono">[{log._id}]</span>
              <span className={`module-tag border w-[90px] text-center ${getModuleColor(log.module)}`}>
                {(log.module || '').toUpperCase()}
              </span>
              <span className="text-muted-foreground shrink-0 w-[160px] font-mono">{log.timestamp}</span>
              <span className="text-primary/50 font-bold">-&gt;</span>
              <span className="text-white/90 whitespace-nowrap">
                <span className="text-muted-foreground text-xs uppercase tracking-wider mr-1">Citizen:</span>
                <span className="font-mono" data-testid={`log-citizen-${log._id}`}>{log.citizen_id}</span>
              </span>
              {log.event && (
                <>
                  <span className="text-border mx-1">|</span>
                  <span className="text-primary font-semibold tracking-wide">{log.event}</span>
                </>
              )}
              {log.details && (
                <span className="text-muted-foreground truncate flex-1 ml-2 border-l border-border/50 pl-3">- {log.details}</span>
              )}
            </div>
          ))}
          {logs.length === 0 && !error && (
            <div className="py-10 text-center text-muted-foreground/50 font-mono text-sm flex flex-col items-center gap-2" data-testid="logs-empty">
              <div className="w-2 h-2 bg-primary rounded-full animate-ping mb-2"></div>
              Listening for incoming operations...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
