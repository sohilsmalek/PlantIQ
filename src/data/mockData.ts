import { ComponentItem, Machine, MaintenanceSpare, OEMOrder, PurchaseOrder, RAGDocument, Supplier } from '../types/manufacturing';

export const INITIAL_COMPONENTS: ComponentItem[] = [
  {
    id: 'SEN-2048',
    partNumber: 'SEN-2048',
    name: 'Inductive Proximity Sensor M12 Shielded',
    category: 'Automation',
    manufacturer: 'IFM Electronic / Omron Industrial',
    technicalSpecs: 'M12 cylindrical, sensing distance 4mm, PNP NO, 10-30V DC, IP67/IP69K, response 1000Hz',
    unitCost: 48.50,
    supplierId: 'SUP-02',
    supplierName: 'SensorTech GmbH',
    leadTimeDays: 45,
    riskStatus: 'CRITICAL',
    riskReason: 'Port congestion delay in Hamburg (18-day delay) + Safety stock breached',
    businessImpact: 'Risk of Line 1 SMT & Robot Station M-ASSY-03 shutdown within 48 hours',
    recommendedAction: 'Expedite air freight batch or swap with approved Omron E2B alternative in Sanand warehouse',
    priority: 'P1 - Immediate',
    onHandStock: 3,
    reservedStock: 8,
    incomingPO: 20,
    safetyStock: 15,
    minOrderQty: 10,
    orderMultiple: 5,
    fourWeekForecast: [12, 16, 14, 18],
    productBOMUsage: [],
    equipmentBOMUsage: [
      { machineId: 'M-ASSY-03', machineName: 'High-Speed SMT Placement Station', role: 'Feeder Indexing Sensor' },
      { machineId: 'M-ROBOT-02', machineName: '6-Axis Robotic Sealant Dispenser', role: 'Home Position Limit Sensor' },
      { machineId: 'M-CNC-04', machineName: 'Enclosure Milling CNC Cell', role: 'Tool Position Verifier' }
    ],
    approvedAlternatives: [
      { partNumber: 'ALT-SEN-2050', name: 'Omron E2B-M12KS04-WP-B1', manufacturer: 'Omron Industrial', leadTimeDays: 7, unitCost: 52.00, qualificationStatus: 'Fully Qualified' },
      { partNumber: 'ALT-SEN-2042', name: 'Balluff BES M12MI-PSC40B', manufacturer: 'Balluff', leadTimeDays: 21, unitCost: 49.00, qualificationStatus: 'Conditional' }
    ],
    documents: [
      { title: 'IFM M12 Proximity Sensor Datasheet.pdf', type: 'Datasheet', size: '1.4 MB', date: '2026-01-15' },
      { title: 'SOP-MNT-402 Feeder Sensor Replacement.pdf', type: 'SOP', size: '2.8 MB', date: '2025-11-20' }
    ]
  },
  {
    id: 'MCU-110',
    partNumber: 'MCU-110',
    name: '32-bit Automotive TriCore Microcontroller ASIL-D',
    category: 'Electronics',
    manufacturer: 'Infineon Technologies (AURIX TC397)',
    technicalSpecs: 'TriCore 300MHz, 16MB Flash, 2.9MB SRAM, AEC-Q100 Grade 1, BGA-292, ASIL-D certified',
    unitCost: 32.50,
    supplierId: 'SUP-01',
    supplierName: 'MicroChip Global Logistics',
    leadTimeDays: 182,
    riskStatus: 'CRITICAL',
    riskReason: 'Single-source wafer foundry allocation constraint; 4-week delivery backlog',
    businessImpact: 'Affects 5,000 units of Maruti Suzuki ECU-GEN5 and Mahindra Powertrain ECU',
    recommendedAction: 'Engage procurement for tier-1 spot buy allocation and shift 1,200 units from Line 2 reserve',
    priority: 'P1 - Immediate',
    onHandStock: 1200,
    reservedStock: 3500,
    incomingPO: 2500,
    safetyStock: 2000,
    minOrderQty: 1000,
    orderMultiple: 500,
    fourWeekForecast: [1250, 1500, 1800, 1600],
    productBOMUsage: [
      { productCode: 'ECU-GEN5-PRO', productName: 'Next-Gen Powertrain ECU Pro', qtyPerECU: 1 },
      { productCode: 'ECU-POWERTRAIN-V2', productName: 'Automotive Powertrain Controller V2', qtyPerECU: 1 },
      { productCode: 'ADAS-CTRL-UNIT', productName: 'ADAS Central Processing Module', qtyPerECU: 1 }
    ],
    equipmentBOMUsage: [],
    approvedAlternatives: [
      { partNumber: 'ALT-MCU-112', name: 'STMicroelectronics SPC58NN84', manufacturer: 'STMicroelectronics', leadTimeDays: 90, unitCost: 34.00, qualificationStatus: 'Conditional' }
    ],
    documents: [
      { title: 'Infineon AURIX TC397 Hardware User Manual.pdf', type: 'Datasheet', size: '12.4 MB', date: '2025-08-10' },
      { title: 'ECU-GEN5 BOM Compliance Spec.pdf', type: 'Specification', size: '3.1 MB', date: '2026-02-01' }
    ]
  },
  {
    id: 'PCB-04',
    partNumber: 'PCB-04',
    name: '8-Layer High-TG ECU Printed Circuit Board',
    category: 'Electronics',
    manufacturer: 'AT&S Advanced Circuits',
    technicalSpecs: '8-layer FR4/Rogers high-frequency substrate, immersion gold (ENIG), TG170, 1.6mm thickness',
    unitCost: 14.80,
    supplierId: 'SUP-04',
    supplierName: 'AT&S Advanced Circuits',
    leadTimeDays: 35,
    riskStatus: 'WARNING',
    riskReason: 'Available stock (0) below 1,000 unit safety buffer due to surge in Tata Motors EV order',
    businessImpact: 'Potential 4-day shipping slip on Batch BCM-EV-400 scheduled next Wednesday',
    recommendedAction: 'Release expedite authorization for PO-9844 currently in transit via Frankfurt air terminal',
    priority: 'P2 - High',
    onHandStock: 4100,
    reservedStock: 4500,
    incomingPO: 5000,
    safetyStock: 1000,
    minOrderQty: 1000,
    orderMultiple: 1000,
    fourWeekForecast: [2000, 2500, 1800, 2200],
    productBOMUsage: [
      { productCode: 'ECU-GEN5-PRO', productName: 'Next-Gen Powertrain ECU Pro', qtyPerECU: 1 },
      { productCode: 'BCM-EV-400', productName: 'Electric Vehicle Body Control Module', qtyPerECU: 1 }
    ],
    equipmentBOMUsage: [],
    approvedAlternatives: [
      { partNumber: 'ALT-PCB-08', name: 'Unimicron 8L Automotive Grade Board', manufacturer: 'Unimicron', leadTimeDays: 28, unitCost: 15.20, qualificationStatus: 'Fully Qualified' }
    ],
    documents: [
      { title: 'PCB-04 Gerber and IPC-A-600 Class 3 Report.pdf', type: 'Quality', size: '8.5 MB', date: '2026-01-20' }
    ]
  },
  {
    id: 'CAP-22',
    partNumber: 'CAP-22',
    name: 'SMD Ceramic Capacitor 10µF 50V X7R 1206',
    category: 'Electrical',
    manufacturer: 'Murata Manufacturing',
    technicalSpecs: '10uF +/-10%, 50V DC rating, dielectric X7R, 1206 footprint, AEC-Q200 automotive qualified',
    unitCost: 0.18,
    supplierId: 'SUP-03',
    supplierName: 'Murata Electronics',
    leadTimeDays: 28,
    riskStatus: 'WARNING',
    riskReason: 'Rapid consumption rate exceeding weekly forecasted reels by 14%',
    businessImpact: 'High risk of SMT reel depletion on Line 2 feeder within 5 operational days',
    recommendedAction: 'Trigger automatic reel replenishment PO of 100,000 units from Murata Singapore warehouse',
    priority: 'P2 - High',
    onHandStock: 85000,
    reservedStock: 92000,
    incomingPO: 100000,
    safetyStock: 25000,
    minOrderQty: 20000,
    orderMultiple: 10000,
    fourWeekForecast: [35000, 42000, 38000, 45000],
    productBOMUsage: [
      { productCode: 'ECU-GEN5-PRO', productName: 'Next-Gen Powertrain ECU Pro', qtyPerECU: 16 },
      { productCode: 'ECU-POWERTRAIN-V2', productName: 'Automotive Powertrain Controller V2', qtyPerECU: 14 },
      { productCode: 'BCM-EV-400', productName: 'Electric Vehicle Body Control Module', qtyPerECU: 18 }
    ],
    equipmentBOMUsage: [],
    approvedAlternatives: [
      { partNumber: 'ALT-CAP-24', name: 'TDK CGA5L3X7R1H106K160AB', manufacturer: 'TDK Corporation', leadTimeDays: 21, unitCost: 0.19, qualificationStatus: 'Fully Qualified' }
    ],
    documents: [
      { title: 'Murata AEC-Q200 Automotive Capacitor Spec.pdf', type: 'Datasheet', size: '1.1 MB', date: '2025-06-12' }
    ]
  },
  {
    id: 'PMIC-08',
    partNumber: 'PMIC-08',
    name: 'Automotive Power Management IC ASIL-D',
    category: 'Electronics',
    manufacturer: 'Texas Instruments (TPS6594)',
    technicalSpecs: 'Dual PMIC system with 6 step-down converters, 4 LDOs, watchdog timer, ASIL-D compliant',
    unitCost: 11.20,
    supplierId: 'SUP-01',
    supplierName: 'MicroChip Global Logistics',
    leadTimeDays: 126,
    riskStatus: 'HEALTHY',
    riskReason: 'Stock levels healthy with 45 days forward coverage',
    businessImpact: 'No current impact; monitor lead time trajectory for Q4 planning',
    recommendedAction: 'Maintain standard weekly buffer inspection',
    priority: 'P4 - Low',
    onHandStock: 6800,
    reservedStock: 3200,
    incomingPO: 4000,
    safetyStock: 1500,
    minOrderQty: 1000,
    orderMultiple: 500,
    fourWeekForecast: [1100, 1200, 1150, 1300],
    productBOMUsage: [
      { productCode: 'ECU-GEN5-PRO', productName: 'Next-Gen Powertrain ECU Pro', qtyPerECU: 1 },
      { productCode: 'ADAS-CTRL-UNIT', productName: 'ADAS Central Processing Module', qtyPerECU: 1 }
    ],
    equipmentBOMUsage: [],
    approvedAlternatives: [
      { partNumber: 'ALT-PMIC-09', name: 'NXP PF8200 Power Management IC', manufacturer: 'NXP', leadTimeDays: 110, unitCost: 11.80, qualificationStatus: 'Fully Qualified' }
    ],
    documents: [
      { title: 'TI TPS6594 Automotive PMIC Reference.pdf', type: 'Datasheet', size: '4.5 MB', date: '2025-10-18' }
    ]
  },
  {
    id: 'CAN-44',
    partNumber: 'CAN-44',
    name: 'High-Speed CAN-FD Transceiver with Standby',
    category: 'Electronics',
    manufacturer: 'NXP Semiconductors (TJA1044)',
    technicalSpecs: 'CAN FD up to 5Mbit/s, AEC-Q100 Grade 0, SO8 package, 5V supply, ISO 11898-2:2016 compliant',
    unitCost: 1.45,
    supplierId: 'SUP-06',
    supplierName: 'NXP Semiconductors Direct',
    leadTimeDays: 63,
    riskStatus: 'HEALTHY',
    riskReason: 'Buffer stock adequate; shipments on schedule',
    businessImpact: 'Operating within normal safety margins',
    recommendedAction: 'Standard replenishment cycle',
    priority: 'P4 - Low',
    onHandStock: 14500,
    reservedStock: 6800,
    incomingPO: 8000,
    safetyStock: 3000,
    minOrderQty: 2500,
    orderMultiple: 1000,
    fourWeekForecast: [2200, 2400, 2100, 2500],
    productBOMUsage: [
      { productCode: 'ECU-GEN5-PRO', productName: 'Next-Gen Powertrain ECU Pro', qtyPerECU: 2 },
      { productCode: 'ECU-POWERTRAIN-V2', productName: 'Automotive Powertrain Controller V2', qtyPerECU: 2 },
      { productCode: 'BCM-EV-400', productName: 'Electric Vehicle Body Control Module', qtyPerECU: 3 }
    ],
    equipmentBOMUsage: [],
    approvedAlternatives: [],
    documents: [
      { title: 'NXP TJA1044 CAN-FD Transceiver Spec.pdf', type: 'Datasheet', size: '2.1 MB', date: '2025-04-14' }
    ]
  },
  {
    id: 'MOS-55',
    partNumber: 'MOS-55',
    name: 'Automotive Power MOSFET 60V 120A D2PAK',
    category: 'Electrical',
    manufacturer: 'STMicroelectronics',
    technicalSpecs: '60V N-channel STripFET F7, 120A drain current, RDS(on) 2.8mOhm, AEC-Q101 qualified',
    unitCost: 2.10,
    supplierId: 'SUP-05',
    supplierName: 'TE Connectivity & Global Power',
    leadTimeDays: 42,
    riskStatus: 'WARNING',
    riskReason: 'Incoming PO-9848 delayed by 6 days at customs clearance in Mumbai port',
    businessImpact: 'Risk of powertrain ECU assembly line throttling if customs delay extends >10 days',
    recommendedAction: 'Request priority clearance broker assistance; activate secondary safety lot in transit',
    priority: 'P2 - High',
    onHandStock: 7400,
    reservedStock: 8200,
    incomingPO: 12000,
    safetyStock: 3500,
    minOrderQty: 5000,
    orderMultiple: 1000,
    fourWeekForecast: [3000, 3200, 3500, 3100],
    productBOMUsage: [
      { productCode: 'ECU-POWERTRAIN-V2', productName: 'Automotive Powertrain Controller V2', qtyPerECU: 4 },
      { productCode: 'BCM-EV-400', productName: 'Electric Vehicle Body Control Module', qtyPerECU: 6 }
    ],
    equipmentBOMUsage: [],
    approvedAlternatives: [
      { partNumber: 'ALT-MOS-58', name: 'Infineon OptiMOS 5 Power Transistor', manufacturer: 'Infineon', leadTimeDays: 35, unitCost: 2.25, qualificationStatus: 'Fully Qualified' }
    ],
    documents: [
      { title: 'STMicro Power MOSFET Thermal Performance.pdf', type: 'Datasheet', size: '1.9 MB', date: '2025-09-02' }
    ]
  },
  {
    id: 'ENC-12',
    partNumber: 'ENC-12',
    name: 'Die-Cast Aluminum ECU Enclosure IP67',
    category: 'Mechanical',
    manufacturer: 'Precision Castings Automotive',
    technicalSpecs: 'A380 Die-cast aluminum alloy, IP67 sealed with liquid silicone gasket groove, EMI shielded',
    unitCost: 18.60,
    supplierId: 'SUP-07',
    supplierName: 'Precision Dynamics India',
    leadTimeDays: 21,
    riskStatus: 'HEALTHY',
    riskReason: 'Local supplier based in Ahmedabad (120km from Sanand plant); inventory stable',
    businessImpact: 'None; local JIT delivery functioning smoothly',
    recommendedAction: 'Maintain bi-weekly Kanban replenishments',
    priority: 'P4 - Low',
    onHandStock: 3800,
    reservedStock: 2400,
    incomingPO: 2000,
    safetyStock: 800,
    minOrderQty: 500,
    orderMultiple: 250,
    fourWeekForecast: [900, 1000, 950, 1100],
    productBOMUsage: [
      { productCode: 'ECU-GEN5-PRO', productName: 'Next-Gen Powertrain ECU Pro', qtyPerECU: 1 },
      { productCode: 'ECU-POWERTRAIN-V2', productName: 'Automotive Powertrain Controller V2', qtyPerECU: 1 }
    ],
    equipmentBOMUsage: [],
    approvedAlternatives: [],
    documents: [
      { title: 'ENC-12 Enclosure Dimensional Drawing and Salt Spray Spec.pdf', type: 'Specification', size: '5.2 MB', date: '2025-03-30' }
    ]
  },
  {
    id: 'CONN-96',
    partNumber: 'CONN-96',
    name: '96-Pin Sealed Automotive Header Connector',
    category: 'Mechanical',
    manufacturer: 'TE Connectivity',
    technicalSpecs: '96-way PCB header, gold flashed pin terminals, waterproof silicon perimeter seal, USCAR-2 approved',
    unitCost: 7.80,
    supplierId: 'SUP-05',
    supplierName: 'TE Connectivity & Global Power',
    leadTimeDays: 49,
    riskStatus: 'WARNING',
    riskReason: 'Safety stock ratio below 40%; supplier notified of tooling maintenance downtime',
    businessImpact: 'Exposure to upcoming Hyundai ADAS batch in 3 weeks',
    recommendedAction: 'Advance delivery date of PO-9851 with 15% expediting fee authorization',
    priority: 'P3 - Medium',
    onHandStock: 1900,
    reservedStock: 2200,
    incomingPO: 3000,
    safetyStock: 1200,
    minOrderQty: 1000,
    orderMultiple: 500,
    fourWeekForecast: [800, 950, 900, 1000],
    productBOMUsage: [
      { productCode: 'ECU-GEN5-PRO', productName: 'Next-Gen Powertrain ECU Pro', qtyPerECU: 1 },
      { productCode: 'ADAS-CTRL-UNIT', productName: 'ADAS Central Processing Module', qtyPerECU: 1 }
    ],
    equipmentBOMUsage: [],
    approvedAlternatives: [
      { partNumber: 'ALT-CONN-98', name: 'Molex MX123 Automotive Sealed Connector', manufacturer: 'Molex', leadTimeDays: 45, unitCost: 8.10, qualificationStatus: 'Fully Qualified' }
    ],
    documents: [
      { title: 'TE Connectivity 96-Pin USCAR-2 Qualification.pdf', type: 'Quality', size: '3.6 MB', date: '2025-07-22' }
    ]
  },
  {
    id: 'SRV-02',
    partNumber: 'SRV-02',
    name: 'AC Servo Motor Actuator 400W 3000RPM',
    category: 'Automation',
    manufacturer: 'Yaskawa Electric',
    technicalSpecs: '400W, 200V AC, absolute 24-bit optical encoder, IP65, built-in dynamic brake',
    unitCost: 480.00,
    supplierId: 'SUP-02',
    supplierName: 'SensorTech GmbH',
    leadTimeDays: 60,
    riskStatus: 'WARNING',
    riskReason: 'Zero critical spares remaining in Plant A central toolroom; lead time 60 days',
    businessImpact: 'If M-ROBOT-02 axis 4 servo fails, line 1 sealant cell completely halts',
    recommendedAction: 'Procure 2 unit emergency spare inventory from domestic authorized distributor',
    priority: 'P2 - High',
    onHandStock: 0,
    reservedStock: 0,
    incomingPO: 1,
    safetyStock: 2,
    minOrderQty: 1,
    orderMultiple: 1,
    fourWeekForecast: [0, 1, 0, 0],
    productBOMUsage: [],
    equipmentBOMUsage: [
      { machineId: 'M-ROBOT-02', machineName: '6-Axis Robotic Sealant Dispenser', role: 'Joint 4 Articulation Drive' }
    ],
    approvedAlternatives: [],
    documents: [
      { title: 'Yaskawa Sigma-7 Servo Manual and Calibration.pdf', type: 'Manual', size: '14.2 MB', date: '2024-12-05' }
    ]
  },
  {
    id: 'SOL-18',
    partNumber: 'SOL-18',
    name: 'Pneumatic 5/2 Directional Solenoid Valve Manifold',
    category: 'Automation',
    manufacturer: 'Festo AG',
    technicalSpecs: '5/2 way single solenoid, 24V DC, flow 650 l/min, sub-base manifold mounted, IP65',
    unitCost: 115.00,
    supplierId: 'SUP-08',
    supplierName: 'Festo Pneumatics India',
    leadTimeDays: 14,
    riskStatus: 'HEALTHY',
    riskReason: 'Local consignment stock maintained at Sanand warehouse',
    businessImpact: 'Low risk; replacement available in 2 hours',
    recommendedAction: 'Standard monthly PM inspection',
    priority: 'P4 - Low',
    onHandStock: 8,
    reservedStock: 2,
    incomingPO: 5,
    safetyStock: 4,
    minOrderQty: 2,
    orderMultiple: 2,
    fourWeekForecast: [1, 2, 1, 1],
    productBOMUsage: [],
    equipmentBOMUsage: [
      { machineId: 'M-ASSY-03', machineName: 'High-Speed SMT Placement Station', role: 'Nozzle Vacuum Ejector Valve' },
      { machineId: 'M-TEST-01', machineName: 'Automated In-Circuit & Flash Testing Cell', role: 'Fixture Clamping Cylinder' }
    ],
    approvedAlternatives: [],
    documents: [
      { title: 'Festo VUVG Valve Technical Data.pdf', type: 'Datasheet', size: '2.4 MB', date: '2025-05-19' }
    ]
  },
  {
    id: 'FLT-05',
    partNumber: 'FLT-05',
    name: 'Hydraulic Spindle Oil Filter Cartridge 5-Micron',
    category: 'Mechanical',
    manufacturer: 'Hydac International',
    technicalSpecs: 'Microglass synthetic media, 5 micron absolute filtration (Beta 5 >= 200), collapse rating 30 bar',
    unitCost: 65.00,
    supplierId: 'SUP-07',
    supplierName: 'Precision Dynamics India',
    leadTimeDays: 10,
    riskStatus: 'CRITICAL',
    riskReason: 'M-CNC-04 high differential pressure indicator triggered; zero spares in stock',
    businessImpact: 'High risk of spindle hydraulic seizure and pump cavitation within 72 operating hours',
    recommendedAction: 'Issue immediate emergency PO to Hydac Pune for same-day hot-shot delivery',
    priority: 'P1 - Immediate',
    onHandStock: 0,
    reservedStock: 1,
    incomingPO: 3,
    safetyStock: 2,
    minOrderQty: 2,
    orderMultiple: 2,
    fourWeekForecast: [1, 1, 1, 0],
    productBOMUsage: [],
    equipmentBOMUsage: [
      { machineId: 'M-CNC-04', machineName: 'Enclosure Milling CNC Cell', role: 'Spindle Chiller Fluid Filter' }
    ],
    approvedAlternatives: [],
    documents: [
      { title: 'Hydac Filter Cartridge Replacement SOP.pdf', type: 'SOP', size: '1.7 MB', date: '2025-08-30' }
    ]
  }
];

export const INITIAL_OEM_ORDERS: OEMOrder[] = [
  {
    orderId: 'OEM-9801',
    oemName: 'Mahindra & Mahindra Automotive',
    productCode: 'ECU-POWERTRAIN-V2',
    productName: 'Automotive Powertrain Controller V2',
    quantity: 2500,
    targetDeliveryDate: '2026-10-21',
    valueUSD: 750000,
    status: 'At Risk',
    exposedComponents: ['MCU-110', 'MOS-55', 'CAP-22']
  },
  {
    orderId: 'OEM-9802',
    oemName: 'Tata Motors EV Division',
    productCode: 'BCM-EV-400',
    productName: 'Electric Vehicle Body Control Module',
    quantity: 3800,
    targetDeliveryDate: '2026-10-27',
    valueUSD: 1140000,
    status: 'At Risk',
    exposedComponents: ['PCB-04', 'CAP-22', 'MOS-55']
  },
  {
    orderId: 'OEM-9803',
    oemName: 'Maruti Suzuki India Ltd',
    productCode: 'ECU-GEN5-PRO',
    productName: 'Next-Gen Powertrain ECU Pro',
    quantity: 5000,
    targetDeliveryDate: '2026-11-02',
    valueUSD: 1250000,
    status: 'At Risk',
    exposedComponents: ['MCU-110', 'PCB-04', 'SEN-2048']
  },
  {
    orderId: 'OEM-9804',
    oemName: 'Hyundai Motor India',
    productCode: 'ADAS-CTRL-UNIT',
    productName: 'ADAS Central Processing Module',
    quantity: 1600,
    targetDeliveryDate: '2026-10-17',
    valueUSD: 640000,
    status: 'At Risk',
    exposedComponents: ['CONN-96', 'MCU-110']
  },
  {
    orderId: 'OEM-9805',
    oemName: 'Toyota Kirloskar Motor',
    productCode: 'ECU-GEN5-PRO',
    productName: 'Next-Gen Powertrain ECU Pro',
    quantity: 2200,
    targetDeliveryDate: '2026-11-15',
    valueUSD: 550000,
    status: 'Scheduled',
    exposedComponents: []
  }
];

export const INITIAL_MACHINES: Machine[] = [
  {
    id: 'M-ASSY-03',
    name: 'High-Speed SMT Placement Station',
    line: 'Line 1 — Sanand Main ECU',
    stationType: 'Surface Mount Technology (SMT)',
    healthScore: 68,
    temperature: 78.4,
    tempThreshold: 75.0,
    vibration: 4.8,
    vibrationThreshold: 4.5,
    oilLevel: 42,
    oilThreshold: 30,
    lastMaintenance: '2026-09-12',
    nextMaintenanceDue: '2026-10-12',
    status: 'WARNING',
    activeAlerts: [
      {
        id: 'ALT-M3-01',
        issue: 'Spindle harmonic vibration exceeded threshold (4.8 mm/s vs 4.5 mm/s limit)',
        severity: 'CRITICAL',
        timestamp: 'Today at 08:14 AM',
        action: 'Perform bearing acoustic inspection; replace high-speed spindle bearing and verify lubrication'
      },
      {
        id: 'ALT-M3-02',
        issue: 'Feeder indexing proximity sensor jitter detected (SEN-2048)',
        severity: 'WARNING',
        timestamp: 'Today at 09:32 AM',
        action: 'Clean optic lens and inspect M12 sensor alignment on feeder bank 3'
      }
    ],
    compatibleSpares: ['SEN-2048', 'SOL-18'],
    telemetryHistory: [
      { time: '02:00', temperature: 71.2, vibration: 3.8, oilLevel: 44 },
      { time: '04:00', temperature: 72.8, vibration: 4.0, oilLevel: 44 },
      { time: '06:00', temperature: 75.1, vibration: 4.3, oilLevel: 43 },
      { time: '08:00', temperature: 78.4, vibration: 4.8, oilLevel: 42 },
      { time: '10:00', temperature: 77.9, vibration: 4.7, oilLevel: 42 },
      { time: '12:00', temperature: 78.2, vibration: 4.8, oilLevel: 41 }
    ]
  },
  {
    id: 'M-ROBOT-02',
    name: '6-Axis Robotic Sealant Dispenser & Screwdriving',
    line: 'Line 1 — Final Assembly',
    stationType: 'Robotic Automation (Fanuc M-20iD)',
    healthScore: 89,
    temperature: 69.1,
    tempThreshold: 75.0,
    vibration: 2.1,
    vibrationThreshold: 4.5,
    oilLevel: 68,
    oilThreshold: 30,
    lastMaintenance: '2026-09-28',
    nextMaintenanceDue: '2026-10-28',
    status: 'OPERATIONAL',
    activeAlerts: [],
    compatibleSpares: ['SEN-2048', 'SRV-02'],
    telemetryHistory: [
      { time: '02:00', temperature: 66.0, vibration: 1.9, oilLevel: 69 },
      { time: '04:00', temperature: 67.5, vibration: 2.0, oilLevel: 69 },
      { time: '06:00', temperature: 68.2, vibration: 2.1, oilLevel: 68 },
      { time: '08:00', temperature: 69.1, vibration: 2.1, oilLevel: 68 },
      { time: '10:00', temperature: 68.8, vibration: 2.0, oilLevel: 68 },
      { time: '12:00', temperature: 69.0, vibration: 2.1, oilLevel: 67 }
    ]
  },
  {
    id: 'M-TEST-01',
    name: 'Automated In-Circuit & Flash Testing Cell',
    line: 'Line 2 — Quality & End of Line',
    stationType: 'In-Circuit & Functional Tester (Keysight i3070)',
    healthScore: 95,
    temperature: 54.0,
    tempThreshold: 75.0,
    vibration: 0.8,
    vibrationThreshold: 4.5,
    oilLevel: 95,
    oilThreshold: 30,
    lastMaintenance: '2026-10-02',
    nextMaintenanceDue: '2026-11-02',
    status: 'OPERATIONAL',
    activeAlerts: [],
    compatibleSpares: ['SOL-18'],
    telemetryHistory: [
      { time: '02:00', temperature: 53.0, vibration: 0.7, oilLevel: 95 },
      { time: '04:00', temperature: 53.5, vibration: 0.8, oilLevel: 95 },
      { time: '06:00', temperature: 54.0, vibration: 0.8, oilLevel: 95 },
      { time: '08:00', temperature: 54.2, vibration: 0.8, oilLevel: 95 },
      { time: '10:00', temperature: 54.1, vibration: 0.8, oilLevel: 94 },
      { time: '12:00', temperature: 53.9, vibration: 0.8, oilLevel: 94 }
    ]
  },
  {
    id: 'M-CNC-04',
    name: 'Enclosure Milling & Deburring CNC Cell',
    line: 'Line 3 — Mechanical Housing Prep',
    stationType: 'CNC Vertical Machining Center (Fanuc Robodrill)',
    healthScore: 61,
    temperature: 81.2,
    tempThreshold: 75.0,
    vibration: 3.9,
    vibrationThreshold: 4.5,
    oilLevel: 26,
    oilThreshold: 30,
    lastMaintenance: '2026-08-15',
    nextMaintenanceDue: '2026-10-05',
    status: 'CRITICAL',
    activeAlerts: [
      {
        id: 'ALT-M4-01',
        issue: 'Hydraulic reservoir oil level low (26% vs 30% min threshold)',
        severity: 'CRITICAL',
        timestamp: 'Today at 07:45 AM',
        action: 'Top up hydraulic fluid ISO VG 46 and replace clogged filter cartridge FLT-05'
      },
      {
        id: 'ALT-M4-02',
        issue: 'Spindle thermal drift above 80°C threshold (current: 81.2°C)',
        severity: 'WARNING',
        timestamp: 'Today at 09:10 AM',
        action: 'Check chiller circulation pump and heat exchanger airflow filter'
      }
    ],
    compatibleSpares: ['SEN-2048', 'FLT-05'],
    telemetryHistory: [
      { time: '02:00', temperature: 74.0, vibration: 3.2, oilLevel: 31 },
      { time: '04:00', temperature: 76.5, vibration: 3.5, oilLevel: 29 },
      { time: '06:00', temperature: 79.1, vibration: 3.7, oilLevel: 28 },
      { time: '08:00', temperature: 81.2, vibration: 3.9, oilLevel: 26 },
      { time: '10:00', temperature: 80.8, vibration: 3.9, oilLevel: 26 },
      { time: '12:00', temperature: 81.5, vibration: 4.0, oilLevel: 25 }
    ]
  }
];

export const INITIAL_MAINTENANCE_SPARES: MaintenanceSpare[] = [
  {
    partNumber: 'SEN-2048',
    name: 'Inductive Proximity Sensor M12 Shielded',
    category: 'Automation Sensor',
    machineIds: ['M-ASSY-03', 'M-ROBOT-02', 'M-CNC-04'],
    stock: 3,
    reorderPoint: 10,
    leadTimeDays: 45,
    criticality: 'CRITICAL',
    unitCost: 48.50,
    actionRequired: 'Stock depleted below reorder threshold (3 on hand vs 10 safety target). Expedite order.'
  },
  {
    partNumber: 'SRV-02',
    name: 'AC Servo Motor Actuator 400W 3000RPM',
    category: 'Motion Drive',
    machineIds: ['M-ROBOT-02'],
    stock: 0,
    reorderPoint: 2,
    leadTimeDays: 60,
    criticality: 'CRITICAL',
    unitCost: 480.00,
    actionRequired: 'Zero spares in storage. PO-9846 in transit. High risk if Axis 4 degrades.'
  },
  {
    partNumber: 'FLT-05',
    name: 'Hydraulic Spindle Oil Filter Cartridge 5µm',
    category: 'Filtration',
    machineIds: ['M-CNC-04'],
    stock: 0,
    reorderPoint: 3,
    leadTimeDays: 10,
    criticality: 'CRITICAL',
    unitCost: 65.00,
    actionRequired: 'Immediate emergency purchase needed. Differential pressure alarm active on M-CNC-04.'
  },
  {
    partNumber: 'SOL-18',
    name: 'Pneumatic 5/2 Directional Solenoid Valve Manifold',
    category: 'Pneumatics',
    machineIds: ['M-ASSY-03', 'M-TEST-01'],
    stock: 8,
    reorderPoint: 5,
    leadTimeDays: 14,
    criticality: 'MEDIUM',
    unitCost: 115.00,
    actionRequired: 'Healthy stock level. Periodic PM inspection scheduled.'
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'SUP-01',
    name: 'MicroChip Global Logistics',
    tier: 'Tier-2',
    country: 'Taiwan / Singapore',
    suppliedComponents: ['MCU-110', 'PMIC-08'],
    avgLeadTimeDays: 154,
    onTimeDeliveryPct: 81.5,
    openPOsCount: 5,
    riskLevel: 'HIGH',
    qualityScore: 96.2,
    contactEmail: 'automotive.supply@microchip-global.tw',
    singleSourceCount: 1
  },
  {
    id: 'SUP-02',
    name: 'SensorTech GmbH',
    tier: 'Tier-2',
    country: 'Germany',
    suppliedComponents: ['SEN-2048', 'SRV-02'],
    avgLeadTimeDays: 52,
    onTimeDeliveryPct: 76.0,
    openPOsCount: 3,
    riskLevel: 'HIGH',
    qualityScore: 98.4,
    contactEmail: 'orders@sensortech-gmbh.de',
    singleSourceCount: 1
  },
  {
    id: 'SUP-03',
    name: 'Murata Electronics',
    tier: 'Tier-2',
    country: 'Japan',
    suppliedComponents: ['CAP-22'],
    avgLeadTimeDays: 28,
    onTimeDeliveryPct: 96.8,
    openPOsCount: 2,
    riskLevel: 'LOW',
    qualityScore: 99.7,
    contactEmail: 'auto.sales@murata.jp',
    singleSourceCount: 0
  },
  {
    id: 'SUP-04',
    name: 'AT&S Advanced Circuits',
    tier: 'Tier-2',
    country: 'Austria / India',
    suppliedComponents: ['PCB-04'],
    avgLeadTimeDays: 35,
    onTimeDeliveryPct: 91.2,
    openPOsCount: 4,
    riskLevel: 'MEDIUM',
    qualityScore: 97.5,
    contactEmail: 'automotive.pcb@ats.net',
    singleSourceCount: 0
  },
  {
    id: 'SUP-05',
    name: 'TE Connectivity & Global Power',
    tier: 'Tier-2',
    country: 'United States',
    suppliedComponents: ['CONN-96', 'MOS-55'],
    avgLeadTimeDays: 45,
    onTimeDeliveryPct: 93.4,
    openPOsCount: 3,
    riskLevel: 'LOW',
    qualityScore: 98.9,
    contactEmail: 'orders.uscar@te.com',
    singleSourceCount: 0
  },
  {
    id: 'SUP-06',
    name: 'NXP Semiconductors Direct',
    tier: 'Tier-2',
    country: 'Netherlands',
    suppliedComponents: ['CAN-44'],
    avgLeadTimeDays: 63,
    onTimeDeliveryPct: 89.0,
    openPOsCount: 2,
    riskLevel: 'MEDIUM',
    qualityScore: 98.1,
    contactEmail: 'automotive.emea@nxp.com',
    singleSourceCount: 0
  },
  {
    id: 'SUP-07',
    name: 'Precision Dynamics India',
    tier: 'Tier-2',
    country: 'India (Ahmedabad)',
    suppliedComponents: ['ENC-12', 'FLT-05'],
    avgLeadTimeDays: 16,
    onTimeDeliveryPct: 95.0,
    openPOsCount: 1,
    riskLevel: 'LOW',
    qualityScore: 95.8,
    contactEmail: 'plant.support@precisiondynamics.in',
    singleSourceCount: 0
  },
  {
    id: 'SUP-08',
    name: 'Festo Pneumatics India',
    tier: 'Tier-2',
    country: 'India / Germany',
    suppliedComponents: ['SOL-18'],
    avgLeadTimeDays: 14,
    onTimeDeliveryPct: 98.0,
    openPOsCount: 1,
    riskLevel: 'LOW',
    qualityScore: 99.0,
    contactEmail: 'pneu.gujarat@festo.com',
    singleSourceCount: 0
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    poNumber: 'PO-9840',
    partNumber: 'SEN-2048',
    componentName: 'Inductive Proximity Sensor M12',
    supplierName: 'SensorTech GmbH',
    quantity: 20,
    orderDate: '2026-08-20',
    expectedDelivery: '2026-10-14',
    status: 'DELAYED',
    criticality: 'HIGH',
    trackingId: 'DHL-EX-9923842'
  },
  {
    poNumber: 'PO-9841',
    partNumber: 'MCU-110',
    componentName: '32-bit Automotive TriCore Microcontroller',
    supplierName: 'MicroChip Global Logistics',
    quantity: 2500,
    orderDate: '2026-04-10',
    expectedDelivery: '2026-10-18',
    status: 'AT_RISK',
    criticality: 'HIGH',
    trackingId: 'FEDEX-CARGO-77319'
  },
  {
    poNumber: 'PO-9844',
    partNumber: 'PCB-04',
    componentName: '8-Layer High-TG ECU Printed Circuit Board',
    supplierName: 'AT&S Advanced Circuits',
    quantity: 5000,
    orderDate: '2026-09-05',
    expectedDelivery: '2026-10-12',
    status: 'IN_TRANSIT',
    criticality: 'HIGH',
    trackingId: 'LH-CARGO-4021-FRA'
  },
  {
    poNumber: 'PO-9845',
    partNumber: 'CAP-22',
    componentName: 'SMD Ceramic Capacitor 10µF 50V',
    supplierName: 'Murata Electronics',
    quantity: 100000,
    orderDate: '2026-09-15',
    expectedDelivery: '2026-10-11',
    status: 'ON_TIME',
    criticality: 'MEDIUM',
    trackingId: 'ANA-CARGO-88402'
  },
  {
    poNumber: 'PO-9846',
    partNumber: 'SRV-02',
    componentName: 'AC Servo Motor Actuator 400W',
    supplierName: 'SensorTech GmbH',
    quantity: 1,
    orderDate: '2026-08-10',
    expectedDelivery: '2026-10-25',
    status: 'DELAYED',
    criticality: 'HIGH',
    trackingId: 'UPS-WORLD-332910'
  },
  {
    poNumber: 'PO-9848',
    partNumber: 'MOS-55',
    componentName: 'Automotive Power MOSFET 60V 120A',
    supplierName: 'TE Connectivity & Global Power',
    quantity: 12000,
    orderDate: '2026-08-28',
    expectedDelivery: '2026-10-16',
    status: 'AT_RISK',
    criticality: 'MEDIUM',
    trackingId: 'MAERSK-BOM-8831'
  },
  {
    poNumber: 'PO-9850',
    partNumber: 'PMIC-08',
    componentName: 'Automotive Power Management IC',
    supplierName: 'MicroChip Global Logistics',
    quantity: 4000,
    orderDate: '2026-06-05',
    expectedDelivery: '2026-10-22',
    status: 'ON_TIME',
    criticality: 'LOW',
    trackingId: 'SIN-AIR-55410'
  },
  {
    poNumber: 'PO-9851',
    partNumber: 'CONN-96',
    componentName: '96-Pin Sealed Automotive Header Connector',
    supplierName: 'TE Connectivity & Global Power',
    quantity: 3000,
    orderDate: '2026-08-25',
    expectedDelivery: '2026-10-20',
    status: 'ON_TIME',
    criticality: 'MEDIUM',
    trackingId: 'DHL-EXP-441209'
  }
];

export const INITIAL_RAG_DOCUMENTS: RAGDocument[] = [
  {
    id: 'DOC-MNT-402',
    title: 'SOP-MNT-402: High-Speed SMT Placement Station Vibration & Spindle Protocol',
    fileName: 'SOP-MNT-402-SMT-Vibration.pdf',
    category: 'SOP',
    docType: 'Standard Operating Procedure',
    dateAdded: '2026-01-18',
    fileSize: '2.8 MB',
    summary: 'Standard maintenance procedure for addressing harmonic vibration anomalies and spindle bearing failure on M-ASSY-03.',
    chunks: [
      {
        id: 'CHUNK-MNT-01',
        page: 3,
        section: 'Section 3.1: Vibration Limits & Diagnostic Thresholds',
        content: 'For machine M-ASSY-03 (High-Speed SMT Placement Station), normal RMS vibration is 1.5 to 3.2 mm/s. A warning threshold is reached at 4.5 mm/s. Any reading >= 4.8 mm/s indicates high-frequency harmonic bearing race deterioration or feeder resonance. Immediate bearing acoustic inspection using ultrasound probe is mandatory within 4 operating hours.'
      },
      {
        id: 'CHUNK-MNT-02',
        page: 4,
        section: 'Section 4.2: Corrective Action Sequence for High Vibration Alert',
        content: 'Procedure: 1. Halt line at end of current PCB panel run. 2. Lock out station power and inspect feeder indexing sensor (part SEN-2048) alignment on bank 3. 3. Check spindle high-speed ceramic hybrid bearings for micro-pitting. 4. If bearing play exceeds 12 microns, replace spindle cartridge assembly (P/N SPN-ASSY-400) and recalibrate optical zero.'
      }
    ]
  },
  {
    id: 'DOC-DS-SEN2048',
    title: 'Datasheet: SEN-2048 Inductive Proximity Sensor M12 Shielded',
    fileName: 'DS-SEN-2048-Inductive-M12.pdf',
    category: 'DATASHEET',
    docType: 'Component Specification',
    dateAdded: '2025-11-10',
    fileSize: '1.4 MB',
    summary: 'Technical characteristics, electrical pinout, sensing envelope, and approved drop-in equivalents for SEN-2048.',
    chunks: [
      {
        id: 'CHUNK-SEN-01',
        page: 1,
        section: 'Section 1: Electrical & Mechanical Specifications',
        content: 'Part Number SEN-2048: M12 cylindrical brass nickel-plated housing, flush shielded installation, nominal sensing distance Sn = 4.0mm, operating voltage 10-30V DC, PNP normally open (NO) output, switching frequency 1000Hz, IP67/IP69K rating. Pin 1: +24V, Pin 3: 0V GND, Pin 4: Output signal.'
      },
      {
        id: 'CHUNK-SEN-02',
        page: 2,
        section: 'Section 2: Approved Drop-in Replacements',
        content: 'In emergency shortage situations, Omron E2B-M12KS04-WP-B1 (ALT-SEN-2050) is fully qualified as a form-fit-function replacement without mechanical bracket modifications. Balluff BES M12MI-PSC40B (ALT-SEN-2042) is conditionally approved requiring cable adapter harness AD-M12-4P.'
      }
    ]
  },
  {
    id: 'DOC-BOM-GEN5',
    title: 'BOM-ECU-GEN5-PRO: Engineering Bill of Materials & Subassembly Hierarchy',
    fileName: 'BOM-ECU-GEN5-PRO-Rev4.pdf',
    category: 'QUALITY',
    docType: 'Bill of Materials Specification',
    dateAdded: '2026-02-01',
    fileSize: '4.2 MB',
    summary: 'Full engineering BOM specification for Next-Gen Powertrain ECU Pro, component ratios, and functional criticalities.',
    chunks: [
      {
        id: 'CHUNK-BOM-01',
        page: 2,
        section: 'Section 2: Active Electronics & Compute Core',
        content: 'Each ECU-GEN5-PRO board contains: 1x MCU-110 (Infineon AURIX TC397 TriCore 32-bit), 1x PMIC-08 (TI TPS6594 Power Management IC), 2x CAN-44 (NXP TJA1044 CAN-FD Transceiver), 16x CAP-22 (Murata 10uF 50V Ceramic Decoupling Capacitor), 1x PCB-04 (8-layer high TG PCB), 1x CONN-96 (TE 96-pin automotive connector), 1x ENC-12 (Die-cast housing).'
      },
      {
        id: 'CHUNK-BOM-02',
        page: 5,
        section: 'Section 5: Manufacturing Line Routing & Station Dependency',
        content: 'ECU-GEN5-PRO travels through: Line 1 SMT Pick & Place (M-ASSY-03) -> Automated Optical Inspection (AOI) -> Selective Soldering -> 6-Axis Robot Screwdriving & Potting (M-ROBOT-02) -> Final In-Circuit Testing & Flash Programming (M-TEST-01).'
      }
    ]
  },
  {
    id: 'DOC-MNT-ROBOT',
    title: 'MAN-ROBOT-FANUC: Preventive Maintenance Protocol for 6-Axis Robotic Sealant Cell',
    fileName: 'MAN-ROBOT-FANUC-M20.pdf',
    category: 'MANUAL',
    docType: 'Maintenance Manual',
    dateAdded: '2025-08-22',
    fileSize: '9.8 MB',
    summary: 'Preventive maintenance, harmonic gear lubrication, and servo motor replacement guide for M-ROBOT-02.',
    chunks: [
      {
        id: 'CHUNK-ROB-01',
        page: 12,
        section: 'Section 6: Overheating & Servo Motor Failure Protocol',
        content: 'If robot joint temperature exceeds 75°C or encoder communication loss occurs on Axis 4: 1. Stop production cycle immediately. 2. Check robotic harmonic drive grease condition (Kyodo Yushi Molywhite RE No. 00). 3. If thermal sensor reports >80°C continuous, replace servo motor actuator SRV-02 (400W Yaskawa AC Servo). 4. Perform zero-point mastering using alignment gauge pins.'
      }
    ]
  },
  {
    id: 'DOC-SOP-PUR109',
    title: 'SOP-PUR-109: Emergency Dual-Sourcing Qualification & Fast-Track Requisition',
    fileName: 'SOP-PUR-109-DualSourcing.pdf',
    category: 'SOP',
    docType: 'Standard Operating Procedure',
    dateAdded: '2026-02-14',
    fileSize: '1.9 MB',
    summary: 'Standard operating procedure for fast-tracking secondary suppliers during semiconductor and sensor disruptions.',
    chunks: [
      {
        id: 'CHUNK-PUR-01',
        page: 1,
        section: 'Section 1: Criteria for Single-Source Emergency Authorization',
        content: 'When single-source components (e.g. MCU-110, SEN-2048) have on-hand stock below 7 days of production and supplier delivery is delayed by >10 business days: 1. Plant Director and Materials Manager are authorized to trigger Fast-Track Secondary Source Requisition. 2. Premium freight (air courier) approval limit is raised to $15,000 without prior VP signoff.'
      }
    ]
  },
  {
    id: 'DOC-RCA-FLR-26',
    title: 'RCA-FLR-2026-03: Root Cause Analysis on M-CNC-04 Spindle Chiller Leak',
    fileName: 'RCA-FLR-2026-03-SpindleOil.pdf',
    category: 'FAILURE_REPORT',
    docType: 'Incident & Root Cause Analysis',
    dateAdded: '2026-03-01',
    fileSize: '3.1 MB',
    summary: 'Analysis of low oil reservoir alarm and hydraulic cartridge contamination on Fanuc CNC enclosure milling machine.',
    chunks: [
      {
        id: 'CHUNK-RCA-01',
        page: 2,
        section: 'Section 2: Failure Mechanism and Corrective Action',
        content: 'Root cause was determined to be a clogged 5-micron filter cartridge (FLT-05) causing high bypass pressure, accompanied by a micro-fissure in the return line manifold. Action: When oil level drops below 30% and spindle temperature surpasses 80°C, machine must not be operated for more than 4 hours. FLT-05 filter cartridge must be replaced and reservoir recharged with ISO VG 46 synthetic lubricant.'
      }
    ]
  }
];
