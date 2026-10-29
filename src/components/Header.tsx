import React from 'react';
import {
  Boxes,
  TrendingUp,
  CalendarDays,
  ListOrdered,
  Layers,
  Sparkles,
  PlusCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Percent,
} from 'lucide-react';
import { SystemKPIs } from '../types/production';

export type ActiveTab = 'factory_3d' | 'demand_forecast' | 'master_schedule' | 'orders_pipeline' | 'materials_bom';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  kpis: SystemKPIs;
  onOpenNewOrder: () => void;
  onOpenOptimize: () => void;
  activeShifts: number;
  onChangeShifts: (shifts: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  kpis,
  onOpenNewOrder,
  onOpenOptimize,
  activeShifts,
  onChangeShifts,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Facility Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-sky-200">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base tracking-tight">PlanFlow 3D</span>
                <span className="bg-sky-50 text-sky-700 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-sky-200">
                  Precision MPS
                </span>
              </div>
              <p className="text-xs text-slate-500">Autonomous Hardware Assembly • Facility Alpha</p>
            </div>
          </div>

          {/* Navigation View Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => onTabChange('factory_3d')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'factory_3d'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Boxes className="w-3.5 h-3.5 text-sky-500" />
              <span>3D Factory Floor</span>
            </button>

            <button
              onClick={() => onTabChange('demand_forecast')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'demand_forecast'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>Demand & Sales Forecasting</span>
            </button>

            <button
              onClick={() => onTabChange('master_schedule')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'master_schedule'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
              <span>Master Schedule (Gantt)</span>
            </button>

            <button
              onClick={() => onTabChange('orders_pipeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'orders_pipeline'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5 text-amber-500" />
              <span>Upcoming Orders</span>
            </button>

            <button
              onClick={() => onTabChange('materials_bom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'materials_bom'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-500" />
              <span>BOM & Materials</span>
            </button>
          </nav>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-2">
            {/* Shifts dropdown */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-xs">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-600">Shifts:</span>
              <select
                value={activeShifts}
                onChange={(e) => onChangeShifts(Number(e.target.value))}
                className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs font-semibold text-slate-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value={1}>1 Shift (8h)</option>
                <option value={2}>2 Shifts (16h)</option>
                <option value={3}>3 Shifts (24/7)</option>
              </select>
            </div>

            {/* AI Auto-Optimizer */}
            <button
              onClick={onOpenOptimize}
              className="bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Auto-Optimize</span>
            </button>

            {/* + New Order */}
            <button
              onClick={onOpenNewOrder}
              className="bg-sky-600 hover:bg-sky-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ New Order</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Tabs */}
      <div className="md:hidden flex overflow-x-auto px-4 py-2 border-t border-slate-100 gap-1 bg-slate-50">
        <button
          onClick={() => onTabChange('factory_3d')}
          className={`px-3 py-1 rounded-md text-xs whitespace-nowrap ${
            activeTab === 'factory_3d' ? 'bg-white font-bold text-sky-600 shadow-xs' : 'text-slate-600'
          }`}
        >
          3D Twin
        </button>
        <button
          onClick={() => onTabChange('demand_forecast')}
          className={`px-3 py-1 rounded-md text-xs whitespace-nowrap ${
            activeTab === 'demand_forecast' ? 'bg-white font-bold text-sky-600 shadow-xs' : 'text-slate-600'
          }`}
        >
          Forecast
        </button>
        <button
          onClick={() => onTabChange('master_schedule')}
          className={`px-3 py-1 rounded-md text-xs whitespace-nowrap ${
            activeTab === 'master_schedule' ? 'bg-white font-bold text-sky-600 shadow-xs' : 'text-slate-600'
          }`}
        >
          Gantt
        </button>
        <button
          onClick={() => onTabChange('orders_pipeline')}
          className={`px-3 py-1 rounded-md text-xs whitespace-nowrap ${
            activeTab === 'orders_pipeline' ? 'bg-white font-bold text-sky-600 shadow-xs' : 'text-slate-600'
          }`}
        >
          Orders
        </button>
        <button
          onClick={() => onTabChange('materials_bom')}
          className={`px-3 py-1 rounded-md text-xs whitespace-nowrap ${
            activeTab === 'materials_bom' ? 'bg-white font-bold text-sky-600 shadow-xs' : 'text-slate-600'
          }`}
        >
          BOM
        </button>
      </div>

      {/* High-Level KPI Strip */}
      <div className="border-t border-slate-100 bg-slate-50/70 py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Metric 1 */}
          <div className="bg-white border border-slate-200/80 rounded-lg p-2.5 shadow-2xs">
            <span className="text-[11px] font-medium text-slate-500 block">Firm Orders Backlog</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-bold text-slate-900">{kpis.totalFirmOrdersUnits.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400">units</span>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="bg-white border border-slate-200/80 rounded-lg p-2.5 shadow-2xs">
            <span className="text-[11px] font-medium text-slate-500 block">Forecast Demand (30D)</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-bold text-slate-900">{kpis.totalForecastUnitsNext30D.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-600 font-semibold">+14% YoY</span>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="bg-white border border-slate-200/80 rounded-lg p-2.5 shadow-2xs">
            <span className="text-[11px] font-medium text-slate-500 block">Net Production Need</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-bold text-sky-600">{kpis.netProductionRequirement.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400">units</span>
            </div>
          </div>

          {/* Metric 4 */}
          <div className="bg-white border border-slate-200/80 rounded-lg p-2.5 shadow-2xs">
            <span className="text-[11px] font-medium text-slate-500 block">Plant Utilization</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-base font-bold text-slate-900">{kpis.plantUtilizationPct}%</span>
              <span className="text-[10px] text-slate-500">Cap. 4 lines</span>
            </div>
          </div>

          {/* Metric 5 */}
          <div className="bg-white border border-slate-200/80 rounded-lg p-2.5 shadow-2xs">
            <span className="text-[11px] font-medium text-slate-500 block">On-Time Delivery Rate</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-bold text-emerald-600">{kpis.onTimeDeliveryRate}%</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 inline" />
            </div>
          </div>

          {/* Metric 6 */}
          <div className="bg-white border border-slate-200/80 rounded-lg p-2.5 shadow-2xs">
            <span className="text-[11px] font-medium text-slate-500 block">Active Bottlenecks</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span
                className={`text-base font-bold ${
                  kpis.bottlenecksDetected > 0 ? 'text-amber-600' : 'text-slate-800'
                }`}
              >
                {kpis.bottlenecksDetected}
              </span>
              <span className="text-[10px] text-slate-400">
                {kpis.bottlenecksDetected === 0 ? 'Clear Flow' : 'Risk points'}
              </span>
              {kpis.bottlenecksDetected > 0 && (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 inline ml-auto" />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
