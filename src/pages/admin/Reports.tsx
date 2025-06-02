import { useState } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell
} from 'recharts';
import { Download, Calendar, Filter } from 'lucide-react';

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    from: '2023-01-01',
    to: '2023-06-30',
  });

  // Sample data for reports
  const conversionData = [
    { name: 'Jan', rate: 42 },
    { name: 'Feb', rate: 45 },
    { name: 'Mar', rate: 48 },
    { name: 'Apr', rate: 46 },
    { name: 'May', rate: 52 },
    { name: 'Jun', rate: 58 },
  ];

  const sourceData = [
    { name: 'Website', value: 42 },
    { name: 'Referral', value: 28 },
    { name: 'Email Campaign', value: 19 },
    { name: 'Trade Show', value: 15 },
    { name: 'Google Ads', value: 20 },
  ];

  const userPerformanceData = [
    { name: 'John Doe', leads: 28, conversions: 12 },
    { name: 'Jane Smith', leads: 24, conversions: 14 },
    { name: 'Alex Taylor', leads: 32, conversions: 18 },
    { name: 'Sarah Wilson', leads: 19, conversions: 8 },
    { name: 'Robert Brown', leads: 21, conversions: 9 },
  ];

  const trendData = [
    { month: 'Jan', newLeads: 35, expiring: 18, registered: 20, flagged: 5, expired: 10 },
    { month: 'Feb', newLeads: 38, expiring: 16, registered: 22, flagged: 4, expired: 12 },
    { month: 'Mar', newLeads: 42, expiring: 20, registered: 25, flagged: 6, expired: 8 },
    { month: 'Apr', newLeads: 50, expiring: 22, registered: 28, flagged: 4, expired: 10 },
    { month: 'May', newLeads: 45, expiring: 24, registered: 30, flagged: 8, expired: 12 },
    { month: 'Jun', newLeads: 55, expiring: 28, registered: 32, flagged: 6, expired: 15 },
  ];

  const COLORS = ['#2563EB', '#F59E0B', '#10B981', '#6B7280', '#EF4444'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500">Analyze performance metrics and trends</p>
        </div>
        <div className="flex space-x-2">
          <button className="btn btn-secondary flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Custom Date Range
          </button>
          <button className="btn btn-primary flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Export Reports
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="form-label">From Date</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={e => setDateRange({ ...dateRange, from: e.target.value })}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">To Date</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={e => setDateRange({ ...dateRange, to: e.target.value })}
              className="form-input"
            />
          </div>
          <div className="flex items-end">
            <button className="btn btn-primary flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {/* Conversion Rate Trend */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Rate Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={conversionData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" />
              <YAxis
                label={{ value: 'Conversion Rate (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#2563EB"
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lead Source Analysis & User Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Source Analysis */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Source Analysis</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Performance */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales User Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={userPerformanceData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="leads" fill="#2563EB" name="Total Leads" />
                <Bar dataKey="conversions" fill="#10B981" name="Conversions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Status Trends */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Status Trends</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={trendData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="newLeads" stackId="a" fill="#2563EB" name="New" />
              <Bar dataKey="expiring" stackId="a" fill="#F59E0B" name="Expiring" />
              <Bar dataKey="registered" stackId="a" fill="#10B981" name="Registered" />
              <Bar dataKey="flagged" stackId="a" fill="#6B7280" name="Flagged" />
              <Bar dataKey="expired" stackId="a" fill="#EF4444" name="Expired" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card hover:shadow-lg transition-shadow duration-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Lead Conversion Report</h3>
          <p className="text-gray-500 mb-4">Detailed analysis of lead conversions over time</p>
          <button className="btn btn-primary w-full">Export PDF</button>
        </div>
        
        <div className="card hover:shadow-lg transition-shadow duration-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Sales Performance Report</h3>
          <p className="text-gray-500 mb-4">Individual sales user performance metrics</p>
          <button className="btn btn-primary w-full">Export PDF</button>
        </div>
        
        <div className="card hover:shadow-lg transition-shadow duration-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Source Analysis Report</h3>
          <p className="text-gray-500 mb-4">Breakdown of lead sources and effectiveness</p>
          <button className="btn btn-primary w-full">Export PDF</button>
        </div>
      </div>
    </div>
  );
};

export default Reports;