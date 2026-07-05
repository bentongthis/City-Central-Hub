import { useEffect, useState } from 'react';
// @ts-expect-error - project requires jsx for these files
import HospitalCapacityCard from './components/hospital/HospitalCapacityCard';
// @ts-expect-error
import SchoolMetricsCard from './components/school/SchoolMetricsCard';
// @ts-expect-error
import BusinessRegistryCard from './components/business/BusinessRegistryCard';
// @ts-expect-error
import TransitLogisticsBanner from './components/transport/TransitLogisticsBanner';
// @ts-expect-error
import CentralLogs from './components/global/CentralLogs';

function App() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    document.documentElement.classList.add('dark');
    
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = time.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });

  return (
    <div className="min-h-[100dvh] bg-background text-foreground p-4 md:p-6 lg:p-8 selection:bg-primary/30">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-border/50">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span className="bg-primary text-primary-foreground px-2.5 py-0.5 rounded-md text-xl font-black shadow-[0_0_15px_rgba(0,212,255,0.4)]">SIA 2</span>
              Smart City Central Government Hub
            </h1>
            <p className="text-primary/70 mt-1.5 text-xs tracking-widest uppercase font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
              Integrated Municipal Operations Dashboard
            </p>
          </div>
          <div className="text-right">
            <div className="font-mono text-4xl font-black text-primary tracking-tighter drop-shadow-[0_0_8px_rgba(0,212,255,0.3)]">
              {timeString}
            </div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-1.5 flex items-center justify-end gap-2">
              {dateString} 
              <span className="text-border">|</span>
              <span className="text-emerald-400 font-bold">SYSTEM ONLINE</span>
            </div>
          </div>
        </header>

        {/* DASHBOARD GRID */}
        <main className="dashboard-grid">
          <HospitalCapacityCard />
          <SchoolMetricsCard />
          <BusinessRegistryCard />
          
          <TransitLogisticsBanner />
          
          <CentralLogs />
        </main>
        
      </div>
    </div>
  );
}

export default App;
