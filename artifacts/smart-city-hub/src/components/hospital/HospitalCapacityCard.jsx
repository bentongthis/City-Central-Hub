import { useEffect, useState } from 'react';
import { fetchHospitalData } from '../../services/api';
import { Activity, AlertTriangle, Clock } from 'lucide-react';

export default function HospitalCapacityCard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      const { data: result, error: err } = await fetchHospitalData({ signal: controller.signal });
      if (err === 'Request aborted') return;
      if (err) {
        setError("Connecting to Joaron's API Node...");
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
    <div className="hub-card" data-testid="card-hospital">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-400" />
          Hospital Capacity Module
        </h2>
        {data && (
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">ER Status</span>
            <div
              className="status-dot"
              style={{ backgroundColor: data.er_status === 'CRITICAL' ? '#ef4444' : data.er_status === 'BUSY' ? '#f59e0b' : '#10b981' }}
              title={`ER Status: ${data.er_status}`}
              data-testid="hospital-er-status"
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="animate-pulse flex flex-col gap-4 mt-4" data-testid="hospital-loading">
          <div className="h-4 bg-muted/50 rounded w-1/3"></div>
          <div className="h-8 bg-muted/50 rounded w-full"></div>
          <div className="h-4 bg-muted/50 rounded w-1/2"></div>
        </div>
      ) : error ? (
        <div className="fallback-badge mt-4" data-testid="hospital-fallback">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : data ? (
        <div className="mt-4 flex flex-col gap-4" data-testid="hospital-data">
          <div className="flex justify-between items-end">
            <div className="data-value text-teal-400" data-testid="hospital-beds-available">
              {data.available_beds}
              <span className="text-xl text-muted-foreground font-sans font-medium tracking-normal"> / {data.total_beds}</span>
            </div>
            <div className="text-xs text-muted-foreground pb-1">Beds Available</div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="uppercase tracking-wider font-semibold">Capacity Fill</span>
              <span className="font-mono">{Math.round(((data.total_beds - data.available_beds) / data.total_beds) * 100)}%</span>
            </div>
            <progress
              value={data.available_beds}
              max={data.total_beds}
              className="w-full h-2 rounded-full overflow-hidden [&::-webkit-progress-bar]:bg-black/30 [&::-webkit-progress-value]:bg-teal-400"
              aria-label="Hospital Bed Availability"
              data-testid="hospital-progress"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
            <span className="font-mono text-[10px] bg-black/30 px-2 py-1 rounded border border-border/30" data-testid="hospital-citizen-id">ID: {data.citizen_id}</span>
            <span className="flex items-center gap-1 font-mono" data-testid="hospital-last-updated">
              <Clock className="w-3.5 h-3.5" /> {data.last_updated}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
