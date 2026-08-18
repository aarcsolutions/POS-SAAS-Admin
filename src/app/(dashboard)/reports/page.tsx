'use client';

import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  Target,
  PieChart,
  ShoppingCart,
  Users,
  CreditCard,
  Hash,
  ArrowLeft,
} from 'lucide-react';
import ProductPerformanceTable from '@/components/reports/ProductPerformanceTable';
import ProfitAnalysisView from '@/components/reports/ProfitAnalysisView';
import { Select } from '@/components/ui/Select';

interface DailySale {
  date: string;
  day: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
  profit: number;
}

interface ProductPerf {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitsSold: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  growth: number;
}

const generateDailySales = (): DailySale[] => {
  const data: DailySale[] = [];
  const baseRevenue = 45000;
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const variation = Math.random() * 0.4 - 0.15;
    const revenue = Math.round(baseRevenue * (1 + variation));
    const orders = Math.round(revenue / 850);
    const avgOrderValue = Math.round(revenue / orders);
    const profit = Math.round(revenue * 0.28);
    data.push({
      date: date.toISOString().split('T')[0],
      day: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      revenue,
      orders,
      avgOrderValue,
      profit,
    });
  }
  return data;
};

const productPerformance: ProductPerf[] = [
  { id: '1', name: 'Premium Coffee Beans', sku: 'COF-001', category: 'Beverages', unitsSold: 342, revenue: 102600, cost: 68400, profit: 34200, margin: 33.3, growth: 12.5 },
  { id: '2', name: 'Green Tea Bags', sku: 'TEA-007', category: 'Beverages', unitsSold: 298, revenue: 59600, cost: 35760, profit: 23840, margin: 40.0, growth: 8.2 },
  { id: '3', name: 'Burger Patties', sku: 'BGR-008', category: 'Food Items', unitsSold: 567, revenue: 170100, cost: 119070, profit: 51030, margin: 30.0, growth: 15.8 },
  { id: '4', name: 'Fresh Milk Cartons', sku: 'MLK-005', category: 'Beverages', unitsSold: 890, revenue: 71200, cost: 56960, profit: 14240, margin: 20.0, growth: -3.1 },
  { id: '5', name: 'Chocolate Syrup', sku: 'CHS-003', category: 'Desserts', unitsSold: 156, revenue: 23400, cost: 14040, profit: 9360, margin: 40.0, growth: -18.4 },
  { id: '6', name: 'Whole Wheat Flour', sku: 'FLR-002', category: 'Raw Materials', unitsSold: 445, revenue: 66750, cost: 46725, profit: 20025, margin: 30.0, growth: 5.3 },
  { id: '7', name: 'Disposable Cups', sku: 'CUP-004', category: 'Packaging', unitsSold: 1200, revenue: 36000, cost: 25200, profit: 10800, margin: 30.0, growth: 22.1 },
  { id: '8', name: 'Sugar (Refined)', sku: 'SUG-006', category: 'Raw Materials', unitsSold: 380, revenue: 30400, cost: 21280, profit: 9120, margin: 30.0, growth: 1.2 },
];

const dailySales = generateDailySales();
const totalRevenue = dailySales.reduce((s, d) => s + d.revenue, 0);
const totalProfit = dailySales.reduce((s, d) => s + d.profit, 0);
const totalOrders = dailySales.reduce((s, d) => s + d.orders, 0);
const avgOrderValue = Math.round(totalRevenue / totalOrders);
const profitMargin = (totalProfit / totalRevenue) * 100;

const maxRevenue = Math.max(...dailySales.map((d) => d.revenue));
const maxProfit = Math.max(...dailySales.map((d) => d.profit));

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'profit'>('overview');
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = productPerformance.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sales & Reports</h1>
          <p className="mt-1 text-sm text-slate-500">Analyze sales performance, product metrics, and profit insights.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={period}
            onChange={(value) => setPeriod(value as typeof period)}
            size="lg"
            allowEmpty={false}
            options={[
              { value: '7d', label: 'Last 7 Days' },
              { value: '30d', label: 'Last 30 Days' },
              { value: '90d', label: 'Last 90 Days' },
              { value: 'custom', label: 'Custom Range' },
            ]}
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <DollarSign className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">Total Revenue</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">PKR {totalRevenue.toLocaleString()}</div>
          <div className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
            <ArrowUpRight className="h-3 w-3" /> +12.5% vs last period
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <PieChart className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">Total Profit</div>
          <div className="mt-1 text-2xl font-bold text-emerald-700">PKR {totalProfit.toLocaleString()}</div>
          <div className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
            <ArrowUpRight className="h-3 w-3" /> +8.3% vs last period
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">Total Orders</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{totalOrders.toLocaleString()}</div>
          <div className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
            <ArrowUpRight className="h-3 w-3" /> +5.7% vs last period
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">Avg Order Value</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">PKR {avgOrderValue.toLocaleString()}</div>
          <div className="mt-1 flex items-center gap-1 text-xs font-medium text-rose-600">
            <ArrowDownRight className="h-3 w-3" /> -2.1% vs last period
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Target className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium text-slate-500">Profit Margin</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{profitMargin.toFixed(1)}%</div>
          <div className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
            <ArrowUpRight className="h-3 w-3" /> +1.2% vs last period
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'products', label: 'Product Performance', icon: Package },
          { id: 'profit', label: 'Profit Analysis', icon: PieChart },
        ].map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition
                ${activeTab === tab.id ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <TabIcon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Revenue & Profit Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Revenue & Profit Trend</h2>
                <p className="text-sm text-slate-500">Daily revenue and profit over the last 30 days</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="text-slate-600">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-700" />
                  <span className="text-slate-600">Profit</span>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              {dailySales.map((day) => (
                <div key={day.date} className="flex items-center gap-4">
                  <div className="w-32 shrink-0 text-xs text-slate-500">{day.day}</div>
                  <div className="flex-1">
                    <div className="mb-1 h-4 overflow-hidden rounded-full bg-slate-50">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${(day.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-emerald-50">
                      <div
                        className="h-full rounded-full bg-emerald-700 transition-all"
                        style={{ width: `${(day.profit / maxProfit) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-24 text-right text-xs font-bold text-slate-700">
                    PKR {day.revenue.toLocaleString()}
                  </div>
                  <div className="w-20 text-right text-xs font-medium text-emerald-600">
                    {day.orders} orders
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Metrics Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Sales by Day of Week</h3>
              <div className="space-y-3">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, i) => {
                  const avg = Math.round(totalRevenue / 7 * (1 + (i - 3) * 0.05));
                  return (
                    <div key={day} className="flex items-center gap-3">
                      <div className="w-20 text-xs font-medium text-slate-600">{day}</div>
                      <div className="flex-1">
                        <div className="h-6 overflow-hidden rounded-lg bg-slate-50">
                          <div
                            className="flex h-full items-center justify-end rounded-lg bg-emerald-500 px-2 text-xs font-bold text-white"
                            style={{ width: `${(avg / (totalRevenue / 7 * 1.2)) * 100}%` }}
                          >
                            {avg > 30000 && `PKR ${(avg / 1000).toFixed(0)}K`}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Sales by Category</h3>
              <div className="space-y-3">
                {[
                  { name: 'Beverages', value: 233400, color: 'bg-emerald-500' },
                  { name: 'Food Items', value: 170100, color: 'bg-blue-500' },
                  { name: 'Raw Materials', value: 97150, color: 'bg-amber-500' },
                  { name: 'Packaging', value: 36000, color: 'bg-rose-400' },
                  { name: 'Desserts', value: 23400, color: 'bg-purple-500' },
                ].map((cat) => {
                  const total = 233400 + 170100 + 97150 + 36000 + 23400;
                  return (
                    <div key={cat.name} className="flex items-center gap-3">
                      <div className="w-28 text-xs font-medium text-slate-600">{cat.name}</div>
                      <div className="flex-1">
                        <div className="h-5 overflow-hidden rounded-full bg-slate-50">
                          <div
                            className={`h-full rounded-full ${cat.color}`}
                            style={{ width: `${(cat.value / total) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-24 text-right text-xs font-bold text-slate-700">
                        PKR {cat.value.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <ProductPerformanceTable products={filteredProducts} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      )}

      {activeTab === 'profit' && (
        <ProfitAnalysisView products={productPerformance} dailySales={dailySales} />
      )}
    </div>
  );
}
