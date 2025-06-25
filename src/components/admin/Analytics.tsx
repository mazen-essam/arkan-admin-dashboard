
import React from 'react';
import { TrendingUp, Eye, Clock, Users } from 'lucide-react';
import StatCard from '../StatCard';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const trafficData = [
  { name: 'Organic Search', value: 45, color: '#3B82F6' },
  { name: 'Direct', value: 25, color: '#10B981' },
  { name: 'Social Media', value: 20, color: '#F59E0B' },
  { name: 'Referral', value: 10, color: '#EF4444' },
];

const pageViewsData = [
  { date: '1/1', views: 2400 },
  { date: '1/2', views: 1398 },
  { date: '1/3', views: 9800 },
  { date: '1/4', views: 3908 },
  { date: '1/5', views: 4800 },
  { date: '1/6', views: 3800 },
  { date: '1/7', views: 4300 },
];

const Analytics: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Track your website performance and user engagement.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Page Views"
          value="28,492"
          change="+15% from last week"
          changeType="positive"
          icon={Eye}
        />
        <StatCard
          title="Unique Visitors"
          value="8,342"
          change="+8% from last week"
          changeType="positive"
          icon={Users}
        />
        <StatCard
          title="Avg. Session Duration"
          value="3m 24s"
          change="-2% from last week"
          changeType="negative"
          icon={Clock}
        />
        <StatCard
          title="Bounce Rate"
          value="42.3%"
          change="-5% from last week"
          changeType="positive"
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trafficData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {trafficData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {trafficData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Page Views Trend */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Page Views Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pageViewsData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorViews)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Pages */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Pages</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              { page: '/dashboard', views: '5,234', percentage: '18.4%' },
              { page: '/users', views: '4,123', percentage: '14.5%' },
              { page: '/analytics', views: '3,567', percentage: '12.5%' },
              { page: '/settings', views: '2,891', percentage: '10.2%' },
              { page: '/login', views: '2,456', percentage: '8.6%' },
            ].map((page, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{page.page}</p>
                  <p className="text-sm text-gray-500">{page.views} views</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{page.percentage}</p>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: page.percentage }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
