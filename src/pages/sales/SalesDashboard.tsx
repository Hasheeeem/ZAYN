import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/StatCard';
import { Users, Target, TrendingUp, Calendar, DollarSign, Mail } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';

const SalesDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { leads } = useData();
  const { authState } = useAuth();
  
  // Filter leads assigned to current sales user
  const myLeads = leads.filter(lead => lead.assignedTo === authState.user?.id.toString());
  
  // Calculate real metrics from database
  const totalLeads = myLeads.length;
  const newLeads = myLeads.filter(lead => lead.status === 'new').length;
  const contactedLeads = myLeads.filter(lead => lead.status === 'contacted').length;
  const qualifiedLeads = myLeads.filter(lead => lead.status === 'qualified').length;
  const convertedLeads = myLeads.filter(lead => lead.status === 'converted').length;
  const lostLeads = myLeads.filter(lead => lead.status === 'lost').length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0';
  const totalRevenue = myLeads.filter(l => l.status === 'converted').reduce((sum, lead) => sum + (lead.pricePaid || lead.price || 0), 0);
  const avgDealSize = convertedLeads > 0 ? (totalRevenue / convertedLeads).toFixed(0) : '0';
  
  // This week's performance from real data
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const thisWeekLeads = myLeads.filter(lead => {
    const createdAt = new Date(lead.createdAt);
    return createdAt >= weekStart && createdAt <= weekEnd;
  });
  
  // Weekly performance data from real leads
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    const dayLeads = myLeads.filter(lead => {
      const createdAt = new Date(lead.createdAt);
      return format(createdAt, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    });

    return {
      date: format(date, 'EEE'),
      leads: dayLeads.length,
      converted: dayLeads.filter(l => l.status === 'converted').length,
      contacted: dayLeads.filter(l => l.status === 'contacted').length,
      revenue: dayLeads.filter(l => l.status === 'converted').reduce((sum, lead) => sum + (lead.pricePaid || lead.price || 0), 0)
    };
  }).reverse();

  // Lead status distribution from real data
  const statusData = [
    { name: 'New', value: newLeads, color: '#10B981' },
    { name: 'Contacted', value: contactedLeads, color: '#F59E0B' },
    { name: 'Qualified', value: qualifiedLeads, color: '#3B82F6' },
    { name: 'Converted', value: convertedLeads, color: '#8B5CF6' },
    { name: 'Lost', value: lostLeads, color: '#EF4444' }
  ];

  // Lead source performance from real data
  const sourceData = [
    {
      source: 'Website',
      leads: myLeads.filter(l => l.source === 'website').length,
      converted: myLeads.filter(l => l.source === 'website' && l.status === 'converted').length,
      revenue: myLeads.filter(l => l.source === 'website' && l.status === 'converted').reduce((sum, lead) => sum + (lead.pricePaid || lead.price || 0), 0)
    },
    {
      source: 'Referral',
      leads: myLeads.filter(l => l.source === 'referral').length,
      converted: myLeads.filter(l => l.source === 'referral' && l.status === 'converted').length,
      revenue: myLeads.filter(l => l.source === 'referral' && l.status === 'converted').reduce((sum, lead) => sum + (lead.pricePaid || lead.price || 0), 0)
    },
    {
      source: 'Call',
      leads: myLeads.filter(l => l.source === 'call').length,
      converted: myLeads.filter(l => l.source === 'call' && l.status === 'converted').length,
      revenue: myLeads.filter(l => l.source === 'call' && l.status === 'converted').reduce((sum, lead) => sum + (lead.pricePaid || lead.price || 0), 0)
    },
    {
      source: 'Other',
      leads: myLeads.filter(l => l.source === 'other').length,
      converted: myLeads.filter(l => l.source === 'other' && l.status === 'converted').length,
      revenue: myLeads.filter(l => l.source === 'other' && l.status === 'converted').reduce((sum, lead) => sum + (lead.pricePaid || lead.price || 0), 0)
    }
  ];

  // Recent leads from database
  const recentLeads = myLeads
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const dashboardStats = [
    {
      title: 'My Total Leads',
      value: totalLeads,
      icon: <Users size={24} />,
      color: 'blue',
      onClick: () => navigate('/sales/leads')
    },
    {
      title: 'New Leads',
      value: newLeads,
      icon: <Target size={24} />,
      color: 'green',
      onClick: () => navigate('/sales/leads?status=new')
    },
    {
      title: 'Converted',
      value: convertedLeads,
      icon: <Target size={24} />,
      color: 'purple',
      onClick: () => navigate('/sales/leads?status=converted')
    },
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      icon: <DollarSign size={24} />,
      color: 'yellow',
      onClick: () => navigate('/sales/leads')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Welcome back, {authState.user?.name}!</h2>
            <p className="mt-1 opacity-90">Here's your sales performance overview for {format(new Date(), 'MMMM dd, yyyy')}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{conversionRate}%</div>
            <div className="text-sm opacity-80">Conversion Rate</div>
          </div>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <div key={index} onClick={stat.onClick} className="cursor-pointer transform hover:scale-105 transition-transform">
            <StatCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          </div>
        ))}
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">This Week</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{thisWeekLeads.length}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-500">New leads this week</span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Conversion Rate</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{conversionRate}%</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-500">Overall performance</span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Target className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Average Deal</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">${avgDealSize}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-500">Per conversion</span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <DollarSign className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts Section - Only show if there's data */}
      {myLeads.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Performance */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Weekly Performance</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="leads" name="New Leads" fill="#8884d8" />
                  <Bar dataKey="converted" name="Converted" fill="#82ca9d" />
                  <Bar dataKey="contacted" name="Contacted" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Lead Status Distribution */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Lead Status Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData.filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.filter(item => item.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue by Source - Only show if there's revenue */}
          {totalRevenue > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Revenue by Source</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sourceData.filter(item => item.revenue > 0)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="source" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Daily Revenue Trend - Only show if there's revenue */}
          {totalRevenue > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Daily Revenue Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData.filter(item => item.revenue > 0)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Leads from Database */}
      {recentLeads.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Leads</h3>
          <div className="space-y-4">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                    {(lead.companyRepresentativeName || lead.firstName || 'U').charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {lead.companyRepresentativeName || `${lead.firstName} ${lead.lastName}`}
                    </p>
                    <p className="text-sm text-gray-600">{lead.companyName || lead.domain}</p>
                    <p className="text-xs text-gray-500">{format(new Date(lead.createdAt), 'MMM dd, yyyy')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    lead.status === 'new' ? 'bg-green-100 text-green-800' :
                    lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                    lead.status === 'qualified' ? 'bg-blue-100 text-blue-800' :
                    lead.status === 'converted' ? 'bg-purple-100 text-purple-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {lead.status.toUpperCase()}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    ${lead.pricePaid || lead.price || 0}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data State */}
      {myLeads.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No leads assigned yet</h3>
          <p className="text-gray-500 mb-6">You don't have any leads assigned to you yet. Contact your admin to get started.</p>
          <button
            onClick={() => navigate('/sales/leads')}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Users className="-ml-1 mr-2 h-5 w-5" />
            View Leads
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/sales/leads')}
            className="p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center group"
          >
            <Users className="mx-auto mb-2 text-gray-400 group-hover:text-indigo-600" size={24} />
            <span className="text-sm font-medium text-gray-600 group-hover:text-indigo-600">View All Leads</span>
          </button>
          <button 
            onClick={() => navigate('/sales/calendar')}
            className="p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center group"
          >
            <Calendar className="mx-auto mb-2 text-gray-400 group-hover:text-indigo-600" size={24} />
            <span className="text-sm font-medium text-gray-600 group-hover:text-indigo-600">Calendar</span>
          </button>
          <button 
            onClick={() => navigate('/sales/targets')}
            className="p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center group"
          >
            <Target className="mx-auto mb-2 text-gray-400 group-hover:text-indigo-600" size={24} />
            <span className="text-sm font-medium text-gray-600 group-hover:text-indigo-600">View Targets</span>
          </button>
          <button 
            onClick={() => window.open('mailto:support@zownlead.com')}
            className="p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center group"
          >
            <Mail className="mx-auto mb-2 text-gray-400 group-hover:text-indigo-600" size={24} />
            <span className="text-sm font-medium text-gray-600 group-hover:text-indigo-600">Contact Support</span>
          </button>
        </div>
      </div>

      {/* Performance Summary - Only show if there's data */}
      {myLeads.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Performance Summary</h3>
              <p className="text-gray-600 mt-1">Your current performance metrics</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{convertedLeads}</div>
                <div className="text-sm text-gray-600">Conversions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">${avgDealSize}</div>
                <div className="text-sm text-gray-600">Avg Deal</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{conversionRate}%</div>
                <div className="text-sm text-gray-600">Conv. Rate</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesDashboard;