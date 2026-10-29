import React, { useState } from 'react';
import {
  UpcomingOrder,
  ProductSKU,
  WorkstationLine,
  OrderPriority,
  OrderStatus,
} from '../types/production';
import {
  ListOrdered,
  Search,
  Filter,
  PlusCircle,
  Calendar,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface OrdersPipelineViewProps {
  orders: UpcomingOrder[];
  products: ProductSKU[];
  workstations: WorkstationLine[];
  onOpenNewOrder: () => void;
  onDispatchOrder: (orderId: string, lineId: string) => void;
}

export const OrdersPipelineView: React.FC<OrdersPipelineViewProps> = ({
  orders,
  products,
  workstations,
  onOpenNewOrder,
  onDispatchOrder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedOrderForDispatch, setSelectedOrderForDispatch] = useState<UpcomingOrder | null>(null);
  const [chosenLineId, setChosenLineId] = useState<string>(workstations[0]?.id || '');

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const product = products.find((p) => p.id === order.skuId);
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product?.skuCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalValue = orders.reduce((sum, o) => {
    const p = products.find((prod) => prod.id === o.skuId);
    return sum + o.quantity * (p?.unitPrice || 0);
  }, 0);

  const rushCount = orders.filter((o) => o.priority === 'rush').length;
  const backlogCount = orders.filter((o) => o.status === 'backlog').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500 text-white shadow-xs">
              <ListOrdered className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Customer Demand Pipeline & Order Backlog
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracking {orders.length} firm orders representing ${(totalValue / 1_000_000).toFixed(2)}M in production revenue.
          </p>
        </div>

        <button
          onClick={onOpenNewOrder}
          className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Customer Order</span>
        </button>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-xs text-slate-500 block">Total Pipeline Value</span>
          <span className="text-xl font-bold text-slate-900 mt-0.5 block">
            ${(totalValue / 1_000_000).toFixed(2)}M
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-xs text-slate-500 block">Unbatched Backlog Orders</span>
          <span className="text-xl font-bold text-amber-600 mt-0.5 block">
            {backlogCount} orders
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-xs text-slate-500 block">Critical Rush Priorities</span>
          <span className="text-xl font-bold text-rose-600 mt-0.5 block">
            {rushCount} expedited
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <span className="text-xs text-slate-500 block">Average Delivery Target</span>
          <span className="text-xl font-bold text-slate-900 mt-0.5 block">
            12.4 Days
          </span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search order #, customer, or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-transparent focus:outline-none text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="all">All Statuses</option>
            <option value="in_production">In Production</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="backlog">Backlog</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="all">All Priorities</option>
            <option value="rush">Rush Only</option>
            <option value="high">High Priority</option>
            <option value="normal">Normal</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer & Tier</th>
                <th className="py-3 px-4">Hardware SKU</th>
                <th className="py-3 px-4 text-right">Units</th>
                <th className="py-3 px-4 text-right">Order Revenue</th>
                <th className="py-3 px-4">Delivery Deadline</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Assigned Line</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => {
                const product = products.find((p) => p.id === order.skuId);
                const assignedLine = workstations.find((w) => w.id === order.assignedLineId);
                const orderRev = order.quantity * (product?.unitPrice || 0);

                return (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{order.orderNumber}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{order.clientName}</div>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {order.clientTier}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: product?.colorAccent || '#38bdf8' }}
                        />
                        <span className="font-semibold text-slate-800">{product?.skuCode}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[160px]">
                        {product?.name}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {order.quantity.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-700">
                      ${(orderRev / 1000).toFixed(1)}k
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{order.deliveryDeadline}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          order.status === 'in_production'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : order.status === 'scheduled'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : order.status === 'confirmed'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          order.priority === 'rush'
                            ? 'bg-rose-100 text-rose-700'
                            : order.priority === 'high'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {order.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {assignedLine ? (
                        <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {assignedLine.code}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {order.status === 'backlog' || order.status === 'confirmed' ? (
                        <button
                          onClick={() => {
                            setSelectedOrderForDispatch(order);
                          }}
                          className="bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold px-2.5 py-1 rounded-lg text-[11px] border border-sky-200 transition-colors cursor-pointer"
                        >
                          Dispatch to Line
                        </button>
                      ) : (
                        <span className="text-emerald-600 text-[11px] font-medium flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Sequenced
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Modal Dialog */}
      {selectedOrderForDispatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">
              Dispatch Order {selectedOrderForDispatch.orderNumber}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select target workstation line to immediately schedule production batch for {selectedOrderForDispatch.clientName}.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Target Workstation Line:
                </label>
                <select
                  value={chosenLineId}
                  onChange={(e) => setChosenLineId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {workstations.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {ws.code} - {ws.name} ({ws.capacityPerHour} u/hr)
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-800">
                <div className="font-semibold">Batch Summary:</div>
                <div className="mt-1">
                  Quantity: {selectedOrderForDispatch.quantity} units • Deadline: {selectedOrderForDispatch.deliveryDeadline}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setSelectedOrderForDispatch(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDispatchOrder(selectedOrderForDispatch.id, chosenLineId);
                  setSelectedOrderForDispatch(null);
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white cursor-pointer shadow-xs"
              >
                Confirm & Sequence Batch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
