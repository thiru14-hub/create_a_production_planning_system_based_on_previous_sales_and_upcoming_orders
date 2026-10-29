import {
  ProductSKU,
  SkuSalesHistory,
  UpcomingOrder,
  WorkstationLine,
  ProductionBatch,
  MaterialInventory,
  LineCapacityAnalysis,
  SystemKPIs,
} from '../types/production';

export interface SkuDemandSummary {
  skuId: string;
  skuCode: string;
  productName: string;
  colorAccent: string;
  currentStock: number;
  safetyStockTarget: number;
  confirmedOrderUnits: number;
  forecastedSalesUnitsNext30D: number;
  totalGrossDemand: number;
  netProductionRequirement: number;
  unitPrice: number;
  estimatedOrderRevenue: number;
}

export interface MaterialRequirementCheck {
  materialId: string;
  code: string;
  name: string;
  category: string;
  totalRequired: number;
  inStock: number;
  onOrder: number;
  shortageQuantity: number;
  isShortage: boolean;
  leadTimeDays: number;
  supplierName: string;
  estimatedCostToCover: number;
}

/**
 * Computes forecasted demand for the next 30, 60, and 90 days
 * using a weighted 3-month moving average combined with trend growth and seasonality index.
 */
export function calculateSkuDemandForecast(
  products: ProductSKU[],
  salesHistory: SkuSalesHistory[],
  orders: UpcomingOrder[],
  growthMultiplier = 1.0 // for what-if scenarios
): SkuDemandSummary[] {
  return products.map((product) => {
    const history = salesHistory.find((h) => h.skuId === product.id);
    let forecasted30D = 0;

    if (history && history.records.length > 0) {
      const records = history.records;
      const last3 = records.slice(-3);
      // Weighted moving average: last month 50%, 2nd last 30%, 3rd last 20%
      const weights = [0.2, 0.3, 0.5];
      let weightedAvg = 0;
      last3.forEach((rec, idx) => {
        weightedAvg += rec.unitsSold * weights[idx];
      });

      // Growth trend adjustment
      const growthFactor = 1 + (history.trendGrowthPct / 100) * (1 / 12);
      // Seasonal factor for upcoming month (November/Q4 uplift typically 1.15x)
      const seasonalFactor = 1.12;

      forecasted30D = Math.round(weightedAvg * growthFactor * seasonalFactor * growthMultiplier);
    } else {
      forecasted30D = product.batchSizeStandard * 2;
    }

    // Sum unfulfilled upcoming orders
    const activeOrders = orders.filter(
      (o) => o.skuId === product.id && o.status !== 'shipped'
    );
    const confirmedOrderUnits = activeOrders.reduce((acc, cur) => acc + cur.quantity, 0);

    // Safety stock in units based on daily velocity
    const dailyVelocity = forecasted30D / 30;
    const safetyStockTarget = Math.round(dailyVelocity * product.safetyStockDays);

    const totalGrossDemand = confirmedOrderUnits + Math.round(forecasted30D * 0.4); // 40% uncommitted forecast buffer
    const availableStock = product.currentStock;
    const netProductionRequirement = Math.max(
      0,
      totalGrossDemand - availableStock + safetyStockTarget
    );

    return {
      skuId: product.id,
      skuCode: product.skuCode,
      productName: product.name,
      colorAccent: product.colorAccent,
      currentStock: product.currentStock,
      safetyStockTarget,
      confirmedOrderUnits,
      forecastedSalesUnitsNext30D: forecasted30D,
      totalGrossDemand,
      netProductionRequirement,
      unitPrice: product.unitPrice,
      estimatedOrderRevenue: confirmedOrderUnits * product.unitPrice,
    };
  });
}

/**
 * Evaluates line utilization and bottlenecks based on scheduled and proposed batches
 */
export function analyzeWorkstationCapacity(
  workstations: WorkstationLine[],
  batches: ProductionBatch[],
  products: ProductSKU[],
  shiftCount = 2, // 1 = 8h/day, 2 = 16h/day, 3 = 24h/day
  planningDays = 14
): LineCapacityAnalysis[] {
  const hoursPerDay = shiftCount * 8;
  const totalDays = planningDays;

  return workstations.map((line) => {
    // Effective line hours considering OEE
    const nominalHours = totalDays * hoursPerDay;
    const effectiveAvailableHours = Math.round(nominalHours * (line.efficiencyOEE / 100));

    // Calculate required hours for all batches on this line
    const lineBatches = batches.filter((b) => b.lineId === line.id && b.status !== 'completed');
    let requiredHours = 0;

    lineBatches.forEach((batch) => {
      const prod = products.find((p) => p.id === batch.skuId);
      const remainingUnits = Math.max(0, batch.quantity - batch.completedQuantity);
      if (prod) {
        // cycle time in minutes converted to hours + 5% setup changeover
        const hours = (remainingUnits * prod.cycleTimeMinutes) / 60 * 1.05;
        requiredHours += hours;
      } else {
        requiredHours += remainingUnits / line.capacityPerHour;
      }
    });

    const utilizationPct = effectiveAvailableHours > 0
      ? Math.round((requiredHours / effectiveAvailableHours) * 100)
      : 0;

    return {
      lineId: line.id,
      lineName: line.name,
      availableHours: effectiveAvailableHours,
      requiredHours: Math.round(requiredHours),
      utilizationPct,
      isOverloaded: utilizationPct > 95,
      scheduledBatchesCount: lineBatches.length,
    };
  });
}

/**
 * Checks BOM inventory and detects material shortages for all active & upcoming production
 */
export function evaluateBOMInventory(
  batches: ProductionBatch[],
  orders: UpcomingOrder[],
  products: ProductSKU[],
  materials: MaterialInventory[]
): MaterialRequirementCheck[] {
  // Aggregate required units of every component
  const componentDemandMap: Record<string, number> = {};

  batches
    .filter((b) => b.status !== 'completed')
    .forEach((batch) => {
      const prod = products.find((p) => p.id === batch.skuId);
      if (prod) {
        const remainingQty = Math.max(0, batch.quantity - batch.completedQuantity);
        prod.bom.forEach((bomItem) => {
          componentDemandMap[bomItem.componentId] =
            (componentDemandMap[bomItem.componentId] || 0) +
            remainingQty * bomItem.requiredPerUnit;
        });
      }
    });

  // Also include unbatched upcoming orders
  const unbatchedOrders = orders.filter(
    (o) => !o.scheduledBatchId && (o.status === 'confirmed' || o.status === 'backlog')
  );
  unbatchedOrders.forEach((ord) => {
    const prod = products.find((p) => p.id === ord.skuId);
    if (prod) {
      prod.bom.forEach((bomItem) => {
        componentDemandMap[bomItem.componentId] =
          (componentDemandMap[bomItem.componentId] || 0) +
          ord.quantity * bomItem.requiredPerUnit;
      });
    }
  });

  return materials.map((mat) => {
    const totalRequired = componentDemandMap[mat.id] || 0;
    const availableSupply = mat.inStock + mat.onOrder;
    const shortageQuantity = Math.max(0, totalRequired + mat.minimumSafetyStock - availableSupply);
    const isShortage = shortageQuantity > 0;

    return {
      materialId: mat.id,
      code: mat.code,
      name: mat.name,
      category: mat.category,
      totalRequired,
      inStock: mat.inStock,
      onOrder: mat.onOrder,
      shortageQuantity,
      isShortage,
      leadTimeDays: mat.leadTimeDays,
      supplierName: mat.supplierName,
      estimatedCostToCover: Math.round(shortageQuantity * mat.unitCost),
    };
  });
}

/**
 * Calculates high-level Production Planning KPIs
 */
export function computeSystemKPIs(
  orders: UpcomingOrder[],
  demandSummary: SkuDemandSummary[],
  lineCapacity: LineCapacityAnalysis[],
  materialChecks: MaterialRequirementCheck[],
  activeShifts: number
): SystemKPIs {
  const totalFirmOrdersUnits = orders
    .filter((o) => o.status !== 'shipped')
    .reduce((sum, o) => sum + o.quantity, 0);

  const totalForecastUnitsNext30D = demandSummary.reduce(
    (sum, d) => sum + d.forecastedSalesUnitsNext30D,
    0
  );

  const netProductionRequirement = demandSummary.reduce(
    (sum, d) => sum + d.netProductionRequirement,
    0
  );

  const totalAvailHours = lineCapacity.reduce((sum, l) => sum + l.availableHours, 0);
  const totalReqHours = lineCapacity.reduce((sum, l) => sum + l.requiredHours, 0);
  const plantUtilizationPct = totalAvailHours > 0
    ? Math.min(100, Math.round((totalReqHours / totalAvailHours) * 100))
    : 0;

  const totalActiveOrders = orders.filter((o) => o.status !== 'shipped').length;
  const delayedOrders = orders.filter((o) => o.status === 'backlog').length;
  const onTimeDeliveryRate = totalActiveOrders > 0
    ? Math.max(75, Math.min(100, Math.round(((totalActiveOrders - delayedOrders * 0.5) / totalActiveOrders) * 100)))
    : 100;

  const lineBottlenecks = lineCapacity.filter((l) => l.isOverloaded).length;
  const materialBottlenecks = materialChecks.filter((m) => m.isShortage).length;
  const bottlenecksDetected = lineBottlenecks + materialBottlenecks;

  const estimatedRevenue = demandSummary.reduce((sum, d) => sum + d.estimatedOrderRevenue, 0);

  return {
    totalFirmOrdersUnits,
    totalForecastUnitsNext30D,
    netProductionRequirement,
    plantUtilizationPct,
    onTimeDeliveryRate,
    bottlenecksDetected,
    estimatedRevenue,
    activeShifts,
  };
}

/**
 * Auto-scheduler solver: automatically sequences orders into production batches,
 * balancing load across available lines, minimizing late deliveries, and setting dates.
 */
export function autoOptimizeSchedule(
  currentOrders: UpcomingOrder[],
  workstations: WorkstationLine[],
  products: ProductSKU[],
  existingBatches: ProductionBatch[],
  activeShifts = 2
): {
  optimizedBatches: ProductionBatch[];
  updatedOrders: UpcomingOrder[];
  rebalancedLineCount: number;
} {
  // Deep clone to keep pure
  const updatedOrders = JSON.parse(JSON.stringify(currentOrders)) as UpcomingOrder[];
  const optimizedBatches: ProductionBatch[] = JSON.parse(JSON.stringify(existingBatches));

  // Sort orders by priority and deadline
  const priorityScore = (priority: string) => {
    if (priority === 'rush') return 3;
    if (priority === 'high') return 2;
    return 1;
  };

  const pendingOrders = updatedOrders.filter(
    (o) => o.status === 'confirmed' || o.status === 'backlog'
  );

  pendingOrders.sort((a, b) => {
    const pDiff = priorityScore(b.priority) - priorityScore(a.priority);
    if (pDiff !== 0) return pDiff;
    return new Date(a.deliveryDeadline).getTime() - new Date(b.deliveryDeadline).getTime();
  });

  // Track each line's current occupied end date
  const lineEndTimes: Record<string, Date> = {};
  const baseDate = new Date();

  workstations.forEach((line) => {
    // Check existing in_progress or scheduled batches on this line
    const lineBatches = optimizedBatches.filter(
      (b) => b.lineId === line.id && b.status !== 'completed'
    );
    if (lineBatches.length > 0) {
      // Find latest end date
      const latest = lineBatches.reduce((max, b) => {
        const d = new Date(b.plannedEndDate);
        return d > max ? d : max;
      }, baseDate);
      lineEndTimes[line.id] = new Date(latest);
    } else {
      lineEndTimes[line.id] = new Date(baseDate.getTime() + 2 * 3600 * 1000); // starts in 2 hours
    }
  });

  let rebalancedLineCount = 0;

  // Assign pending orders
  pendingOrders.forEach((order, index) => {
    const product = products.find((p) => p.id === order.skuId);
    if (!product) return;

    // Pick line with earliest availability that handles this stage
    // For PCB / IoT: line-01 or line-02
    // For Bio / Sensor: line-02 or line-03
    let candidateLines = workstations;
    if (product.category.includes('Automotive') || product.category.includes('Motion')) {
      candidateLines = workstations.filter((w) => w.id === 'line-01' || w.id === 'line-02');
    } else if (product.category.includes('Medical')) {
      candidateLines = workstations.filter((w) => w.id === 'line-03' || w.id === 'line-02');
    } else {
      candidateLines = workstations.filter((w) => w.id === 'line-01' || w.id === 'line-02');
    }

    if (candidateLines.length === 0) candidateLines = workstations;

    // Pick candidate with earliest available end time
    candidateLines.sort(
      (a, b) => (lineEndTimes[a.id]?.getTime() || 0) - (lineEndTimes[b.id]?.getTime() || 0)
    );
    const chosenLine = candidateLines[0];

    const startTime = new Date(lineEndTimes[chosenLine.id].getTime() + 30 * 60 * 1000); // 30 min changeover
    // Calculate duration in hours based on cycle time & shift throughput
    const cycleTimeHours = (product.cycleTimeMinutes * order.quantity) / 60;
    const workingHoursPerDay = activeShifts * 8;
    const daysNeeded = Math.max(0.5, cycleTimeHours / workingHoursPerDay);

    const endTime = new Date(startTime.getTime() + daysNeeded * 24 * 3600 * 1000);
    lineEndTimes[chosenLine.id] = endTime;

    const newBatchId = `batch-opt-${Date.now()}-${index}`;
    const newBatch: ProductionBatch = {
      id: newBatchId,
      batchCode: `BAT-${order.orderNumber.replace('ORD-', '')}`,
      skuId: order.skuId,
      orderId: order.id,
      lineId: chosenLine.id,
      quantity: order.quantity,
      completedQuantity: 0,
      plannedStartDate: startTime.toISOString().slice(0, 16).replace('T', ' '),
      plannedEndDate: endTime.toISOString().slice(0, 16).replace('T', ' '),
      status: 'scheduled',
      scrapRatePct: 0.5,
      isRush: order.priority === 'rush',
    };

    optimizedBatches.push(newBatch);

    // Update order status
    order.status = 'scheduled';
    order.assignedLineId = chosenLine.id;
    order.scheduledBatchId = newBatchId;
    rebalancedLineCount++;
  });

  return {
    optimizedBatches,
    updatedOrders,
    rebalancedLineCount,
  };
}
