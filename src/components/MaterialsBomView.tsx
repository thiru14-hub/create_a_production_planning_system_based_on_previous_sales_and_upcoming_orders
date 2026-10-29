import React, { useState } from 'react';
import { MaterialInventory } from '../types/production';
import { MaterialRequirementCheck } from '../services/plannerEngine';
import {
  Layers,
  AlertTriangle,
  CheckCircle,
  Truck,
  PlusCircle,
  ShieldCheck,
  DollarSign,
  Package,
} from 'lucide-react';

interface MaterialsBomViewProps {
  materials: MaterialInventory[];
  materialChecks: MaterialRequirementCheck[];
  onRestockMaterial: (materialId: string, quantity: number) => void;
}

export const MaterialsBomView: React.FC<MaterialsBomViewProps> = ({
  materials,
  materialChecks,
  onRestockMaterial,
}) => {
  const [restockItem, setRestockItem] = useState<MaterialInventory | null>(null);
  const [restockQty, setRestockQty] = useState<number>(2000);

  const totalShortages = materialChecks.filter((m) => m.isShortage).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-500 text-white shadow-xs">
              <Layers className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Materials Requirements Planning (MRP) & Stock Buffer
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Reconciles Bill of Materials requirements against physical warehouse stock and inbound supplier purchase orders.
          </p>
        </div>

        {totalShortages > 0 ? (
          <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-800 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>{totalShortages} Material Stockout Risks Detected</span>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>100% Component Coverage for Planned Schedule</span>
          </div>
        )}
      </div>

      {/* Materials Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                <th className="py-3 px-4">Component Code & Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Phys. In Stock</th>
                <th className="py-3 px-4 text-right">Inbound POs</th>
                <th className="py-3 px-4 text-right">Required by Plan</th>
                <th className="py-3 px-4">Buffer Health</th>
                <th className="py-3 px-4">Lead Time</th>
                <th className="py-3 px-4">Primary Supplier</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {materials.map((mat) => {
                const check = materialChecks.find((c) => c.materialId === mat.id);
                const req = check?.totalRequired || 0;
                const totalAvail = mat.inStock + mat.onOrder;
                const coverageRatio = req > 0 ? (totalAvail / req) : 2.0;

                return (
                  <tr key={mat.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{mat.code}</div>
                      <div className="text-[11px] text-slate-500">{mat.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">
                        {mat.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {mat.inStock.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-sky-600">
                      +{mat.onOrder.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {req.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      {check?.isShortage ? (
                        <div className="flex items-center gap-1.5 text-amber-600 font-bold text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Shortage ({check.shortageQuantity} u)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-[11px]">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Secure ({(coverageRatio * 100).toFixed(0)}%)</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                        <span>{mat.leadTimeDays} days</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-[140px]">
                      {mat.supplierName}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setRestockItem(mat);
                          setRestockQty(check?.shortageQuantity ? check.shortageQuantity * 2 : 2500);
                        }}
                        className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold px-2.5 py-1 rounded-lg text-[11px] border border-purple-200 transition-colors cursor-pointer"
                      >
                        + Issue PO
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock PO Modal */}
      {restockItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">
              Issue Purchase Order: {restockItem.code}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Order component replenish shipment from {restockItem.supplierName}.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Reorder Quantity (Units):
                </label>
                <input
                  type="number"
                  value={restockQty}
                  onChange={(e) => setRestockQty(Math.max(100, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-xs text-purple-800">
                <div className="flex justify-between">
                  <span>Unit Cost:</span>
                  <span className="font-semibold">${restockItem.unitCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Total PO Commitment:</span>
                  <span className="font-bold">${((restockQty * restockItem.unitCost)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between mt-1 text-[11px] text-purple-600">
                  <span>Estimated Transit Lead Time:</span>
                  <span>{restockItem.leadTimeDays} business days</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setRestockItem(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onRestockMaterial(restockItem.id, restockQty);
                  setRestockItem(null);
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-xs"
              >
                Confirm Purchase Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
