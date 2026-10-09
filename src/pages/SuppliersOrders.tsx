import React, { useState } from 'react';
import {
  Truck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Send,
  Building2,
  FileCheck
} from 'lucide-react';
import { PurchaseOrder, Supplier } from '../types/manufacturing';
import { KpiCard } from '../components/common/KpiCard';
import { Badge } from '../components/common/Badge';
import { usePlantDatabase } from '../context/DatabaseContext';
import { Upload } from 'lucide-react';

interface SuppliersOrdersProps {
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  onSelectComponent: (partNumber: string) => void;
  onNavigateToParts: () => void;
}

export const SuppliersOrders: React.FC<SuppliersOrdersProps> = ({
  suppliers,
  purchaseOrders,
  onSelectComponent,
  onNavigateToParts
}) => {
  const { openImportModal } = usePlantDatabase();
  const [activeTab, setActiveTab] = useState<'pos' | 'suppliers' | 'planner'>('pos');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRequisitionModalOpen, setIsRequisitionModalOpen] = useState(false);

  // Stats
  const delayedCount = purchaseOrders.filter(
    (po) => po.status === 'DELAYED' || po.status === 'AT_RISK'
  ).length;
  const avgOTD = (
    suppliers.reduce((sum, s) => sum + s.onTimeDeliveryPct, 0) / suppliers.length
  ).toFixed(1);
  const singleSourceCount = suppliers.reduce((sum, s) => sum + s.singleSourceCount, 0);

  const filteredPOs = purchaseOrders.filter((po) => {
    const matchesStatus = statusFilter === 'ALL' || po.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      po.poNumber.toLowerCase().includes(q) ||
      po.partNumber.toLowerCase().includes(q) ||
      po.supplierName.toLowerCase().includes(q) ||
      po.componentName.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const handleSimulatedAction = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#172B4D]">
            Suppliers & Purchase Orders
          </h1>
          <p className="text-xs text-[#718198]">
            Tier-2 supplier performance index, lead time adherence, and inbound purchase orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openImportModal(activeTab === 'suppliers' ? 'suppliers' : 'purchaseOrders')}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#172B4D] hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Upload className="h-3.5 w-3.5 text-[#1677F2]" />
            <span>Upload {activeTab === 'suppliers' ? 'Suppliers' : 'POs'} CSV</span>
          </button>
          <button
            onClick={() => setIsRequisitionModalOpen(true)}
            className="flex items-center gap-1.5 rounded-md bg-[#1677F2] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600 transition-colors shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Purchase Requisition</span>
          </button>
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Suppliers"
          value={suppliers.length}
          subValue="Active contracted Tier-2/3 vendors"
          icon={Building2}
          variant="primary"
          badgeText="Contracted"
        />

        <KpiCard
          title="On-Time Delivery Rate"
          value={`${avgOTD}%`}
          subValue="Target >= 95.0% adherence"
          subTextColor={parseFloat(avgOTD) < 90 ? 'text-[#E5484D]' : 'text-[#20A36B]'}
          icon={Clock}
          variant={parseFloat(avgOTD) < 90 ? 'warning' : 'healthy'}
          badgeText="Last 90d"
        />

        <KpiCard
          title="Delayed Purchase Orders"
          value={delayedCount}
          subValue="PO-9840 (SEN-2048), PO-9846 (SRV-02)"
          subTextColor="text-[#E5484D]"
          icon={AlertTriangle}
          variant="critical"
          badgeText="Urgent"
        />

        <KpiCard
          title="Single-Source Parts"
          value={singleSourceCount}
          subValue="MCU-110 & SEN-2048 without secondary source"
          subTextColor="text-[#D97706]"
          icon={ShieldAlert}
          variant="warning"
          badgeText="Dual-Source Gap"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('pos')}
          className={`border-b-2 px-4 py-2 transition-colors ${
            activeTab === 'pos'
              ? 'border-[#1677F2] text-[#1677F2]'
              : 'border-transparent text-slate-500 hover:text-[#172B4D]'
          }`}
        >
          Purchase Orders ({purchaseOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`border-b-2 px-4 py-2 transition-colors ${
            activeTab === 'suppliers'
              ? 'border-[#1677F2] text-[#1677F2]'
              : 'border-transparent text-slate-500 hover:text-[#172B4D]'
          }`}
        >
          Supplier Master & Scorecards ({suppliers.length})
        </button>
        <button
          onClick={() => setActiveTab('planner')}
          className={`border-b-2 px-4 py-2 transition-colors ${
            activeTab === 'planner'
              ? 'border-[#1677F2] text-[#1677F2]'
              : 'border-transparent text-slate-500 hover:text-[#172B4D]'
          }`}
        >
          Replenishment Planning & Expedite Queue
        </button>
      </div>

      {/* TAB 1: PURCHASE ORDERS */}
      {activeTab === 'pos' && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200/90 bg-white p-3 shadow-xs">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search PO #, part #, or supplier..."
                className="w-full rounded border border-slate-200 bg-[#F3F6FB] pl-9 pr-3 py-1.5 text-xs text-[#172B4D] focus:border-[#1677F2] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-[#172B4D] focus:outline-none"
              >
                <option value="ALL">All Delivery Statuses</option>
                <option value="DELAYED">Delayed</option>
                <option value="AT_RISK">At Risk</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="ON_TIME">On Time</option>
                <option value="RECEIVED">Received</option>
              </select>
            </div>
          </div>

          {/* PO Table */}
          <div className="rounded-lg border border-slate-200/90 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-3">PO Number</th>
                    <th className="py-3 px-3">Part #</th>
                    <th className="py-3 px-3">Component Name</th>
                    <th className="py-3 px-3">Supplier</th>
                    <th className="py-3 px-3 text-right">Quantity</th>
                    <th className="py-3 px-3">Order Date</th>
                    <th className="py-3 px-3">Expected Delivery</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPOs.map((po, idx) => {
                    let statusVariant: 'critical' | 'warning' | 'healthy' | 'info' | 'neutral' =
                      'neutral';
                    if (po.status === 'DELAYED') statusVariant = 'critical';
                    else if (po.status === 'AT_RISK') statusVariant = 'warning';
                    else if (po.status === 'IN_TRANSIT') statusVariant = 'info';
                    else if (po.status === 'ON_TIME') statusVariant = 'healthy';

                    return (
                      <tr key={`${po.poNumber}-${idx}`} className="hover:bg-blue-50/30 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-[#1677F2]">
                          {po.poNumber}
                        </td>
                        <td
                          onClick={() => {
                            onSelectComponent(po.partNumber);
                            onNavigateToParts();
                          }}
                          className="py-3 px-3 font-mono font-bold text-slate-700 cursor-pointer hover:underline"
                        >
                          {po.partNumber}
                        </td>
                        <td className="py-3 px-3 text-[#172B4D] max-w-[150px] truncate">
                          {po.componentName}
                        </td>
                        <td className="py-3 px-3 text-slate-600">{po.supplierName}</td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-[#172B4D]">
                          {po.quantity.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-slate-500 font-mono">{po.orderDate}</td>
                        <td className="py-3 px-3 font-mono font-medium text-[#172B4D]">
                          {po.expectedDelivery}
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant={statusVariant}>{po.status.replace('_', ' ')}</Badge>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => setSelectedPO(po)}
                            className="rounded border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            Review Order
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUPPLIERS */}
      {activeTab === 'suppliers' && (
        <div className="rounded-lg border border-slate-200/90 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-3">Supplier Name</th>
                  <th className="py-3 px-3">Country / Hub</th>
                  <th className="py-3 px-3">Supplied Components</th>
                  <th className="py-3 px-3 text-right">Avg Lead Time</th>
                  <th className="py-3 px-3 text-right">On-Time Delivery %</th>
                  <th className="py-3 px-3 text-center">Open POs</th>
                  <th className="py-3 px-3">Risk Level</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map((s, idx) => (
                  <tr key={`${s.id}-${idx}`} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#172B4D]">{s.name}</div>
                      <div className="text-[10px] text-slate-400">{s.contactEmail}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{s.country}</td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {s.suppliedComponents.map((c, cIdx) => (
                          <span
                            key={`${c}-${cIdx}`}
                            onClick={() => {
                              onSelectComponent(c);
                              onNavigateToParts();
                            }}
                            className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-700 cursor-pointer hover:bg-blue-100 hover:text-blue-700"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {s.avgLeadTimeDays} days
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      <span
                        className={
                          s.onTimeDeliveryPct < 85
                            ? 'text-[#E5484D]'
                            : s.onTimeDeliveryPct < 92
                            ? 'text-[#D97706]'
                            : 'text-[#20A36B]'
                        }
                      >
                        {s.onTimeDeliveryPct}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-semibold text-slate-700">
                      {s.openPOsCount}
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          s.riskLevel === 'HIGH'
                            ? 'critical'
                            : s.riskLevel === 'MEDIUM'
                            ? 'warning'
                            : 'healthy'
                        }
                      >
                        {s.riskLevel} RISK
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() =>
                          handleSimulatedAction(
                            `Supplier audit dossier opened for ${s.name}. Quality score: ${s.qualityScore}/100.`
                          )
                        }
                        className="rounded border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                      >
                        View Audit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: REPLENISHMENT PLANNER */}
      {activeTab === 'planner' && (
        <div className="rounded-lg border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#172B4D]">
                Automated Replenishment Expedite Planner
              </h2>
              <p className="text-xs text-[#718198]">
                Expedite air freight authorization and second-source lot allocation
              </p>
            </div>
            <button
              onClick={() =>
                handleSimulatedAction('Replenishment plan exported to Sanand Procurement Dispatch.')
              }
              className="rounded bg-[#1677F2] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600"
            >
              Export Plan
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="rounded-lg border border-red-200 bg-red-50/40 p-3.5 flex items-start justify-between">
              <div>
                <span className="font-bold text-[#E5484D]">Urgent Expedite: SEN-2048 (PO-9840)</span>
                <p className="mt-1 text-slate-700">
                  SensorTech GmbH delayed 18 days at Hamburg. Switch 20 units to Lufthansa Air Cargo ($450 expedite fee). ETA moves from Oct 14 to Oct 11.
                </p>
              </div>
              <button
                onClick={() =>
                  handleSimulatedAction('Air-freight expedite authorized for PO-9840 (SEN-2048).')
                }
                className="shrink-0 rounded bg-[#E5484D] px-2.5 py-1 text-xs font-bold text-white hover:bg-red-700"
              >
                Authorize Air Freight
              </button>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-3.5 flex items-start justify-between">
              <div>
                <span className="font-bold text-[#D97706]">Spot-Buy Sourcing: MCU-110</span>
                <p className="mt-1 text-slate-700">
                  Single-source allocation deficit of 2,300 units for Maruti Suzuki build. Spot buy authorization for 1,200 units Infineon TC397.
                </p>
              </div>
              <button
                onClick={() =>
                  handleSimulatedAction('Emergency spot-buy requisition PO created for 1,200 MCU-110 units.')
                }
                className="shrink-0 rounded bg-[#E9A23B] px-2.5 py-1 text-xs font-bold text-white hover:bg-amber-600"
              >
                Approve Spot Buy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Order Modal */}
      {selectedPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-base text-[#172B4D]">
                Purchase Order Details: {selectedPO.poNumber}
              </span>
              <button
                onClick={() => setSelectedPO(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Component:</span>
                <span className="font-bold font-mono text-[#1677F2]">{selectedPO.partNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Name:</span>
                <span className="font-medium text-[#172B4D]">{selectedPO.componentName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Supplier:</span>
                <span className="font-medium text-[#172B4D]">{selectedPO.supplierName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Ordered Quantity:</span>
                <span className="font-mono font-bold text-[#172B4D]">
                  {selectedPO.quantity.toLocaleString()} units
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Expected Delivery:</span>
                <span className="font-mono font-bold text-[#E5484D]">
                  {selectedPO.expectedDelivery}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Tracking Reference:</span>
                <span className="font-mono text-slate-700">{selectedPO.trackingId}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedPO(null)}
                className="rounded border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleSimulatedAction(
                    `Supplier liaison dispatched for ${selectedPO.poNumber} (${selectedPO.supplierName}).`
                  );
                  setSelectedPO(null);
                }}
                className="rounded bg-[#1677F2] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600"
              >
                Contact Supplier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Purchase Requisition Modal */}
      {isRequisitionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-base text-[#172B4D]">
                Create Purchase Requisition (PR)
              </span>
              <button
                onClick={() => setIsRequisitionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700">Target Component:</label>
                <select className="mt-1 w-full rounded border border-slate-200 bg-white p-2 text-xs">
                  <option>SEN-2048 — Inductive Proximity Sensor M12</option>
                  <option>MCU-110 — 32-bit Automotive TriCore Microcontroller</option>
                  <option>FLT-05 — Hydraulic Spindle Oil Filter Cartridge</option>
                  <option>PCB-04 — 8-Layer High-TG ECU Printed Circuit Board</option>
                  <option>CAP-22 — SMD Ceramic Capacitor 10µF 50V</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Requisition Quantity:</label>
                <input
                  type="number"
                  defaultValue={500}
                  className="mt-1 w-full rounded border border-slate-200 bg-white p-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Priority Level:</label>
                <select className="mt-1 w-full rounded border border-slate-200 bg-white p-2 text-xs">
                  <option>P1 — Production Line Critical (Immediate Sign-off)</option>
                  <option>P2 — Safety Buffer Depletion</option>
                  <option>P3 — Standard MRP Replenishment</option>
                </select>
              </div>

              <div className="rounded bg-slate-50 p-2 text-[11px] text-slate-500">
                *Demo simulation: Submitting will route requisition to the mock ERP purchasing queue without placing external orders.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsRequisitionModalOpen(false)}
                className="rounded border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSimulatedAction(
                    'Requisition PR-2026-904 created successfully and logged in ERP.'
                  );
                  setIsRequisitionModalOpen(false);
                }}
                className="rounded bg-[#1677F2] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600"
              >
                Submit Requisition
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
