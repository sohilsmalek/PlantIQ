import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Filter,
  Search,
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  Info,
  DollarSign,
  Package,
  Layers
} from 'lucide-react';
import { MaterialPlanRow } from '../types/manufacturing';
import { PlanningCalculationResult, exportPlanToCSV } from '../services/materialPlanning';
import { Badge } from '../components/common/Badge';

interface InventoryForecastProps {
  planningResult: PlanningCalculationResult;
  onSelectComponent: (partNumber: string) => void;
  onNavigateToParts: () => void;
  onNavigateToSimulator: () => void;
}

export const InventoryForecast: React.FC<InventoryForecastProps> = ({
  planningResult,
  onSelectComponent,
  onNavigateToParts,
  onNavigateToSimulator
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortField, setSortField] = useState<keyof MaterialPlanRow>('netReplenishment');
  const [sortAsc, setSortAsc] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleSort = (field: keyof MaterialPlanRow) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleCreateRequisition = (partNumber: string, qty: number) => {
    setActionNotice(
      `Purchase requisition created for ${qty.toLocaleString()} units of ${partNumber}. Sent to ERP procurement queue.`
    );
    setTimeout(() => setActionNotice(null), 4000);
  };

  const filteredRows = planningResult.rows
    .filter((row) => {
      const matchesCategory = filterCategory === 'ALL' || row.category === filterCategory;
      const matchesStatus = filterStatus === 'ALL' || row.status === filterStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        row.partNumber.toLowerCase().includes(q) ||
        row.name.toLowerCase().includes(q) ||
        row.supplierName.toLowerCase().includes(q);
      return matchesCategory && matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#172B4D]">
            Inventory & Forecasts — Material Planning Engine (MRP)
          </h1>
          <p className="text-xs text-[#718198]">
            Automated net replenishment calculation, safety buffers, and MOQ lot-sizing for ECU production
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportPlanToCSV(planningResult.rows)}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#172B4D] hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-[#1677F2]" />
            <span>Export CSV Plan</span>
          </button>
          <button
            onClick={onNavigateToSimulator}
            className="flex items-center gap-1.5 rounded-md bg-[#1677F2] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600 transition-colors shadow-2xs"
          >
            <span>Simulate Disruption</span>
          </button>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Mathematical Planning Assumptions & Calculation Logic */}
      <div className="rounded-lg border border-blue-200/90 bg-blue-50/50 p-4 text-xs text-[#172B4D]">
        <div className="flex items-center gap-2 font-bold text-[#10233F]">
          <Info className="h-4 w-4 text-[#1677F2]" />
          <span>MRP Calculation Rules & Engineering Formulas</span>
        </div>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3 text-[11px] leading-relaxed">
          <div className="rounded bg-white/80 p-2.5 border border-blue-100">
            <strong className="text-[#1677F2]">1. Gross Component Demand:</strong>
            <p className="mt-0.5 text-slate-600">
              ∑(OEM ECU Demand × BOM Qty / Board) across firm & scheduled OEM delivery milestones.
            </p>
          </div>
          <div className="rounded bg-white/80 p-2.5 border border-blue-100">
            <strong className="text-[#1677F2]">2. Net Available Stock:</strong>
            <p className="mt-0.5 text-slate-600">
              Available = On-Hand Stock − Reserved for Line 1/2 WIP (excludes quarantined parts).
            </p>
          </div>
          <div className="rounded bg-white/80 p-2.5 border border-blue-100">
            <strong className="text-[#1677F2]">3. Recommended Order Qty:</strong>
            <p className="mt-0.5 text-slate-600">
              Max(0, Net Requirement) raised to Supplier MOQ, rounded up to next standard Order Multiple.
            </p>
          </div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200/90 bg-white p-3 shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by part number, name, or Tier-2 supplier..."
            className="w-full rounded border border-slate-200 bg-[#F3F6FB] pl-9 pr-3 py-1.5 text-xs text-[#172B4D] focus:border-[#1677F2] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-[#172B4D] focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Electrical">Electrical</option>
            <option value="Automation">Automation</option>
            <option value="Mechanical">Mechanical</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-[#172B4D] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="CRITICAL">Critical Shortage</option>
            <option value="WARNING">Buffer Warning</option>
            <option value="HEALTHY">Healthy Stock</option>
          </select>
        </div>
      </div>

      {/* Dense Material Planning Table */}
      <div className="rounded-lg border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th
                  onClick={() => handleSort('partNumber')}
                  className="py-3 px-3 cursor-pointer hover:text-[#1677F2]"
                >
                  <div className="flex items-center gap-1">
                    <span>Part #</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Component Name</th>
                <th
                  onClick={() => handleSort('grossDemand')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-[#1677F2]"
                >
                  Gross Demand
                </th>
                <th
                  onClick={() => handleSort('availableStock')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-[#1677F2]"
                >
                  Avail Stock
                </th>
                <th className="py-3 px-3 text-right">Incoming PO</th>
                <th className="py-3 px-3 text-right">Safety Stock</th>
                <th
                  onClick={() => handleSort('netReplenishment')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-[#1677F2]"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Net Replenish</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right font-bold text-[#1677F2]">
                  Rec. Order Qty
                </th>
                <th className="py-3 px-3">Supplier & Lead Time</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.map((row, idx) => (
                <tr key={`${row.partNumber}-${idx}`} className="hover:bg-blue-50/30 transition-colors">
                  <td
                    onClick={() => {
                      onSelectComponent(row.partNumber);
                      onNavigateToParts();
                    }}
                    className="py-3 px-3 font-mono font-bold text-[#1677F2] cursor-pointer hover:underline"
                  >
                    {row.partNumber}
                  </td>
                  <td className="py-3 px-3 font-medium text-[#172B4D]">
                    <div className="max-w-[140px] truncate" title={row.name}>
                      {row.name}
                    </div>
                    <div className="text-[10px] text-slate-400">{row.category}</div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-700">
                    {row.grossDemand.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    <span
                      className={
                        row.availableStock < 0
                          ? 'font-bold text-[#E5484D]'
                          : row.availableStock < row.safetyStock
                          ? 'font-bold text-[#D97706]'
                          : 'text-slate-700'
                      }
                    >
                      {row.availableStock.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-600">
                    {row.incomingPO.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-500">
                    {row.safetyStock.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold">
                    <span
                      className={
                        row.netReplenishment > 0 ? 'text-[#E5484D]' : 'text-slate-400'
                      }
                    >
                      {row.netReplenishment.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-[#1677F2]">
                    {row.recommendedOrderQty > 0
                      ? row.recommendedOrderQty.toLocaleString()
                      : '—'}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    <div className="truncate max-w-[130px]">{row.supplierName}</div>
                    <div className="text-[10px] text-slate-400">{row.leadTimeDays}d lead time</div>
                  </td>
                  <td className="py-3 px-3">
                    <Badge
                      variant={
                        row.status === 'CRITICAL'
                          ? 'critical'
                          : row.status === 'WARNING'
                          ? 'warning'
                          : 'healthy'
                      }
                    >
                      {row.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-center">
                    {row.recommendedOrderQty > 0 ? (
                      <button
                        onClick={() =>
                          handleCreateRequisition(row.partNumber, row.recommendedOrderQty)
                        }
                        className="rounded bg-[#1677F2] px-2 py-1 text-[11px] font-semibold text-white hover:bg-blue-600 transition-colors"
                      >
                        Create PO
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">Stock OK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
