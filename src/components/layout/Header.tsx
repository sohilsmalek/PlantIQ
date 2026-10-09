import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Calendar,
  Building2,
  ChevronDown,
  User,
  AlertTriangle,
  Cpu,
  Cog,
  Truck,
  CheckCircle2,
  X,
  Upload,
  Database
} from 'lucide-react';
import { usePlantDatabase } from '../../context/DatabaseContext';
import { NavigationPage } from './Sidebar';

interface HeaderProps {
  onNavigate: (page: NavigationPage) => void;
  onSelectComponent: (partNumber: string) => void;
  onSelectMachine: (machineId: string) => void;
  unreadAlertsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  onSelectComponent,
  onSelectMachine,
  unreadAlertsCount
}) => {
  const {
    components,
    machines,
    suppliers,
    purchaseOrders,
    isCustomDatabase,
    openImportModal
  } = usePlantDatabase();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState('Plant A — Sanand (Tier-1 ECU)');
  const [selectedDateRange, setSelectedDateRange] = useState('October 2026 (Active Run)');

  const searchRef = useRef<HTMLDivElement>(null);
  const alertsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
        setIsAlertsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered search results against live database
  const q = searchQuery.toLowerCase().trim();
  const matchedComponents = q
    ? components.filter(
        (c) =>
          c.partNumber.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.manufacturer.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const matchedMachines = q
    ? machines.filter(
        (m) =>
          m.id.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q) ||
          m.stationType.toLowerCase().includes(q)
      ).slice(0, 2)
    : [];

  const matchedSuppliers = q
    ? suppliers.filter(
        (s) => s.name.toLowerCase().includes(q) || s.country.toLowerCase().includes(q)
      ).slice(0, 2)
    : [];

  const matchedPOs = q
    ? purchaseOrders.filter(
        (po) =>
          po.poNumber.toLowerCase().includes(q) ||
          po.partNumber.toLowerCase().includes(q) ||
          po.supplierName.toLowerCase().includes(q)
      ).slice(0, 2)
    : [];

  const hasSearchResults =
    matchedComponents.length > 0 ||
    matchedMachines.length > 0 ||
    matchedSuppliers.length > 0 ||
    matchedPOs.length > 0;

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200/90 bg-white px-6 shadow-xs">
      {/* Left: Plant & Date Pickers */}
      <div className="flex items-center gap-4">
        {/* Plant Selector */}
        <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs text-[#172B4D] font-medium hover:bg-slate-100 transition-colors cursor-pointer">
          <Building2 className="h-4 w-4 text-[#1677F2]" />
          <span className="font-semibold">{selectedPlant}</span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </div>

        {/* Date Range Selector */}
        <div className="hidden sm:flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs text-[#718198] hover:bg-slate-100 transition-colors cursor-pointer">
          <Calendar className="h-4 w-4 text-slate-500" />
          <span className="text-[#172B4D] font-medium">{selectedDateRange}</span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div ref={searchRef} className="relative mx-4 flex-1 max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Global search parts, machines, POs, suppliers (e.g. SEN-2048, M-ASSY-03)..."
            className="w-full rounded-md border border-slate-200 bg-[#F3F6FB] pl-9 pr-8 py-1.5 text-xs text-[#172B4D] placeholder-slate-400 transition-all focus:border-[#1677F2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1677F2]"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isSearchOpen && searchQuery.trim().length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1.5 max-h-96 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 shadow-xl z-50">
            {!hasSearchResults ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No manufacturing records found for "{searchQuery}".
              </div>
            ) : (
              <div className="space-y-3">
                {matchedComponents.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Components & BOM
                    </div>
                    {matchedComponents.map((c, idx) => (
                      <div
                        key={`${c.id}-${idx}`}
                        onClick={() => {
                          onSelectComponent(c.partNumber);
                          onNavigate('parts-bom');
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center justify-between rounded px-2.5 py-1.5 text-xs hover:bg-blue-50 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Cpu className="h-4 w-4 text-[#1677F2]" />
                          <div>
                            <span className="font-mono font-bold text-[#172B4D]">{c.partNumber}</span>
                            <span className="ml-2 text-slate-600 truncate">{c.name}</span>
                          </div>
                        </div>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                            c.riskStatus === 'CRITICAL'
                              ? 'bg-red-100 text-red-700'
                              : c.riskStatus === 'WARNING'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {c.riskStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {matchedMachines.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Machinery & Assembly Cells
                    </div>
                    {matchedMachines.map((m, idx) => (
                      <div
                        key={`${m.id}-${idx}`}
                        onClick={() => {
                          onSelectMachine(m.id);
                          onNavigate('machines-spares');
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center justify-between rounded px-2.5 py-1.5 text-xs hover:bg-blue-50 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Cog className="h-4 w-4 text-[#E9A23B]" />
                          <div>
                            <span className="font-mono font-bold text-[#172B4D]">{m.id}</span>
                            <span className="ml-2 text-slate-600">{m.name}</span>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {m.temperature}°C / {m.vibration}mm/s
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {matchedPOs.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Purchase Orders
                    </div>
                    {matchedPOs.map((po, idx) => (
                      <div
                        key={`${po.poNumber}-${idx}`}
                        onClick={() => {
                          onNavigate('suppliers-orders');
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center justify-between rounded px-2.5 py-1.5 text-xs hover:bg-blue-50 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-[#20A4D8]" />
                          <div>
                            <span className="font-mono font-bold text-[#172B4D]">{po.poNumber}</span>
                            <span className="ml-2 text-slate-600">{po.supplierName}</span>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {po.status} (Qty: {po.quantity})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Notifications, CSV Import & Profile */}
      <div className="flex items-center gap-2.5">
        {/* CSV Import Button */}
        <button
          onClick={() => openImportModal()}
          className="flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50/80 px-2.5 py-1.5 text-xs font-semibold text-[#1677F2] hover:bg-blue-100/80 hover:border-blue-300 transition-colors shadow-2xs"
          title="Upload CSV to update database"
        >
          <Upload className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Upload CSV</span>
          {isCustomDatabase && (
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" title="Custom Database Active" />
          )}
        </button>

        {/* Notifications Bell */}
        <div ref={alertsRef} className="relative">
          <button
            onClick={() => setIsAlertsOpen(!isAlertsOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Bell className="h-4 w-4" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E5484D] text-[10px] font-bold text-white shadow-xs">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isAlertsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-slate-200 bg-white p-3 shadow-xl z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-[#172B4D]">Active Plant Alerts</span>
                <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-[#E5484D]">
                  2 Critical
                </span>
              </div>
              <div className="mt-2 space-y-2 max-h-72 overflow-y-auto">
                <div
                  onClick={() => {
                    onSelectComponent('SEN-2048');
                    onNavigate('parts-bom');
                    setIsAlertsOpen(false);
                  }}
                  className="rounded-md border border-red-100 bg-red-50/60 p-2.5 text-xs cursor-pointer hover:bg-red-50 transition-colors"
                >
                  <div className="flex items-center justify-between font-bold text-[#E5484D]">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" /> SEN-2048 Depleted
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">08:14 AM</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-700">
                    Proximity sensor available stock reached -5. SMT feeder station M-ASSY-03 threatened.
                  </p>
                </div>

                <div
                  onClick={() => {
                    onSelectMachine('M-ASSY-03');
                    onNavigate('machines-spares');
                    setIsAlertsOpen(false);
                  }}
                  className="rounded-md border border-amber-100 bg-amber-50/60 p-2.5 text-xs cursor-pointer hover:bg-amber-50 transition-colors"
                >
                  <div className="flex items-center justify-between font-bold text-[#D97706]">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" /> High Vibration M-ASSY-03
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">09:32 AM</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-700">
                    Spindle vibration 4.8 mm/s exceeded 4.5 mm/s threshold. Mandatory ultrasound inspection.
                  </p>
                </div>

                <div
                  onClick={() => {
                    onNavigate('suppliers-orders');
                    setIsAlertsOpen(false);
                  }}
                  className="rounded-md border border-blue-100 bg-blue-50/60 p-2.5 text-xs cursor-pointer hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center justify-between font-bold text-[#1677F2]">
                    <span className="flex items-center gap-1">
                      <Truck className="h-3.5 w-3.5" /> PO-9844 In Transit
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Yesterday</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-700">
                    5,000 units PCB-04 cleared Frankfurt air freight hub; ETA Sanand in 48h.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-[#172B4D] hover:bg-slate-50 transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#10233F] text-xs font-bold text-white">
              SM
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold leading-tight text-[#172B4D]">Sohil Malek</div>
              <div className="text-[10px] font-medium text-[#718198]">Plant Operations Lead</div>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-xl z-50 text-xs">
              <div className="border-b border-slate-100 p-2">
                <div className="font-bold text-[#172B4D]">Sohil Malek</div>
                <div className="text-[11px] text-[#718198]">Tier-1 Automotive Electronics</div>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                  <CheckCircle2 className="h-3 w-3" /> Operations Lead Clearance (Level 4)
                </div>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    onNavigate('database-csv');
                    setIsProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-slate-700 hover:bg-slate-100 font-semibold text-[#1677F2]"
                >
                  <Database className="h-3.5 w-3.5 text-[#1677F2]" />
                  <span>Database & CSV Hub</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('reports-settings');
                    setIsProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-slate-700 hover:bg-slate-100"
                >
                  Plant Configuration & Models
                </button>
                <button
                  onClick={() => {
                    onNavigate('reports-settings');
                    setIsProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-slate-700 hover:bg-slate-100"
                >
                  Knowledge Base & SOPs
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
