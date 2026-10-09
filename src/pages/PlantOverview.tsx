import React from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Cog,
  Package,
  ArrowRight,
  Sparkles,
  Activity,
  CheckCircle2,
  Clock,
  Layers,
  ExternalLink,
  Database
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { KpiCard } from '../components/common/KpiCard';
import { Badge } from '../components/common/Badge';
import { ComponentItem, Machine, OEMOrder } from '../types/manufacturing';
import { PlanningCalculationResult } from '../services/materialPlanning';
import { NavigationPage } from '../components/layout/Sidebar';

interface PlantOverviewProps {
  planningResult: PlanningCalculationResult;
  components: ComponentItem[];
  machines: Machine[];
  oemOrders: OEMOrder[];
  onNavigate: (page: NavigationPage) => void;
  onSelectComponent: (partNumber: string) => void;
  onSelectMachine: (machineId: string) => void;
}

export const PlantOverview: React.FC<PlantOverviewProps> = ({
  planningResult,
  components,
  machines,
  oemOrders,
  onNavigate,
  onSelectComponent,
  onSelectMachine
}) => {
  // Priority Action Queue parts
  const priorityParts = components
    .filter((c) => c.riskStatus === 'CRITICAL' || c.riskStatus === 'WARNING')
    .slice(0, 5);

  // Machine Telemetry Trend Data (M-ASSY-03)
  const telemetryData = [
    { time: '04:00', temp: 72.8, vibration: 3.9, oil: 44 },
    { time: '06:00', temp: 75.1, vibration: 4.2, oil: 43 },
    { time: '08:00', temp: 78.4, vibration: 4.8, oil: 42 },
    { time: '10:00', temp: 77.9, vibration: 4.7, oil: 42 },
    { time: '12:00', temp: 78.2, vibration: 4.8, oil: 41 },
    { time: '14:00', temp: 79.0, vibration: 4.9, oil: 41 }
  ];

  // Machine Alerts
  const allAlerts = machines.flatMap((m) =>
    m.activeAlerts.map((a) => ({
      machineId: m.id,
      machineName: m.name,
      ...a
    }))
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#172B4D]">
            Plant Operations Command Center
          </h1>
          <p className="text-xs text-[#718198]">
            Real-time ECU manufacturing telemetry, material replenishment planning, and supplier risk index
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('database-csv')}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#172B4D] shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <Database className="h-3.5 w-3.5 text-[#1677F2]" />
            <span>Database & CSV</span>
          </button>
          <button
            onClick={() => onNavigate('scenario-simulator')}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#172B4D] shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <span>Simulate Disruption</span>
          </button>
          <button
            onClick={() => onNavigate('ai-copilot')}
            className="flex items-center gap-1.5 rounded-md bg-[#1677F2] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-blue-600 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Launch AI Copilot</span>
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Critical Shortages"
          value={planningResult.criticalShortagesCount}
          subValue="SEN-2048, MCU-110, FLT-05 depleted"
          subTextColor="text-[#E5484D]"
          icon={AlertTriangle}
          variant="critical"
          badgeText="Action Req"
          onClick={() => onNavigate('inventory-forecasts')}
        />

        <KpiCard
          title="Parts at Risk"
          value={planningResult.partsAtRiskCount}
          subValue="Stock below safety thresholds"
          subTextColor="text-[#D97706]"
          icon={ShieldAlert}
          variant="warning"
          badgeText="Safety Buffer"
          onClick={() => onNavigate('parts-bom')}
        />

        <KpiCard
          title="Machines at Risk"
          value={planningResult.machinesAtRiskCount}
          subValue="M-ASSY-03, M-CNC-04 telemetry flags"
          subTextColor="text-[#D97706]"
          icon={Cog}
          variant="warning"
          badgeText="2 Stations"
          onClick={() => onNavigate('machines-spares')}
        />

        <KpiCard
          title="OEM Orders Exposed"
          value={planningResult.oemOrdersExposedCount}
          subValue={`$${(planningResult.totalExposedValueUSD / 1000000).toFixed(2)}M delivery exposure`}
          subTextColor="text-[#E5484D]"
          icon={Package}
          variant="critical"
          badgeText="Mahindra / Tata"
          onClick={() => onNavigate('inventory-forecasts')}
        />
      </div>

      {/* Main Content: Two Columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column (7 cols): Priority Action Queue */}
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-lg border border-slate-200/90 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-[#172B4D]">Priority Action Queue</h2>
                <p className="text-xs text-[#718198]">
                  Immediate procurement, air-freight expedites, and tooling interventions
                </p>
              </div>
              <button
                onClick={() => onNavigate('inventory-forecasts')}
                className="flex items-center gap-1 text-xs font-semibold text-[#1677F2] hover:underline"
              >
                <span>Full MRP Workbench</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Compact Table */}
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-2.5 px-3">Part #</th>
                    <th className="py-2.5 px-3">Component Name</th>
                    <th className="py-2.5 px-3">Risk Reason</th>
                    <th className="py-2.5 px-3">Business Impact</th>
                    <th className="py-2.5 px-3">Recommended Action</th>
                    <th className="py-2.5 px-3 text-right">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {priorityParts.map((part, pIdx) => (
                    <tr
                      key={`${part.partNumber || part.id}-${pIdx}`}
                      onClick={() => {
                        onSelectComponent(part.partNumber);
                        onNavigate('parts-bom');
                      }}
                      className="group cursor-pointer hover:bg-blue-50/40 transition-colors"
                    >
                      <td className="py-3 px-3 font-mono font-bold text-[#1677F2] group-hover:underline">
                        {part.partNumber}
                      </td>
                      <td className="py-3 px-3 font-medium text-[#172B4D]">
                        <div className="max-w-[130px] truncate" title={part.name}>
                          {part.name}
                        </div>
                        <div className="text-[10px] text-slate-400">{part.category}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        <div className="max-w-[150px] truncate" title={part.riskReason}>
                          {part.riskReason}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        <div className="max-w-[150px] truncate text-[#E5484D] font-medium" title={part.businessImpact}>
                          {part.businessImpact}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        <div className="max-w-[160px] truncate" title={part.recommendedAction}>
                          {part.recommendedAction}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Badge
                          variant={part.riskStatus === 'CRITICAL' ? 'critical' : 'warning'}
                        >
                          {part.priority.split(' - ')[0]}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Machine Health Trends */}
          <div className="rounded-lg border border-slate-200/90 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-[#172B4D]">
                    Machine Health & Predictive Telemetry
                  </h2>
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-[#D97706]">
                    M-ASSY-03 (SMT Station)
                  </span>
                </div>
                <p className="text-xs text-[#718198]">
                  Spindle bearing vibration harmonic anomaly vs critical ISO thresholds
                </p>
              </div>
              <button
                onClick={() => {
                  onSelectMachine('M-ASSY-03');
                  onNavigate('machines-spares');
                }}
                className="flex items-center gap-1 text-xs font-semibold text-[#1677F2] hover:underline"
              >
                <span>Machine 360°</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Recharts Line/Area Chart */}
            <div className="mt-4 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetryData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="time" stroke="#718198" fontSize={11} />
                  <YAxis yAxisId="left" stroke="#718198" fontSize={11} domain={[50, 90]} />
                  <YAxis yAxisId="right" orientation="right" stroke="#718198" fontSize={11} domain={[0, 6]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#10233F', color: '#fff', borderRadius: '6px', fontSize: '11px', border: 'none' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  <ReferenceLine yAxisId="right" y={4.5} stroke="#E5484D" strokeDasharray="4 4" label={{ value: 'Vib Limit 4.5mm/s', fill: '#E5484D', fontSize: 10 }} />
                  <ReferenceLine yAxisId="left" y={75} stroke="#E9A23B" strokeDasharray="4 4" label={{ value: 'Temp Limit 75°C', fill: '#E9A23B', fontSize: 10 }} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="temp"
                    name="Temperature (°C)"
                    stroke="#E9A23B"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="vibration"
                    name="Vibration (mm/s)"
                    stroke="#E5484D"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Risk Donut, AI Insight, Recent Alerts */}
        <div className="space-y-6 lg:col-span-5">
          {/* AI Operational Insight Banner */}
          <div className="rounded-lg border border-blue-200/90 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/40 p-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1677F2] text-white shadow-xs">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#10233F] uppercase tracking-wider">
                    PlantIQ AI Operational Insight
                  </span>
                  <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-[#1677F2]">
                    High Urgency
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-[#172B4D]">
                  Dual disruption detected on Line 1: <strong>SEN-2048</strong> proximity sensor delivery slip coincides with <strong>M-ASSY-03</strong> spindle vibration breach (4.8 mm/s). Without immediate Omron alternative allocation, SMT line stoppage is projected in <strong>42 hours</strong>, exposing $1.25M in Maruti Suzuki orders.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => onNavigate('ai-copilot')}
                    className="flex items-center gap-1.5 rounded bg-[#1677F2] px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-600 transition-colors"
                  >
                    <span>View AI Mitigations & Actions</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Risk by Category Donut Chart */}
          <div className="rounded-lg border border-slate-200/90 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-[#172B4D]">Risk Distribution by Category</h2>
                <p className="text-xs text-[#718198]">BOM components across technical domains</p>
              </div>
              <Badge variant="neutral">{planningResult.totalTrackedParts} Total Tracked</Badge>
            </div>

            <div className="relative mt-2 flex h-52 items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planningResult.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {planningResult.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#10233F', color: '#fff', borderRadius: '6px', fontSize: '11px', border: 'none' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                </PieChart>
              </ResponsiveContainer>
              {/* Centered Total Indicator */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-2">
                <span className="text-xl font-bold text-[#172B4D]">
                  {planningResult.totalTrackedParts}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400">Parts</span>
              </div>
            </div>
          </div>

          {/* Recent Machine Alerts */}
          <div className="rounded-lg border border-slate-200/90 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-[#172B4D]">Recent Machine Alerts</h2>
                <p className="text-xs text-[#718198]">Active alarms requiring technician dispatch</p>
              </div>
              <button
                onClick={() => onNavigate('machines-spares')}
                className="text-xs font-semibold text-[#1677F2] hover:underline"
              >
                View All
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {allAlerts.map((alert, aIdx) => (
                <div
                  key={`${alert.id}-${alert.machineId}-${aIdx}`}
                  onClick={() => {
                    onSelectMachine(alert.machineId);
                    onNavigate('machines-spares');
                  }}
                  className={`rounded-lg border p-3 text-xs transition-colors cursor-pointer ${
                    alert.severity === 'CRITICAL'
                      ? 'border-red-200 bg-red-50/40 hover:bg-red-50'
                      : 'border-amber-200 bg-amber-50/40 hover:bg-amber-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="font-mono text-[#10233F]">{alert.machineId}</span>
                      <span className="text-slate-500 font-normal truncate max-w-[130px]">
                        • {alert.machineName}
                      </span>
                    </div>
                    <Badge variant={alert.severity === 'CRITICAL' ? 'critical' : 'warning'}>
                      {alert.severity}
                    </Badge>
                  </div>

                  <p className="mt-1 font-medium text-[#172B4D]">{alert.issue}</p>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="text-[#1677F2] font-medium truncate max-w-[190px]">
                      Action: {alert.action}
                    </span>
                    <span className="shrink-0">{alert.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
