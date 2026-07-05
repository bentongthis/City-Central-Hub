import { useEffect, useState } from 'react';
import { fetchTransitData } from '../../services/api';
import { Truck, MapPin, Map } from 'lucide-react';

export default function TransitLogisticsBanner() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // AbortController lives in effect scope so cleanup can abort in-flight requests
    const controller = new AbortController();

    const loadData = async () => {
      const { data: result, error: err } = await fetchTransitData({ signal: controller.signal });
      // Ignore aborted requests — component is unmounted
      if (err === 'Request aborted') return;
      if (err) {
        setError("⚠️ Connecting to Dwight's Transit API Node...");
      } else {
        setData(result);
        setError(null);
      }
      setLoading(false);
    };

    loadData();
    const interval = setInterval(loadData, 5000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="hub-card transit-banner" data-testid="banner-transit">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Truck className="w-6 h-6 text-emerald-400" />
          🚑 Transit &amp; Logistics Dashboard
        </h2>

        {data && (
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase text-muted-foreground tracking-wider font-semibold">Deployed Ambulances</span>
              <span className="font-mono text-2xl font-bold text-emerald-400 leading-none mt-1" data-testid="transit-deployed">
                {data.deployed_ambulances} <span className="text-muted-foreground text-sm font-normal">/ {data.total_ambulances}</span>
              </span>
            </div>
            <div className="w-px h-8 bg-border/50 hidden md:block"></div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase text-muted-foreground tracking-wider font-semibold">Active Routes</span>
              <span className="font-mono text-2xl font-bold text-white leading-none mt-1" data-testid="transit-routes">{data.active_routes}</span>
            </div>
            <div className="w-px h-8 bg-border/50 hidden md:block"></div>
            <div className="font-mono text-[10px] bg-black/30 px-2 py-1 rounded text-muted-foreground border border-border/30" data-testid="transit-citizen-id">
              ID: {data.citizen_id}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="animate-pulse flex flex-col gap-4 py-4" data-testid="transit-loading">
          <div className="h-4 bg-muted/50 rounded w-1/4"></div>
          <div className="h-12 bg-muted/50 rounded w-full"></div>
          <div className="h-12 bg-muted/50 rounded w-full"></div>
        </div>
      ) : error ? (
        <div className="fallback-badge my-4 w-fit" data-testid="transit-fallback">
          <span>{error}</span>
        </div>
      ) : data ? (
        <div className="pt-2" data-testid="transit-data">
          <h3 className="text-[11px] uppercase text-muted-foreground font-semibold mb-3 tracking-widest flex items-center gap-2">
            <Map className="w-3.5 h-3.5 text-emerald-500/70" /> Live Status Matrix
          </h3>

          {(!data.units || data.units.length === 0) ? (
            <div className="text-center py-8 text-muted-foreground text-sm bg-black/20 rounded-lg border border-border/50 border-dashed" data-testid="transit-no-units">
              No units currently deployed in the field
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" data-testid="transit-unit-table">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b border-border/50 uppercase tracking-wider bg-black/10">
                    <th className="py-2.5 px-3 font-semibold rounded-tl">Unit ID</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold">Location</th>
                    <th className="py-2.5 px-3 font-semibold rounded-tr text-right">Last Ping</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {data.units.map(unit => (
                    <tr key={unit.unit_id} className="hover:bg-white/[0.02] transition-colors group" data-testid={`transit-unit-${unit.unit_id}`}>
                      <td className="py-3 px-3 font-mono text-sm text-white group-hover:text-emerald-300 transition-colors">{unit.unit_id}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest ${
                          unit.status === 'ACTIVE'   ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          unit.status === 'STANDBY'  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                       'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            unit.status === 'ACTIVE'  ? 'bg-emerald-400 animate-pulse' :
                            unit.status === 'STANDBY' ? 'bg-blue-400' :
                                                        'bg-red-400'
                          }`} />
                          {unit.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 opacity-50" />
                          {unit.location}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-muted-foreground font-mono text-right">
                        {unit.last_ping}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
