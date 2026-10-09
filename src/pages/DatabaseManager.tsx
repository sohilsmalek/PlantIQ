/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Database,
  Upload,
  Download,
  FileSpreadsheet,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Layers,
  Cpu,
  Cog,
  Truck,
  FileText,
  Package,
  Wrench,
  Check,
  FileArchive,
  ArrowUpRight
} from 'lucide-react';
import { usePlantDatabase } from '../context/DatabaseContext';
import { Badge } from '../components/common/Badge';
import { CSV_TEMPLATES, DatabaseTableKey } from '../services/csvDatabaseService';

interface DatabaseManagerProps {
  onSelectComponent: (partNumber: string) => void;
  onSelectMachine: (machineId: string) => void;
  onNavigateToParts: () => void;
  onNavigateToMachines: () => void;
}

export const DatabaseManager: React.FC<DatabaseManagerProps> = ({
  onSelectComponent,
  onSelectMachine,
  onNavigateToParts,
  onNavigateToMachines
}) => {
  const {
    components,
    machines,
    oemOrders,
    suppliers,
    purchaseOrders,
    spares,
    planningResult,
    metadata,
    isCustomDatabase,
    resetToDefaultDatabase,
    exportTable,
    exportAllDatabase,
    downloadTemplate,
    downloadAllTemplates,
    openImportModal
  } = usePlantDatabase();

  const [activeTab, setActiveTab] = useState<DatabaseTableKey>('components');
  const [searchQuery, setSearchQuery] = useState('');

  // Table summary counts
  const tableCounts = {
    components: components.length,
    machines: machines.length,
    oemOrders: oemOrders.length,
    suppliers: suppliers.length,
    purchaseOrders: purchaseOrders.length,
    spares: spares.length
  };

  const q = searchQuery.toLowerCase().trim();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#172B4D]">
              Database & CSV Management
            </h1>
            {isCustomDatabase ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Custom Database Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 border border-blue-200">
                Factory Baseline Demo Dataset
              </span>
            )}
          </div>
          <p className="text-xs text-[#718198] mt-0.5">
            Upload custom CSV files from your side to power all BOM planning, machine health telemetry, and supplier simulations
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {isCustomDatabase && (
            <button
              onClick={() => {
                if (confirm('Reset to the factory demo baseline dataset?')) {
                  resetToDefaultDatabase();
                }
              }}
              className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-red-600 transition-colors shadow-2xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset to Demo Data</span>
            </button>
          )}

          <button
            onClick={downloadAllTemplates}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#172B4D] hover:bg-slate-100 transition-colors shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-[#1677F2]" />
            <span>Download All CSV Templates</span>
          </button>

          <button
            onClick={() => exportAllDatabase()}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#172B4D] hover:bg-slate-100 transition-colors shadow-2xs"
          >
            <FileArchive className="h-3.5 w-3.5 text-emerald-600" />
            <span>Export Database (.ZIP)</span>
          </button>

          <button
            onClick={() => openImportModal(activeTab)}
            className="flex items-center gap-2 rounded-md bg-[#1677F2] px-4 py-2 text-xs font-bold text-white hover:bg-blue-600 transition-all shadow-sm"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload Database CSV</span>
          </button>
        </div>
      </div>

      {/* Database Status & Quick Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setActiveTab('components')}
          className={`cursor-pointer rounded-lg border p-3 transition-all ${
            activeTab === 'components'
              ? 'border-[#1677F2] bg-blue-50/50 shadow-xs'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">Parts & BOM</span>
            <Cpu className="h-3.5 w-3.5 text-[#1677F2]" />
          </div>
          <div className="text-lg font-bold text-[#172B4D]">{components.length}</div>
          <div className="text-[10px] text-red-600 font-medium">
            {planningResult.criticalShortagesCount} critical risks
          </div>
        </div>

        <div
          onClick={() => setActiveTab('machines')}
          className={`cursor-pointer rounded-lg border p-3 transition-all ${
            activeTab === 'machines'
              ? 'border-[#1677F2] bg-blue-50/50 shadow-xs'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">Machines & Cells</span>
            <Cog className="h-3.5 w-3.5 text-amber-600" />
          </div>
          <div className="text-lg font-bold text-[#172B4D]">{machines.length}</div>
          <div className="text-[10px] text-amber-600 font-medium">
            {machines.filter((m) => m.status !== 'OPERATIONAL').length} with alerts
          </div>
        </div>

        <div
          onClick={() => setActiveTab('oemOrders')}
          className={`cursor-pointer rounded-lg border p-3 transition-all ${
            activeTab === 'oemOrders'
              ? 'border-[#1677F2] bg-blue-50/50 shadow-xs'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">OEM Contracts</span>
            <Package className="h-3.5 w-3.5 text-indigo-600" />
          </div>
          <div className="text-lg font-bold text-[#172B4D]">{oemOrders.length}</div>
          <div className="text-[10px] text-slate-500">
            ${(oemOrders.reduce((acc, o) => acc + o.valueUSD, 0) / 1000000).toFixed(1)}M active
          </div>
        </div>

        <div
          onClick={() => setActiveTab('suppliers')}
          className={`cursor-pointer rounded-lg border p-3 transition-all ${
            activeTab === 'suppliers'
              ? 'border-[#1677F2] bg-blue-50/50 shadow-xs'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">Vendors / Suppliers</span>
            <Truck className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div className="text-lg font-bold text-[#172B4D]">{suppliers.length}</div>
          <div className="text-[10px] text-slate-500">
            {suppliers.filter((s) => s.riskLevel === 'HIGH').length} high risk
          </div>
        </div>

        <div
          onClick={() => setActiveTab('purchaseOrders')}
          className={`cursor-pointer rounded-lg border p-3 transition-all ${
            activeTab === 'purchaseOrders'
              ? 'border-[#1677F2] bg-blue-50/50 shadow-xs'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">Purchase Orders</span>
            <FileText className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <div className="text-lg font-bold text-[#172B4D]">{purchaseOrders.length}</div>
          <div className="text-[10px] text-amber-600 font-medium">
            {purchaseOrders.filter((po) => po.status === 'DELAYED' || po.status === 'AT_RISK').length} delayed
          </div>
        </div>

        <div
          onClick={() => setActiveTab('spares')}
          className={`cursor-pointer rounded-lg border p-3 transition-all ${
            activeTab === 'spares'
              ? 'border-[#1677F2] bg-blue-50/50 shadow-xs'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold">Toolroom Spares</span>
            <Wrench className="h-3.5 w-3.5 text-purple-600" />
          </div>
          <div className="text-lg font-bold text-[#172B4D]">{spares.length}</div>
          <div className="text-[10px] text-red-600 font-medium">
            {spares.filter((sp) => sp.stock <= sp.reorderPoint).length} low buffer
          </div>
        </div>
      </div>

      {/* CSV Quick Import Banner */}
      <div className="rounded-xl border border-blue-200/80 bg-gradient-to-r from-blue-50/90 to-indigo-50/90 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-[#1677F2]" />
              <h3 className="text-sm font-bold text-[#172B4D]">
                Have your own CSV database ready?
              </h3>
            </div>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              Upload your plant components, CNC/SMT machine parameters, OEM contracts, or vendor lists.
              PlantIQ's auto-parser normalizes column aliases and updates real-time inventory calculations instantly.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => downloadTemplate(activeTab)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-[#172B4D] hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Download className="h-3.5 w-3.5 text-[#1677F2]" />
              <span>Download {CSV_TEMPLATES[activeTab].label} Template</span>
            </button>
            <button
              onClick={() => openImportModal(activeTab)}
              className="flex items-center gap-1.5 rounded-lg bg-[#1677F2] px-4 py-2 text-xs font-bold text-white hover:bg-blue-600 transition-colors shadow-xs"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload CSV Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Table Viewer Section */}
      <div className="rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {/* Table Selector Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 px-5 py-3 gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs font-semibold">
            {(
              [
                { key: 'components', label: 'Parts & BOM', count: components.length },
                { key: 'machines', label: 'Machines & Telemetry', count: machines.length },
                { key: 'oemOrders', label: 'OEM Orders', count: oemOrders.length },
                { key: 'suppliers', label: 'Suppliers', count: suppliers.length },
                { key: 'purchaseOrders', label: 'Purchase Orders', count: purchaseOrders.length },
                { key: 'spares', label: 'Maintenance Spares', count: spares.length }
              ] as { key: DatabaseTableKey; label: string; count: number }[]
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setSearchQuery('');
                }}
                className={`rounded-md px-3 py-1.5 transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-[#1677F2] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-[#172B4D]'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Right Side: Search & Export Table */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search in ${CSV_TEMPLATES[activeTab].label}...`}
                className="h-8 w-48 sm:w-64 rounded-md border border-slate-200 pl-8 pr-3 text-xs placeholder:text-slate-400 focus:border-[#1677F2] focus:outline-hidden"
              />
            </div>
            <button
              onClick={() => exportTable(activeTab)}
              title="Export this table to CSV"
              className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-[#172B4D] hover:bg-slate-100 transition-colors"
            >
              <Download className="h-3 w-3 text-[#1677F2]" />
              <span className="hidden sm:inline">Export Table CSV</span>
            </button>
          </div>
        </div>

        {/* Dynamic Table Content */}
        <div className="overflow-x-auto max-h-[540px]">
          {/* 1. COMPONENTS TABLE */}
          {activeTab === 'components' && (
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-100 text-[11px] font-bold text-slate-700 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Part Number</th>
                  <th className="px-4 py-2.5">Component Name</th>
                  <th className="px-4 py-2.5">Category</th>
                  <th className="px-4 py-2.5">Stock (Avail / Safety)</th>
                  <th className="px-4 py-2.5">Unit Cost</th>
                  <th className="px-4 py-2.5">Supplier</th>
                  <th className="px-4 py-2.5">Lead Time</th>
                  <th className="px-4 py-2.5">Risk Status</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {components
                  .filter((c) =>
                    q
                      ? c.partNumber.toLowerCase().includes(q) ||
                        c.name.toLowerCase().includes(q) ||
                        c.supplierName.toLowerCase().includes(q)
                      : true
                  )
                  .map((c, idx) => (
                    <tr key={`${c.partNumber}-${idx}`} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2 font-bold text-[#1677F2]">{c.partNumber}</td>
                      <td className="px-4 py-2 font-sans font-medium text-[#172B4D] max-w-[220px] truncate">
                        {c.name}
                      </td>
                      <td className="px-4 py-2 font-sans">
                        <Badge variant="neutral">{c.category}</Badge>
                      </td>
                      <td className="px-4 py-2 font-mono">
                        <span className={c.onHandStock - c.reservedStock <= 0 ? 'text-red-600 font-bold' : ''}>
                          {c.onHandStock - c.reservedStock}
                        </span>
                        <span className="text-slate-400"> / {c.safetyStock} min</span>
                      </td>
                      <td className="px-4 py-2 font-mono">${c.unitCost.toFixed(2)}</td>
                      <td className="px-4 py-2 font-sans text-slate-600 truncate max-w-[140px]">
                        {c.supplierName}
                      </td>
                      <td className="px-4 py-2 font-mono">{c.leadTimeDays}d</td>
                      <td className="px-4 py-2 font-sans">
                        <Badge
                          variant={
                            c.riskStatus === 'CRITICAL'
                              ? 'critical'
                              : c.riskStatus === 'WARNING'
                              ? 'warning'
                              : 'healthy'
                          }
                        >
                          {c.riskStatus}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => {
                            onSelectComponent(c.partNumber);
                            onNavigateToParts();
                          }}
                          className="text-[#1677F2] hover:underline font-sans text-xs font-semibold inline-flex items-center gap-0.5"
                        >
                          <span>View BOM</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {/* 2. MACHINES TABLE */}
          {activeTab === 'machines' && (
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-100 text-[11px] font-bold text-slate-700 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Machine ID</th>
                  <th className="px-4 py-2.5">Station Name</th>
                  <th className="px-4 py-2.5">Line</th>
                  <th className="px-4 py-2.5">Health Score</th>
                  <th className="px-4 py-2.5">Temp (°C)</th>
                  <th className="px-4 py-2.5">Vibration (mm/s)</th>
                  <th className="px-4 py-2.5">Oil Level</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {machines
                  .filter((m) =>
                    q
                      ? m.id.toLowerCase().includes(q) ||
                        m.name.toLowerCase().includes(q) ||
                        m.line.toLowerCase().includes(q)
                      : true
                  )
                  .map((m, idx) => (
                    <tr key={`${m.id}-${idx}`} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2 font-bold text-[#1677F2]">{m.id}</td>
                      <td className="px-4 py-2 font-sans font-medium text-[#172B4D]">{m.name}</td>
                      <td className="px-4 py-2 font-sans text-slate-600">{m.line}</td>
                      <td className="px-4 py-2 font-mono">
                        <span
                          className={`font-bold ${
                            m.healthScore < 75 ? 'text-red-600' : m.healthScore < 85 ? 'text-amber-600' : 'text-emerald-600'
                          }`}
                        >
                          {m.healthScore}%
                        </span>
                      </td>
                      <td className="px-4 py-2 font-mono">
                        <span className={m.temperature > m.tempThreshold ? 'text-red-600 font-bold' : ''}>
                          {m.temperature}°C
                        </span>
                      </td>
                      <td className="px-4 py-2 font-mono">
                        <span className={m.vibration > m.vibrationThreshold ? 'text-amber-600 font-bold' : ''}>
                          {m.vibration} mm/s
                        </span>
                      </td>
                      <td className="px-4 py-2 font-mono">{m.oilLevel}%</td>
                      <td className="px-4 py-2 font-sans">
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
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => {
                            onSelectMachine(m.id);
                            onNavigateToMachines();
                          }}
                          className="text-[#1677F2] hover:underline font-sans text-xs font-semibold inline-flex items-center gap-0.5"
                        >
                          <span>Telemetry</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {/* 3. OEM ORDERS TABLE */}
          {activeTab === 'oemOrders' && (
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-100 text-[11px] font-bold text-slate-700 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Order ID</th>
                  <th className="px-4 py-2.5">OEM Customer</th>
                  <th className="px-4 py-2.5">Product Code</th>
                  <th className="px-4 py-2.5">Quantity</th>
                  <th className="px-4 py-2.5">Target Delivery</th>
                  <th className="px-4 py-2.5">Value (USD)</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {oemOrders
                  .filter((o) =>
                    q
                      ? o.orderId.toLowerCase().includes(q) ||
                        o.oemName.toLowerCase().includes(q) ||
                        o.productCode.toLowerCase().includes(q)
                      : true
                  )
                  .map((o, idx) => (
                    <tr key={`${o.orderId}-${idx}`} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2 font-bold text-[#1677F2]">{o.orderId}</td>
                      <td className="px-4 py-2 font-sans font-medium text-[#172B4D]">{o.oemName}</td>
                      <td className="px-4 py-2 font-mono text-slate-700">{o.productCode}</td>
                      <td className="px-4 py-2 font-mono font-bold">{o.quantity.toLocaleString()}</td>
                      <td className="px-4 py-2 font-mono">{o.targetDeliveryDate}</td>
                      <td className="px-4 py-2 font-mono font-semibold">${o.valueUSD.toLocaleString()}</td>
                      <td className="px-4 py-2 font-sans">
                        <Badge
                          variant={
                            o.status === 'At Risk'
                              ? 'critical'
                              : o.status === 'Delivered'
                              ? 'healthy'
                              : 'info'
                          }
                        >
                          {o.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {/* 4. SUPPLIERS TABLE */}
          {activeTab === 'suppliers' && (
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-100 text-[11px] font-bold text-slate-700 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Vendor ID</th>
                  <th className="px-4 py-2.5">Supplier Name</th>
                  <th className="px-4 py-2.5">Tier</th>
                  <th className="px-4 py-2.5">Country / Hub</th>
                  <th className="px-4 py-2.5">Lead Time</th>
                  <th className="px-4 py-2.5">On-Time %</th>
                  <th className="px-4 py-2.5">Quality Score</th>
                  <th className="px-4 py-2.5">Risk Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {suppliers
                  .filter((s) =>
                    q
                      ? s.id.toLowerCase().includes(q) ||
                        s.name.toLowerCase().includes(q) ||
                        s.country.toLowerCase().includes(q)
                      : true
                  )
                  .map((s, idx) => (
                    <tr key={`${s.id}-${idx}`} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2 font-bold text-[#1677F2]">{s.id}</td>
                      <td className="px-4 py-2 font-sans font-medium text-[#172B4D]">{s.name}</td>
                      <td className="px-4 py-2 font-sans">
                        <Badge variant="neutral">{s.tier}</Badge>
                      </td>
                      <td className="px-4 py-2 font-sans text-slate-600">{s.country}</td>
                      <td className="px-4 py-2 font-mono">{s.avgLeadTimeDays}d</td>
                      <td className="px-4 py-2 font-mono font-bold">
                        <span className={s.onTimeDeliveryPct < 85 ? 'text-red-600' : 'text-emerald-600'}>
                          {s.onTimeDeliveryPct}%
                        </span>
                      </td>
                      <td className="px-4 py-2 font-mono">{s.qualityScore}</td>
                      <td className="px-4 py-2 font-sans">
                        <Badge
                          variant={
                            s.riskLevel === 'HIGH'
                              ? 'critical'
                              : s.riskLevel === 'MEDIUM'
                              ? 'warning'
                              : 'healthy'
                          }
                        >
                          {s.riskLevel}
                        </Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {/* 5. PURCHASE ORDERS TABLE */}
          {activeTab === 'purchaseOrders' && (
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-100 text-[11px] font-bold text-slate-700 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">PO Number</th>
                  <th className="px-4 py-2.5">Part Number</th>
                  <th className="px-4 py-2.5">Component Description</th>
                  <th className="px-4 py-2.5">Supplier</th>
                  <th className="px-4 py-2.5">Quantity</th>
                  <th className="px-4 py-2.5">ETA Delivery</th>
                  <th className="px-4 py-2.5">Tracking AWB</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {purchaseOrders
                  .filter((po) =>
                    q
                      ? po.poNumber.toLowerCase().includes(q) ||
                        po.partNumber.toLowerCase().includes(q) ||
                        po.supplierName.toLowerCase().includes(q)
                      : true
                  )
                  .map((po, idx) => (
                    <tr key={`${po.poNumber}-${idx}`} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2 font-bold text-[#1677F2]">{po.poNumber}</td>
                      <td className="px-4 py-2 font-mono text-slate-700">{po.partNumber}</td>
                      <td className="px-4 py-2 font-sans text-[#172B4D] truncate max-w-[200px]">
                        {po.componentName}
                      </td>
                      <td className="px-4 py-2 font-sans text-slate-600 truncate max-w-[140px]">
                        {po.supplierName}
                      </td>
                      <td className="px-4 py-2 font-mono font-bold">{po.quantity.toLocaleString()}</td>
                      <td className="px-4 py-2 font-mono">{po.expectedDelivery}</td>
                      <td className="px-4 py-2 font-mono text-slate-500">{po.trackingId}</td>
                      <td className="px-4 py-2 font-sans">
                        <Badge
                          variant={
                            po.status === 'DELAYED' || po.status === 'AT_RISK'
                              ? 'critical'
                              : po.status === 'ON_TIME'
                              ? 'healthy'
                              : 'info'
                          }
                        >
                          {po.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {/* 6. MAINTENANCE SPARES TABLE */}
          {activeTab === 'spares' && (
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-100 text-[11px] font-bold text-slate-700 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Part Number</th>
                  <th className="px-4 py-2.5">Spare Description</th>
                  <th className="px-4 py-2.5">Category</th>
                  <th className="px-4 py-2.5">Applicable Machines</th>
                  <th className="px-4 py-2.5">Stock / Reorder</th>
                  <th className="px-4 py-2.5">Lead Time</th>
                  <th className="px-4 py-2.5">Criticality</th>
                  <th className="px-4 py-2.5">Unit Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {spares
                  .filter((sp) =>
                    q
                      ? sp.partNumber.toLowerCase().includes(q) ||
                        sp.name.toLowerCase().includes(q) ||
                        sp.category.toLowerCase().includes(q)
                      : true
                  )
                  .map((sp, idx) => (
                    <tr key={`${sp.partNumber}-${idx}`} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2 font-bold text-[#1677F2]">{sp.partNumber}</td>
                      <td className="px-4 py-2 font-sans font-medium text-[#172B4D] truncate max-w-[200px]">
                        {sp.name}
                      </td>
                      <td className="px-4 py-2 font-sans">
                        <Badge variant="neutral">{sp.category}</Badge>
                      </td>
                      <td className="px-4 py-2 font-mono text-slate-600">
                        {sp.machineIds.join(', ')}
                      </td>
                      <td className="px-4 py-2 font-mono">
                        <span className={sp.stock <= sp.reorderPoint ? 'text-red-600 font-bold' : ''}>
                          {sp.stock}
                        </span>
                        <span className="text-slate-400"> / {sp.reorderPoint} target</span>
                      </td>
                      <td className="px-4 py-2 font-mono">{sp.leadTimeDays}d</td>
                      <td className="px-4 py-2 font-sans">
                        <Badge
                          variant={
                            sp.criticality === 'CRITICAL'
                              ? 'critical'
                              : sp.criticality === 'HIGH'
                              ? 'warning'
                              : 'healthy'
                          }
                        >
                          {sp.criticality}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 font-mono">${sp.unitCost.toFixed(2)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
