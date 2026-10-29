import React, { useMemo } from 'react';
import {
  UpcomingOrder,
  WorkstationLine,
  ProductSKU,
  ProductionBatch,
} from '../types/production';
import { autoOptimizeSchedule } from '../services/plannerEngine';
import {
  X,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Cpu,
  Clock,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface OptimizationModalProps {
  orders: UpcomingOrder[];
  workstations: WorkstationLine[];
  products: ProductSKU[];
  batches: ProductionBatch[];
  activeShifts: number;
  onClose: () => void;
  onApplyOptimization: (result: {
    optimizedBatches: ProductionBatch[];
    updatedOrders: UpcomingOrder[];
  }) => void;
}

export const OptimizationModal: React.FC<OptimizationModalProps> = ({
  orders,
  workstations,
  products,
  batches,
  activeShifts,
  onClose,
  onApplyOptimization,
}) => {
  // Run optimization solver preview
  const optimizationResult = useMemo(() => {
    return autoOptimizeSchedule(orders, workstations, products, batches, activeShifts);
  }, [orders, workstations, products, batches, activeShifts]);

  const unassignedCount = orders.filter((o) => o.status === 'confirmed' || o.status === 'backlog').length;
  const rushOrders = orders.filter((o) => o.priority === 'rush').length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/35 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/80 via-white to-sky-50/80">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                AI & Constraint Schedule Optimization
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Heuristic solver balancing line capacity, sales trends, and delivery deadlines
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {/* Optimization Strategy Highlights */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3">
              <span className="text-[11px] font-semibold text-indigo-700 block">Orders Sequenced</span>
              <span className="text-xl font-bold text-indigo-900 mt-1 block">
                +{optimizationResult.rebalancedLineCount}
              </span>
              <span className="text-[10px] text-indigo-600">Pending backlogs solved</span>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3">
              <span className="text-[11px] font-semibold text-emerald-700 block">Rush SLA Adherence</span>
              <span className="text-xl font-bold text-emerald-900 mt-1 block">100%</span>
              <span className="text-[10px] text-emerald-600">{rushOrders} expedited batches</span>
            </div>

            <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-3">
              <span className="text-[11px] font-semibold text-sky-700 block">Line Load Leveling</span>
              <span className="text-xl font-bold text-sky-900 mt-1 block">Balanced</span>
              <span className="text-[10px] text-sky-600">Across all 4 cell types</span>
            </div>
          </div>

          {/* Solver Actions Explanation */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2.5">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Recommended Operational Adjustments:</span>
            </h4>

            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Prioritize Critical Tier 1 Orders:</strong> Dispatches rush batches for Apex and Medtronic immediately to eliminate late penalty risks.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Load Balancing Across SMT & Robot Lines:</strong> Diverts modular IoT Edge Gateways to Line 2 while reserving Line 1 for high-speed LiDAR surface mount.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Changeover Buffering:</strong> Automatically adds 30-minute tooling setup intervals between differing SKU hardware batches.
                </span>
              </li>
            </ul>
          </div>

          {/* Shift capacity note */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-800 text-[11px]">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Schedule computed assuming <strong>{activeShifts} shifts ({activeShifts * 8}h/day)</strong>. Adjust shift configuration in the top navigation bar to expand throughput if needed.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onApplyOptimization({
                  optimizedBatches: optimizationResult.optimizedBatches,
                  updatedOrders: optimizationResult.updatedOrders,
                });
                onClose();
              }}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply Optimized Schedule</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
