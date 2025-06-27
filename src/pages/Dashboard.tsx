import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import { Users, UserPlus, CheckCircle, XCircle, TrendingUp, Calendar } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { format, subDays } from 'date-fns';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { leads, managementUsers, salespeople } = useData();
  const { authState } = useAuth();
  
  // Calculate real metrics from database
  const totalLeads = leads.length;
  const newLeadsThisWeek = leads.filter(lead => {
    const createdAt = new Date(lead.createdAt);
    return createdAt >= subDays(new Date(), 7);
  }).length;
  
  const convertedLeads = leads.filter(lead => lead.status === 'converted').length;
  const lostLeads = leads.filter(lead => lead.status === 'lost').length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0';
  const totalUsers = managementUsers.length;
  const activeSalespeople = salespeople.filter(person => person.status === 'active').length;

  const dashboardStats = [
    {
      id: 'total-leads',
      title: 'Total Leads',
      value: totalLeads,
      icon: <Users size={24} />,
      color: 'blue',
      onClick: () => navigate('/leads')
    },
    {
      id: 'new-leads',
      title: 'New This Week',
      value: newLeadsThisWeek,
      icon: <UserPlus size={24} />,
      color: 'green',
      onClick: () => navigate('/leads?status=new')
    },
    {
      id: 'converted-leads',
      title: 'Converted Leads',
      value: convertedLeads,
      icon: <CheckCircle size={24} />,
      color: 'purple',
      onClick: () => navigate('/leads?status=converted')
    },
    {
      id: 'conversion-rate',
      title: 'Conversion Rate',
      value: `${conversionRate}%`,
      icon: <TrendingUp size={24} />,
      color: 'yellow',
      onClick: () => navigate('/reports')
    }
  ];

  // Recent leads from database
  const recentLeads = leads
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Lead status breakdown from real data
  const statusBreakdown = {
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    converted: leads.filter(l => l.status === 'converted').length,
    lost: leads.filter(l => l.status === 'lost').length
  };

  // Source breakdown from real data
  const sourceBreakdown = {
    website: leads.filter(l => l.source === 'website').length,
    referral: leads.filter(l => l.source === 'referral').length,
    call: leads.filter(l => l.source === 'call').length,
    other: leads.filter(l => l.source === 'other').length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Welcome to ZownLead CRM</h2>
          <p className="text-gray-600">Overview of your system performance</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Logged in as</div>
          <div className="font-medium text-gray-800">{authState.user?.name}</div>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map(stat => (
          <div key={stat.id} onClick={stat.onClick} className="cursor-pointer transform hover:scale-105 transition-transform">
            <StatCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          </div>
        ))}
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Status Breakdown */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Lead Status Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">New</span>
              <span className="font-semibold text-green-600">{statusBreakdown.new}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Contacted</span>
              <span className="font-semibold text-yellow-600">{statusBreakdown.contacted}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Qualified</span>
              <span className="font-semibold text-blue-600">{statusBreakdown.qualified}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Converted</span>
              <span className="font-semibold text-purple-600">{statusBreakdown.converted}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Lost</span>
              <span className="font-semibold text-red-600">{statusBreakdown.lost}</span>
            </div>
          </div>
        </div>

        {/* Lead Sources */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Lead Sources</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Website</span>
              <span className="font-semibold text-indigo-600">{sourceBreakdown.website}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Referral</span>
              <span className="font-semibold text-green-600">{sourceBreakdown.referral}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Call</span>
              <span className="font-semibold text-blue-600">{sourceBreakdown.call}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Other</span>
              <span className="font-semibold text-gray-600">{sourceBreakdown.other}</span>
            </div>
          </div>
        </div>

        {/* System Stats */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">System Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Users</span>
              <span className="font-semibold text-indigo-600">{totalUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Salespeople</span>
              <span className="font-semibold text-green-600">{activeSalespeople}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Leads</span>
              <span className="font-semibold text-blue-600">{totalLeads}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Conversion Rate</span>
              <span className="font-semibold text-purple-600">{conversionRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Leads</h3>
        {recentLeads.length > 0 ? (
          <div className="space-y-3">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
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
        ) : (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No leads yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first lead.</p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/leads')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <UserPlus className="-ml-1 mr-2 h-5 w-5" />
                Add Lead
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/leads')}
            className="p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center group"
          >
            <Users className="mx-auto mb-2 text-gray-400 group-hover:text-indigo-600" size={24} />
            <span className="text-sm font-medium text-gray-600 group-hover:text-indigo-600">Manage Leads</span>
          </button>
          <button 
            onClick={() => navigate('/usersettings')}
            className="p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center group"
          >
            <Users className="mx-auto mb-2 text-gray-400 group-hover:text-indigo-600" size={24} />
            <span className="text-sm font-medium text-gray-600 group-hover:text-indigo-600">User Settings</span>
          </button>
          <button 
            onClick={() => navigate('/reports')}
            className="p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center group"
          >
            <TrendingUp className="mx-auto mb-2 text-gray-400 group-hover:text-indigo-600" size={24} />
            <span className="text-sm font-medium text-gray-600 group-hover:text-indigo-600">View Reports</span>
          </button>
          <button 
            onClick={() => navigate('/management')}
            className="p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center group"
          >
            <Calendar className="mx-auto mb-2 text-gray-400 group-hover:text-indigo-600" size={24} />
            <span className="text-sm font-medium text-gray-600 group-hover:text-indigo-600">Management</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;