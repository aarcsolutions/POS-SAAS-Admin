'use client';

import { AlertTriangle, ArrowUpRight, Building2, Package, TrendingUp, Wallet } from 'lucide-react';
import SalesPerformanceChart from '@/components/dashboard/SalesPerformanceChart';

const stats = [
  {
    label: 'Total Sales',
    value: 'PKR 1.28M',
    change: '+12.5%',
    icon: Wallet,
  },
  {
    label: 'Monthly Revenue',
    value: 'PKR 420K',
    change: '+8.2%',
    icon: TrendingUp,
  },
  {
    label: 'Active Branches',
    value: '06',
    change: '2 cities',
    icon: Building2,
  },
  {
    label: 'Low Stock Alerts',
    value: '18',
    change: 'Needs review',
    icon: AlertTriangle,
  },
];

const lowStockItems = [
  { name: 'Arabica Coffee Beans', sku: 'PRD-1024', stock: '8 units' },
  { name: 'Thermal Receipt Rolls', sku: 'SUP-8841', stock: '12 rolls' },
  { name: 'Chocolate Syrup', sku: 'PRD-3312', stock: '5 bottles' },
];

const topProducts = [
  { name: 'Chicken Burger', sales: '1,240 orders', revenue: 'PKR 384K' },
  { name: 'Latte Regular', sales: '890 orders', revenue: 'PKR 178K' },
  { name: 'Family Deal', sales: '420 orders', revenue: 'PKR 252K' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Overview of sales, revenue, stock, and branches.</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700">
          View Reports
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {stat.change}
                </span>
              </div>
              <div className="text-sm font-medium text-slate-500">{stat.label}</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Sales Performance</h2>
              <p className="text-sm text-slate-500">Daily and monthly sales trend</p>
            </div>
            <select className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none">
              <option>Last 30 days</option>
              <option>This month</option>
              <option>This year</option>
            </select>
          </div>
          <div className="rounded-2xl bg-slate-50 p-5">
            <SalesPerformanceChart />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Low Stock Alerts</h2>
              <p className="text-sm text-slate-500">Items close to reorder level</p>
            </div>
          </div>
          <div className="space-y-3">
            {lowStockItems.map((item) => (
              <div key={item.sku} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-slate-800">{item.name}</div>
                    <div className="mt-1 text-xs text-slate-500">{item.sku}</div>
                  </div>
                  <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                    {item.stock}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Top Products</h2>
            <p className="text-sm text-slate-500">Product performance summary</p>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Sales</th>
                <th className="px-4 py-3">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {topProducts.map((product) => (
                <tr key={product.name}>
                  <td className="px-4 py-4 font-semibold text-slate-800">{product.name}</td>
                  <td className="px-4 py-4 text-slate-600">{product.sales}</td>
                  <td className="px-4 py-4 font-semibold text-slate-900">{product.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
