import React from 'react';
import {
  LayoutDashboard,
  Cpu,
  Cog,
  BarChart3,
  Truck,
  SlidersHorizontal,
  Bot,
  FileText,
  Activity,
  Layers,
  Database,
  ShieldAlert
} from 'lucide-react';

export type NavigationPage =
  | 'plant-overview'
  | 'parts-bom'
  | 'machines-spares'
  | 'inventory-forecasts'
  | 'suppliers-orders'
  | 'scenario-simulator'
  | 'ai-copilot'
  | 'database-csv'
  | 'reports-settings';

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  criticalShortagesCount: number;
  machineAlertsCount: number;
  isCustomDatabase?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  criticalShortagesCount,
  machineAlertsCount,
  isCustomDatabase = false
}) => {
  const navItems = [
    {
      id: 'plant-overview' as NavigationPage,
      label: 'Plant Overview',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'database-csv' as NavigationPage,
      label: 'Database & CSV',
      icon: Database,
      badge: isCustomDatabase ? 'Custom' : 'CSV Hub',
      badgeColor: isCustomDatabase
        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
        : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
    },
    {
      id: 'parts-bom' as NavigationPage,
      label: 'Parts & BOM',
      icon: Cpu,
      badge: criticalShortagesCount > 0 ? `${criticalShortagesCount} risk` : null,
      badgeColor: 'bg-red-500/20 text-red-300 border border-red-500/40'
    },
    {
      id: 'machines-spares' as NavigationPage,
      label: 'Machines & Spares',
      icon: Cog,
      badge: machineAlertsCount > 0 ? `${machineAlertsCount} alert` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
    },
    {
      id: 'inventory-forecasts' as NavigationPage,
      label: 'Inventory & Forecasts',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'suppliers-orders' as NavigationPage,
      label: 'Suppliers & Orders',
      icon: Truck,
      badge: '4 delay',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
    },
    {
      id: 'scenario-simulator' as NavigationPage,
      label: 'Scenario Simulator',
      icon: SlidersHorizontal,
      badge: 'What-If',
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
    },
    {
      id: 'ai-copilot' as NavigationPage,
      label: 'AI Copilot',
      icon: Bot,
      badge: 'GenAI',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
    },
    {
      id: 'reports-settings' as NavigationPage,
      label: 'Reports & Settings',
      icon: FileText,
      badge: null
    }
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[230px] flex-col border-r border-[#1C365C] bg-[#10233F] text-slate-200 select-none">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-[#1E375F] px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1677F2] text-white shadow-md shadow-blue-900/40">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold tracking-tight text-white">PlantIQ</span>
            <span className="inline-block h-2 w-2 rounded-full bg-[#20A36B] ring-2 ring-[#20A36B]/30 animate-pulse" />
          </div>
          <p className="text-[10px] font-medium tracking-wider uppercase text-slate-400">
            ECU Manufacturing Intel
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
        <div className="px-3 pb-1 text-[10px] font-semibold tracking-wider uppercase text-slate-400">
          Operations Center
        </div>

        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`group flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-[#1677F2] text-white shadow-xs'
                  : 'text-slate-300 hover:bg-[#183156] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-medium leading-none ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Plant Status Footprint */}
      <div className="border-t border-[#1E375F] bg-[#0C1B31] p-3">
        <div className="rounded-md border border-[#1C365C] bg-[#10233F]/80 p-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-[#20A36B]" />
              <span className="text-[11px] font-medium text-slate-200">Sanand Facility</span>
            </div>
            <span className="rounded bg-emerald-950 px-1.5 py-0.2 text-[9px] font-medium text-[#20A36B] border border-emerald-800">
              Live (99.8%)
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
            <span>SMT Lines: 3/3 Active</span>
            <span className="text-[#E9A23B]">2 Warnings</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
