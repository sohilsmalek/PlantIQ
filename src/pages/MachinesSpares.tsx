import React, { useState } from 'react';
import {
  Cog,
  AlertTriangle,
  Activity,
  CheckCircle2,
  Wrench,
  Clock,
  Thermometer,
  Zap,
  Droplets,
  Layers,
  ArrowRight,
  Sliders,
  FileText,
  ShieldCheck,
  PlusCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { Machine, MaintenanceSpare } from '../types/manufacturing';
import { Badge } from '../components/common/Badge';
import { usePlantDatabase } from '../context/DatabaseContext';
import { Upload } from 'lucide-react';

interface MachinesSparesProps {
  machines: Machine[];
  spares: MaintenanceSpare[];
  selectedMachineId: string;
  onSelectMachine: (machineId: string) => void;
  onSelectPart: (partNumber: string) => void;
}

export const MachinesSpares: React.FC<MachinesSparesProps> = ({
  machines,
  spares,
  selectedMachineId,
  onSelectMachine,
  onSelectPart
}) => {
  const { openImportModal } = usePlantDatabase();
  const [activeTab, setActiveTab] = useState<'overview' | 'spares' | 'history' | 'telemetry' | 'documents'>('overview');
  const [showThresholdConfig, setShowThresholdConfig] = useState(false);
  const [tempThreshold, setTempThreshold] = useState(75.0);
  const [vibThreshold, setVibThreshold] = useState(4.5);
  const [oilThreshold, setOilThreshold] = useState(30);
  const [reorderSuccessMsg, setReorderSuccessMsg] = useState<string | null>(null);

  const activeMachine =
    machines.find((m) => m.id === selectedMachineId) || machines[0];

  const handleReorderSpare = (partNumber: string) => {
    setReorderSuccessMsg(`Emergency spare requisition submitted for ${partNumber}. Procurement notified.`);
    setTimeout(() => setReorderSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#172B4D]">
            Machines & Spares Monitoring
          </h1>
          <p className="text-xs text-[#718198]">
            Predictive machine health, line dependencies, vibration harmonics, and spare parts availability
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openImportModal('machines')}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#172B4D] hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Upload className="h-3.5 w-3.5 text-[#1677F2]" />
            <span>Upload Machines CSV</span>
          </button>
          <button
            onClick={() => setShowThresholdConfig(!showThresholdConfig)}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#172B4D] hover:bg-slate-50 transition-colors"
          >
            <Sliders className="h-3.5 w-3.5 text-[#1677F2]" />
            <span>Configure Sensor Thresholds</span>
          </button>
        </div>
      </div>

      {/* Threshold Config Modal / Drawer */}
      {showThresholdConfig && (
        <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-4 text-xs">
          <div className="flex items-center justify-between border-b border-blue-200/80 pb-2">
            <span className="font-bold text-[#10233F]">
              Predictive Telemetry Threshold Settings (Demo Assumptions)
            </span>
            <span className="text-[11px] text-slate-500">
              Thresholds calibrate live alarm generation
            </span>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="font-semibold text-slate-700">Temperature Limit (°C):</label>
              <input
                type="number"
                value={tempThreshold}
                onChange={(e) => setTempThreshold(parseFloat(e.target.value))}
                className="mt-1 w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs"
              />
              <span className="text-[10px] text-slate-400">Baseline ISO 10816: 75.0°C</span>
            </div>
            <div>
              <label className="font-semibold text-slate-700">Vibration RMS Limit (mm/s):</label>
              <input
                type="number"
                step="0.1"
                value={vibThreshold}
                onChange={(e) => setVibThreshold(parseFloat(e.target.value))}
                className="mt-1 w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs"
              />
              <span className="text-[10px] text-slate-400">Harmonic threshold: 4.5 mm/s</span>
            </div>
            <div>
              <label className="font-semibold text-slate-700">Minimum Oil Level (%):</label>
              <input
                type="number"
                value={oilThreshold}
                onChange={(e) => setOilThreshold(parseInt(e.target.value, 10))}
                className="mt-1 w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs"
              />
              <span className="text-[10px] text-slate-400">Hydraulic low trip: 30%</span>
            </div>
          </div>
        </div>
      )}

      {/* Toast message */}
      {reorderSuccessMsg && (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{reorderSuccessMsg}</span>
        </div>
      )}

      {/* Machine Dependency Diagram */}
      <div className="rounded-lg border border-slate-200/90 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#1677F2]" />
            <h2 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
              Production Line & Machine Dependency Chain
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">Line 1: Sanand Powertrain ECU</span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <div className="rounded bg-slate-100 px-3 py-2 font-medium text-slate-700 border border-slate-200">
            Line 1: Powertrain SMT
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400" />
          <div className="rounded bg-blue-50 px-3 py-2 font-semibold text-[#1677F2] border border-blue-200">
            M-ASSY-03 (High-Speed SMT)
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400" />
          <div className="rounded bg-slate-100 px-3 py-2 font-medium text-slate-700 border border-slate-200">
            M-ROBOT-02 (Fanuc Screwdriving)
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400" />
          <div className="rounded bg-slate-100 px-3 py-2 font-medium text-slate-700 border border-slate-200">
            M-TEST-01 (In-Circuit ICT Cell)
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400" />
          <div className="rounded bg-emerald-50 px-3 py-2 font-semibold text-emerald-700 border border-emerald-200">
            Final Pack & OEM Dispatch
          </div>
        </div>
      </div>

      {/* Main Grid: Machine Cards on Left (4 cols), Detail View on Right (8 cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Machine Roster */}
        <div className="space-y-3 lg:col-span-4">
          <div className="space-y-2.5">
            {machines.map((m, mIdx) => {
              const isSelected = m.id === activeMachine.id;
              const hasAlert = m.activeAlerts.length > 0;
              return (
                <div
                  key={`${m.id}-${mIdx}`}
                  onClick={() => onSelectMachine(m.id)}
                  className={`rounded-lg border p-3.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#1677F2] bg-blue-50/40 shadow-xs'
                      : 'border-slate-200/90 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#10233F]">{m.id}</span>
                    <Badge
                      variant={
                        m.status === 'CRITICAL'
                          ? 'critical'
                          : m.status === 'WARNING'
                          ? 'warning'
                          : 'healthy'
                      }
                    >
                      {m.status}
                    </Badge>
                  </div>

                  <h3 className="mt-1 text-xs font-bold text-[#172B4D] truncate">{m.name}</h3>
                  <div className="text-[11px] text-slate-500">{m.stationType}</div>

                  {/* Quick telemetry indicators */}
                  <div className="mt-3 grid grid-cols-3 gap-1.5 rounded bg-[#F3F6FB] p-2 text-center text-[10px]">
                    <div>
                      <span className="text-slate-400">Temp</span>
                      <div
                        className={`font-mono font-bold ${
                          m.temperature > m.tempThreshold ? 'text-[#E5484D]' : 'text-slate-700'
                        }`}
                      >
                        {m.temperature}°C
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Vibration</span>
                      <div
                        className={`font-mono font-bold ${
                          m.vibration > m.vibrationThreshold ? 'text-[#E5484D]' : 'text-slate-700'
                        }`}
                      >
                        {m.vibration} mm/s
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Oil Level</span>
                      <div
                        className={`font-mono font-bold ${
                          m.oilLevel < m.oilThreshold ? 'text-[#E5484D]' : 'text-slate-700'
                        }`}
                      >
                        {m.oilLevel}%
                      </div>
                    </div>
                  </div>

                  {hasAlert && (
                    <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-[#E5484D]">
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      <span className="truncate">{m.activeAlerts[0].issue}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Machine Detail & Spares Tabs */}
        <div className="space-y-4 lg:col-span-8">
          <div className="rounded-lg border border-slate-200/90 bg-white p-5 shadow-xs">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-blue-100 px-2 py-0.5 font-mono text-xs font-bold text-[#1677F2]">
                    {activeMachine.id}
                  </span>
                  <Badge
                    variant={
                      activeMachine.status === 'CRITICAL'
                        ? 'critical'
                        : activeMachine.status === 'WARNING'
                        ? 'warning'
                        : 'healthy'
                    }
                  >
                    {activeMachine.status}
                  </Badge>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-medium text-slate-600">{activeMachine.line}</span>
                </div>

                <h2 className="mt-1.5 text-lg font-bold text-[#172B4D]">{activeMachine.name}</h2>
                <p className="text-xs text-slate-500">{activeMachine.stationType}</p>
              </div>

              <div className="rounded border border-slate-100 bg-slate-50 px-3 py-1.5 text-right">
                <div className="text-[10px] uppercase text-slate-400">Health Index</div>
                <div
                  className={`text-xl font-bold font-mono ${
                    activeMachine.healthScore < 70
                      ? 'text-[#E5484D]'
                      : activeMachine.healthScore < 85
                      ? 'text-[#E9A23B]'
                      : 'text-[#20A36B]'
                  }`}
                >
                  {activeMachine.healthScore}%
                </div>
              </div>
            </div>

            {/* Telemetry Sensor Metrics Bar */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="flex items-center gap-1">
                    <Thermometer className="h-3.5 w-3.5" /> Spindle Temp
                  </span>
                  <span className="text-[10px]">Limit: {activeMachine.tempThreshold}°C</span>
                </div>
                <div className="mt-1 text-lg font-bold font-mono text-[#172B4D]">
                  {activeMachine.temperature}°C
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5" /> RMS Vibration
                  </span>
                  <span className="text-[10px]">Limit: {activeMachine.vibrationThreshold}mm/s</span>
                </div>
                <div className="mt-1 text-lg font-bold font-mono text-[#E5484D]">
                  {activeMachine.vibration} mm/s
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="flex items-center gap-1">
                    <Droplets className="h-3.5 w-3.5" /> Hydraulic Fluid
                  </span>
                  <span className="text-[10px]">Min: {activeMachine.oilThreshold}%</span>
                </div>
                <div className="mt-1 text-lg font-bold font-mono text-[#172B4D]">
                  {activeMachine.oilLevel}%
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mt-4 flex border-b border-slate-200 text-xs font-semibold">
              {(
                [
                  { id: 'overview', label: 'Overview & Alerts' },
                  { id: 'spares', label: 'Compatible Spare Parts' },
                  { id: 'telemetry', label: '24h Sensor Telemetry' },
                  { id: 'history', label: 'Maintenance Log' },
                  { id: 'documents', label: 'Manuals & SOPs' }
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`border-b-2 px-3.5 py-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#1677F2] text-[#1677F2]'
                      : 'border-transparent text-slate-500 hover:text-[#172B4D]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* TAB 1: OVERVIEW & ALERTS */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
                <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                  Active Fault Alarms ({activeMachine.activeAlerts.length})
                </h3>

                {activeMachine.activeAlerts.length === 0 ? (
                  <div className="mt-3 flex items-center gap-2 rounded bg-emerald-50 p-3 text-xs text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>All operating parameters within nominal limits. Zero active alerts.</span>
                  </div>
                ) : (
                  <div className="mt-3 space-y-2">
                    {activeMachine.activeAlerts.map((alert, aIdx) => (
                      <div
                        key={`${alert.id}-${aIdx}`}
                        className="rounded border border-red-200 bg-red-50/50 p-3 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#E5484D]">{alert.issue}</span>
                          <span className="text-[10px] text-slate-400">{alert.timestamp}</span>
                        </div>
                        <div className="mt-1 text-slate-700">
                          <strong>Standard Protocol: </strong>
                          {alert.action}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Maintenance Schedule */}
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
                <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                  Maintenance Schedule & PM Timetable
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500">Last Overhaul Completed:</span>
                    <div className="font-semibold text-[#172B4D]">{activeMachine.lastMaintenance}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Next Scheduled PM:</span>
                    <div className="font-semibold text-[#1677F2]">
                      {activeMachine.nextMaintenanceDue}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPATIBLE SPARE PARTS */}
          {activeTab === 'spares' && (
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#172B4D]">
                    Toolroom Spares Inventory for {activeMachine.id}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Immediate replacement items mapped to this assembly station
                  </p>
                </div>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase">
                      <th className="py-2 px-3">Part #</th>
                      <th className="py-2 px-3">Spare Name</th>
                      <th className="py-2 px-3">On Hand</th>
                      <th className="py-2 px-3">Reorder Point</th>
                      <th className="py-2 px-3">Criticality</th>
                      <th className="py-2 px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {spares
                      .filter((s) => s.machineIds.includes(activeMachine.id))
                      .map((sp, spIdx) => (
                        <tr key={`${sp.partNumber}-${spIdx}`} className="hover:bg-slate-50">
                          <td
                            onClick={() => onSelectPart(sp.partNumber)}
                            className="py-2.5 px-3 font-mono font-bold text-[#1677F2] cursor-pointer hover:underline"
                          >
                            {sp.partNumber}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-[#172B4D]">{sp.name}</td>
                          <td className="py-2.5 px-3 font-mono">
                            <span
                              className={
                                sp.stock <= sp.reorderPoint ? 'font-bold text-[#E5484D]' : ''
                              }
                            >
                              {sp.stock} units
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">
                            {sp.reorderPoint} units
                          </td>
                          <td className="py-2.5 px-3">
                            <Badge
                              variant={sp.criticality === 'CRITICAL' ? 'critical' : 'warning'}
                            >
                              {sp.criticality}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3">
                            <button
                              onClick={() => handleReorderSpare(sp.partNumber)}
                              className="rounded bg-[#1677F2] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-600 transition-colors"
                            >
                              Reorder Spare
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: TELEMETRY TRENDS */}
          {activeTab === 'telemetry' && (
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
              <h3 className="text-sm font-bold text-[#172B4D]">24-Hour Telemetry Historical Log</h3>
              <p className="text-xs text-slate-500">
                Continuous IoT sensor readings collected at 2-hour sampling intervals
              </p>
              <div className="mt-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={activeMachine.telemetryHistory}
                    margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="time" stroke="#718198" fontSize={11} />
                    <YAxis yAxisId="temp" stroke="#718198" fontSize={11} />
                    <YAxis yAxisId="vib" orientation="right" stroke="#718198" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#10233F',
                        color: '#fff',
                        borderRadius: '6px',
                        fontSize: '11px',
                        border: 'none'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                    <ReferenceLine
                      yAxisId="vib"
                      y={activeMachine.vibrationThreshold}
                      stroke="#E5484D"
                      strokeDasharray="3 3"
                    />
                    <Line
                      yAxisId="temp"
                      type="monotone"
                      dataKey="temperature"
                      name="Temperature (°C)"
                      stroke="#E9A23B"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="vib"
                      type="monotone"
                      dataKey="vibration"
                      name="Vibration (mm/s)"
                      stroke="#E5484D"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TAB 4: MAINTENANCE LOG */}
          {activeTab === 'history' && (
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs text-xs space-y-3">
              <h3 className="text-sm font-bold text-[#172B4D]">Certified Service History</h3>
              <div className="divide-y divide-slate-100">
                <div className="py-2.5">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-[#172B4D]">Spindle Dynamic Balancing & Bearing Lubrication</span>
                    <span className="text-slate-400">2026-09-12</span>
                  </div>
                  <p className="mt-1 text-slate-600">
                    High-speed cartridge inspected. ISO VG 46 fluid replenished; optical calibration performed by Fanuc certified field engineer.
                  </p>
                </div>
                <div className="py-2.5">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-[#172B4D]">Feeder Bank Sensor Replacement</span>
                    <span className="text-slate-400">2026-07-28</span>
                  </div>
                  <p className="mt-1 text-slate-600">
                    Replaced degraded optic sensor with SEN-2048 (IFM M12). Verified repeat index cycle.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MANUALS & SOPS */}
          {activeTab === 'documents' && (
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs text-xs">
              <h3 className="text-sm font-bold text-[#172B4D]">Operating Manuals & Work Instructions</h3>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between rounded border border-slate-100 bg-slate-50 p-2.5">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#1677F2]" />
                    <div>
                      <div className="font-semibold text-[#172B4D]">
                        SOP-MNT-402 High-Speed Placement Vibration Guide.pdf
                      </div>
                      <div className="text-[11px] text-slate-400">2.8 MB • Rev 3.2</div>
                    </div>
                  </div>
                  <button className="text-[11px] font-semibold text-[#1677F2] hover:underline">
                    View SOP
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
