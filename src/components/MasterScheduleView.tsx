import React, { useState } from 'react';
import {
  WorkstationLine,
  ProductionBatch,
  ProductSKU,
  UpcomingOrder,
  LineCapacityAnalysis,
} from '../types/production';
import {
  CalendarDays,
  Clock,
  AlertTriangle,
  CheckCircle,
  Cpu,
  Bot,
  Scan,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface MasterScheduleViewProps {
  workstations: WorkstationLine[];
  batches: ProductionBatch[];
  products: ProductSKU[];
  orders: UpcomingOrder[];
  lineCapacity: LineCapacityAnalysis[];
  onOpenOptimize: () => void;
  onSelectLine: (lineId: string) => void;
  onUpdateBatch?: (updatedBatch: ProductionBatch) => void;
}

export const MasterScheduleView: React.FC<MasterScheduleViewProps> = ({
  workstations,
  batches,
  products,
  orders,
  lineCapacity,
  onOpenOptimize,
  onSelectLine,
}) => {
  const [selectedBatch, setSelectedBatch] = useState<ProductionBatch | null>(null);

  // Generate 14-day calendar columns starting from today
  const calendarDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dateStr: d.toISOString().slice(0, 10),
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      monthName: d.toLocaleDateString('en-US', { month: 'short' }),
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
    };
  });

  const getLineIcon = (type: string) => {
    switch (type) {
      case 'SMT PCB Assembly':
        return <Cpu className="w-4 h-4 text-sky-500" />;
      case 'Robotic Subassembly':
        return <Bot className="w-4 h-4 text-emerald-500" />;
      case 'Precision Optical QA':
        return <Scan className="w-4 h-4 text-purple-500" />;
      case 'Automated Packaging & Crating':
      default:
        return <Package className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500 text-white shadow-xs">
              <CalendarDays className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Master Production Schedule (MPS) & Line Gantt
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic sequencing of manufacturing jobs across assembly cells with automated changeover buffers.
          </p>
        </div>

        <button
          onClick={onOpenOptimize}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Auto-Rebalance Bottlenecks</span>
        </button>
      </div>

      {/* Line Capacity Utilization Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {lineCapacity.map((line) => {
          const ws = workstations.find((w) => w.id === line.lineId);
          return (
            <div
              key={line.lineId}
              onClick={() => onSelectLine(line.lineId)}
              className={`p-4 rounded-xl border transition-all cursor-pointer bg-white hover:shadow-md ${
                line.isOverloaded
                  ? 'border-amber-300 ring-2 ring-amber-100'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {ws?.code}
                </span>
                <span
                  className={`text-xs font-bold ${
                    line.utilizationPct > 90
                      ? 'text-amber-600'
                      : line.utilizationPct > 70
                      ? 'text-emerald-600'
                      : 'text-slate-600'
                  }`}
                >
                  {line.utilizationPct}% Load
                </span>
              </div>

              <div className="text-xs font-bold text-slate-900 truncate mb-1">
                {line.lineName}
              </div>

              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden my-2">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    line.utilizationPct > 95
                      ? 'bg-amber-500'
                      : line.utilizationPct > 75
                      ? 'bg-emerald-500'
                      : 'bg-sky-500'
                  }`}
                  style={{ width: `${Math.min(100, line.utilizationPct)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                <span>{line.requiredHours}h / {line.availableHours}h avail</span>
                <span>{line.scheduledBatchesCount} batches</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Gantt Timeline Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              14-Day Production Sequencing Timeline
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Click any production batch to view linked order & line specifications
          </span>
        </div>

        {/* Calendar Days Header */}
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-16 border-b border-slate-200 text-xs bg-slate-50">
              {/* Left Column for Line Name */}
              <div className="col-span-3 p-3 font-semibold text-slate-700 border-r border-slate-200">
                Workstation Line
              </div>
              {/* 13 or 14 day headers */}
              <div className="col-span-13 grid grid-cols-14 text-center">
                {calendarDays.map((d, idx) => (
                  <div
                    key={d.dateStr}
                    className={`py-2 border-r border-slate-200/80 text-[11px] ${
                      idx === 0
                        ? 'bg-sky-50 font-bold text-sky-700'
                        : d.isWeekend
                        ? 'bg-slate-100/50 text-slate-400'
                        : 'text-slate-600 font-medium'
                    }`}
                  >
                    <div>{d.dayName}</div>
                    <div className="font-bold text-xs">{d.dayNumber}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Line Rows */}
            <div className="divide-y divide-slate-100">
              {workstations.map((line) => {
                const lineBatches = batches.filter((b) => b.lineId === line.id);
                return (
                  <div key={line.id} className="grid grid-cols-16 min-h-[90px] items-stretch">
                    {/* Line Info Left Cell */}
                    <div
                      onClick={() => onSelectLine(line.id)}
                      className="col-span-3 p-3 border-r border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col justify-center"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        {getLineIcon(line.type)}
                        <span className="font-bold text-slate-900 text-xs">{line.code}</span>
                        <span className="text-[10px] text-slate-500">({line.capacityPerHour} u/h)</span>
                      </div>
                      <div className="text-xs text-slate-600 line-clamp-1">{line.name}</div>
                      <div className="text-[10px] text-emerald-600 font-medium mt-1">
                        OEE: {line.efficiencyOEE}% • {line.operatorCount} Operators
                      </div>
                    </div>

                    {/* Gantt Timeline Cell */}
                    <div className="col-span-13 relative bg-slate-50/20 py-2 px-1">
                      {/* Vertical day grid stripes */}
                      <div className="absolute inset-0 grid grid-cols-14 pointer-events-none">
                        {calendarDays.map((d) => (
                          <div
                            key={d.dateStr}
                            className={`border-r border-slate-100 h-full ${
                              d.isWeekend ? 'bg-slate-50/60' : ''
                            }`}
                          />
                        ))}
                      </div>

                      {/* Batches on this line */}
                      <div className="relative z-10 flex flex-col gap-1.5 h-full justify-center">
                        {lineBatches.map((batch) => {
                          const product = products.find((p) => p.id === batch.skuId);
                          const order = orders.find((o) => o.id === batch.orderId);

                          // Approximate visual start offset and width
                          const startDate = new Date(batch.plannedStartDate);
                          const endDate = new Date(batch.plannedEndDate);
                          const now = new Date();
                          const startDiffDays = Math.max(
                            0,
                            (startDate.getTime() - now.getTime()) / (1000 * 3600 * 24)
                          );
                          const durationDays = Math.max(
                            1.5,
                            (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
                          );

                          const leftPct = Math.min(85, (startDiffDays / 14) * 100);
                          const widthPct = Math.min(100 - leftPct, (durationDays / 14) * 100);

                          const isSelected = selectedBatch?.id === batch.id;

                          return (
                            <div
                              key={batch.id}
                              onClick={() => setSelectedBatch(batch)}
                              style={{
                                marginLeft: `${leftPct}%`,
                                width: `${Math.max(12, widthPct)}%`,
                              }}
                              className={`p-2 rounded-xl text-left border shadow-2xs transition-all cursor-pointer relative overflow-hidden ${
                                isSelected
                                  ? 'ring-2 ring-sky-500 shadow-md'
                                  : 'hover:shadow-sm'
                              } ${
                                batch.status === 'in_progress'
                                  ? 'bg-sky-50/90 border-sky-300'
                                  : 'bg-white border-slate-200'
                              }`}
                            >
                              {/* Accent top color strip matching product SKU */}
                              <div
                                className="absolute top-0 left-0 right-0 h-1"
                                style={{ backgroundColor: product?.colorAccent || '#38bdf8' }}
                              />

                              <div className="flex items-center justify-between text-[11px] gap-1">
                                <span className="font-bold text-slate-800 truncate">
                                  {batch.batchCode}
                                </span>
                                {batch.isRush && (
                                  <span className="bg-rose-100 text-rose-700 font-bold px-1 rounded text-[9px]">
                                    RUSH
                                  </span>
                                )}
                              </div>

                              <div className="text-[10px] text-slate-600 truncate mt-0.5">
                                {product?.skuCode} • {batch.quantity} units
                              </div>

                              {order && (
                                <div className="text-[9px] text-slate-400 truncate">
                                  {order.clientName}
                                </div>
                              )}

                              {/* Progress bar if in progress */}
                              {batch.status === 'in_progress' && (
                                <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                                  <div
                                    className="bg-sky-600 h-full rounded-full"
                                    style={{
                                      width: `${Math.round(
                                        (batch.completedQuantity / batch.quantity) * 100
                                      )}%`,
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Batch Inspection Drawer / Card */}
      {selectedBatch && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded">
                  {selectedBatch.batchCode}
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  {products.find((p) => p.id === selectedBatch.skuId)?.name}
                </h4>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Planned Window: {selectedBatch.plannedStartDate} → {selectedBatch.plannedEndDate}
              </p>
            </div>

            <button
              onClick={() => setSelectedBatch(null)}
              className="text-xs text-slate-400 hover:text-slate-700 px-2 py-1 rounded"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block">Assigned Workstation:</span>
              <span className="font-bold text-slate-800 mt-1 block">
                {workstations.find((w) => w.id === selectedBatch.lineId)?.name}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block">Batch Quantity:</span>
              <span className="font-bold text-slate-800 mt-1 block">
                {selectedBatch.completedQuantity} / {selectedBatch.quantity} completed
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block">Quality Scrap Rate:</span>
              <span className="font-bold text-emerald-600 mt-1 block">
                {selectedBatch.scrapRatePct}% (Within ±1.0% tolerance)
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block">Customer Destination:</span>
              <span className="font-bold text-slate-800 mt-1 block truncate">
                {orders.find((o) => o.id === selectedBatch.orderId)?.clientName || 'Internal Warehouse Replenishment'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
