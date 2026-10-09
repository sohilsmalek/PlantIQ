/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ComponentItem,
  Machine,
  MaintenanceSpare,
  OEMOrder,
  PartCategory,
  PurchaseOrder,
  RiskLevel,
  Supplier
} from '../types/manufacturing';
import JSZip from 'jszip';

export type DatabaseTableKey =
  | 'components'
  | 'machines'
  | 'oemOrders'
  | 'suppliers'
  | 'purchaseOrders'
  | 'spares';

export interface DatabaseMetadata {
  isCustom: boolean;
  lastUpdated: string;
  source: string;
  uploadedFiles: string[];
  counts: Record<DatabaseTableKey, number>;
}

export interface CSVParseResult<T> {
  tableKey: DatabaseTableKey;
  data: T[];
  headers: string[];
  totalRows: number;
  validRows: number;
  errors: string[];
  warnings: string[];
  samplePreview: Record<string, string>[];
}

export interface PlantDatabaseState {
  components: ComponentItem[];
  machines: Machine[];
  oemOrders: OEMOrder[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  spares: MaintenanceSpare[];
  metadata: DatabaseMetadata;
}

// ==========================================
// Robust RFC-4180 CSV Parser
// ==========================================

export function parseCSVToRows(csvText: string): string[][] {
  const cleanText = csvText.replace(/^\uFEFF/, '').trim(); // Remove UTF-8 BOM
  if (!cleanText) return [];

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped double quote
          currentField += '"';
          i++;
        } else {
          // Closing quote
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',' || char === ';' || char === '\t') {
        // Delimiter support (comma, semicolon, tab)
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\r') {
        // Handle CRLF
        if (nextChar === '\n') {
          i++;
        }
        currentRow.push(currentField.trim());
        if (currentRow.some((f) => f.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        if (currentRow.some((f) => f.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  // Push last cell & row if any
  currentRow.push(currentField.trim());
  if (currentRow.some((f) => f.length > 0)) {
    rows.push(currentRow);
  }

  return rows;
}

// Convert parsed matrix into array of objects with normalized keys
export function rowsToObjectList(rows: string[][]): {
  headers: string[];
  records: Record<string, string>[];
} {
  if (rows.length === 0) return { headers: [], records: [] };

  const rawHeaders = rows[0].map((h) => h.replace(/^["']|["']$/g, '').trim());
  const normalizedHeaders = rawHeaders.map((h) => normalizeKey(h));

  const records: Record<string, string>[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    // Skip empty lines
    if (row.length === 0 || (row.length === 1 && !row[0])) continue;

    const record: Record<string, string> = {};
    for (let j = 0; j < rawHeaders.length; j++) {
      const val = row[j] !== undefined ? row[j] : '';
      record[normalizedHeaders[j]] = val;
      // also keep raw header for display
      record[rawHeaders[j]] = val;
    }
    records.push(record);
  }

  return { headers: rawHeaders, records };
}

function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function getField(record: Record<string, string>, ...aliases: string[]): string {
  for (const alias of aliases) {
    const norm = normalizeKey(alias);
    if (record[norm] !== undefined && record[norm] !== '') {
      return record[norm];
    }
    if (record[alias] !== undefined && record[alias] !== '') {
      return record[alias];
    }
  }
  return '';
}

function parseNumber(val: string, fallback = 0): number {
  if (!val) return fallback;
  const cleaned = val.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? fallback : parsed;
}

// ==========================================
// Automatic Table Type Detector
// ==========================================

export function detectTableTypeFromHeaders(headers: string[]): DatabaseTableKey {
  const norm = headers.map(normalizeKey).join(' ');

  if (
    norm.includes('stationtype') ||
    norm.includes('healthscore') ||
    norm.includes('tempmachine') ||
    norm.includes('vibration') ||
    norm.includes('oillevel') ||
    norm.includes('machineid') ||
    norm.includes('machinename')
  ) {
    return 'machines';
  }

  if (
    norm.includes('oemname') ||
    norm.includes('orderid') ||
    norm.includes('productcode') ||
    norm.includes('valueusd') ||
    norm.includes('targetdeliverydate')
  ) {
    return 'oemOrders';
  }

  if (
    norm.includes('ponumber') ||
    norm.includes('trackingid') ||
    norm.includes('orderdate') ||
    norm.includes('expecteddelivery')
  ) {
    return 'purchaseOrders';
  }

  if (
    norm.includes('supplierid') ||
    norm.includes('suppliername') && norm.includes('ontimedelivery') ||
    norm.includes('tier') ||
    norm.includes('qualityscore')
  ) {
    return 'suppliers';
  }

  if (
    norm.includes('reorderpoint') ||
    norm.includes('spare') ||
    norm.includes('criticality') && norm.includes('actionrequired')
  ) {
    return 'spares';
  }

  // Default to components if partNumber / onHandStock / category exists
  return 'components';
}

// ==========================================
// Table Parsers & Normalizers
// ==========================================

export function parseComponentsCSV(csvText: string): CSVParseResult<ComponentItem> {
  const rows = parseCSVToRows(csvText);
  const { headers, records } = rowsToObjectList(rows);
  const data: ComponentItem[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  records.forEach((rec, idx) => {
    const rowNum = idx + 2;
    const partNumber = getField(rec, 'partNumber', 'part_number', 'partNo', 'part#', 'pn', 'part');
    const name = getField(rec, 'name', 'componentName', 'description', 'partName');

    if (!partNumber && !name) {
      warnings.push(`Row ${rowNum}: Skipped row with empty part number and name.`);
      return;
    }

    const resolvedPartNum = partNumber || `PART-${1000 + idx}`;
    const resolvedName = name || resolvedPartNum;

    const rawCategory = getField(rec, 'category', 'type', 'partCategory');
    let category: PartCategory = 'Electronics';
    if (/mech/i.test(rawCategory)) category = 'Mechanical';
    else if (/auto/i.test(rawCategory)) category = 'Automation';
    else if (/elec(?!tron)/i.test(rawCategory)) category = 'Electrical';

    const onHandStock = parseNumber(getField(rec, 'onHandStock', 'stock', 'onHand', 'qtyOnHand'), 0);
    const reservedStock = parseNumber(getField(rec, 'reservedStock', 'reserved', 'allocatedStock'), 0);
    const incomingPO = parseNumber(getField(rec, 'incomingPO', 'incoming', 'openPOQty', 'onOrder'), 0);
    const safetyStock = parseNumber(getField(rec, 'safetyStock', 'safety', 'bufferStock', 'minStock'), 10);
    const unitCost = parseNumber(getField(rec, 'unitCost', 'cost', 'price', 'unitPriceUSD'), 15.0);
    const leadTimeDays = parseNumber(getField(rec, 'leadTimeDays', 'leadTime', 'ltDays'), 30);
    const minOrderQty = parseNumber(getField(rec, 'minOrderQty', 'moq', 'minOrder'), 10);
    const orderMultiple = parseNumber(getField(rec, 'orderMultiple', 'multiple', 'packSize'), 5);

    const rawRisk = getField(rec, 'riskStatus', 'risk', 'status').toUpperCase();
    let riskStatus: RiskLevel = 'HEALTHY';
    if (rawRisk.includes('CRIT') || onHandStock <= reservedStock) {
      riskStatus = 'CRITICAL';
    } else if (rawRisk.includes('WARN') || onHandStock < safetyStock) {
      riskStatus = 'WARNING';
    }

    // 4-week forecast
    const w1 = parseNumber(getField(rec, 'forecastW1', 'w1Demand', 'w1'), Math.round(safetyStock * 0.4));
    const w2 = parseNumber(getField(rec, 'forecastW2', 'w2Demand', 'w2'), Math.round(safetyStock * 0.45));
    const w3 = parseNumber(getField(rec, 'forecastW3', 'w3Demand', 'w3'), Math.round(safetyStock * 0.5));
    const w4 = parseNumber(getField(rec, 'forecastW4', 'w4Demand', 'w4'), Math.round(safetyStock * 0.4));

    // Optional parse BOM usage strings: e.g. "ECU-GEN5-PRO:1;BCM-EV-400:2"
    const bomStr = getField(rec, 'productBOMUsage', 'bomUsage', 'usedInECU');
    const productBOMUsage: ComponentItem['productBOMUsage'] = [];
    if (bomStr) {
      bomStr.split(';').forEach((chunk) => {
        const [code, qty] = chunk.split(':');
        if (code) {
          productBOMUsage.push({
            productCode: code.trim(),
            productName: `ECU Assembly (${code.trim()})`,
            qtyPerECU: parseNumber(qty, 1)
          });
        }
      });
    } else {
      // Default standard ECU BOM linkage if electronics
      if (category === 'Electronics' || category === 'Electrical') {
        productBOMUsage.push({
          productCode: 'ECU-GEN5-PRO',
          productName: 'Next-Gen Powertrain ECU Pro',
          qtyPerECU: 1
        });
      }
    }

    // Equipment usage: e.g. "M-ASSY-03:Feeder"
    const equipStr = getField(rec, 'equipmentBOMUsage', 'equipmentUsage', 'machineUsage');
    const equipmentBOMUsage: ComponentItem['equipmentBOMUsage'] = [];
    if (equipStr) {
      equipStr.split(';').forEach((chunk) => {
        const [mId, role] = chunk.split(':');
        if (mId) {
          equipmentBOMUsage.push({
            machineId: mId.trim(),
            machineName: `Machine Cell ${mId.trim()}`,
            role: role ? role.trim() : 'Operational Spare / Sensor'
          });
        }
      });
    }

    const existingIdx = data.findIndex((c) => c.partNumber === resolvedPartNum);
    if (existingIdx >= 0) {
      const existing = data[existingIdx];
      if (productBOMUsage.length > 0) {
        existing.productBOMUsage.push(...productBOMUsage);
      }
      if (equipmentBOMUsage.length > 0) {
        existing.equipmentBOMUsage.push(...equipmentBOMUsage);
      }
      return;
    }

    data.push({
      id: resolvedPartNum,
      partNumber: resolvedPartNum,
      name: resolvedName,
      category,
      manufacturer: getField(rec, 'manufacturer', 'maker', 'oem') || 'Global Automotive Component Supplier',
      technicalSpecs: getField(rec, 'technicalSpecs', 'specs', 'description') || 'Automotive Grade AEC-Q100 compliant',
      unitCost,
      supplierId: getField(rec, 'supplierId', 'vendorId') || 'SUP-01',
      supplierName: getField(rec, 'supplierName', 'supplier', 'vendor') || 'Primary Supplier',
      leadTimeDays,
      riskStatus,
      riskReason: getField(rec, 'riskReason', 'reason') || (riskStatus === 'CRITICAL' ? 'Safety stock threshold breached' : 'Nominal inventory buffer'),
      businessImpact: getField(rec, 'businessImpact', 'impact') || 'Tier-1 ECU production line',
      recommendedAction: getField(rec, 'recommendedAction', 'action') || 'Review procurement schedule',
      priority: riskStatus === 'CRITICAL' ? 'P1 - Immediate' : riskStatus === 'WARNING' ? 'P2 - High' : 'P3 - Medium',
      onHandStock,
      reservedStock,
      incomingPO,
      safetyStock,
      minOrderQty,
      orderMultiple,
      fourWeekForecast: [w1, w2, w3, w4],
      productBOMUsage,
      equipmentBOMUsage,
      approvedAlternatives: [],
      documents: [
        {
          title: `${resolvedPartNum} Technical Datasheet.pdf`,
          type: 'Datasheet',
          size: '1.2 MB',
          date: '2026-01-10'
        }
      ]
    });
  });

  return {
    tableKey: 'components',
    data,
    headers,
    totalRows: records.length,
    validRows: data.length,
    errors,
    warnings,
    samplePreview: records.slice(0, 5)
  };
}

export function parseMachinesCSV(csvText: string): CSVParseResult<Machine> {
  const rows = parseCSVToRows(csvText);
  const { headers, records } = rowsToObjectList(rows);
  const data: Machine[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  records.forEach((rec, idx) => {
    const rowNum = idx + 2;
    const id = getField(rec, 'id', 'machineId', 'machine_id', 'stationId', 'code');
    const name = getField(rec, 'name', 'machineName', 'machine_name', 'station');

    if (!id && !name) {
      warnings.push(`Row ${rowNum}: Skipped row with empty machine ID and name.`);
      return;
    }

    const resolvedId = id || `M-STATION-${10 + idx}`;
    const resolvedName = name || `Production Cell ${resolvedId}`;

    const healthScore = parseNumber(getField(rec, 'healthScore', 'health', 'score'), 90);
    const temperature = parseNumber(getField(rec, 'temperature', 'temp', 'celsius'), 55.0);
    const tempThreshold = parseNumber(getField(rec, 'tempThreshold', 'maxTemp'), 75.0);
    const vibration = parseNumber(getField(rec, 'vibration', 'vib', 'mms'), 1.2);
    const vibrationThreshold = parseNumber(getField(rec, 'vibrationThreshold', 'maxVib'), 4.5);
    const oilLevel = parseNumber(getField(rec, 'oilLevel', 'oil', 'oilPct'), 85);
    const oilThreshold = parseNumber(getField(rec, 'oilThreshold', 'minOil'), 30);

    const rawStatus = getField(rec, 'status').toUpperCase();
    let status: Machine['status'] = 'OPERATIONAL';
    if (rawStatus.includes('CRIT') || healthScore < 70 || temperature > tempThreshold || vibration > vibrationThreshold) {
      status = 'CRITICAL';
    } else if (rawStatus.includes('WARN') || healthScore < 85 || oilLevel < oilThreshold) {
      status = 'WARNING';
    }

    const alertsRaw = getField(rec, 'activeAlerts', 'alerts', 'issues');
    const activeAlerts: Machine['activeAlerts'] = [];
    if (alertsRaw) {
      alertsRaw.split(';').forEach((chunk, aIdx) => {
        if (chunk.trim()) {
          activeAlerts.push({
            id: `ALT-${resolvedId}-${aIdx + 1}`,
            issue: chunk.trim(),
            severity: status === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
            timestamp: 'Active Shift',
            action: 'Inspect station sensor and check mechanical tolerances'
          });
        }
      });
    }

    const sparesRaw = getField(rec, 'compatibleSpares', 'spares', 'spareParts');
    const compatibleSpares = sparesRaw ? sparesRaw.split(',').map((s) => s.trim()).filter(Boolean) : ['SEN-2048'];

    const existingIdx = data.findIndex((m) => m.id === resolvedId);
    if (existingIdx >= 0) {
      const existing = data[existingIdx];
      if (activeAlerts.length > 0) {
        existing.activeAlerts.push(...activeAlerts);
      }
      existing.compatibleSpares = Array.from(new Set([...existing.compatibleSpares, ...compatibleSpares]));
      return;
    }

    data.push({
      id: resolvedId,
      name: resolvedName,
      line: getField(rec, 'line', 'productionLine') || 'Line 1 — Surface Mount (SMT)',
      stationType: getField(rec, 'stationType', 'station', 'type') || 'Automated Assembly Cell',
      healthScore,
      temperature,
      tempThreshold,
      vibration,
      vibrationThreshold,
      oilLevel,
      oilThreshold,
      lastMaintenance: getField(rec, 'lastMaintenance', 'lastMaint') || '2026-09-15',
      nextMaintenanceDue: getField(rec, 'nextMaintenanceDue', 'nextMaint') || '2026-10-30',
      status,
      activeAlerts,
      compatibleSpares,
      telemetryHistory: [
        { time: '04:00', temperature: Math.max(30, temperature - 2), vibration: Math.max(0.5, vibration - 0.3), oilLevel },
        { time: '08:00', temperature: temperature - 1, vibration: vibration - 0.1, oilLevel },
        { time: '12:00', temperature, vibration, oilLevel: Math.max(10, oilLevel - 1) },
        { time: '16:00', temperature, vibration, oilLevel }
      ]
    });
  });

  return {
    tableKey: 'machines',
    data,
    headers,
    totalRows: records.length,
    validRows: data.length,
    errors,
    warnings,
    samplePreview: records.slice(0, 5)
  };
}

export function parseOEMOrdersCSV(csvText: string): CSVParseResult<OEMOrder> {
  const rows = parseCSVToRows(csvText);
  const { headers, records } = rowsToObjectList(rows);
  const data: OEMOrder[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  records.forEach((rec, idx) => {
    const rowNum = idx + 2;
    const orderId = getField(rec, 'orderId', 'order_id', 'po', 'orderNumber');
    const oemName = getField(rec, 'oemName', 'oem', 'customer', 'client');

    if (!orderId && !oemName) {
      warnings.push(`Row ${rowNum}: Skipped row with empty Order ID and Customer.`);
      return;
    }

    const resolvedOrderId = orderId || `OEM-${9800 + idx}`;
    const resolvedOemName = oemName || 'Tier-1 Automotive OEM';
    const quantity = parseNumber(getField(rec, 'quantity', 'qty', 'orderQty'), 2500);
    const valueUSD = parseNumber(getField(rec, 'valueUSD', 'value', 'revenue', 'totalUSD'), quantity * 300);

    const rawStatus = getField(rec, 'status').toLowerCase();
    let status: OEMOrder['status'] = 'Scheduled';
    if (rawStatus.includes('risk')) status = 'At Risk';
    else if (rawStatus.includes('firm')) status = 'Firm';
    else if (rawStatus.includes('deliv')) status = 'Delivered';

    const exposed = getField(rec, 'exposedComponents', 'components', 'criticalParts');
    const exposedComponents = exposed ? exposed.split(',').map((s) => s.trim()).filter(Boolean) : ['MCU-110'];

    if (data.some((o) => o.orderId === resolvedOrderId)) {
      return;
    }

    data.push({
      orderId: resolvedOrderId,
      oemName: resolvedOemName,
      productCode: getField(rec, 'productCode', 'product', 'model') || 'ECU-GEN5-PRO',
      productName: getField(rec, 'productName', 'description') || 'Automotive Powertrain ECU Pro',
      quantity,
      targetDeliveryDate: getField(rec, 'targetDeliveryDate', 'deliveryDate', 'dueDate') || '2026-10-30',
      valueUSD,
      status,
      exposedComponents
    });
  });

  return {
    tableKey: 'oemOrders',
    data,
    headers,
    totalRows: records.length,
    validRows: data.length,
    errors,
    warnings,
    samplePreview: records.slice(0, 5)
  };
}

export function parseSuppliersCSV(csvText: string): CSVParseResult<Supplier> {
  const rows = parseCSVToRows(csvText);
  const { headers, records } = rowsToObjectList(rows);
  const data: Supplier[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  records.forEach((rec, idx) => {
    const rowNum = idx + 2;
    const id = getField(rec, 'id', 'supplierId', 'supplier_id', 'code');
    const name = getField(rec, 'name', 'supplierName', 'vendorName', 'vendor');

    if (!id && !name) {
      warnings.push(`Row ${rowNum}: Skipped row with empty Supplier ID and Name.`);
      return;
    }

    const resolvedId = id || `SUP-${String(idx + 1).padStart(2, '0')}`;
    const resolvedName = name || `Tier-2 Vendor ${resolvedId}`;

    const rawRisk = getField(rec, 'riskLevel', 'risk', 'status').toUpperCase();
    let riskLevel: Supplier['riskLevel'] = 'LOW';
    if (rawRisk.includes('HIGH')) riskLevel = 'HIGH';
    else if (rawRisk.includes('MED')) riskLevel = 'MEDIUM';

    const supplied = getField(rec, 'suppliedComponents', 'components', 'parts');
    const suppliedComponents = supplied ? supplied.split(',').map((s) => s.trim()).filter(Boolean) : ['MCU-110'];

    if (data.some((s) => s.id === resolvedId)) {
      return;
    }

    data.push({
      id: resolvedId,
      name: resolvedName,
      tier: (getField(rec, 'tier').includes('3') ? 'Tier-3' : 'Tier-2') as 'Tier-2' | 'Tier-3',
      country: getField(rec, 'country', 'origin', 'region') || 'Germany',
      suppliedComponents,
      avgLeadTimeDays: parseNumber(getField(rec, 'avgLeadTimeDays', 'leadTime', 'avgLeadTime'), 45),
      onTimeDeliveryPct: parseNumber(getField(rec, 'onTimeDeliveryPct', 'otd', 'onTimePct'), 92.5),
      openPOsCount: parseNumber(getField(rec, 'openPOsCount', 'openPOs', 'poCount'), 2),
      riskLevel,
      qualityScore: parseNumber(getField(rec, 'qualityScore', 'quality', 'ppmScore'), 98.0),
      contactEmail: getField(rec, 'contactEmail', 'email') || 'procurement@supplier.com',
      singleSourceCount: parseNumber(getField(rec, 'singleSourceCount', 'singleSource'), 0)
    });
  });

  return {
    tableKey: 'suppliers',
    data,
    headers,
    totalRows: records.length,
    validRows: data.length,
    errors,
    warnings,
    samplePreview: records.slice(0, 5)
  };
}

export function parsePurchaseOrdersCSV(csvText: string): CSVParseResult<PurchaseOrder> {
  const rows = parseCSVToRows(csvText);
  const { headers, records } = rowsToObjectList(rows);
  const data: PurchaseOrder[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  records.forEach((rec, idx) => {
    const rowNum = idx + 2;
    const poNumber = getField(rec, 'poNumber', 'po_number', 'po', 'orderNumber');
    const partNumber = getField(rec, 'partNumber', 'part_number', 'partNo', 'pn');

    if (!poNumber && !partNumber) {
      warnings.push(`Row ${rowNum}: Skipped row with empty PO number and Part Number.`);
      return;
    }

    const resolvedPoNumber = poNumber || `PO-${9840 + idx}`;
    const resolvedPartNum = partNumber || `PART-${idx + 1}`;

    const rawStatus = getField(rec, 'status').toUpperCase();
    let status: PurchaseOrder['status'] = 'IN_TRANSIT';
    if (rawStatus.includes('DELAY')) status = 'DELAYED';
    else if (rawStatus.includes('RISK')) status = 'AT_RISK';
    else if (rawStatus.includes('TIME')) status = 'ON_TIME';
    else if (rawStatus.includes('RECEIV')) status = 'RECEIVED';

    const rawCrit = getField(rec, 'criticality').toUpperCase();
    let criticality: PurchaseOrder['criticality'] = 'MEDIUM';
    if (rawCrit.includes('HIGH') || status === 'DELAYED') criticality = 'HIGH';
    else if (rawCrit.includes('LOW')) criticality = 'LOW';

    if (data.some((p) => p.poNumber === resolvedPoNumber)) {
      return;
    }

    data.push({
      poNumber: resolvedPoNumber,
      partNumber: resolvedPartNum,
      componentName: getField(rec, 'componentName', 'name', 'description') || resolvedPartNum,
      supplierName: getField(rec, 'supplierName', 'supplier', 'vendor') || 'Primary Supplier',
      quantity: parseNumber(getField(rec, 'quantity', 'qty', 'orderQty'), 500),
      orderDate: getField(rec, 'orderDate', 'date') || '2026-09-01',
      expectedDelivery: getField(rec, 'expectedDelivery', 'eta', 'dueDate') || '2026-10-25',
      status,
      criticality,
      trackingId: getField(rec, 'trackingId', 'tracking', 'billOfLading') || `AWB-${Math.floor(100000 + Math.random() * 900000)}`
    });
  });

  return {
    tableKey: 'purchaseOrders',
    data,
    headers,
    totalRows: records.length,
    validRows: data.length,
    errors,
    warnings,
    samplePreview: records.slice(0, 5)
  };
}

export function parseSparesCSV(csvText: string): CSVParseResult<MaintenanceSpare> {
  const rows = parseCSVToRows(csvText);
  const { headers, records } = rowsToObjectList(rows);
  const data: MaintenanceSpare[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  records.forEach((rec, idx) => {
    const rowNum = idx + 2;
    const partNumber = getField(rec, 'partNumber', 'part_number', 'partNo', 'spareCode');
    const name = getField(rec, 'name', 'spareName', 'description');

    if (!partNumber && !name) {
      warnings.push(`Row ${rowNum}: Skipped row with empty Spare Part Number and Name.`);
      return;
    }

    const resolvedPartNum = partNumber || `SPARE-${idx + 1}`;
    const resolvedName = name || resolvedPartNum;
    const stock = parseNumber(getField(rec, 'stock', 'qty', 'onHand'), 2);
    const reorderPoint = parseNumber(getField(rec, 'reorderPoint', 'minStock', 'reorder'), 5);

    const rawCrit = getField(rec, 'criticality').toUpperCase();
    let criticality: MaintenanceSpare['criticality'] = 'MEDIUM';
    if (rawCrit.includes('CRIT') || stock === 0) criticality = 'CRITICAL';
    else if (rawCrit.includes('HIGH')) criticality = 'HIGH';
    else if (rawCrit.includes('LOW')) criticality = 'LOW';

    const machinesRaw = getField(rec, 'machineIds', 'machines', 'applicableMachines');
    const machineIds = machinesRaw ? machinesRaw.split(',').map((m) => m.trim()).filter(Boolean) : ['M-ASSY-03'];

    if (data.some((sp) => sp.partNumber === resolvedPartNum)) {
      return;
    }

    data.push({
      partNumber: resolvedPartNum,
      name: resolvedName,
      category: getField(rec, 'category', 'type') || 'Tooling & Sensors',
      machineIds,
      stock,
      reorderPoint,
      leadTimeDays: parseNumber(getField(rec, 'leadTimeDays', 'leadTime'), 14),
      criticality,
      unitCost: parseNumber(getField(rec, 'unitCost', 'cost', 'price'), 45.0),
      actionRequired: getField(rec, 'actionRequired', 'action') || (stock <= reorderPoint ? 'Stock below reorder point' : 'Nominal buffer')
    });
  });

  return {
    tableKey: 'spares',
    data,
    headers,
    totalRows: records.length,
    validRows: data.length,
    errors,
    warnings,
    samplePreview: records.slice(0, 5)
  };
}

// Universal parser based on target table
export function parseCSVForTable(tableKey: DatabaseTableKey, csvText: string): CSVParseResult<any> {
  switch (tableKey) {
    case 'components':
      return parseComponentsCSV(csvText);
    case 'machines':
      return parseMachinesCSV(csvText);
    case 'oemOrders':
      return parseOEMOrdersCSV(csvText);
    case 'suppliers':
      return parseSuppliersCSV(csvText);
    case 'purchaseOrders':
      return parsePurchaseOrdersCSV(csvText);
    case 'spares':
      return parseSparesCSV(csvText);
  }
}

// ==========================================
// CSV Templates & Exporters
// ==========================================

export const CSV_TEMPLATES: Record<DatabaseTableKey, { filename: string; label: string; description: string; content: string }> = {
  components: {
    filename: 'plantiq_components_bom_template.csv',
    label: 'Parts & BOM Components',
    description: 'Component inventory, risk levels, supplier linkages, safety buffers, and costs',
    content: `partNumber,name,category,manufacturer,unitCost,supplierName,leadTimeDays,riskStatus,riskReason,onHandStock,reservedStock,incomingPO,safetyStock,minOrderQty,orderMultiple,forecastW1,forecastW2,forecastW3,forecastW4
SEN-2048,"Inductive Proximity Sensor M12 Shielded",Automation,"IFM Electronic / Omron",48.50,"SensorTech GmbH",45,CRITICAL,"Port congestion in Hamburg + Safety stock breached",3,8,20,15,10,5,12,16,14,18
MCU-110,"32-bit Automotive TriCore Microcontroller ASIL-D",Electronics,"Infineon Technologies",32.50,"MicroChip Global",182,CRITICAL,"Single-source wafer foundry allocation constraint",1200,3500,2500,2000,1000,500,850,920,950,1100
CAP-22,"Automotive MLCC Ceramic Capacitor 10uF 50V AEC-Q200",Electronics,"Murata Manufacturing",0.45,"Murata Electronics",28,HEALTHY,"Stable buffer in primary warehouse",45000,28000,25000,15000,10000,5000,8000,8500,9000,9200
PCB-04,"High-TG 8-Layer Automotive ECU HDI Mainboard",Electronics,"AT&S Advanced Circuits",18.20,"AT&S Advanced",35,WARNING,"Copper substrate raw material lead-time slip",2200,2800,4000,2500,1000,500,1200,1400,1350,1500
CONN-96,"96-Pin Waterproof Automotive Sealed Header",Electrical,"TE Connectivity",6.80,"TE Connectivity",42,HEALTHY,"Dual-sourced qualified with Amphenol",8500,4200,5000,3000,2000,1000,1800,2100,2050,2200
FLT-05,"Hydraulic Spindle Oil Filter Cartridge 5-Micron",Mechanical,"Hydac International",65.00,"Precision Dynamics",10,CRITICAL,"High differential pressure on M-CNC-04; zero stock",0,1,3,2,2,2,1,1,1,0`
  },
  machines: {
    filename: 'plantiq_machines_telemetry_template.csv',
    label: 'Machines & Telemetry',
    description: 'Line machinery, sensor metrics (vibration, temperature, oil), and health scores',
    content: `id,name,line,stationType,healthScore,temperature,tempThreshold,vibration,vibrationThreshold,oilLevel,oilThreshold,status,activeAlerts,compatibleSpares
M-ASSY-03,"High-Speed SMT Component Placement Station","Line 1 — Surface Mount (SMT)","Yamaha YSM20R Pick & Place",74,68.4,75.0,4.8,4.5,78,30,WARNING,"Spindle harmonic vibration elevated (4.8 mm/s vs 4.5 mm/s limit)","SEN-2048,SRV-02"
M-ROBOT-02,"6-Axis Robotic Sealant & Conformal Coating Cell","Line 1 — SMT Protective Dispense","Fanuc M-10iD/12 Robot",88,58.2,70.0,2.1,4.0,84,30,OPERATIONAL,"","SEN-2048,SRV-02"
M-TEST-01,"Automated In-Circuit & Flash Programming Test Cell","Line 2 — Quality & End of Line","In-Circuit Tester (Keysight i3070)",95,54.0,75.0,0.8,4.5,95,30,OPERATIONAL,"","SOL-18"
M-CNC-04,"Enclosure Milling & Deburring CNC Cell","Line 3 — Mechanical Housing Prep","Fanuc Robodrill VMC",61,81.2,75.0,3.9,4.5,26,30,CRITICAL,"Hydraulic reservoir oil level low (26% vs 30% min);Spindle thermal drift (81.2°C)","SEN-2048,FLT-05"`
  },
  oemOrders: {
    filename: 'plantiq_oem_orders_template.csv',
    label: 'OEM Customer Orders',
    description: 'Tier-1 vehicle manufacturer production contracts and delivery commitments',
    content: `orderId,oemName,productCode,productName,quantity,targetDeliveryDate,valueUSD,status,exposedComponents
OEM-9801,"Mahindra & Mahindra Automotive",ECU-POWERTRAIN-V2,"Automotive Powertrain Controller V2",2500,2026-10-21,750000,"At Risk","MCU-110,MOS-55,CAP-22"
OEM-9802,"Tata Motors EV Division",BCM-EV-400,"Electric Vehicle Body Control Module",3800,2026-10-27,1140000,"At Risk","PCB-04,CAP-22,MOS-55"
OEM-9803,"Maruti Suzuki India Ltd",ECU-GEN5-PRO,"Next-Gen Powertrain ECU Pro",5000,2026-11-02,1650000,"Scheduled","MCU-110,SEN-2048"
OEM-9804,"Hyundai Motor India",ADAS-RADAR-L2,"ADAS Radar Processing Module Level 2",1800,2026-11-15,810000,"Firm","CAN-44,PCB-04"`
  },
  suppliers: {
    filename: 'plantiq_suppliers_template.csv',
    label: 'Suppliers Directory',
    description: 'Tier-2 & Tier-3 vendors, on-time delivery rates, lead-times, and quality scores',
    content: `id,name,tier,country,avgLeadTimeDays,onTimeDeliveryPct,openPOsCount,riskLevel,qualityScore,contactEmail,singleSourceCount,suppliedComponents
SUP-01,"MicroChip Global Logistics",Tier-2,"Taiwan / Singapore",182,78.5,3,HIGH,98.2,procurement@microchip-logistics.com,2,"MCU-110,CAN-44"
SUP-02,"SensorTech GmbH",Tier-2,"Germany",45,82.4,2,HIGH,96.8,orders@sensortech.de,1,"SEN-2048"
SUP-03,"Murata Electronics Corp",Tier-2,"Japan",28,96.8,2,LOW,99.7,auto.sales@murata.jp,0,"CAP-22"
SUP-04,"AT&S Advanced Circuits",Tier-2,"Austria / India",35,91.2,4,MEDIUM,97.5,automotive.pcb@ats.net,0,"PCB-04"
SUP-05,"TE Connectivity & Global Power",Tier-2,"United States",45,93.4,3,LOW,98.9,orders.uscar@te.com,0,"CONN-96,MOS-55"`
  },
  purchaseOrders: {
    filename: 'plantiq_purchase_orders_template.csv',
    label: 'Open Purchase Orders',
    description: 'Active inbound shipments, tracking numbers, and delivery milestone statuses',
    content: `poNumber,partNumber,componentName,supplierName,quantity,orderDate,expectedDelivery,status,criticality,trackingId
PO-9842,SEN-2048,"Inductive Proximity Sensor M12 Shielded","SensorTech GmbH",20,2026-08-15,2026-10-18,DELAYED,HIGH,BL-HH-992014
PO-9843,MCU-110,"32-bit Automotive TriCore Microcontroller","MicroChip Global Logistics",2500,2026-05-10,2026-10-25,DELAYED,HIGH,AWB-SIN-40918
PO-9844,PCB-04,"High-TG 8-Layer Automotive ECU Mainboard","AT&S Advanced Circuits",4000,2026-09-02,2026-10-22,IN_TRANSIT,MEDIUM,TRK-ATS-88192
PO-9845,CAP-22,"Automotive MLCC Ceramic Capacitor 10uF","Murata Electronics Corp",25000,2026-09-12,2026-10-28,ON_TIME,LOW,DHL-JPN-002914
PO-9846,FLT-05,"Hydraulic Spindle Oil Filter Cartridge 5µm","Precision Dynamics India",3,2026-10-06,2026-10-12,IN_TRANSIT,HIGH,BLR-EXP-77210`
  },
  spares: {
    filename: 'plantiq_maintenance_spares_template.csv',
    label: 'Maintenance Spares',
    description: 'Toolroom spare parts inventory, reorder thresholds, and critical machine links',
    content: `partNumber,name,category,machineIds,stock,reorderPoint,leadTimeDays,criticality,unitCost,actionRequired
SEN-2048,"Inductive Proximity Sensor M12 Shielded","Automation Sensor","M-ASSY-03,M-ROBOT-02,M-CNC-04",3,10,45,CRITICAL,48.50,"Stock depleted below reorder threshold (3 on hand vs 10 safety target). Expedite order."
SRV-02,"AC Servo Motor Actuator 400W 3000RPM","Motion Drive","M-ROBOT-02",0,2,60,CRITICAL,480.00,"Zero spares in storage. PO-9846 in transit. High risk if Axis 4 degrades."
FLT-05,"Hydraulic Spindle Oil Filter Cartridge 5µm","Filtration","M-CNC-04",0,3,10,CRITICAL,65.00,"Zero stock. M-CNC-04 oil filter differential pressure warning active."
SOL-18,"Pneumatic Directional Control Solenoid Valve","Pneumatics","M-TEST-01",5,4,14,LOW,85.00,"Inventory healthy (5 available vs 4 reorder point)."`
  }
};

// Download helper
export function triggerDownload(filename: string, textContent: string, mimeType = 'text/csv;charset=utf-8;'): void {
  const blob = new Blob([textContent], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Download single template
export function downloadTemplateCSV(tableKey: DatabaseTableKey): void {
  const tpl = CSV_TEMPLATES[tableKey];
  triggerDownload(tpl.filename, tpl.content);
}

// Download all templates as a ZIP bundle
export async function downloadAllTemplatesZip(): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('plantiq_database_templates');

  for (const [key, tpl] of Object.entries(CSV_TEMPLATES)) {
    folder?.file(tpl.filename, tpl.content);
  }

  folder?.file(
    'README_CSV_IMPORT.txt',
    `PlantIQ — Automotive Tier-1 ECU Manufacturing Intelligence
============================================================
CSV DATABASE TEMPLATES

How to upload your database into PlantIQ:
1. Open any of the included CSV templates in Excel, Google Sheets, or any CSV editor.
2. Replace the sample rows with your real plant data.
3. Keep the header row intact (or use your own headers; PlantIQ's smart auto-detector will map common column aliases).
4. Save as .csv format.
5. In PlantIQ, go to "Database & CSV" from the sidebar (or click "Import CSV" at the top).
6. Drag & drop your CSV file(s) into the upload zone or choose multiple CSV files at once!
7. Review the live preview and validation report, then click "Confirm & Apply to Database".

Tables Supported:
- plantiq_components_bom_template.csv: Parts & BOM inventory
- plantiq_machines_telemetry_template.csv: Machine stations & telemetry
- plantiq_oem_orders_template.csv: OEM contracts & customer orders
- plantiq_suppliers_template.csv: Tier-2 / Tier-3 supplier vendor directory
- plantiq_purchase_orders_template.csv: Open purchase orders & tracking
- plantiq_maintenance_spares_template.csv: Toolroom maintenance spares

Data persistence: Uploaded data is stored securely in your browser's local database storage.
You can reset to default demo data or export your database back to CSV at any time.`
  );

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'plantiq_all_csv_templates.zip');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export active database tables to CSV
export function exportTableToCSV(tableKey: DatabaseTableKey, data: any[]): void {
  const dateStr = new Date().toISOString().split('T')[0];
  let csvText = '';

  switch (tableKey) {
    case 'components': {
      const headers = [
        'partNumber', 'name', 'category', 'manufacturer', 'unitCost',
        'supplierId', 'supplierName', 'leadTimeDays', 'riskStatus', 'riskReason',
        'onHandStock', 'reservedStock', 'incomingPO', 'safetyStock', 'minOrderQty',
        'orderMultiple', 'forecastW1', 'forecastW2', 'forecastW3', 'forecastW4'
      ];
      const rows = (data as ComponentItem[]).map((c) => [
        `"${c.partNumber}"`,
        `"${c.name.replace(/"/g, '""')}"`,
        `"${c.category}"`,
        `"${c.manufacturer.replace(/"/g, '""')}"`,
        c.unitCost,
        `"${c.supplierId}"`,
        `"${c.supplierName.replace(/"/g, '""')}"`,
        c.leadTimeDays,
        `"${c.riskStatus}"`,
        `"${(c.riskReason || '').replace(/"/g, '""')}"`,
        c.onHandStock,
        c.reservedStock,
        c.incomingPO,
        c.safetyStock,
        c.minOrderQty,
        c.orderMultiple,
        c.fourWeekForecast?.[0] ?? 0,
        c.fourWeekForecast?.[1] ?? 0,
        c.fourWeekForecast?.[2] ?? 0,
        c.fourWeekForecast?.[3] ?? 0
      ].join(','));
      csvText = [headers.join(','), ...rows].join('\n');
      break;
    }
    case 'machines': {
      const headers = [
        'id', 'name', 'line', 'stationType', 'healthScore',
        'temperature', 'tempThreshold', 'vibration', 'vibrationThreshold',
        'oilLevel', 'oilThreshold', 'status', 'activeAlerts', 'compatibleSpares'
      ];
      const rows = (data as Machine[]).map((m) => [
        `"${m.id}"`,
        `"${m.name.replace(/"/g, '""')}"`,
        `"${m.line.replace(/"/g, '""')}"`,
        `"${m.stationType.replace(/"/g, '""')}"`,
        m.healthScore,
        m.temperature,
        m.tempThreshold,
        m.vibration,
        m.vibrationThreshold,
        m.oilLevel,
        m.oilThreshold,
        `"${m.status}"`,
        `"${m.activeAlerts.map((a) => a.issue).join(';').replace(/"/g, '""')}"`,
        `"${m.compatibleSpares.join(',')}"`
      ].join(','));
      csvText = [headers.join(','), ...rows].join('\n');
      break;
    }
    case 'oemOrders': {
      const headers = ['orderId', 'oemName', 'productCode', 'productName', 'quantity', 'targetDeliveryDate', 'valueUSD', 'status', 'exposedComponents'];
      const rows = (data as OEMOrder[]).map((o) => [
        `"${o.orderId}"`,
        `"${o.oemName.replace(/"/g, '""')}"`,
        `"${o.productCode}"`,
        `"${o.productName.replace(/"/g, '""')}"`,
        o.quantity,
        `"${o.targetDeliveryDate}"`,
        o.valueUSD,
        `"${o.status}"`,
        `"${(o.exposedComponents || []).join(',')}"`
      ].join(','));
      csvText = [headers.join(','), ...rows].join('\n');
      break;
    }
    case 'suppliers': {
      const headers = ['id', 'name', 'tier', 'country', 'avgLeadTimeDays', 'onTimeDeliveryPct', 'openPOsCount', 'riskLevel', 'qualityScore', 'contactEmail', 'singleSourceCount', 'suppliedComponents'];
      const rows = (data as Supplier[]).map((s) => [
        `"${s.id}"`,
        `"${s.name.replace(/"/g, '""')}"`,
        `"${s.tier}"`,
        `"${s.country.replace(/"/g, '""')}"`,
        s.avgLeadTimeDays,
        s.onTimeDeliveryPct,
        s.openPOsCount,
        `"${s.riskLevel}"`,
        s.qualityScore,
        `"${s.contactEmail}"`,
        s.singleSourceCount,
        `"${(s.suppliedComponents || []).join(',')}"`
      ].join(','));
      csvText = [headers.join(','), ...rows].join('\n');
      break;
    }
    case 'purchaseOrders': {
      const headers = ['poNumber', 'partNumber', 'componentName', 'supplierName', 'quantity', 'orderDate', 'expectedDelivery', 'status', 'criticality', 'trackingId'];
      const rows = (data as PurchaseOrder[]).map((po) => [
        `"${po.poNumber}"`,
        `"${po.partNumber}"`,
        `"${po.componentName.replace(/"/g, '""')}"`,
        `"${po.supplierName.replace(/"/g, '""')}"`,
        po.quantity,
        `"${po.orderDate}"`,
        `"${po.expectedDelivery}"`,
        `"${po.status}"`,
        `"${po.criticality}"`,
        `"${po.trackingId}"`
      ].join(','));
      csvText = [headers.join(','), ...rows].join('\n');
      break;
    }
    case 'spares': {
      const headers = ['partNumber', 'name', 'category', 'machineIds', 'stock', 'reorderPoint', 'leadTimeDays', 'criticality', 'unitCost', 'actionRequired'];
      const rows = (data as MaintenanceSpare[]).map((sp) => [
        `"${sp.partNumber}"`,
        `"${sp.name.replace(/"/g, '""')}"`,
        `"${sp.category}"`,
        `"${sp.machineIds.join(',')}"`,
        sp.stock,
        sp.reorderPoint,
        sp.leadTimeDays,
        `"${sp.criticality}"`,
        sp.unitCost,
        `"${(sp.actionRequired || '').replace(/"/g, '""')}"`
      ].join(','));
      csvText = [headers.join(','), ...rows].join('\n');
      break;
    }
  }

  triggerDownload(`plantiq_${tableKey}_export_${dateStr}.csv`, csvText);
}

// Export entire database bundle as ZIP
export async function exportFullDatabaseZip(db: {
  components: ComponentItem[];
  machines: Machine[];
  oemOrders: OEMOrder[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  spares: MaintenanceSpare[];
}): Promise<void> {
  const dateStr = new Date().toISOString().split('T')[0];
  const zip = new JSZip();
  const folder = zip.folder(`plantiq_database_backup_${dateStr}`);

  // Helper to generate CSV strings
  const genCSV = (tableKey: DatabaseTableKey, items: any[]) => {
    // Generate text via temporary capture
    let captured = '';
    const oldTrigger = triggerDownload;
    // @ts-ignore
    window.__tmp_export = (name: string, content: string) => {
      captured = content;
    };
    exportTableToCSV(tableKey, items);
    return captured;
  };

  // Build each file directly into ZIP
  for (const key of ['components', 'machines', 'oemOrders', 'suppliers', 'purchaseOrders', 'spares'] as DatabaseTableKey[]) {
    // We can format each table cleanly
    let csvData = '';
    if (key === 'components') {
      const headers = 'partNumber,name,category,manufacturer,unitCost,supplierId,supplierName,leadTimeDays,riskStatus,riskReason,onHandStock,reservedStock,incomingPO,safetyStock,minOrderQty,orderMultiple,forecastW1,forecastW2,forecastW3,forecastW4';
      const rows = db.components.map((c) => `"${c.partNumber}","${c.name.replace(/"/g, '""')}","${c.category}","${c.manufacturer.replace(/"/g, '""')}",${c.unitCost},"${c.supplierId}","${c.supplierName.replace(/"/g, '""')}",${c.leadTimeDays},"${c.riskStatus}","${(c.riskReason || '').replace(/"/g, '""')}",${c.onHandStock},${c.reservedStock},${c.incomingPO},${c.safetyStock},${c.minOrderQty},${c.orderMultiple},${c.fourWeekForecast?.[0] || 0},${c.fourWeekForecast?.[1] || 0},${c.fourWeekForecast?.[2] || 0},${c.fourWeekForecast?.[3] || 0}`);
      csvData = [headers, ...rows].join('\n');
    } else if (key === 'machines') {
      const headers = 'id,name,line,stationType,healthScore,temperature,tempThreshold,vibration,vibrationThreshold,oilLevel,oilThreshold,status,activeAlerts,compatibleSpares';
      const rows = db.machines.map((m) => `"${m.id}","${m.name.replace(/"/g, '""')}","${m.line.replace(/"/g, '""')}","${m.stationType.replace(/"/g, '""')}",${m.healthScore},${m.temperature},${m.tempThreshold},${m.vibration},${m.vibrationThreshold},${m.oilLevel},${m.oilThreshold},"${m.status}","${m.activeAlerts.map(a => a.issue).join(';').replace(/"/g, '""')}","${m.compatibleSpares.join(',')}"`);
      csvData = [headers, ...rows].join('\n');
    } else if (key === 'oemOrders') {
      const headers = 'orderId,oemName,productCode,productName,quantity,targetDeliveryDate,valueUSD,status,exposedComponents';
      const rows = db.oemOrders.map((o) => `"${o.orderId}","${o.oemName.replace(/"/g, '""')}","${o.productCode}","${o.productName.replace(/"/g, '""')}",${o.quantity},"${o.targetDeliveryDate}",${o.valueUSD},"${o.status}","${(o.exposedComponents || []).join(',')}"`);
      csvData = [headers, ...rows].join('\n');
    } else if (key === 'suppliers') {
      const headers = 'id,name,tier,country,avgLeadTimeDays,onTimeDeliveryPct,openPOsCount,riskLevel,qualityScore,contactEmail,singleSourceCount,suppliedComponents';
      const rows = db.suppliers.map((s) => `"${s.id}","${s.name.replace(/"/g, '""')}","${s.tier}","${s.country.replace(/"/g, '""')}",${s.avgLeadTimeDays},${s.onTimeDeliveryPct},${s.openPOsCount},"${s.riskLevel}",${s.qualityScore},"${s.contactEmail}",${s.singleSourceCount},"${(s.suppliedComponents || []).join(',')}"`);
      csvData = [headers, ...rows].join('\n');
    } else if (key === 'purchaseOrders') {
      const headers = 'poNumber,partNumber,componentName,supplierName,quantity,orderDate,expectedDelivery,status,criticality,trackingId';
      const rows = db.purchaseOrders.map((po) => `"${po.poNumber}","${po.partNumber}","${po.componentName.replace(/"/g, '""')}","${po.supplierName.replace(/"/g, '""')}",${po.quantity},"${po.orderDate}","${po.expectedDelivery}","${po.status}","${po.criticality}","${po.trackingId}"`);
      csvData = [headers, ...rows].join('\n');
    } else if (key === 'spares') {
      const headers = 'partNumber,name,category,machineIds,stock,reorderPoint,leadTimeDays,criticality,unitCost,actionRequired';
      const rows = db.spares.map((sp) => `"${sp.partNumber}","${sp.name.replace(/"/g, '""')}","${sp.category}","${sp.machineIds.join(',')} ",${sp.stock},${sp.reorderPoint},${sp.leadTimeDays},"${sp.criticality}",${sp.unitCost},"${(sp.actionRequired || '').replace(/"/g, '""')}"`);
      csvData = [headers, ...rows].join('\n');
    }
    folder?.file(`plantiq_${key}.csv`, csvData);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `plantiq_database_export_${dateStr}.zip`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
