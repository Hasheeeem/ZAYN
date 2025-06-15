import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/StatCard';
import { Users, Target, TrendingUp, Calendar, Phone, Mail, CheckCircle, Clock, DollarSign, Award, AlertTriangle, Star } from 'lucide-react';
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
  
  // Calculate comprehensive sales metrics
  const totalLeads = myLeads.length;
  const newLeads = myLeads.filter(lead => lead.status === 'new').length;
  const contactedLeads = myLeads.filter(lead => lead.status === 'contacted').length;
  const qualifiedLeads = myLeads.filter(lead => lead.status === 'qualified').length;
  const convertedLeads = myLeads.filter(lead => lead.status === 'converted').length;
  const lostLeads = myLeads.filter(lead => lead.status === 'lost').length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0';
  const totalRevenue = myLeads.filter(l => l.status === 'converted').reduce((sum, lead) => sum + lead.price, 0);
  const avgDealSize = convertedLeads > 0 ? (totalRevenue / convertedLeads).toFixed(0) : '0';
  
  // This week's performance
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const thisWeekLeads = myLeads.filter(lead => {
    const createdAt = new Date(lead.createdAt);
    return createdAt >= weekStart && createdAt <= weekEnd;
  });
  
  // Weekly performance data
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
      revenue: dayLeads.filter(l => l.status === 'converted').reduce((sum, lead) => sum + lead.price, 0)
    };
  }).reverse();

  // Lead status distribution
  const statusData = [
    { name: 'New', value: newLeads, color: '#10B981' },
    { name: 'Contacted', value: contactedLeads, color: '#F59E0B' },
    { name: 'Qualified', value: qualifiedLeads, color: '#3B82F6' },
    { name: 'Converted', value: convertedLeads, color: '#8B5CF6' },
    { name: 'Lost', value: lostLeads, color: '#EF4444' }
  ];

  // Lead source performance
  const sourceData = [
    {
      source: 'Website',
      leads: myLeads.filter(l => l.source === 'website').length,
      converted: myLeads.filter(l => l.source === 'website' && l.status === 'converted').length,
      revenue: myLeads.filter(l => l.source === 'website' && l.status === 'converted').reduce((sum, lead) => sum + lead.price, 0)
    },
    {
      source: 'Referral',
      leads: myLeads.filter(l => l.source === 'referral').length,
      converted: myLeads.filter(l => l.source === 'referral' && l.status === 'converted').length,
      revenue: myLeads.filter(l => l.source === 'referral' && l.status === 'converted').reduce((sum, lead) => sum + lead.price, 0)
    },
    {
      source: 'Call',
      leads: myLeads.filter(l => l.source === 'call').length,
      converted: myLeads.filter(l => l.source === 'call' && l.status === 'converted').length,
      revenue: myLeads.filter(l => l.source === 'call' && l.status === 'converted').reduce((sum, lead) => sum + lead.price, 0)
    },
    {
      source: 'Other',
      leads: myLeads.filter(l => l.source === 'other').length,
      converted: myLeads.filter(l => l.source === 'other' && l.status === 'converted').length,
      revenue: myLeads.filter(l => l.source === 'other' && l.status === 'converted').reduce((sum, lead) => sum + lead.price, 0)
    }
  ];

  // Recent activities with more detail
  const recentActivities = [
    { 
      id: 1, 
      type: 'conversion', 
      description: 'Successfully converted TechStartup.com', 
      time: '2 hours ago', 
      icon: <CheckCircle size={16} />,
      value: '$4,500',
      priority: 'high'
    },
    { 
      id: 2, 
      type: 'call', 
      description: 'Follow-up call with E-commerce Pro completed', 
      time: '4 hours ago', 
      icon: <Phone size={16} />,
      value: '$7,200',
      priority: 'medium'
    },
    { 
      id: 3, 
      type: 'email', 
      description: 'Proposal sent to Fintech Solutions', 
      time: '6 hours ago', 
      icon: <Mail size={16} />,
      value: '$12,500',
      priority: 'high'
    },
    { 
      id: 4, 
      type: 'meeting', 
      description: 'Demo scheduled with AI Consulting', 
      time: '1 day ago', 
      icon: <Calendar size={16} />,
      value: '$15,000',
      priority: 'high'
    },
    { 
      id: 5, 
      type: 'qualification', 
      description: 'Green Energy lead qualified', 
      time: '1 day ago', 
      icon: <Target size={16} />,
      value: '$18,500',
      priority: 'medium'
    }
  ];

  // Today's tasks with priorities
  const todaysTasks = [
    { 
      id: 1, 
      task: 'Follow up with TechStartup.com decision', 
      priority: 'high', 
      time: '10:00 AM',
      type: 'follow-up',
      leadValue: '$4,500'
    },
    { 
      id: 2, 
      task: 'Send contract to HealthTech App', 
      priority: 'high', 
      time: '11:30 AM',
      type: 'contract',
      leadValue: '$8,900'
    },
    { 
      id: 3, 
      task: 'Demo call with Blockchain Dev', 
      priority: 'medium', 
      time: '2:00 PM',
      type: 'demo',
      leadValue: '$22,000'
    },
    { 
      id: 4, 
      task: 'Proposal preparation for EdTech Platform', 
      priority: 'medium', 
      time: '3:30 PM',
      type: 'proposal',
      leadValue: '$11,200'
    },
    { 
      id: 5, 
      task: 'Update CRM with call notes', 
      priority: 'low', 
      time: '5:00 PM',
      type: 'admin',
      leadValue: ''
    }
  ];

  // Upcoming meetings
  const upcomingMeetings = [
    {
      id: 1,
      title: 'Product Demo - AI Consulting',
      time: 'Today 3:00 PM',
      type: 'demo',
      client: 'Emily Davis',
      value: '$15,000'
    },
    {
      id: 2,
      title: 'Follow-up Call - Green Energy',
      time: 'Tomorrow 10:00 AM',
      type: 'call',
      client: 'Robert Miller',
      value: '$18,500'
    },
    {
      id: 3,
      title: 'Contract Review - Food Delivery',
      time: 'Tomorrow 2:00 PM',
      type: 'meeting',
      client: 'Lisa Anderson',
      value: '$9,800'
    }
  ];

  // Performance insights
  const performanceInsights = [
    {
      title: 'This Week Performance',
      value: `${thisWeekLeads.length} leads`,
      change: '+15%',
      trend: 'up',
      description: 'vs last week'
    },
    {
      title: 'Conversion Trend',
      value: `${conversionRate}%`,
      change: '+3.2%',
      trend: 'up',
      description: 'vs last month'
    },
    {
      title: 'Pipeline Value',
      value: `$${(qualifiedLeads * parseInt(avgDealSize)).toLocaleString()}`,
      change: '+8.5%',
      trend: 'up',
      description: 'qualified leads'
    }
  ];

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
      icon: <CheckCircle size={24} />,
      color: 'purple',
      onClick: () => navigate('/sales/leads?status=converted')
    },
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      icon: <DollarSign size={24} />,
      color: 'yellow',
      onClick: () => navigate('/sales/reports')
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

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {performanceInsights.map((insight, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-600">{insight.title}</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{insight.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${
                    insight.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {insight.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">{insight.description}</span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${
                insight.trend === 'up' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <TrendingUp className={`${
                  insight.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`} size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Charts Section */}
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
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Source */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Revenue by Source</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sourceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Revenue Trend */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibent text-gray-700 mb-4">Daily Revenue Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity and Tasks Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.priority === 'high' ? 'bg-red-100 text-red-600' :
                  activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{activity.description}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">{activity.time}</p>
                    <span className="text-xs font-semibold text-green-600">{activity.value}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Today's Tasks */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Today's Tasks</h3>
          <div className="space-y-3">
            {todaysTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    task.type === 'follow-up' ? 'bg-blue-100 text-blue-600' :
                    task.type === 'demo' ? 'bg-purple-100 text-purple-600' :
                    task.type === 'contract' ? 'bg-green-100 text-green-600' :
                    task.type === 'proposal' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{task.task}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500">{task.time}</p>
                      {task.leadValue && (
                        <span className="text-xs font-semibold text-green-600">{task.leadValue}</span>
                      )}
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  task.priority === 'high' ? 'bg-red-100 text-red-800' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Upcoming Meetings</h3>
          <div className="space-y-4">
            {upcomingMeetings.map((meeting) => (
              <div key={meeting.id} className="border-l-4 border-indigo-500 pl-4 py-2">
                <h4 className="font-medium text-gray-800">{meeting.title}</h4>
                <p className="text-sm text-gray-600">{meeting.client}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">{meeting.time}</span>
                  <span className="text-xs font-semibold text-green-600">{meeting.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
            <span className="text-sm font-medium text-gray-600 group-hover:text-indigo-600">Schedule Meeting</span>
          </button>
          <button 
            onClick={() => navigate('/sales/targets')}
            className="p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center group"
          >
            <Target className="mx-auto mb-2 text-gray-400 group-hover:text-indigo-600" size={24} />
            <span className="text-sm font-medium text-gray-600 group-hover:text-indigo-600">View Targets</span>
          </button>
          <button 
            onClick={() => navigate('/sales/reports')}
            className="p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center group"
          >
            <TrendingUp className="mx-auto mb-2 text-gray-400 group-hover:text-indigo-600" size={24} />
            <span className="text-sm font-medium text-gray-600 group-hover:text-indigo-600">View Reports</span>
          </button>
          <button 
            onClick={() => navigate('/sales/profile')}
            className="p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center group"
          >
            <Star className="mx-auto mb-2 text-gray-400 group-hover:text-indigo-600" size={24} />
            <span className="text-sm font-medium text-gray-600 group-hover:text-indigo-600">My Profile</span>
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

      {/* Performance Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Performance Summary</h3>
            <p className="text-gray-600 mt-1">You're performing excellently this month!</p>
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
    </div>
  );
};

export default SalesDashboard;