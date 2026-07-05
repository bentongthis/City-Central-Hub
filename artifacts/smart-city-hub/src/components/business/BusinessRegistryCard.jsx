import { useEffect, useState } from 'react';
import { fetchBusinessData } from '../../services/api';
import { AlertTriangle, Building2, CheckCircle2, Clock } from 'lucide-react';

export default function BusinessRegistryCard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      const { data: result, error: err } = await fetchBusinessData({ signal: controller.signal });
      if (err === 'Request aborted') return;
      if (err) {
        setError("Synching with Cleverson's MongoDB Collection...");
      } else {
        setData(result);
        setError(null);
      }
      setLoading(false);
    };

    loadData();
    const interval = setInterval(loadData, 10000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="hub-card" data-testid="card-business">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Building2 className="w-5 h-5 text-amber-400" />
          Business Registry
        </h2>
      </div>

      {loading ? (
        <div className="animate-pulse flex flex-col gap-4 mt-4" data-testid="business-loading">
          <div className="h-4 bg-muted/50 rounded w-1/3"></div>
          <div className="h-8 bg-muted/50 rounded w-full"></div>
          <div className="h-4 bg-muted/50 rounded w-1/2"></div>
        </div>
      ) : error ? (
        <div className="fallback-badge mt-4" data-testid="business-fallback">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : data ? (
        <div className="mt-4 flex flex-col gap-4" data-testid="business-data">
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Compliant
              </span>
              <span className="font-mono text-amber-400 font-bold" data-testid="business-compliance-count">
                {data.compliant_count} <span className="text-muted-foreground font-normal">/ {data.total_businesses}</span>
              </span>
            </div>
            <progress
              value={data.compliant_count}
              max={data.total_businesses}
              className="w-full h-2 rounded-full overflow-hidden [&::-webkit-progress-bar]:bg-black/30 [&::-webkit-progress-value]:bg-amber-400"
              aria-label="Business Compliance Ratio"
              data-testid="business-progress"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="bg-black/20 p-3 rounded-lg border border-border/50 border-l-2 border-l-amber-500">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Operational Pharmacies</div>
              <div className="data-value text-2xl text-amber-400 leading-none" data-testid="business-pharmacy-count">{data.pharmacy_count}</div>
            </div>
            <div className="bg-black/20 p-3 rounded-lg border border-border/50 flex flex-col justify-between">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-500" /> Pending Review
              </div>
              <div className="font-mono text-xl text-white font-medium leading-none" data-testid="business-pending">{data.pending_review}</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50 mt-1">
            <span className="font-mono text-[10px] bg-black/30 px-2 py-1 rounded border border-border/30" data-testid="business-citizen-id">ID: {data.citizen_id}</span>
            <span className="flex items-center gap-1 font-mono" data-testid="business-last-updated">
              <Clock className="w-3.5 h-3.5" /> {data.last_updated}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
