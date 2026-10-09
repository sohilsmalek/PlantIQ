import React, { useState } from 'react';
import {
  Cpu,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  Truck,
  Layers,
  FileText,
  Boxes,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Download
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
import { ComponentItem, PartCategory, RiskLevel } from '../types/manufacturing';
import { Badge } from '../components/common/Badge';
import { usePlantDatabase } from '../context/DatabaseContext';
import { Upload } from 'lucide-react';

interface PartsBOMProps {
  components: ComponentItem[];
  selectedPartNumber: string;
  onSelectComponent: (partNumber: string) => void;
  onNavigateToSimulator?: () => void;
}

export const PartsBOM: React.FC<PartsBOMProps> = ({
  components,
  selectedPartNumber,
  onSelectComponent,
  onNavigateToSimulator
}) => {
  const { openImportModal } = usePlantDatabase();
  const [activeTab, setActiveTab] = useState<'overview' | 'stock' | 'suppliers' | 'usage' | 'documents'>('overview');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Component
  const activeComponent =
    components.find((c) => c.partNumber === selectedPartNumber) || components[0];

  // Filtering list
  const filteredComponents = components.filter((c) => {
    const matchesCategory = filterCategory === 'ALL' || c.category === filterCategory;
    const matchesRisk = filterRisk === 'ALL' || c.riskStatus === filterRisk;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.partNumber.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.manufacturer.toLowerCase().includes(q);
    return matchesCategory && matchesRisk && matchesSearch;
  });

  const availableStock = activeComponent.onHandStock - activeComponent.reservedStock;

  // Forecast Chart data
  const forecastChartData = [
    { week: 'Week 1', demand: activeComponent.fourWeekForecast[0] },
    { week: 'Week 2', demand: activeComponent.fourWeekForecast[1] },
    { week: 'Week 3', demand: activeComponent.fourWeekForecast[2] },
    { week: 'Week 4', demand: activeComponent.fourWeekForecast[3] }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#172B4D]">
            Parts & BOM — Component 360° Intelligence
          </h1>
          <p className="text-xs text-[#718198]">
            Master engineering catalogue, dual-sourcing qualifications, and real-time inventory buffers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openImportModal('components')}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#172B4D] hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Upload className="h-3.5 w-3.5 text-[#1677F2]" />
            <span>Upload Parts CSV</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Master List on Left (4 cols), 360° Detail View on Right (8 cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Component Selector List */}
        <div className="space-y-3 lg:col-span-4">
          <div className="rounded-lg border border-slate-200/90 bg-white p-3 shadow-xs">
            {/* Search and Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter part # or name..."
                  className="w-full rounded border border-slate-200 bg-[#F3F6FB] pl-8 pr-2.5 py-1 text-xs text-[#172B4D] focus:border-[#1677F2] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="flex-1 rounded border border-slate-200 bg-white px-2 py-1 text-[11px] text-[#172B4D] focus:outline-none"
                >
                  <option value="ALL">All Domains</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Automation">Automation</option>
                  <option value="Mechanical">Mechanical</option>
                </select>

                <select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                  className="flex-1 rounded border border-slate-200 bg-white px-2 py-1 text-[11px] text-[#172B4D] focus:outline-none"
                >
                  <option value="ALL">All Risk Levels</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="WARNING">Warning</option>
                  <option value="HEALTHY">Healthy</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="mt-3 divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
              {filteredComponents.map((comp, compIdx) => {
                const isSelected = comp.partNumber === activeComponent.partNumber;
                return (
                  <div
                    key={`${comp.partNumber || comp.id}-${compIdx}`}
                    onClick={() => onSelectComponent(comp.partNumber)}
                    className={`p-2.5 transition-colors cursor-pointer rounded-md ${
                      isSelected
                        ? 'bg-blue-50/80 border-l-4 border-[#1677F2]'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#1677F2]">
                        {comp.partNumber}
                      </span>
                      <Badge
                        variant={
                          comp.riskStatus === 'CRITICAL'
                            ? 'critical'
                            : comp.riskStatus === 'WARNING'
                            ? 'warning'
                            : 'healthy'
                        }
                      >
                        {comp.riskStatus}
                      </Badge>
                    </div>

                    <div className="mt-1 text-xs font-medium text-[#172B4D] truncate">
                      {comp.name}
                    </div>

                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{comp.category}</span>
                      <span className="font-mono">
                        Avail: {comp.onHandStock - comp.reservedStock}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 360° Detailed Intelligence Panel */}
        <div className="space-y-4 lg:col-span-8">
          {/* Main Component Header Card */}
          <div className="rounded-lg border border-slate-200/90 bg-white p-5 shadow-xs">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-blue-100 px-2 py-0.5 font-mono text-xs font-bold text-[#1677F2]">
                    {activeComponent.partNumber}
                  </span>
                  <Badge
                    variant={
                      activeComponent.riskStatus === 'CRITICAL'
                        ? 'critical'
                        : activeComponent.riskStatus === 'WARNING'
                        ? 'warning'
                        : 'healthy'
                    }
                  >
                    {activeComponent.riskStatus} RISK
                  </Badge>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-medium text-slate-600">
                    {activeComponent.category}
                  </span>
                </div>

                <h2 className="mt-1.5 text-lg font-bold text-[#172B4D]">
                  {activeComponent.name}
                </h2>
                <p className="text-xs text-slate-500">{activeComponent.manufacturer}</p>
              </div>

              <div className="flex items-center gap-2">
                {activeComponent.riskStatus !== 'HEALTHY' && onNavigateToSimulator && (
                  <button
                    onClick={onNavigateToSimulator}
                    className="flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-[#172B4D] hover:bg-slate-50"
                  >
                    <span>Simulate Disruption</span>
                  </button>
                )}
                <div className="rounded border border-slate-100 bg-slate-50 px-3 py-1.5 text-right">
                  <div className="text-[10px] uppercase text-slate-400">Unit Cost</div>
                  <div className="text-sm font-bold font-mono text-[#172B4D]">
                    ${activeComponent.unitCost.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Specs summary */}
            <div className="mt-3 rounded bg-[#F3F6FB] p-2.5 text-xs text-[#172B4D]">
              <span className="font-semibold text-slate-600">Engineering Specification: </span>
              {activeComponent.technicalSpecs}
            </div>

            {/* Tabs */}
            <div className="mt-4 flex border-b border-slate-200 text-xs font-semibold">
              {(
                [
                  { id: 'overview', label: 'Overview' },
                  { id: 'stock', label: 'Stock & Demand' },
                  { id: 'suppliers', label: 'Suppliers & Sourcing' },
                  { id: 'usage', label: 'BOM Hierarchy & Usage' },
                  { id: 'documents', label: 'Datasheets & SOPs' }
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

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Risk Alert Box */}
              {activeComponent.riskStatus !== 'HEALTHY' && (
                <div
                  className={`rounded-lg border p-4 text-xs ${
                    activeComponent.riskStatus === 'CRITICAL'
                      ? 'border-red-200 bg-red-50/50 text-red-900'
                      : 'border-amber-200 bg-amber-50/50 text-amber-900'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Root Cause of Risk: {activeComponent.riskReason}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div>
                      <span className="font-semibold">Business Impact: </span>
                      {activeComponent.businessImpact}
                    </div>
                    <div>
                      <span className="font-semibold">Recommended Intervention: </span>
                      {activeComponent.recommendedAction}
                    </div>
                  </div>
                </div>
              )}

              {/* 4 Stock Summary Cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-2xs">
                  <div className="text-[11px] text-slate-500">On-Hand Stock</div>
                  <div className="mt-1 text-lg font-bold font-mono text-[#172B4D]">
                    {activeComponent.onHandStock.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-2xs">
                  <div className="text-[11px] text-slate-500">Reserved for Production</div>
                  <div className="mt-1 text-lg font-bold font-mono text-[#E9A23B]">
                    {activeComponent.reservedStock.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-2xs">
                  <div className="text-[11px] text-slate-500">Net Available Stock</div>
                  <div
                    className={`mt-1 text-lg font-bold font-mono ${
                      availableStock < 0 ? 'text-[#E5484D]' : 'text-[#20A36B]'
                    }`}
                  >
                    {availableStock.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-2xs">
                  <div className="text-[11px] text-slate-500">Incoming POs</div>
                  <div className="mt-1 text-lg font-bold font-mono text-[#1677F2]">
                    {activeComponent.incomingPO.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Demand Forecast Chart */}
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-[#172B4D]">
                    4-Week Consumption & Demand Forecast
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Lead Time: {activeComponent.leadTimeDays} days
                  </span>
                </div>
                <div className="mt-3 h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={forecastChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="week" stroke="#718198" fontSize={11} />
                      <YAxis stroke="#718198" fontSize={11} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#10233F', color: '#fff', borderRadius: '6px', fontSize: '11px', border: 'none' }}
                      />
                      <Bar dataKey="demand" name="Required Quantity" fill="#1677F2" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STOCK & DEMAND */}
          {activeTab === 'stock' && (
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[#172B4D]">Inventory Balancing & MOQ Constraints</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                <div className="space-y-2 border-r border-slate-100 pr-4">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Safety Stock Target:</span>
                    <span className="font-mono font-bold text-[#172B4D]">{activeComponent.safetyStock}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Minimum Order Quantity (MOQ):</span>
                    <span className="font-mono font-bold text-[#172B4D]">{activeComponent.minOrderQty}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Order Multiple:</span>
                    <span className="font-mono font-bold text-[#172B4D]">{activeComponent.orderMultiple}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Lead Time to Sanand:</span>
                    <span className="font-mono font-bold text-[#172B4D]">{activeComponent.leadTimeDays} days</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Primary Supplier:</span>
                    <span className="font-semibold text-[#1677F2]">{activeComponent.supplierName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Stock Cover Period:</span>
                    <span className="font-mono font-bold text-[#172B4D]">
                      {availableStock > 0 ? `${Math.round((availableStock / (activeComponent.fourWeekForecast[0] || 1)) * 7)} days` : '0 days (Deficit)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SUPPLIERS & ALTERNATIVES */}
          {activeTab === 'suppliers' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
                <h3 className="text-sm font-bold text-[#172B4D]">Primary Source</h3>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-[#1677F2]">{activeComponent.supplierName}</div>
                    <div className="text-slate-500">Standard lead time: {activeComponent.leadTimeDays} days</div>
                  </div>
                  <Badge variant="healthy">Tier-2 Contracted</Badge>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
                <h3 className="text-sm font-bold text-[#172B4D]">Approved Alternatives & Second Sources</h3>
                {activeComponent.approvedAlternatives.length === 0 ? (
                  <div className="mt-3 rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                    <strong>Single-Source Vulnerability:</strong> No secondary source currently qualified for this part. Dual-sourcing audit recommended.
                  </div>
                ) : (
                  <div className="mt-3 space-y-2">
                    {activeComponent.approvedAlternatives.map((alt, altIdx) => (
                      <div
                        key={`${alt.partNumber}-${altIdx}`}
                        className="flex items-center justify-between rounded border border-slate-100 bg-slate-50 p-3 text-xs"
                      >
                        <div>
                          <div className="font-bold font-mono text-[#172B4D]">{alt.partNumber}</div>
                          <div className="text-slate-600">{alt.name} ({alt.manufacturer})</div>
                          <div className="text-[11px] text-slate-400">Lead time: {alt.leadTimeDays} days • Unit cost: ${alt.unitCost.toFixed(2)}</div>
                        </div>
                        <Badge
                          variant={
                            alt.qualificationStatus === 'Fully Qualified'
                              ? 'healthy'
                              : 'warning'
                          }
                        >
                          {alt.qualificationStatus}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: USAGE */}
          {activeTab === 'usage' && (
            <div className="space-y-4">
              {/* Product BOM Usage */}
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
                <h3 className="text-sm font-bold text-[#172B4D]">Product BOM Usage (OEM Assemblies)</h3>
                {activeComponent.productBOMUsage.length === 0 ? (
                  <p className="mt-2 text-xs text-slate-500">Not consumed directly in ECU BOM (Equipment Spare Part).</p>
                ) : (
                  <div className="mt-3 divide-y divide-slate-100 text-xs">
                    {activeComponent.productBOMUsage.map((bom, bomIdx) => (
                      <div key={`${bom.productCode}-${bomIdx}`} className="flex items-center justify-between py-2">
                        <div>
                          <span className="font-mono font-bold text-[#1677F2]">{bom.productCode}</span>
                          <span className="ml-2 text-slate-700">{bom.productName}</span>
                        </div>
                        <span className="font-mono font-bold text-[#172B4D]">
                          {bom.qtyPerECU} unit / ECU
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Equipment BOM Usage */}
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
                <h3 className="text-sm font-bold text-[#172B4D]">Equipment BOM Usage (Plant Machinery)</h3>
                {activeComponent.equipmentBOMUsage.length === 0 ? (
                  <p className="mt-2 text-xs text-slate-500">Not designated as an equipment maintenance spare.</p>
                ) : (
                  <div className="mt-3 divide-y divide-slate-100 text-xs">
                    {activeComponent.equipmentBOMUsage.map((eq, eqIdx) => (
                      <div key={`${eq.machineId}-${eqIdx}`} className="flex items-center justify-between py-2">
                        <div>
                          <span className="font-mono font-bold text-[#E9A23B]">{eq.machineId}</span>
                          <span className="ml-2 text-slate-700">{eq.machineName}</span>
                        </div>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          Role: {eq.role}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
              <h3 className="text-sm font-bold text-[#172B4D]">Attached Technical Documents & SOPs</h3>
              <div className="mt-3 space-y-2">
                {activeComponent.documents.map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded border border-slate-100 bg-slate-50 p-2.5 text-xs hover:bg-blue-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#1677F2]" />
                      <div>
                        <div className="font-medium text-[#172B4D]">{doc.title}</div>
                        <div className="text-[11px] text-slate-400">
                          {doc.type} • {doc.size} • {doc.date}
                        </div>
                      </div>
                    </div>
                    <button className="flex items-center gap-1 text-[11px] font-semibold text-[#1677F2] hover:underline">
                      <Download className="h-3.5 w-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
