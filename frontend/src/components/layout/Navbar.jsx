import React from 'react';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Scan, 
  Code2, 
  Cpu, 
  History, 
  Sparkles, 
  FlaskConical,
  Upload
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const Navbar = ({ 
  activeTab, 
  setActiveTab, 
  backendHealthy 
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'scanner', label: 'Scanner & Editor', icon: Scan },
    { id: 'auditor', label: 'Auditor & DAG', icon: Code2 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo & Title */}
        <div 
          onClick={() => setActiveTab('dashboard')} 
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 shadow-md shadow-indigo-900/30 text-white font-bold">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white font-sans">
                Leakage<span className="text-indigo-400">Lens</span>
              </span>
              <Badge variant="outline" className="hidden sm:inline-flex text-[10px] py-0 px-1.5 border-slate-700 bg-slate-900 text-indigo-300 font-mono">
                v2.0 Pro
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden md:block">
              Static Data Leakage Analysis & AI Audit Engine
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 rounded-xl bg-slate-900/90 p-1 border border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Status & Quick Action */}
        <div className="flex items-center gap-3">
          {/* Connection Pill */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-slate-900 border border-slate-800 px-2.5 py-1 text-xs text-slate-300">
            {backendHealthy ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-mono text-emerald-400">AST Engine Online</span>
              </>
            ) : (
              <>
                <span className="inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                <span className="text-[11px] font-mono text-amber-400">API Standby</span>
              </>
            )}
          </div>

          <Button 
            onClick={() => setActiveTab('scanner')} 
            size="sm"
            className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload File</span>
          </Button>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="flex lg:hidden overflow-x-auto border-t border-slate-800/60 bg-slate-950 px-2 py-1.5 scrollbar-none">
        <div className="flex items-center gap-1 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
