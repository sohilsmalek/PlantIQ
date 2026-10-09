export type PartCategory = 'Electrical' | 'Mechanical' | 'Electronics' | 'Automation';

export type RiskLevel = 'CRITICAL' | 'WARNING' | 'HEALTHY';

export interface ComponentItem {
  id: string;
  partNumber: string;
  name: string;
  category: PartCategory;
  manufacturer: string;
  technicalSpecs: string;
  unitCost: number;
  supplierId: string;
  supplierName: string;
  leadTimeDays: number;
  riskStatus: RiskLevel;
  riskReason: string;
  businessImpact: string;
  recommendedAction: string;
  priority: 'P1 - Immediate' | 'P2 - High' | 'P3 - Medium' | 'P4 - Low';
  onHandStock: number;
  reservedStock: number;
  incomingPO: number;
  safetyStock: number;
  minOrderQty: number;
  orderMultiple: number;
  fourWeekForecast: [number, number, number, number]; // W1, W2, W3, W4
  productBOMUsage: {
    productCode: string;
    productName: string;
    qtyPerECU: number;
  }[];
  equipmentBOMUsage: {
    machineId: string;
    machineName: string;
    role: string;
  }[];
  approvedAlternatives: {
    partNumber: string;
    name: string;
    manufacturer: string;
    leadTimeDays: number;
    unitCost: number;
    qualificationStatus: 'Fully Qualified' | 'Conditional' | 'Pending Testing';
  }[];
  documents: {
    title: string;
    type: string;
    size: string;
    date: string;
  }[];
}

export interface OEMOrder {
  orderId: string;
  oemName: string;
  productCode: string;
  productName: string;
  quantity: number;
  targetDeliveryDate: string;
  valueUSD: number;
  status: 'Firm' | 'Scheduled' | 'At Risk' | 'Delivered';
  exposedComponents: string[];
}

export interface Machine {
  id: string;
  name: string;
  line: string;
  stationType: string;
  healthScore: number;
  temperature: number; // Celsius
  tempThreshold: number;
  vibration: number; // mm/s
  vibrationThreshold: number;
  oilLevel: number; // %
  oilThreshold: number;
  lastMaintenance: string;
  nextMaintenanceDue: string;
  status: 'OPERATIONAL' | 'WARNING' | 'CRITICAL';
  activeAlerts: {
    id: string;
    issue: string;
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    timestamp: string;
    action: string;
  }[];
  compatibleSpares: string[]; // partNumbers
  telemetryHistory: {
    time: string;
    temperature: number;
    vibration: number;
    oilLevel: number;
  }[];
}

export interface MaintenanceSpare {
  partNumber: string;
  name: string;
  category: string;
  machineIds: string[];
  stock: number;
  reorderPoint: number;
  leadTimeDays: number;
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  unitCost: number;
  actionRequired: string;
}

export interface Supplier {
  id: string;
  name: string;
  tier: 'Tier-2' | 'Tier-3';
  country: string;
  suppliedComponents: string[];
  avgLeadTimeDays: number;
  onTimeDeliveryPct: number;
  openPOsCount: number;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  qualityScore: number; // 0-100
  contactEmail: string;
  singleSourceCount: number;
}

export interface PurchaseOrder {
  poNumber: string;
  partNumber: string;
  componentName: string;
  supplierName: string;
  quantity: number;
  orderDate: string;
  expectedDelivery: string;
  status: 'ON_TIME' | 'IN_TRANSIT' | 'DELAYED' | 'AT_RISK' | 'RECEIVED';
  criticality: 'HIGH' | 'MEDIUM' | 'LOW';
  trackingId: string;
}

export interface MaterialPlanRow {
  partNumber: string;
  name: string;
  category: PartCategory;
  grossDemand: number;
  onHandStock: number;
  reservedStock: number;
  availableStock: number;
  incomingPO: number;
  safetyStock: number;
  netReplenishment: number;
  recommendedOrderQty: number;
  minOrderQty: number;
  orderMultiple: number;
  supplierName: string;
  leadTimeDays: number;
  supplierRisk: 'HIGH' | 'MEDIUM' | 'LOW';
  status: RiskLevel;
}

export interface RAGDocument {
  id: string;
  title: string;
  fileName: string;
  category: 'SOP' | 'MANUAL' | 'DATASHEET' | 'FAILURE_REPORT' | 'QUALITY';
  docType: string;
  dateAdded: string;
  fileSize: string;
  summary: string;
  chunks: {
    id: string;
    page: number;
    section: string;
    content: string;
  }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: {
    docTitle: string;
    section: string;
    page?: number;
    score?: number;
  }[];
  actions?: {
    type: 'PROCUREMENT' | 'MAINTENANCE' | 'RISK';
    title: string;
    description: string;
    partOrMachineId?: string;
  }[];
}

export interface SimulationParams {
  oemDemandChangePct: number; // -30 to +50
  supplierLeadTimeIncreaseDays: number; // 0 to 30
  machineDowntimeHours: number; // 0 to 72
  targetMachineId: string;
  targetComponentId: string;
  useAlternateSupplier: boolean;
}

export interface SimulationResult {
  baselineShortagesCount: number;
  simulatedShortagesCount: number;
  baselineExposedRevenue: number;
  simulatedExposedRevenue: number;
  delayedECUsCount: number;
  lineStoppageRiskDays: number;
  impactedComponents: {
    partNumber: string;
    name: string;
    originalAvailable: number;
    projectedDemand: number;
    shortageQty: number;
    impactLevel: 'CRITICAL' | 'WARNING' | 'MODERATE';
  }[];
  recommendations: string[];
}
