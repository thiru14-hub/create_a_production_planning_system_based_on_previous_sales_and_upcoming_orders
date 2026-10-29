import React, { useState, useMemo } from 'react';
import {
  INITIAL_PRODUCTS,
  INITIAL_SALES_HISTORY,
  INITIAL_UPCOMING_ORDERS,
  INITIAL_WORKSTATIONS,
  INITIAL_BATCHES,
  INITIAL_MATERIALS,
} from './data/mockProductionData';
import {
  ProductSKU,
  SkuSalesHistory,
  UpcomingOrder,
  WorkstationLine,
  ProductionBatch,
  MaterialInventory,
  LineStatus,
} from './types/production';
import {
  calculateSkuDemandForecast,
  analyzeWorkstationCapacity,
  evaluateBOMInventory,
  computeSystemKPIs,
} from './services/plannerEngine';
import { Header, ActiveTab } from './components/Header';
import { FactoryScene } from './components/three/FactoryScene';
import { DemandForecastingView } from './components/DemandForecastingView';
import { MasterScheduleView } from './components/MasterScheduleView';
import { OrdersPipelineView } from './components/OrdersPipelineView';
import { MaterialsBomView } from './components/MaterialsBomView';
import { WorkstationDetailDrawer } from './components/WorkstationDetailDrawer';
import { NewOrderModal } from './components/NewOrderModal';
import { OptimizationModal } from './components/OptimizationModal';

export default function App() {
  const [products] = useState<ProductSKU[]>(INITIAL_PRODUCTS);
  const [salesHistory] = useState<SkuSalesHistory[]>(INITIAL_SALES_HISTORY);
  const [orders, setOrders] = useState<UpcomingOrder[]>(INITIAL_UPCOMING_ORDERS);
  const [workstations, setWorkstations] = useState<WorkstationLine[]>(INITIAL_WORKSTATIONS);
  const [batches, setBatches] = useState<ProductionBatch[]>(INITIAL_BATCHES);
  const [materials, setMaterials] = useState<MaterialInventory[]>(INITIAL_MATERIALS);

  const [activeTab, setActiveTab] = useState<ActiveTab>('factory_3d');
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [activeShifts, setActiveShifts] = useState<number>(2);
  const [growthMultiplier, setGrowthMultiplier] = useState<number>(1.0);

  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isOptimizeModalOpen, setIsOptimizeModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Re-calculate demand forecast, capacity, BOM, and KPIs
  const demandSummary = useMemo(() => {
    return calculateSkuDemandForecast(products, salesHistory, orders, growthMultiplier);
  }, [products, salesHistory, orders, growthMultiplier]);

  const lineCapacity = useMemo(() => {
    return analyzeWorkstationCapacity(workstations, batches, products, activeShifts);
  }, [workstations, batches, products, activeShifts]);

  const materialChecks = useMemo(() => {
    return evaluateBOMInventory(batches, orders, products, materials);
  }, [batches, orders, products, materials]);

  const kpis = useMemo(() => {
    return computeSystemKPIs(orders, demandSummary, lineCapacity, materialChecks, activeShifts);
  }, [orders, demandSummary, lineCapacity, materialChecks, activeShifts]);

  // Handle adding new upcoming customer order
  const handleCreateOrder = (newOrder: UpcomingOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    showNotification(`Order ${newOrder.orderNumber} logged into Master Production Schedule`);
  };

  // Handle direct order dispatch to workstation line
  const handleDispatchOrder = (orderId: string, lineId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const newBatchId = `batch-${Date.now().toString().slice(-4)}`;
    const now = new Date();
    const endDate = new Date(now.getTime() + 4 * 24 * 3600 * 1000);

    const newBatch: ProductionBatch = {
      id: newBatchId,
      batchCode: `BAT-${order.orderNumber.replace('ORD-', '')}`,
      skuId: order.skuId,
      orderId: order.id,
      lineId: lineId,
      quantity: order.quantity,
      completedQuantity: 0,
      plannedStartDate: now.toISOString().slice(0, 16).replace('T', ' '),
      plannedEndDate: endDate.toISOString().slice(0, 16).replace('T', ' '),
      status: 'scheduled',
      scrapRatePct: 0.5,
      isRush: order.priority === 'rush',
    };

    setBatches((prev) => [...prev, newBatch]);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: 'scheduled', assignedLineId: lineId, scheduledBatchId: newBatchId }
          : o
      )
    );

    const targetLine = workstations.find((w) => w.id === lineId);
    showNotification(`Dispatched ${order.orderNumber} to ${targetLine?.code || lineId}`);
  };

  // Handle changing workstation operating status
  const handleChangeLineStatus = (lineId: string, status: LineStatus) => {
    setWorkstations((prev) =>
      prev.map((w) => (w.id === lineId ? { ...w, status } : w))
    );
    showNotification(`Line status updated to ${status.toUpperCase()}`);
  };

  // Handle restocking raw materials
  const handleRestockMaterial = (materialId: string, quantity: number) => {
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === materialId
          ? { ...m, inStock: m.inStock + quantity, onOrder: Math.max(0, m.onOrder - quantity) }
          : m
      )
    );
    showNotification(`Restock PO confirmed (+${quantity.toLocaleString()} units)`);
  };

  // Handle applying auto-optimized schedule
  const handleApplyOptimization = (result: {
    optimizedBatches: ProductionBatch[];
    updatedOrders: UpcomingOrder[];
  }) => {
    setBatches(result.optimizedBatches);
    setOrders(result.updatedOrders);
    showNotification('AI Schedule Optimization applied across all assembly cells!');
  };

  const selectedLine = workstations.find((w) => w.id === selectedLineId) || null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* SaaS Navigation & KPI Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        kpis={kpis}
        onOpenNewOrder={() => setIsNewOrderModalOpen(true)}
        onOpenOptimize={() => setIsOptimizeModalOpen(true)}
        activeShifts={activeShifts}
        onChangeShifts={setActiveShifts}
      />

      {/* Main View Area */}
      <main className="flex-1 relative flex flex-col">
        {activeTab === 'factory_3d' && (
          <div className="w-full h-[calc(100vh-125px)] relative">
            <FactoryScene
              workstations={workstations}
              products={products}
              selectedLineId={selectedLineId}
              onSelectLine={(id) => setSelectedLineId(id)}
              activeShifts={activeShifts}
            />
          </div>
        )}

        {activeTab === 'demand_forecast' && (
          <DemandForecastingView
            products={products}
            salesHistory={salesHistory}
            orders={orders}
            demandSummary={demandSummary}
            growthMultiplier={growthMultiplier}
            onChangeGrowthMultiplier={setGrowthMultiplier}
          />
        )}

        {activeTab === 'master_schedule' && (
          <MasterScheduleView
            workstations={workstations}
            batches={batches}
            products={products}
            orders={orders}
            lineCapacity={lineCapacity}
            onOpenOptimize={() => setIsOptimizeModalOpen(true)}
            onSelectLine={(id) => {
              setSelectedLineId(id);
              setActiveTab('factory_3d');
            }}
          />
        )}

        {activeTab === 'orders_pipeline' && (
          <OrdersPipelineView
            orders={orders}
            products={products}
            workstations={workstations}
            onOpenNewOrder={() => setIsNewOrderModalOpen(true)}
            onDispatchOrder={handleDispatchOrder}
          />
        )}

        {activeTab === 'materials_bom' && (
          <MaterialsBomView
            materials={materials}
            materialChecks={materialChecks}
            onRestockMaterial={handleRestockMaterial}
          />
        )}
      </main>

      {/* Slide-over Workstation Telemetry Drawer */}
      {selectedLine && (
        <WorkstationDetailDrawer
          line={selectedLine}
          onClose={() => setSelectedLineId(null)}
          batches={batches}
          products={products}
          onChangeLineStatus={handleChangeLineStatus}
        />
      )}

      {/* Log New Order Modal */}
      {isNewOrderModalOpen && (
        <NewOrderModal
          products={products}
          onClose={() => setIsNewOrderModalOpen(false)}
          onCreateOrder={handleCreateOrder}
        />
      )}

      {/* Schedule Optimization Solver Modal */}
      {isOptimizeModalOpen && (
        <OptimizationModal
          orders={orders}
          workstations={workstations}
          products={products}
          batches={batches}
          activeShifts={activeShifts}
          onClose={() => setIsOptimizeModalOpen(false)}
          onApplyOptimization={handleApplyOptimization}
        />
      )}

      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-lg border border-slate-700/60 flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}
    </div>
  );
}
