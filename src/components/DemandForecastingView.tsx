import React, { useState } from 'react';
import {
  ProductSKU,
  SkuSalesHistory,
  UpcomingOrder,
} from '../types/production';
import {
  SkuDemandSummary,
} from '../services/plannerEngine';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Sliders,
  DollarSign,
  PackageCheck,
  Zap,
} from 'lucide-react';

interface DemandForecastingViewProps {
  products: ProductSKU[];
  salesHistory: SkuSalesHistory[];
  orders: UpcomingOrder[];
  demandSummary: SkuDemandSummary[];
  growthMultiplier: number;
  onChangeGrowthMultiplier: (multiplier: number) => void;
  onSelectSkuForDetails?: (skuId: string) => void;
}

export const DemandForecastingView: React.FC<DemandForecastingViewProps> = ({
  products,
  salesHistory,
  orders,
  demandSummary,
  growthMultiplier,
  onChangeGrowthMultiplier,
}) => {
  const [selectedSkuId, setSelectedSkuId] = useState<string>(products[0]?.id || '');

  const activeProduct = products.find((p) => p.id === selectedSkuId) || products[0];
  const activeHistory = salesHistory.find((h) => h.skuId === selectedSkuId);
  const activeDemand = demandSummary.find((d) => d.skuId === selectedSkuId);
  const activeOrders = orders.filter((o) => o.skuId === selectedSkuId && o.status !== 'shipped');

  // Find max historical value for chart scaling
  const maxHistoricalUnits = activeHistory
    ? Math.max(...activeHistory.records.map((r) => r.unitsSold), 100)
    : 1000;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner: Logic Explanation */}
      <div className="bg-gradient-to-r from-sky-50 via-white to-indigo-50/40 border border-sky-100 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-sky-500 text-white shadow-xs">
                <TrendingUp className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Demand Reconciliation & Predictive Sales Forecasting
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Synthesizes 12-month historical sales seasonality, moving average trendlines, and firm upcoming orders
              to calculate exact net master production targets while shielding against stockouts.
            </p>
          </div>

          {/* Interactive What-If Scenario Slider */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-xs flex items-center gap-4 min-w-[280px]">
            <Sliders className="w-4 h-4 text-sky-500 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-slate-700">Demand Surge Simulator:</span>
                <span className="font-bold text-sky-600">
                  {growthMultiplier >= 1 ? `+${Math.round((growthMultiplier - 1) * 100)}%` : `${Math.round((growthMultiplier - 1) * 100)}%`}
                </span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.5"
                step="0.05"
                value={growthMultiplier}
                onChange={(e) => onChangeGrowthMultiplier(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Product SKU Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {products.map((p) => {
          const isSelected = p.id === selectedSkuId;
          const skuDemand = demandSummary.find((d) => d.skuId === p.id);
          return (
            <button
              key={p.id}
              onClick={() => setSelectedSkuId(p.id)}
              className={`px-4 py-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-3 shrink-0 ${
                isSelected
                  ? 'bg-white border-sky-400 shadow-sm ring-2 ring-sky-100'
                  : 'bg-white/80 border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: p.colorAccent }}
              />
              <div>
                <div className="text-xs font-bold text-slate-900">{p.skuCode}</div>
                <div className="text-[11px] text-slate-500 truncate max-w-[140px]">{p.name}</div>
              </div>
              <div className="pl-2 border-l border-slate-100 text-right">
                <span className="text-[10px] text-slate-400 block">Net Req.</span>
                <span className="text-xs font-bold text-sky-600">
                  {skuDemand?.netProductionRequirement.toLocaleString()} u
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main 2-Column Analytical View */}
      {activeProduct && activeHistory && activeDemand && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Historical Sales vs Upcoming Orders vs Forecast */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart Container */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-sky-500" />
                    <span>Monthly Sales History & Upcoming Forecast Curve</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Showing 12 months historical performance + projected 30D demand for {activeProduct.name}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-sky-200 border border-sky-300" />
                    <span className="text-slate-600">Past Sales</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                    <span className="text-slate-600">Firm Orders</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-indigo-400 border border-dashed border-indigo-600" />
                    <span className="text-slate-600">Forecast</span>
                  </div>
                </div>
              </div>

              {/* Bar and Curve Chart */}
              <div className="h-64 flex items-end gap-2 pt-6 pb-2 px-2 border-b border-slate-100">
                {activeHistory.records.map((rec) => {
                  const heightPct = Math.round((rec.unitsSold / (maxHistoricalUnits * 1.25)) * 100);
                  return (
                    <div key={rec.month} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                      {/* Tooltip on Hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 bg-slate-900 text-white text-[11px] px-2.5 py-1 rounded-md shadow-md pointer-events-none whitespace-nowrap">
                        <div className="font-bold">{rec.label} {rec.month.slice(0, 4)}</div>
                        <div>{rec.unitsSold.toLocaleString()} units (${(rec.revenue / 1000).toFixed(0)}k)</div>
                        <div className="text-[10px] text-sky-300">Seasonality: {rec.seasonalityIndex}x</div>
                      </div>

                      {/* Bar */}
                      <div
                        className="w-full bg-sky-100 hover:bg-sky-200 border border-sky-300/60 rounded-t-sm transition-all duration-300"
                        style={{ height: `${Math.max(8, heightPct)}%` }}
                      />
                      <span className="text-[10px] text-slate-500 font-medium mt-1.5">{rec.label}</span>
                    </div>
                  );
                })}

                {/* Upcoming Month: Firm Orders + Forecast Split Bar */}
                <div className="flex-1 flex flex-col items-center h-full justify-end group relative">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 bg-slate-900 text-white text-[11px] px-2.5 py-1 rounded-md shadow-md pointer-events-none whitespace-nowrap">
                    <div className="font-bold">Next 30D Planned</div>
                    <div>Firm Orders: {activeDemand.confirmedOrderUnits.toLocaleString()} u</div>
                    <div>Forecast Buffer: {(activeDemand.totalGrossDemand - activeDemand.confirmedOrderUnits).toLocaleString()} u</div>
                  </div>

                  <div className="w-full flex flex-col justify-end" style={{
                    height: `${Math.min(100, Math.round((activeDemand.totalGrossDemand / (maxHistoricalUnits * 1.25)) * 100))}%`
                  }}>
                    {/* Forecast portion */}
                    <div className="w-full bg-indigo-300/80 border-t-2 border-dashed border-indigo-600 rounded-t-sm flex-1" />
                    {/* Firm order portion */}
                    <div
                      className="w-full bg-emerald-500 rounded-b-sm"
                      style={{
                        height: `${Math.round((activeDemand.confirmedOrderUnits / (activeDemand.totalGrossDemand || 1)) * 100)}%`
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 mt-1.5">Next 30D</span>
                </div>
              </div>

              {/* Bottom trend statistics */}
              <div className="grid grid-cols-3 gap-4 pt-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Average Monthly Velocity:</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {activeHistory.averageMonthlyUnits.toLocaleString()} units/mo
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Year-over-Year Growth:</span>
                  <span className="font-bold text-emerald-600 text-sm flex items-center gap-1">
                    +{activeHistory.trendGrowthPct}% <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Current Cycle Time:</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {activeProduct.cycleTimeMinutes} min / unit
                  </span>
                </div>
              </div>
            </div>

            {/* Upcoming Confirmed Orders for this SKU */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  <span>Upcoming Firm Orders Backlog ({activeOrders.length} active)</span>
                </h3>
                <span className="text-xs font-semibold text-slate-600">
                  Total Committed: {activeDemand.confirmedOrderUnits.toLocaleString()} units
                </span>
              </div>

              {activeOrders.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No active orders pending for this SKU. Net requirement driven by replenishment buffer.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-500">
                        <th className="pb-2 font-medium">Order #</th>
                        <th className="pb-2 font-medium">Customer</th>
                        <th className="pb-2 font-medium">Tier</th>
                        <th className="pb-2 font-medium text-right">Quantity</th>
                        <th className="pb-2 font-medium">Deadline</th>
                        <th className="pb-2 font-medium">Status</th>
                        <th className="pb-2 font-medium">Priority</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 font-bold text-slate-900">{ord.orderNumber}</td>
                          <td className="py-2.5 text-slate-700 font-medium">{ord.clientName}</td>
                          <td className="py-2.5">
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">
                              {ord.clientTier}
                            </span>
                          </td>
                          <td className="py-2.5 text-right font-bold text-slate-900">
                            {ord.quantity.toLocaleString()}
                          </td>
                          <td className="py-2.5 text-slate-600">{ord.deliveryDeadline}</td>
                          <td className="py-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                                ord.status === 'in_production'
                                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                  : ord.status === 'scheduled'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {ord.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                ord.priority === 'rush'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : ord.priority === 'high'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {ord.priority}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Col: MPS Demand Reconciliation Breakdown */}
          <div className="space-y-6">
            {/* The Master Formula Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-sky-500" />
                <span>Net Production Requirement Solver</span>
              </h3>

              <div className="space-y-3 text-xs">
                {/* 1. Confirmed Orders */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-600">Firm Upcoming Orders:</span>
                  <span className="font-bold text-slate-900">
                    +{activeDemand.confirmedOrderUnits.toLocaleString()} u
                  </span>
                </div>

                {/* 2. Uncommitted Forecast Buffer */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-600">Forecasted Sales Buffer (30D):</span>
                  <span className="font-bold text-slate-900">
                    +{(activeDemand.totalGrossDemand - activeDemand.confirmedOrderUnits).toLocaleString()} u
                  </span>
                </div>

                {/* Gross Total */}
                <div className="flex items-center justify-between px-2 pt-1 font-semibold text-slate-700 border-t border-slate-100">
                  <span>Gross Demand:</span>
                  <span>{activeDemand.totalGrossDemand.toLocaleString()} units</span>
                </div>

                {/* 3. Deduct Current Stock */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-emerald-800">
                  <span>Less: Available Finished Stock:</span>
                  <span className="font-bold">-{activeProduct.currentStock.toLocaleString()} u</span>
                </div>

                {/* 4. Add Safety Stock */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-sky-50/70 border border-sky-100 text-sky-800">
                  <span>Add: Safety Stock Target ({activeProduct.safetyStockDays}d buffer):</span>
                  <span className="font-bold">+{activeDemand.safetyStockTarget.toLocaleString()} u</span>
                </div>

                {/* NET PRODUCTION TARGET */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-md">
                  <span className="text-xs uppercase font-medium text-sky-100 block">
                    Net Production Required
                  </span>
                  <div className="text-2xl font-black mt-1">
                    {activeDemand.netProductionRequirement.toLocaleString()}
                    <span className="text-xs font-normal text-sky-200 ml-1.5">units to build</span>
                  </div>
                  <p className="text-[11px] text-sky-100/90 mt-2">
                    Equivalent to ~{Math.ceil(activeDemand.netProductionRequirement / activeProduct.batchSizeStandard)} standard production batches.
                  </p>
                </div>
              </div>
            </div>

            {/* Bill of Materials (BOM) for this SKU */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-purple-500" />
                <span>Bill of Materials (BOM Structure)</span>
              </h3>

              <div className="space-y-2 text-xs">
                {activeProduct.bom.map((item) => (
                  <div
                    key={item.componentId}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{item.componentName}</div>
                      <div className="text-[10px] text-slate-400">ID: {item.componentId}</div>
                    </div>
                    <span className="font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {item.requiredPerUnit}x / unit
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
