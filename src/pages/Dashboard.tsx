import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import { Users, Briefcase, UserCheck, BarChart4, TrendingUp, XCircle, UserPlus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { useData } from '../context/DataContext';
import { format, subDays } from 'date-fns';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { leads, salespeople } = useData();
  
  // Calculate dashboard metrics
  const totalLeads = leads.length;
  const newLeadsThisWeek = leads.filter(lead => {
    const createdAt = new Date(lead.createdAt);
    return createdAt >= subDays(new Date(), 7);
  }).length;
  
  const convertedLeads = leads.filter(lead => lead.status === 'converted').length;
  const lostLeads = leads.filter(lead => lead.status === 'lost').length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0';

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
      id: 'lost-leads',
      title: 'Lost Leads',
      value: lostLeads,
      icon: <XCircle size={24} />,
      color: 'red',
      onClick: () => navigate('/leads?status=lost')
    },
    {
      id: 'conversion',
      title: 'Conversion Rate',
      value: `${conversionRate}%`,
      icon: <TrendingUp size={24} />,
      color: 'yellow',
      onClick: () => navigate('/reports')
    }
  ];

  // Generate weekly lead data
  const weeklyLeadData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    const count = leads.filter(lead => {
      const createdAt = new Date(lead.createdAt);
      return format(createdAt, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    }).length;

    return {
      date: format(date, 'MMM dd'),
      count
    };
  }).reverse();

  // Generate funnel data
  const funnelData = [
    { stage: 'New', value: leads.filter(l => l.status === 'new').length },
    { stage: 'Contacted', value: leads.filter(l => l.status === 'contacted').length },
    { stage: 'Qualified', value: leads.filter(l => l.status === 'qualified').length },
    { stage: 'Converted', value: leads.filter(l => l.status === 'converted').length }
  ];

  // Sort salespeople by performance
  const topSalespeople = [...salespeople]
    .sort((a, b) => (b.performance?.conversionRate || 0) - (a.performance?.conversionRate || 0))
    .slice(0, 5);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Welcome to ZownLead CRM</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Weekly Lead Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyLeadData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" name="Leads" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Conversion Funnel</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Top Performing Salespeople</h3>
          <div className="space-y-4">
            {topSalespeople.map((person, index) => (
              <div key={person.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    {person.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{person.name}</p>
                    <p className="text-sm text-gray-500">{person.performance?.leadsConverted || 0} leads converted</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-indigo-600">{person.performance?.conversionRate || 0}%</p>
                  <p className="text-sm text-gray-500">conversion rate</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {leads.slice(0, 5).map((lead) => (
              <div key={lead.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Users size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    New lead added: {lead.firstName} {lead.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{format(new Date(lead.createdAt), 'MMM dd, yyyy')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;