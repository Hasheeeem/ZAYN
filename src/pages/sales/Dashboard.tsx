import { useEffect, useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer
} from 'recharts';
import { 
  Target, TrendingUp, DollarSign, Users, 
  Clock, CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SalesDashboardData {
  assignedLeads: number;
  convertedLeads: number;
  conversionRate: number;
  revenueGenerated: number;
  targetRevenue: number;
  recentOpportunities: Array<{
    id: number;
    name: string;
    product: string;
    status: string;
    value: number;
  }>;
  monthlyPerformance: Array<{
    month: string;
    actual: number;
    target: number;
  }>;
}

const SalesDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<SalesDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3001/salesDashboard');
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-500"></div>
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
  
  const progressPercentage = Math.round((data.revenueGenerated / data.targetRevenue) * 100);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.username}!</h1>
        <p className="text-gray-500">Here's an overview of your sales performance</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stats-card">
          <div className="flex justify-between items-center">
            <span className="stats-label">Assigned Leads</span>
            <Users className="h-6 w-6 text-accent-500" />
          </div>
          <span className="stats-value">{data.assignedLeads}</span>
          <div className="mt-2 text-sm text-gray-500">
            <span className="text-green-500 font-medium">+2 new</span> since yesterday
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex justify-between items-center">
            <span className="stats-label">Conversion Rate</span>
            <TrendingUp className="h-6 w-6 text-green-500" />
          </div>
          <span className="stats-value">{data.conversionRate}%</span>
          <div className="mt-2 text-sm text-gray-500">
            <span className="text-green-500 font-medium">+5%</span> from last month
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex justify-between items-center">
            <span className="stats-label">Revenue Generated</span>
            <DollarSign className="h-6 w-6 text-green-500" />
          </div>
          <span className="stats-value">${data.revenueGenerated}</span>
          <div className="mt-2 text-sm text-gray-500">
            <span className="text-green-500 font-medium">+$1,200</span> from last month
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex justify-between items-center">
            <span className="stats-label">Converted Leads</span>
            <CheckCircle className="h-6 w-6 text-accent-500" />
          </div>
          <span className="stats-value">{data.convertedLeads}</span>
          <div className="mt-2 text-sm text-gray-500">
            <span className="text-green-500 font-medium">+3</span> from last month
          </div>
        </div>
      </div>
      
      {/* Revenue Target */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Revenue Target</h3>
            <p className="text-sm text-gray-500">Monthly goal progress</p>
          </div>
          <div className="flex items-center">
            <Target className="h-5 w-5 text-accent-500 mr-2" />
            <span className="text-lg font-bold">${data.targetRevenue}</span>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">${data.revenueGenerated} of ${data.targetRevenue}</span>
            <span className="text-sm font-medium text-gray-700">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${
                progressPercentage >= 100
                  ? 'bg-green-500'
                  : progressPercentage >= 70
                  ? 'bg-accent-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Monthly Performance Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.monthlyPerformance}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="actual" name="Actual Revenue" fill="#F59E0B" />
              <Bar dataKey="target" name="Target Revenue" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Recent Opportunities */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Opportunities</h3>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Status</th>
                <th>Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOpportunities.map(opp => (
                <tr key={opp.id}>
                  <td>{opp.id}</td>
                  <td className="font-medium text-gray-900">{opp.name}</td>
                  <td>{opp.product}</td>
                  <td>
                    <span
                      className={`badge ${
                        opp.status === 'New'
                          ? 'badge-new'
                          : opp.status === 'Contacted'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {opp.status}
                    </span>
                  </td>
                  <td>${opp.value}</td>
                  <td>
                    <button className="btn btn-primary text-xs py-1">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-center">
          <a href="/sales/opportunities" className="text-accent-600 hover:text-accent-700 font-medium">
            View All Opportunities →
          </a>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="card hover:shadow-lg transition-shadow duration-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Follow-up Reminders</h3>
          <ul className="space-y-2 mb-4">
            <li className="flex items-center text-sm">
              <Clock className="h-4 w-4 text-accent-500 mr-2" />
              <span>Follow up with Digital Marketing Pro (Tomorrow)</span>
            </li>
            <li className="flex items-center text-sm">
              <Clock className="h-4 w-4 text-accent-500 mr-2" />
              <span>Send proposal to Alex Thompson (Today)</span>
            </li>
            <li className="flex items-center text-sm">
              <Clock className="h-4 w-4 text-accent-500 mr-2" />
              <span>Check renewal status for Wellness Center (Friday)</span>
            </li>
          </ul>
          <button className="btn btn-secondary w-full">View All Reminders</button>
        </div>
        
        <div className="card hover:shadow-lg transition-shadow duration-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly Goals</h3>
          <ul className="space-y-3 mb-4">
            <li>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Lead Contacts (15/20)</span>
                <span className="text-sm font-medium text-gray-700">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="h-2.5 rounded-full bg-accent-500" style={{ width: '75%' }}></div>
              </div>
            </li>
            <li>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Conversions (8/12)</span>
                <span className="text-sm font-medium text-gray-700">67%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="h-2.5 rounded-full bg-accent-500" style={{ width: '67%' }}></div>
              </div>
            </li>
            <li>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Revenue ($9,500/$12,000)</span>
                <span className="text-sm font-medium text-gray-700">79%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="h-2.5 rounded-full bg-accent-500" style={{ width: '79%' }}></div>
              </div>
            </li>
          </ul>
          <button className="btn btn-secondary w-full">View Performance Details</button>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;