import { useEffect, useState } from 'react';
import { fetchSchoolData } from '../../services/api';
import { ShieldAlert, Clock, GraduationCap } from 'lucide-react';

export default function SchoolMetricsCard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // AbortController lives in effect scope so cleanup can abort in-flight requests
    const controller = new AbortController();

    const loadData = async () => {
      const { data: result, error: err } = await fetchSchoolData({ signal: controller.signal });
      // Ignore aborted requests — component is unmounted
      if (err === 'Request aborted') return;
      if (err) {
        setError("⚠️ Synching with Samson's MongoDB Collection...");
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
    <div className="hub-card" data-testid="card-school">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-indigo-400" />
          🏫 School Safety Metrics
        </h2>
        {data && (
          <div className="flex items-center gap-2 px-2.5 py-1 bg-black/30 rounded border border-border/50 shadow-inner" data-testid="school-safety-badge">
            <ShieldAlert className="w-3.5 h-3.5 text-muted-foreground" />
            <span
              className="text-xs uppercase font-bold tracking-widest"
              style={{ color: data.safety_level === 'HIGH' ? '#10b981' : data.safety_level === 'MEDIUM' ? '#f59e0b' : '#ef4444' }}
            >
              {data.safety_level}
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="animate-pulse flex flex-col gap-4 mt-4" data-testid="school-loading">
          <div className="h-4 bg-muted/50 rounded w-1/3"></div>
          <div className="h-8 bg-muted/50 rounded w-full"></div>
          <div className="h-4 bg-muted/50 rounded w-1/2"></div>
        </div>
      ) : error ? (
        <div className="fallback-badge mt-4" data-testid="school-fallback">
          <span>{error}</span>
        </div>
      ) : data ? (
        <div className="mt-4 flex flex-col gap-4" data-testid="school-data">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs uppercase text-muted-foreground mb-1 tracking-wider font-semibold">Active Incidents</div>
              <div className="data-value text-indigo-400" data-testid="school-incidents">
                {data.active_incidents}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/20 p-3 rounded-lg border border-border/50">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Enrolled</div>
              <div className="font-mono text-lg text-white font-medium" data-testid="school-total-students">{data.total_students}</div>
            </div>
            <div className="bg-black/20 p-3 rounded-lg border border-border/50">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Campus Name</div>
              <div className="font-medium text-sm truncate text-white/90" title={data.campus_name} data-testid="school-campus-name">{data.campus_name}</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50">
            <span className="font-mono text-[10px] bg-black/30 px-2 py-1 rounded border border-border/30" data-testid="school-citizen-id">ID: {data.citizen_id}</span>
            <span className="flex items-center gap-1 font-mono" data-testid="school-last-updated"><Clock className="w-3.5 h-3.5" /> {data.last_updated}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
