/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  ComponentItem,
  Machine,
  MaintenanceSpare,
  OEMOrder,
  PurchaseOrder,
  Supplier
} from '../types/manufacturing';
import {
  INITIAL_COMPONENTS,
  INITIAL_MACHINES,
  INITIAL_MAINTENANCE_SPARES,
  INITIAL_OEM_ORDERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_SUPPLIERS
} from '../data/mockData';
import {
  calculateMaterialPlan,
  PlanningCalculationResult
} from '../services/materialPlanning';
import {
  DatabaseMetadata,
  DatabaseTableKey,
  downloadAllTemplatesZip,
  downloadTemplateCSV,
  exportFullDatabaseZip,
  exportTableToCSV
} from '../services/csvDatabaseService';

const STORAGE_KEY = 'plantiq_automotive_db_v1';

function deduplicateComponents(list: ComponentItem[]): ComponentItem[] {
  const seen = new Set<string>();
  const result: ComponentItem[] = [];
  for (const item of list) {
    const key = item.partNumber || item.id;
    if (key && !seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}

function deduplicateMachines(list: Machine[]): Machine[] {
  const seen = new Set<string>();
  const result: Machine[] = [];
  for (const item of list) {
    const key = item.id;
    if (key && !seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}

function deduplicateOEMOrders(list: OEMOrder[]): OEMOrder[] {
  const seen = new Set<string>();
  const result: OEMOrder[] = [];
  for (const item of list) {
    const key = item.orderId;
    if (key && !seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}

function deduplicateSuppliers(list: Supplier[]): Supplier[] {
  const seen = new Set<string>();
  const result: Supplier[] = [];
  for (const item of list) {
    const key = item.id;
    if (key && !seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}

function deduplicatePOs(list: PurchaseOrder[]): PurchaseOrder[] {
  const seen = new Set<string>();
  const result: PurchaseOrder[] = [];
  for (const item of list) {
    const key = item.poNumber;
    if (key && !seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}

function deduplicateSpares(list: MaintenanceSpare[]): MaintenanceSpare[] {
  const seen = new Set<string>();
  const result: MaintenanceSpare[] = [];
  for (const item of list) {
    const key = item.partNumber;
    if (key && !seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}

interface DatabaseContextType {
  components: ComponentItem[];
  machines: Machine[];
  oemOrders: OEMOrder[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  spares: MaintenanceSpare[];
  planningResult: PlanningCalculationResult;
  metadata: DatabaseMetadata;
  isCustomDatabase: boolean;
  activeAlertsCount: number;

  // Actions
  importTableData: (
    tableKey: DatabaseTableKey,
    records: any[],
    mode: 'replace' | 'append',
    fileName?: string
  ) => void;
  importBatchTables: (
    batches: { tableKey: DatabaseTableKey; records: any[]; fileName: string }[]
  ) => void;
  resetToDefaultDatabase: () => void;
  exportTable: (tableKey: DatabaseTableKey) => void;
  exportAllDatabase: () => Promise<void>;
  downloadTemplate: (tableKey: DatabaseTableKey) => void;
  downloadAllTemplates: () => Promise<void>;

  // Modal control
  isImportModalOpen: boolean;
  activeModalTable: DatabaseTableKey;
  openImportModal: (table?: DatabaseTableKey) => void;
  closeImportModal: () => void;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize from LocalStorage or default
  const [components, setComponents] = useState<ComponentItem[]>(INITIAL_COMPONENTS);
  const [machines, setMachines] = useState<Machine[]>(INITIAL_MACHINES);
  const [oemOrders, setOemOrders] = useState<OEMOrder[]>(INITIAL_OEM_ORDERS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [spares, setSpares] = useState<MaintenanceSpare[]>(INITIAL_MAINTENANCE_SPARES);

  const [metadata, setMetadata] = useState<DatabaseMetadata>({
    isCustom: false,
    lastUpdated: 'Default Sanand Tier-1 Baseline',
    source: 'Factory Baseline Demo Dataset',
    uploadedFiles: [],
    counts: {
      components: INITIAL_COMPONENTS.length,
      machines: INITIAL_MACHINES.length,
      oemOrders: INITIAL_OEM_ORDERS.length,
      suppliers: INITIAL_SUPPLIERS.length,
      purchaseOrders: INITIAL_PURCHASE_ORDERS.length,
      spares: INITIAL_MAINTENANCE_SPARES.length
    }
  });

  // Modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [activeModalTable, setActiveModalTable] = useState<DatabaseTableKey>('components');

  // Load from localStorage on initial client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.components && Array.isArray(parsed.components) && parsed.components.length > 0) {
          setComponents(deduplicateComponents(parsed.components));
        }
        if (parsed.machines && Array.isArray(parsed.machines)) setMachines(deduplicateMachines(parsed.machines));
        if (parsed.oemOrders && Array.isArray(parsed.oemOrders)) setOemOrders(deduplicateOEMOrders(parsed.oemOrders));
        if (parsed.suppliers && Array.isArray(parsed.suppliers)) setSuppliers(deduplicateSuppliers(parsed.suppliers));
        if (parsed.purchaseOrders && Array.isArray(parsed.purchaseOrders)) setPurchaseOrders(deduplicatePOs(parsed.purchaseOrders));
        if (parsed.spares && Array.isArray(parsed.spares)) setSpares(deduplicateSpares(parsed.spares));
        if (parsed.metadata) setMetadata(parsed.metadata);
      }
    } catch (e) {
      console.warn('Could not restore database from localStorage:', e);
    }
  }, []);

  // Save to localStorage when custom database is updated
  const saveStateToStorage = (
    c: ComponentItem[],
    m: Machine[],
    o: OEMOrder[],
    s: Supplier[],
    po: PurchaseOrder[],
    sp: MaintenanceSpare[],
    meta: DatabaseMetadata
  ) => {
    try {
      const payload = {
        components: c,
        machines: m,
        oemOrders: o,
        suppliers: s,
        purchaseOrders: po,
        spares: sp,
        metadata: meta
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to save database to localStorage:', e);
    }
  };

  // Recompute synchronized Material Planning
  const planningResult = useMemo(() => {
    return calculateMaterialPlan(components, oemOrders);
  }, [components, oemOrders]);

  const activeAlertsCount = useMemo(() => {
    return machines.reduce((count, m) => count + m.activeAlerts.length, 0);
  }, [machines]);

  const openImportModal = (table: DatabaseTableKey = 'components') => {
    setActiveModalTable(table);
    setIsImportModalOpen(true);
  };

  const closeImportModal = () => {
    setIsImportModalOpen(false);
  };

  const importTableData = (
    tableKey: DatabaseTableKey,
    records: any[],
    mode: 'replace' | 'append',
    fileName = 'custom_database.csv'
  ) => {
    let nextComponents = [...components];
    let nextMachines = [...machines];
    let nextOEMOrders = [...oemOrders];
    let nextSuppliers = [...suppliers];
    let nextPOs = [...purchaseOrders];
    let nextSpares = [...spares];

    if (tableKey === 'components') {
      if (mode === 'replace') {
        nextComponents = deduplicateComponents(records as ComponentItem[]);
      } else {
        const existingIds = new Set(nextComponents.map((c) => c.partNumber));
        const merged = [...nextComponents];
        (records as ComponentItem[]).forEach((rec) => {
          if (existingIds.has(rec.partNumber)) {
            const idx = merged.findIndex((c) => c.partNumber === rec.partNumber);
            merged[idx] = rec;
          } else {
            existingIds.add(rec.partNumber);
            merged.push(rec);
          }
        });
        nextComponents = deduplicateComponents(merged);
      }
      setComponents(nextComponents);
    } else if (tableKey === 'machines') {
      if (mode === 'replace') {
        nextMachines = deduplicateMachines(records as Machine[]);
      } else {
        const existingIds = new Set(nextMachines.map((m) => m.id));
        const merged = [...nextMachines];
        (records as Machine[]).forEach((rec) => {
          if (existingIds.has(rec.id)) {
            const idx = merged.findIndex((m) => m.id === rec.id);
            merged[idx] = rec;
          } else {
            existingIds.add(rec.id);
            merged.push(rec);
          }
        });
        nextMachines = deduplicateMachines(merged);
      }
      setMachines(nextMachines);
    } else if (tableKey === 'oemOrders') {
      if (mode === 'replace') {
        nextOEMOrders = deduplicateOEMOrders(records as OEMOrder[]);
      } else {
        const existingIds = new Set(nextOEMOrders.map((o) => o.orderId));
        const merged = [...nextOEMOrders];
        (records as OEMOrder[]).forEach((rec) => {
          if (existingIds.has(rec.orderId)) {
            const idx = merged.findIndex((o) => o.orderId === rec.orderId);
            merged[idx] = rec;
          } else {
            existingIds.add(rec.orderId);
            merged.push(rec);
          }
        });
        nextOEMOrders = deduplicateOEMOrders(merged);
      }
      setOemOrders(nextOEMOrders);
    } else if (tableKey === 'suppliers') {
      if (mode === 'replace') {
        nextSuppliers = deduplicateSuppliers(records as Supplier[]);
      } else {
        const existingIds = new Set(nextSuppliers.map((s) => s.id));
        const merged = [...nextSuppliers];
        (records as Supplier[]).forEach((rec) => {
          if (existingIds.has(rec.id)) {
            const idx = merged.findIndex((s) => s.id === rec.id);
            merged[idx] = rec;
          } else {
            existingIds.add(rec.id);
            merged.push(rec);
          }
        });
        nextSuppliers = deduplicateSuppliers(merged);
      }
      setSuppliers(nextSuppliers);
    } else if (tableKey === 'purchaseOrders') {
      if (mode === 'replace') {
        nextPOs = deduplicatePOs(records as PurchaseOrder[]);
      } else {
        const existingIds = new Set(nextPOs.map((po) => po.poNumber));
        const merged = [...nextPOs];
        (records as PurchaseOrder[]).forEach((rec) => {
          if (existingIds.has(rec.poNumber)) {
            const idx = merged.findIndex((po) => po.poNumber === rec.poNumber);
            merged[idx] = rec;
          } else {
            existingIds.add(rec.poNumber);
            merged.push(rec);
          }
        });
        nextPOs = deduplicatePOs(merged);
      }
      setPurchaseOrders(nextPOs);
    } else if (tableKey === 'spares') {
      if (mode === 'replace') {
        nextSpares = deduplicateSpares(records as MaintenanceSpare[]);
      } else {
        const existingIds = new Set(nextSpares.map((sp) => sp.partNumber));
        const merged = [...nextSpares];
        (records as MaintenanceSpare[]).forEach((rec) => {
          if (existingIds.has(rec.partNumber)) {
            const idx = merged.findIndex((sp) => sp.partNumber === rec.partNumber);
            merged[idx] = rec;
          } else {
            existingIds.add(rec.partNumber);
            merged.push(rec);
          }
        });
        nextSpares = deduplicateSpares(merged);
      }
      setSpares(nextSpares);
    }

    const updatedFiles = Array.from(new Set([...metadata.uploadedFiles, fileName]));
    const nextMeta: DatabaseMetadata = {
      isCustom: true,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
      source: `User Uploaded CSV (${fileName})`,
      uploadedFiles: updatedFiles,
      counts: {
        components: nextComponents.length,
        machines: nextMachines.length,
        oemOrders: nextOEMOrders.length,
        suppliers: nextSuppliers.length,
        purchaseOrders: nextPOs.length,
        spares: nextSpares.length
      }
    };

    setMetadata(nextMeta);
    saveStateToStorage(
      nextComponents,
      nextMachines,
      nextOEMOrders,
      nextSuppliers,
      nextPOs,
      nextSpares,
      nextMeta
    );
  };

  const importBatchTables = (
    batches: { tableKey: DatabaseTableKey; records: any[]; fileName: string }[]
  ) => {
    let nextComponents = [...components];
    let nextMachines = [...machines];
    let nextOEMOrders = [...oemOrders];
    let nextSuppliers = [...suppliers];
    let nextPOs = [...purchaseOrders];
    let nextSpares = [...spares];
    const uploadedNames: string[] = [...metadata.uploadedFiles];

    batches.forEach((b) => {
      uploadedNames.push(b.fileName);
      if (b.tableKey === 'components') nextComponents = deduplicateComponents(b.records);
      else if (b.tableKey === 'machines') nextMachines = deduplicateMachines(b.records);
      else if (b.tableKey === 'oemOrders') nextOEMOrders = deduplicateOEMOrders(b.records);
      else if (b.tableKey === 'suppliers') nextSuppliers = deduplicateSuppliers(b.records);
      else if (b.tableKey === 'purchaseOrders') nextPOs = deduplicatePOs(b.records);
      else if (b.tableKey === 'spares') nextSpares = deduplicateSpares(b.records);
    });

    setComponents(nextComponents);
    setMachines(nextMachines);
    setOemOrders(nextOEMOrders);
    setSuppliers(nextSuppliers);
    setPurchaseOrders(nextPOs);
    setSpares(nextSpares);

    const nextMeta: DatabaseMetadata = {
      isCustom: true,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
      source: `Multi-CSV Upload (${batches.length} tables)`,
      uploadedFiles: Array.from(new Set(uploadedNames)),
      counts: {
        components: nextComponents.length,
        machines: nextMachines.length,
        oemOrders: nextOEMOrders.length,
        suppliers: nextSuppliers.length,
        purchaseOrders: nextPOs.length,
        spares: nextSpares.length
      }
    };

    setMetadata(nextMeta);
    saveStateToStorage(
      nextComponents,
      nextMachines,
      nextOEMOrders,
      nextSuppliers,
      nextPOs,
      nextSpares,
      nextMeta
    );
  };

  const resetToDefaultDatabase = () => {
    setComponents(INITIAL_COMPONENTS);
    setMachines(INITIAL_MACHINES);
    setOemOrders(INITIAL_OEM_ORDERS);
    setSuppliers(INITIAL_SUPPLIERS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setSpares(INITIAL_MAINTENANCE_SPARES);

    const defaultMeta: DatabaseMetadata = {
      isCustom: false,
      lastUpdated: 'Default Sanand Tier-1 Baseline',
      source: 'Factory Baseline Demo Dataset',
      uploadedFiles: [],
      counts: {
        components: INITIAL_COMPONENTS.length,
        machines: INITIAL_MACHINES.length,
        oemOrders: INITIAL_OEM_ORDERS.length,
        suppliers: INITIAL_SUPPLIERS.length,
        purchaseOrders: INITIAL_PURCHASE_ORDERS.length,
        spares: INITIAL_MAINTENANCE_SPARES.length
      }
    };

    setMetadata(defaultMeta);
    localStorage.removeItem(STORAGE_KEY);
  };

  const exportTable = (tableKey: DatabaseTableKey) => {
    switch (tableKey) {
      case 'components':
        exportTableToCSV('components', components);
        break;
      case 'machines':
        exportTableToCSV('machines', machines);
        break;
      case 'oemOrders':
        exportTableToCSV('oemOrders', oemOrders);
        break;
      case 'suppliers':
        exportTableToCSV('suppliers', suppliers);
        break;
      case 'purchaseOrders':
        exportTableToCSV('purchaseOrders', purchaseOrders);
        break;
      case 'spares':
        exportTableToCSV('spares', spares);
        break;
    }
  };

  const exportAllDatabase = async () => {
    await exportFullDatabaseZip({
      components,
      machines,
      oemOrders,
      suppliers,
      purchaseOrders,
      spares
    });
  };

  const downloadTemplate = (tableKey: DatabaseTableKey) => {
    downloadTemplateCSV(tableKey);
  };

  const downloadAllTemplates = async () => {
    await downloadAllTemplatesZip();
  };

  return (
    <DatabaseContext.Provider
      value={{
        components,
        machines,
        oemOrders,
        suppliers,
        purchaseOrders,
        spares,
        planningResult,
        metadata,
        isCustomDatabase: metadata.isCustom,
        activeAlertsCount,
        importTableData,
        importBatchTables,
        resetToDefaultDatabase,
        exportTable,
        exportAllDatabase,
        downloadTemplate,
        downloadAllTemplates,
        isImportModalOpen,
        activeModalTable,
        openImportModal,
        closeImportModal
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const usePlantDatabase = () => {
  const ctx = useContext(DatabaseContext);
  if (!ctx) {
    throw new Error('usePlantDatabase must be used within a DatabaseProvider');
  }
  return ctx;
};
