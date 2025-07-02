import React, { useEffect, useState } from 'react';
import { Users, DollarSign, TrendingUp, Home, Percent, Calendar, Package } from 'lucide-react';
import StatCard from '../StatCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import axios from 'axios';

interface Investment {
  id: number;
  user_id: number;
  property_id: number;
  bundle_id: number | null;
  is_bundle: number;
  number_of_shares: number;
  total_amount: string;
  advancement_payment: string;
  share_price: string;
  payment_status: string;
  status: string;
  purchase_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
  };
  property: {
    id: number;
    title_en: string;
  };
}

const API_BASE_URL = 'https://realestate.learnock.com';
const Dashboard: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, []);
  
  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem('token'); // make sure this exists and is correct
  
    if (!token) {
      console.warn("Token not found, skipping fetch.");
      setError("Authentication token missing.");
      setLoading(false);
      return;
    }
  
    const fetchInvestments = async () => {
      try {
        setLoading(true);
        setError(null);
  
        const response = await axios.get(`${API_BASE_URL}/api/properties/sale`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            apiKey: '1234',
          },
          signal: controller.signal,
        });
  
        setInvestments(response.data.data || []);
      } catch (err: any) {
        if (axios.isCancel(err)) {
          console.log('Fetch canceled');
        } else if (err.response?.status === 401) {
          console.error('Unauthorized. Invalid or expired token.');
          setError('Session expired. Please log in again.');
        } else if (err.response?.status === 429) {
          setError('Too many requests. Please try again later.');
          console.warn('Rate limited: 429');
        } else {
          console.error('Fetch error:', err);
          setError(err.message || 'Failed to load investment data');
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchInvestments();
  
    return () => {
      controller.abort(); // Cancel on unmount
    };
  }, []);
  
  const processChartData = () => {
    if (!investments.length) return [];

    const filteredData = investments.filter(investment => {
      const purchaseDate = new Date(investment.purchase_date);
      const now = new Date();
      
      if (timeRange === 'week') {
        const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
        return purchaseDate >= oneWeekAgo;
      } else if (timeRange === 'month') {
        const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
        return purchaseDate >= oneMonthAgo;
      } else { // year
        const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
        return purchaseDate >= oneYearAgo;
      }
    });

    const groupedData = filteredData.reduce((acc, investment) => {
      const date = new Date(investment.purchase_date);
      let key;
      
      if (timeRange === 'week') {
        key = date.toLocaleDateString('default', { weekday: 'short' });
      } else if (timeRange === 'month') {
        key = date.toLocaleDateString('default', { day: 'numeric', month: 'short' });
      } else { // year
        key = date.toLocaleDateString('default', { month: 'short' });
      }

      if (!acc[key]) {
        acc[key] = { date: key, amount: 0, count: 0 };
      }

      acc[key].amount += parseFloat(investment.total_amount);
      acc[key].count += 1;

      return acc;
    }, {} as Record<string, { date: string; amount: number; count: number }>);

    return Object.values(groupedData).sort((a, b) => {
      if (timeRange === 'week') {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days.indexOf(a.date) - days.indexOf(b.date);
      } else {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
    });
  };

  const chartData = processChartData();

  // Calculate stats
  const totalInvestments = investments.length;
  const totalAmount = investments.reduce((sum, inv) => sum + parseFloat(inv.total_amount), 0);
  const avgInvestment = totalInvestments > 0 ? totalAmount / totalInvestments : 0;
  const activeInvestments = investments.filter(i => i.status === 'active').length;
  const completionRate = totalInvestments > 0 ? (activeInvestments / totalInvestments) * 100 : 0;
  const totalShares = investments.reduce((sum, inv) => sum + inv.number_of_shares, 0);

  // Recent investments with full name
  const recentInvestments = investments
    .slice(0, 5)
    .map(inv => ({
      ...inv,
      fullName: `${inv.user.first_name} ${inv.user.last_name}`
    }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment Dashboard</h1>
          <p className="text-gray-600">Track and analyze investment performance</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 rounded-md ${timeRange === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 rounded-md ${timeRange === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-3 py-1 rounded-md ${timeRange === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Investments"
          value={totalInvestments.toString()}
          change="+8% from last period"
          changeType="positive"
          icon={Home}
        />
        <StatCard
          title="Total Amount"
          value={`$${totalAmount.toLocaleString()}`}
          change="+15% from last period"
          changeType="positive"
          icon={DollarSign}
        />
        <StatCard
          title="Avg. Investment"
          value={`$${avgInvestment.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          change="+5% from last period"
          changeType="positive"
          icon={TrendingUp}
        />
        <StatCard
          title="Active Investments"
          value={`${completionRate.toFixed(1)}%`}
          change="+2.5% from last period"
          changeType="positive"
          icon={Percent}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Trend</h3>
          {loading ? (
            <div className="h-64 flex items-center justify-center">Loading...</div>
          ) : error ? (
            <div className="h-64 flex items-center justify-center text-red-500">{error}</div>
          ) : chartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Amount']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#3B82F6" 
                    strokeWidth={3} 
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">No investment data available</div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Volume</h3>
          {loading ? (
            <div className="h-64 flex items-center justify-center">Loading...</div>
          ) : error ? (
            <div className="h-64 flex items-center justify-center text-red-500">{error}</div>
          ) : chartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [value, 'Number of Investments']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#10B981" 
                    name="Number of Investments"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">No investment data available</div>
          )}
        </div>
      </div>

      {/* Recent Investments */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Recent Investments</h3>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            Last 5 investments
          </div>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">Loading investment data...</div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-500">{error}</div>
          ) : investments.length > 0 ? (
            <div className="space-y-4">
              {recentInvestments.map((investment) => (
                <div key={investment.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">
                      {investment.property.title_en || `Property #${investment.property_id}`}
                    </p>
                    <div className="flex space-x-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center">
                        <Package className="w-4 h-4 mr-1" />
                        {investment.number_of_shares} share(s)
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {parseFloat(investment.total_amount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-medium text-gray-900">
                      {investment.fullName}
                    </span>
                    <span className="block text-xs text-gray-500 mt-1">
                      {new Date(investment.purchase_date).toLocaleDateString()}
                    </span>
                    <span className={`inline-block mt-1 text-xs px-2 py-1 rounded-full ${
                      investment.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : investment.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {investment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">No investments recorded yet</div>
          )}
        </div>
      </div>

      {/* Additional Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Active</span>
              <span className="font-medium">{activeInvestments}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completed</span>
              <span className="font-medium">{investments.filter(i => i.status === 'completed').length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending</span>
              <span className="font-medium">{investments.filter(i => i.status === 'pending').length}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Shares Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Shares</span>
              <span className="font-medium">{totalShares}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg. Shares per Investment</span>
              <span className="font-medium">
                {totalInvestments > 0 ? (totalShares / totalInvestments).toFixed(1) : 0}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Completed</span>
              <span className="font-medium">
                {investments.filter(i => i.payment_status === 'completed').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending</span>
              <span className="font-medium">
                {investments.filter(i => i.payment_status === 'pending').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Partially Paid</span>
              <span className="font-medium">
                {investments.filter(i => i.payment_status === 'partial').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;