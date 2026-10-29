export type ClientTier = 'Tier 1 Strategic' | 'Enterprise' | 'Standard';
export type OrderPriority = 'rush' | 'high' | 'normal';
export type OrderStatus = 'confirmed' | 'in_production' | 'scheduled' | 'backlog' | 'shipped';
export type LineStatus = 'running' | 'idle' | 'maintenance' | 'changeover';
export type BatchStatus = 'completed' | 'in_progress' | 'scheduled' | 'delayed';

export interface BOMItem {
  componentId: string;
  componentName: string;
  requiredPerUnit: number;
}

export interface ProductSKU {
  id: string;
  skuCode: string;
  name: string;
  category: string;
  unitPrice: number;
  productionCost: number;
  cycleTimeMinutes: number; // production time per unit on primary line
  batchSizeStandard: number;
  safetyStockDays: number;
  currentStock: number;
  allocatedStock: number;
  reorderPoint: number;
  colorAccent: string; // hex for visual tags
  description: string;
  bom: BOMItem[];
}

export interface MonthlySalesRecord {
  month: string; // e.g. "2025-11", "2025-12"
  label: string; // e.g. "Nov", "Dec"
  unitsSold: number;
  revenue: number;
  seasonalityIndex: number; // 1.0 = average, 1.3 = 30% peak
}

export interface SkuSalesHistory {
  skuId: string;
  records: MonthlySalesRecord[];
  trendGrowthPct: number; // e.g. +14% year over year
  averageMonthlyUnits: number;
}

export interface UpcomingOrder {
  id: string;
  orderNumber: string;
  clientName: string;
  clientTier: ClientTier;
  skuId: string;
  quantity: number;
  orderDate: string; // YYYY-MM-DD
  deliveryDeadline: string; // YYYY-MM-DD
  status: OrderStatus;
  priority: OrderPriority;
  assignedLineId?: string;
  scheduledBatchId?: string;
  notes?: string;
}

export interface WorkstationLine {
  id: string;
  code: string;
  name: string;
  type: 'SMT PCB Assembly' | 'Robotic Subassembly' | 'Precision Optical QA' | 'Automated Packaging & Crating';
  capacityPerHour: number;
  status: LineStatus;
  currentJobId?: string;
  currentSkuId?: string;
  targetUnits: number;
  completedUnits: number;
  efficiencyOEE: number; // Overall Equipment Effectiveness, e.g. 88.5%
  position3D: { x: number; y: number; z: number };
  colorAccent: string;
  operatorCount: number;
  temperatureC: number;
  vibrationMmS: number;
}

export interface ProductionBatch {
  id: string;
  batchCode: string;
  skuId: string;
  orderId?: string; // linked to order, or undefined if replenishment
  lineId: string;
  quantity: number;
  completedQuantity: number;
  plannedStartDate: string; // YYYY-MM-DD HH:mm
  plannedEndDate: string; // YYYY-MM-DD HH:mm
  status: BatchStatus;
  scrapRatePct: number;
  isRush?: boolean;
}

export interface MaterialInventory {
  id: string;
  code: string;
  name: string;
  category: 'Semiconductor' | 'Alloy & Chassis' | 'Electro-mechanical' | 'Optics & Sensors' | 'Packaging';
  inStock: number;
  allocated: number;
  onOrder: number;
  unitCost: number;
  leadTimeDays: number;
  supplierName: string;
  minimumSafetyStock: number;
  reorderTrigger: number;
}

export interface ForecastPoint {
  month: string;
  label: string;
  forecastedUnits: number;
  firmOrderUnits: number;
  totalPlannedProduction: number;
  confidenceLower: number;
  confidenceUpper: number;
}

export interface LineCapacityAnalysis {
  lineId: string;
  lineName: string;
  availableHours: number;
  requiredHours: number;
  utilizationPct: number;
  isOverloaded: boolean;
  scheduledBatchesCount: number;
}

export interface SystemKPIs {
  totalFirmOrdersUnits: number;
  totalForecastUnitsNext30D: number;
  netProductionRequirement: number;
  plantUtilizationPct: number;
  onTimeDeliveryRate: number; // percentage, e.g. 96.8%
  bottlenecksDetected: number;
  estimatedRevenue: number;
  activeShifts: number; // 1, 2, or 3 shifts
}
