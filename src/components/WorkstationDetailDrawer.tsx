import React from 'react';
import {
  WorkstationLine,
  ProductionBatch,
  ProductSKU,
  LineStatus,
} from '../types/production';
import {
  X,
  Cpu,
  Bot,
  Scan,
  Package,
  Activity,
  Thermometer,
  Gauge,
  Users,
  Play,
  Pause,
  Wrench,
  Layers,
  Clock,
} from 'lucide-react';

interface WorkstationDetailDrawerProps {
  line: WorkstationLine | null;
  onClose: () => void;
  batches: ProductionBatch[];
  products: ProductSKU[];
  onChangeLineStatus: (lineId: string, status: LineStatus) => void;
}

export const WorkstationDetailDrawer: React.FC<WorkstationDetailDrawerProps> = ({
  line,
  onClose,
  batches,
  products,
  onChangeLineStatus,
}) => {
  if (!line) return null;

  const lineBatches = batches.filter((b) => b.lineId === line.id);
  const currentBatch = lineBatches.find((b) => b.status === 'in_progress');
  const queuedBatches = lineBatches.filter((b) => b.status === 'scheduled');
  const currentProduct = products.find((p) => p.id === currentBatch?.skuId);

  const getLineIcon = (type: string) => {
    switch (type) {
      case 'SMT PCB Assembly':
        return <Cpu className="w-5 h-5 text-sky-500" />;
      case 'Robotic Subassembly':
        return <Bot className="w-5 h-5 text-emerald-500" />;
      case 'Precision Optical QA':
        return <Scan className="w-5 h-5 text-purple-500" />;
      case 'Automated Packaging & Crating':
      default:
        return <Package className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-250">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
            {getLineIcon(line.type)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-sm">{line.code}</span>
              <span className="bg-sky-50 text-sky-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-sky-200">
                {line.capacityPerHour} u/hr
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate max-w-[200px]">{line.name}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {/* Line State Control Bar */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Operating State
          </label>
          <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => onChangeLineStatus(line.id, 'running')}
              className={`py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                line.status === 'running'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Play className="w-3 h-3" />
              <span>Running</span>
            </button>
            <button
              onClick={() => onChangeLineStatus(line.id, 'changeover')}
              className={`py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                line.status === 'changeover'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Pause className="w-3 h-3" />
              <span>Setup</span>
            </button>
            <button
              onClick={() => onChangeLineStatus(line.id, 'maintenance')}
              className={`py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                line.status === 'maintenance'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3 h-3" />
              <span>Maint.</span>
            </button>
          </div>
        </div>

        {/* Live Hardware Telemetry */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Cell Telemetry & Health
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
              <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                <Activity className="w-3.5 h-3.5 text-emerald-500" />
                <span>Overall OEE</span>
              </div>
              <div className="text-base font-bold text-slate-900 mt-1">{line.efficiencyOEE}%</div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
              <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                <Users className="w-3.5 h-3.5 text-sky-500" />
                <span>Staffing</span>
              </div>
              <div className="text-base font-bold text-slate-900 mt-1">{line.operatorCount} Operators</div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
              <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                <span>Chamber Temp</span>
              </div>
              <div className="text-base font-bold text-slate-900 mt-1">{line.temperatureC}°C</div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
              <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                <Gauge className="w-3.5 h-3.5 text-purple-500" />
                <span>Vibration</span>
              </div>
              <div className="text-base font-bold text-slate-900 mt-1">{line.vibrationMmS} mm/s</div>
            </div>
          </div>
        </div>

        {/* Current Active Batch */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Active Job in Production
          </label>
          {currentBatch ? (
            <div className="bg-gradient-to-br from-slate-50 to-sky-50/50 border border-sky-200 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sky-800">{currentBatch.batchCode}</span>
                <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 rounded">
                  In Progress
                </span>
              </div>

              <div className="font-semibold text-slate-800 text-xs mt-1">
                {currentProduct?.name}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                <span>Progress: {currentBatch.completedQuantity} / {currentBatch.quantity} u</span>
                <span>
                  {Math.round((currentBatch.completedQuantity / currentBatch.quantity) * 100)}%
                </span>
              </div>

              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1.5">
                <div
                  className="bg-sky-600 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.round(
                      (currentBatch.completedQuantity / currentBatch.quantity) * 100
                    )}%`,
                  }}
                />
              </div>

              <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2">
                <Clock className="w-3 h-3" />
                <span>End: {currentBatch.plannedEndDate}</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center text-slate-400">
              Line currently idle. Ready to accept queued batches.
            </div>
          )}
        </div>

        {/* Queued Upcoming Batches on this line */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Queued Batches ({queuedBatches.length})
          </label>
          {queuedBatches.length > 0 ? (
            <div className="space-y-2">
              {queuedBatches.map((batch) => {
                const prod = products.find((p) => p.id === batch.skuId);
                return (
                  <div
                    key={batch.id}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-slate-300"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{batch.batchCode}</span>
                      <span className="text-[10px] text-slate-500">{batch.quantity} units</span>
                    </div>
                    <div className="text-[11px] text-slate-600 truncate mt-0.5">{prod?.name}</div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Start: {batch.plannedStartDate}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-slate-400 text-[11px] italic">No further batches queued.</div>
          )}
        </div>
      </div>
    </div>
  );
};
