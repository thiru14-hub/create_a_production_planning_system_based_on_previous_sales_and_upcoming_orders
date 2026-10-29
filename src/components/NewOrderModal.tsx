import React, { useState } from 'react';
import {
  ProductSKU,
  UpcomingOrder,
  ClientTier,
  OrderPriority,
} from '../types/production';
import {
  X,
  PlusCircle,
  Calendar,
  Building2,
  DollarSign,
  AlertCircle,
  Clock,
} from 'lucide-react';

interface NewOrderModalProps {
  products: ProductSKU[];
  onClose: () => void;
  onCreateOrder: (order: UpcomingOrder) => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  products,
  onClose,
  onCreateOrder,
}) => {
  const [clientName, setClientName] = useState('');
  const [clientTier, setClientTier] = useState<ClientTier>('Enterprise');
  const [skuId, setSkuId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState(350);
  const [priority, setPriority] = useState<OrderPriority>('normal');
  const [notes, setNotes] = useState('');

  // Default deadline 14 days from now
  const defaultDeadline = new Date();
  defaultDeadline.setDate(defaultDeadline.getDate() + 14);
  const [deliveryDeadline, setDeliveryDeadline] = useState(
    defaultDeadline.toISOString().slice(0, 10)
  );

  const selectedProduct = products.find((p) => p.id === skuId) || products[0];
  const orderRevenue = quantity * (selectedProduct?.unitPrice || 0);
  const estimatedHours = ((quantity * (selectedProduct?.cycleTimeMinutes || 3)) / 60).toFixed(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: UpcomingOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      clientName: clientName.trim(),
      clientTier,
      skuId,
      quantity,
      orderDate: new Date().toISOString().slice(0, 10),
      deliveryDeadline,
      status: 'confirmed',
      priority,
      notes: notes.trim() || undefined,
    };

    onCreateOrder(newOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/35 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500 text-white shadow-2xs">
              <PlusCircle className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Log New Customer Production Order
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Customer Name & Tier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Client / Company Name *
              </label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Northrop Autonomous Systems"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Client Account Tier
              </label>
              <select
                value={clientTier}
                onChange={(e) => setClientTier(e.target.value as ClientTier)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="Tier 1 Strategic">Tier 1 Strategic</option>
                <option value="Enterprise">Enterprise</option>
                <option value="Standard">Standard</option>
              </select>
            </div>
          </div>

          {/* SKU Selection */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Select Hardware SKU *
            </label>
            <select
              value={skuId}
              onChange={(e) => setSkuId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.skuCode} - {p.name} (${p.unitPrice} / unit)
                </option>
              ))}
            </select>
          </div>

          {/* Quantity & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Order Units Required *
              </label>
              <input
                type="number"
                min="10"
                step="10"
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(10, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Delivery Deadline *
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  required
                  value={deliveryDeadline}
                  onChange={(e) => setDeliveryDeadline(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Schedule Priority Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['normal', 'high', 'rush'] as OrderPriority[]).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`py-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer border ${
                    priority === p
                      ? p === 'rush'
                        ? 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-100'
                        : p === 'high'
                        ? 'bg-amber-50 text-amber-700 border-amber-300 ring-2 ring-amber-100'
                        : 'bg-sky-50 text-sky-700 border-sky-300 ring-2 ring-sky-100'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Order Impact Preview Box */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-slate-50 to-sky-50/60 border border-sky-100 space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Gross Contract Revenue:</span>
              <span className="font-bold text-slate-900">${orderRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Estimated Assembly Workload:</span>
              <span className="font-semibold text-slate-800">{estimatedHours} machine hours</span>
            </div>
            <div className="flex justify-between text-slate-600 text-[11px]">
              <span>Existing Warehouse Stock:</span>
              <span>{selectedProduct.currentStock} units in inventory</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white cursor-pointer shadow-xs"
            >
              Log Order into MPS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
