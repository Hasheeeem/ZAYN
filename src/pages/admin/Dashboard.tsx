import { useEffect, useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell
} from 'recharts';
import { 
  Users, TrendingUp, Activity, UserCheck, 
  Clock, AlertTriangle, CheckCircle, Database
} from 'lucide-react';

interface DashboardData {
  totalLeads: number;
  convertedLeads: number;
  activeSalesUsers: number;
  monthlyConversionRate: number;
  leadsBySource: Array<{ source: string; count: number }>;
  monthlyLeadTrend: Array<{ month: string; leads: number; conversions: number }>;
  recentActivity: Array<{
    id: number;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3001/dashboard');
        const dashboardData = await response.json();
        setData(dashboardData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading dashboard data. Please try again later.
      </div>
    );
  }
  
  const COLORS = ['#2563EB', '#4F46E5', '#7C3AED', '#DB2777', '#F59E0B'];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Overview of your lead management system</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stats-card">
          <div className="flex justify-between items-center">
            <span className="stats-label">Total Leads</span>
            <Database className="h-6 w-6 text-primary-500" />
          </div>
          <span className="stats-value">{data.totalLeads}</span>
          <div className="mt-2 text-sm text-gray-500">
            <span className="text-green-500 font-medium">+5%</span> from last month
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex justify-between items-center">
            <span className="stats-label">Converted Leads</span>
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
          <span className="stats-value">{data.convertedLeads}</span>
          <div className="mt-2 text-sm text-gray-500">
            <span className="text-green-500 font-medium">+8%</span> from last month
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex justify-between items-center">
            <span className="stats-label">Active Sales Users</span>
            <UserCheck className="h-6 w-6 text-blue-500" />
          </div>
          <span className="stats-value">{data.activeSalesUsers}</span>
          <div className="mt-2 text-sm text-gray-500">No change from last month</div>
        </div>
        
        <div className="stats-card">
          <div className="flex justify-between items-center">
            <span className="stats-label">Conversion Rate</span>
            <TrendingUp className="h-6 w-6 text-accent-500" />
          </div>
          <span className="stats-value">{data.monthlyConversionRate}%</span>
          <div className="mt-2 text-sm text-gray-500">
            <span className="text-green-500 font-medium">+3%</span> from last month
          </div>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Lead Trend */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Lead Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.monthlyLeadTrend}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke="#2563EB"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="conversions"
                  stroke="#10B981"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Lead Sources */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Sources</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.leadsBySource}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="source"
                  label={({ source, count }) => `${source}: ${count}`}
                >
                  {data.leadsBySource.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="flow-root">
          <ul className="-mb-8">
            {data.recentActivity.map((activity, activityIdx) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {activityIdx !== data.recentActivity.length - 1 ? (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-primary-50 text-primary-700">
                        {activity.type === 'New Lead' && <Database className="h-5 w-5" />}
                        {activity.type === 'Conversion' && <CheckCircle className="h-5 w-5" />}
                        {activity.type === 'User Activity' && <Users className="h-5 w-5" />}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-900">{activity.description}</p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        <time dateTime={activity.timestamp}>
                          {new Date(activity.timestamp).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                          })}
                        </time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <button className="btn btn-primary w-full flex items-center justify-center">
          <Database className="mr-2 h-5 w-5" />
          Add New Lead
        </button>
        <button className="btn btn-primary w-full flex items-center justify-center">
          <Users className="mr-2 h-5 w-5" />
          Add New User
        </button>
        <button className="btn btn-primary w-full flex items-center justify-center">
          <Activity className="mr-2 h-5 w-5" />
          View Reports
        </button>
      </div>
    </div>
  );
};

export default Dashboard;