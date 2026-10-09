import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Play,
  RotateCcw,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Package,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { ComponentItem, Machine, OEMOrder } from '../types/manufacturing';
import { Badge } from '../components/common/Badge';

interface ScenarioSimulatorProps {
  components: ComponentItem[];
  machines: Machine[];
  oemOrders: OEMOrder[];
  onSelectComponent: (partNumber: string) => void;
  onNavigateToParts: () => void;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  components,
  machines,
  oemOrders,
  onSelectComponent,
  onNavigateToParts
}) => {
  const [activeScenarioTab, setActiveScenarioTab] = useState<'oem' | 'supplier' | 'machine' | 'alternate'>('oem');

  // Simulator controls
  const [demandChangePct, setDemandChangePct] = useState<number>(20); // +20% surge
  const [supplierDelayDays, setSupplierDelayDays] = useState<number>(14); // +14 days delay
  const [machineDowntimeHours, setMachineDowntimeHours] = useState<number>(16); // 16 hours halt
  const [selectedMachine, setSelectedMachine] = useState<string>('M-ASSY-03');
  const [useAlternateSupplier, setUseAlternateSupplier] = useState<boolean>(false);
  const [alternatePartTarget, setAlternatePartTarget] = useState<string>('SEN-2048');

  // Simulation execution state
  const [isSimulated, setIsSimulated] = useState(true);

  // Dynamic simulation calculations
  const baselineShortageCount = 3;
  const baselineExposedRev = 3.78; // $3.78M

  // Projected impact calculations
  let projectedShortageCount = baselineShortageCount;
  let projectedExposedRev = baselineExposedRev;
  let delayedECUUnits = 1420;
  let lineStoppageDays = 1.8;

  if (activeScenarioTab === 'oem') {
    const demandMultiplier = 1 + demandChangePct / 100;
    projectedShortageCount = demandChangePct > 0 ? Math.round(baselineShortageCount + demandChangePct / 10) : Math.max(1, baselineShortageCount - 1);
    projectedExposedRev = parseFloat((baselineExposedRev * demandMultiplier).toFixed(2));
    delayedECUUnits = Math.round(1420 * demandMultiplier);
    lineStoppageDays = Math.max(0.8, parseFloat((2.5 / demandMultiplier).toFixed(1)));
  } else if (activeScenarioTab === 'supplier') {
    projectedShortageCount = Math.round(baselineShortageCount + supplierDelayDays / 7);
    projectedExposedRev = parseFloat((baselineExposedRev + supplierDelayDays * 0.12).toFixed(2));
    delayedECUUnits = Math.round(1420 + supplierDelayDays * 110);
    lineStoppageDays = Math.max(0.5, parseFloat((3.0 - supplierDelayDays * 0.08).toFixed(1)));
  } else if (activeScenarioTab === 'machine') {
    const hours = machineDowntimeHours;
    projectedShortageCount = baselineShortageCount + (hours > 24 ? 2 : 1);
    projectedExposedRev = parseFloat((baselineExposedRev + hours * 0.04).toFixed(2));
    delayedECUUnits = Math.round(hours * 75); // ~75 ECUs per hour of SMT downtime
    lineStoppageDays = hours > 12 ? 0.0 : 1.2;
  } else if (activeScenarioTab === 'alternate') {
    if (useAlternateSupplier) {
      projectedShortageCount = Math.max(1, baselineShortageCount - 2); // Reduced!
      projectedExposedRev = 0.95;
      delayedECUUnits = 320;
      lineStoppageDays = 8.5; // Healthy buffer!
    } else {
      projectedShortageCount = baselineShortageCount;
      projectedExposedRev = baselineExposedRev;
      delayedECUUnits = 1420;
      lineStoppageDays = 1.8;
    }
  }

  // Comparative Chart data
  const comparisonData = [
    {
      metric: 'Critical Shortages',
      Baseline: baselineShortageCount,
      Projected: projectedShortageCount
    },
    {
      metric: 'Exposed Rev ($M)',
      Baseline: baselineExposedRev,
      Projected: projectedExposedRev
    },
    {
      metric: 'Delayed ECUs (x100)',
      Baseline: 14.2,
      Projected: parseFloat((delayedECUUnits / 100).toFixed(1))
    }
  ];

  const handleReset = () => {
    setDemandChangePct(0);
    setSupplierDelayDays(0);
    setMachineDowntimeHours(0);
    setUseAlternateSupplier(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#172B4D]">
            Scenario Simulator — What-If Manufacturing Risk Modeling
          </h1>
          <p className="text-xs text-[#718198]">
            Stress-test production capacity against demand surges, supplier port delays, and machine downtime
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#172B4D] hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
            <span>Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* Scenario Selection Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold">
        {(
          [
            { id: 'oem', label: 'OEM Demand Fluctuation' },
            { id: 'supplier', label: 'Supplier Lead Time Disruption' },
            { id: 'machine', label: 'Machine Downtime & Outage' },
            { id: 'alternate', label: 'Alternate Supplier Sourcing' }
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveScenarioTab(tab.id)}
            className={`border-b-2 px-4 py-2 transition-colors ${
              activeScenarioTab === tab.id
                ? 'border-[#1677F2] text-[#1677F2]'
                : 'border-transparent text-slate-500 hover:text-[#172B4D]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Controls on Left (5 cols), Simulation Impact Projection on Right (7 cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Interactive Controls */}
        <div className="space-y-4 lg:col-span-5">
          <div className="rounded-lg border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#172B4D]">
              Simulation Parameters & Sliders
            </h2>

            {/* OEM DEMAND CONTROLS */}
            {activeScenarioTab === 'oem' && (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between font-semibold text-[#172B4D]">
                    <span>OEM Order Volume Adjustment:</span>
                    <span className="font-mono text-sm font-bold text-[#1677F2]">
                      {demandChangePct > 0 ? `+${demandChangePct}%` : `${demandChangePct}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="50"
                    step="5"
                    value={demandChangePct}
                    onChange={(e) => setDemandChangePct(parseInt(e.target.value, 10))}
                    className="mt-2 w-full accent-[#1677F2]"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>-30% Contract Cut</span>
                    <span>Baseline (0%)</span>
                    <span>+50% Surge</span>
                  </div>
                </div>

                <div className="rounded bg-slate-50 p-3 text-[11px] text-slate-600 space-y-1">
                  <strong>Impact Hypothesis:</strong>
                  <p>
                    A {demandChangePct}% change in OEM demand will cascade through all 4 active ECU BOMs, shifting gross demand for microcontrollers (MCU-110) and capacitors (CAP-22).
                  </p>
                </div>
              </div>
            )}

            {/* SUPPLIER LEAD TIME CONTROLS */}
            {activeScenarioTab === 'supplier' && (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between font-semibold text-[#172B4D]">
                    <span>Inbound Port & Freight Delay:</span>
                    <span className="font-mono text-sm font-bold text-[#E5484D]">
                      +{supplierDelayDays} days
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="1"
                    value={supplierDelayDays}
                    onChange={(e) => setSupplierDelayDays(parseInt(e.target.value, 10))}
                    className="mt-2 w-full accent-[#E5484D]"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0 days (On Schedule)</span>
                    <span>+15 days</span>
                    <span>+30 days (Critical Congestion)</span>
                  </div>
                </div>

                <div className="rounded bg-slate-50 p-3 text-[11px] text-slate-600">
                  Simulates logistics disruption (Hamburg port strike, customs holdup) on open POs like PO-9840 (SEN-2048) and PO-9841 (MCU-110).
                </div>
              </div>
            )}

            {/* MACHINE DOWNTIME CONTROLS */}
            {activeScenarioTab === 'machine' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700">Target Station:</label>
                  <select
                    value={selectedMachine}
                    onChange={(e) => setSelectedMachine(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-200 bg-white p-2 text-xs"
                  >
                    <option value="M-ASSY-03">M-ASSY-03 (High-Speed SMT Placement Station)</option>
                    <option value="M-ROBOT-02">M-ROBOT-02 (6-Axis Robotic Sealant Dispenser)</option>
                    <option value="M-CNC-04">M-CNC-04 (Enclosure Milling CNC Cell)</option>
                    <option value="M-TEST-01">M-TEST-01 (In-Circuit ICT Cell)</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between font-semibold text-[#172B4D]">
                    <span>Simulated Outage Duration:</span>
                    <span className="font-mono text-sm font-bold text-[#D97706]">
                      {machineDowntimeHours} hours
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="72"
                    step="4"
                    value={machineDowntimeHours}
                    onChange={(e) => setMachineDowntimeHours(parseInt(e.target.value, 10))}
                    className="mt-2 w-full accent-[#E9A23B]"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0 hrs (Normal)</span>
                    <span>24 hrs (1 day)</span>
                    <span>72 hrs (3 days)</span>
                  </div>
                </div>
              </div>
            )}

            {/* ALTERNATE SUPPLIER CONTROLS */}
            {activeScenarioTab === 'alternate' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700">Single-Source Component:</label>
                  <select
                    value={alternatePartTarget}
                    onChange={(e) => setAlternatePartTarget(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-200 bg-white p-2 text-xs"
                  >
                    <option value="SEN-2048">SEN-2048 → Omron E2B Drop-in (ALT-SEN-2050)</option>
                    <option value="MCU-110">MCU-110 → STMicro SPC58NN84 (ALT-MCU-112)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 p-3">
                  <input
                    type="checkbox"
                    id="altToggle"
                    checked={useAlternateSupplier}
                    onChange={(e) => setUseAlternateSupplier(e.target.checked)}
                    className="h-4 w-4 rounded text-[#1677F2] accent-[#1677F2]"
                  />
                  <label htmlFor="altToggle" className="font-semibold text-[#172B4D] cursor-pointer">
                    Activate Secondary Source Lot Allocation
                  </label>
                </div>

                <div className="rounded bg-emerald-50/70 p-3 text-[11px] text-emerald-900 border border-emerald-200">
                  {useAlternateSupplier
                    ? 'Dual-sourcing is ACTIVE: Replenishment will draw from qualified domestic partner. Lead time drops from 45 to 7 days.'
                    : 'Single-source baseline active. High risk of supply chain choke point.'}
                </div>
              </div>
            )}

            <button
              onClick={() => setIsSimulated(true)}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1677F2] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-600 transition-colors"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>Run What-If Simulation</span>
            </button>
          </div>
        </div>

        {/* Right Column: Simulation Results & Impact Analysis */}
        <div className="space-y-4 lg:col-span-7">
          <div className="rounded-lg border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-[#172B4D]">
                  Simulated Impact Projection & Risk Forecast
                </h2>
                <p className="text-xs text-[#718198]">
                  *Estimated metrics based on deterministic plant heuristics and active OEM orders
                </p>
              </div>
              <Badge variant={projectedShortageCount > 3 ? 'critical' : 'healthy'}>
                {projectedShortageCount > 3 ? 'HIGH IMPACT' : 'STABILIZED'}
              </Badge>
            </div>

            {/* 3 Metric Summary Cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-xs">
                <span className="text-[11px] text-slate-500">Projected Part Shortages</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-bold font-mono text-[#E5484D]">
                    {projectedShortageCount} parts
                  </span>
                  <span className="text-[11px] text-slate-400">
                    (Base: {baselineShortageCount})
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-xs">
                <span className="text-[11px] text-slate-500">Exposed OEM Revenue</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-bold font-mono text-[#E5484D]">
                    ${projectedExposedRev}M
                  </span>
                  <span className="text-[11px] text-slate-400">
                    (Base: ${baselineExposedRev}M)
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-xs">
                <span className="text-[11px] text-slate-500">Line Stoppage Timeline</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span
                    className={`text-xl font-bold font-mono ${
                      lineStoppageDays < 2.0 ? 'text-[#E5484D]' : 'text-[#20A36B]'
                    }`}
                  >
                    {lineStoppageDays > 0 ? `${lineStoppageDays} days` : 'Immediate halt'}
                  </span>
                </div>
              </div>
            </div>

            {/* Comparative Recharts Chart */}
            <div className="rounded-lg border border-slate-100 bg-slate-50/40 p-3">
              <div className="text-xs font-bold text-[#172B4D] mb-2">
                Baseline vs Projected Risk Variance
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="metric" stroke="#718198" fontSize={11} />
                    <YAxis stroke="#718198" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#10233F',
                        color: '#fff',
                        borderRadius: '6px',
                        fontSize: '11px',
                        border: 'none'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="Baseline" fill="#718198" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Projected" fill="#1677F2" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recommended Mitigations */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-[#172B4D]">Recommended Mitigating Actions:</div>
              <ul className="space-y-1.5 list-disc list-inside text-slate-700">
                {activeScenarioTab === 'oem' && (
                  <>
                    <li>Trigger spot-buy procurement for 1,200 MCU-110 units from Tier-1 broker.</li>
                    <li>Reallocate 500 PCB-04 units from Line 2 reserve to protect Maruti Suzuki order milestone.</li>
                    <li>Negotiate a 5-day delivery deferral for the lower priority Mahindra spare batch.</li>
                  </>
                )}
                {activeScenarioTab === 'supplier' && (
                  <>
                    <li>Authorize premium air freight ($450) for PO-9840 to bypass Hamburg port backlog.</li>
                    <li>Advance PO-9848 customs clearance with priority agent in Mumbai Nhava Sheva.</li>
                  </>
                )}
                {activeScenarioTab === 'machine' && (
                  <>
                    <li>Reroute surface mount placement panel jobs to secondary line (Line 2 SMT cell).</li>
                    <li>Dispatch priority maintenance crew with acoustic ultrasound probe for spindle inspection.</li>
                  </>
                )}
                {activeScenarioTab === 'alternate' && (
                  <>
                    <li>
                      {useAlternateSupplier
                        ? 'Execute immediate purchase release of 50 units Omron E2B (ALT-SEN-2050).'
                        : 'Qualify secondary source to eliminate single-point-of-failure risk.'}
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
