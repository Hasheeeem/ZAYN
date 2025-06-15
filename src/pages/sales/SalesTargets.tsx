import React, { useState } from 'react';
import { Target, TrendingUp, Calendar, Award, AlertCircle, CheckCircle, DollarSign, Users } from 'lucide-react';
import StatCard from '../../components/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { format, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subMonths } from 'date-fns';

interface SalesTarget {
  id: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  target: number;
  achieved: number;
  deadline: string;
  status: 'on-track' | 'behind' | 'exceeded' | 'completed';
  description: string;
  revenue: number;
  targetRevenue: number;
}

const SalesTargets: React.FC = () => {
  const { leads } = useData();
  const { authState } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

  // Filter leads assigned to current sales user
  const myLeads = leads.filter(lead => lead.assignedTo === authState.user?.id.toString());
  const convertedLeads = myLeads.filter(lead => lead.status === 'converted');
  const totalRevenue = convertedLeads.reduce((sum, lead) => sum + lead.price, 0);

  // Comprehensive targets data
  const targets: SalesTarget[] = [
    {
      id: 1,
      period: 'monthly',
      target: 15,
      achieved: convertedLeads.length,
      deadline: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
      status: convertedLeads.length >= 15 ? 'exceeded' : convertedLeads.length >= 12 ? 'on-track' : 'behind',
      description: 'Monthly lead conversion target',
      revenue: totalRevenue,
      targetRevenue: 150000
    },
    {
      id: 2,
      period: 'quarterly',
      target: 45,
      achieved: convertedLeads.length,
      deadline: format(endOfQuarter(new Date()), 'yyyy-MM-dd'),
      status: convertedLeads.length >= 45 ? 'exceeded' : convertedLeads.length >= 35 ? 'on-track' : 'behind',
      description: 'Quarterly lead conversion target',
      revenue: totalRevenue,
      targetRevenue: 450000
    },
    {
      id: 3,
      period: 'yearly',
      target: 180,
      achieved: convertedLeads.length,
      deadline: format(endOfYear(new Date()), 'yyyy-MM-dd'),
      status: convertedLeads.length >= 180 ? 'exceeded' : convertedLeads.length >= 140 ? 'on-track' : 'behind',
      description: 'Annual lead conversion target',
      revenue: totalRevenue,
      targetRevenue: 1800000
    }
  ];

  // Historical performance data
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = subMonths(new Date(), 11 - i);
    const baseTarget = 15;
    const baseAchieved = Math.floor(Math.random() * 8) + 10;
    
    return {
      month: format(month, 'MMM'),
      target: baseTarget,
      achieved: i === 11 ? convertedLeads.length : baseAchieved,
      revenue: i === 11 ? totalRevenue : (baseAchieved * 8000) + Math.floor(Math.random() * 20000)
    };
  });

  const weeklyData = Array.from({ length: 4 }, (_, i) => ({
    week: `Week ${i + 1}`,
    target: Math.floor(15 / 4),
    achieved: Math.floor(Math.random() * 6) + 2,
    revenue: (Math.floor(Math.random() * 6) + 2) * 8000
  }));

  // Performance by lead source
  const sourcePerformance = [
    { source: 'Website', leads: myLeads.filter(l => l.source === 'website').length, converted: convertedLeads.filter(l => l.source === 'website').length },
    { source: 'Referral', leads: myLeads.filter(l => l.source === 'referral').length, converted: convertedLeads.filter(l => l.source === 'referral').length },
    { source: 'Call', leads: myLeads.filter(l => l.source === 'call').length, converted: convertedLeads.filter(l => l.source === 'call').length },
    { source: 'Other', leads: myLeads.filter(l => l.source === 'other').length, converted: convertedLeads.filter(l => l.source === 'other').length }
  ];

  const currentTarget = targets.find(t => t.period === selectedPeriod);
  const progressPercentage = currentTarget ? (currentTarget.achieved / currentTarget.target) * 100 : 0;
  const revenueProgressPercentage = currentTarget ? (currentTarget.revenue / currentTarget.targetRevenue) * 100 : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeded':
        return 'text-green-600 bg-green-100';
      case 'on-track':
        return 'text-blue-600 bg-blue-100';
      case 'behind':
        return 'text-red-600 bg-red-100';
      case 'completed':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'exceeded':
      case 'completed':
        return <CheckCircle size={16} />;
      case 'on-track':
        return <TrendingUp size={16} />;
      case 'behind':
        return <AlertCircle size={16} />;
      default:
        return <Target size={16} />;
    }
  };

  const targetStats = [
    {
      title: 'Current Target',
      value: currentTarget?.target || 0,
      icon: <Target size={24} />,
      color: 'blue'
    },
    {
      title: 'Achieved',
      value: currentTarget?.achieved || 0,
      icon: <CheckCircle size={24} />,
      color: 'green'
    },
    {
      title: 'Progress',
      value: `${Math.round(progressPercentage)}%`,
      icon: <TrendingUp size={24} />,
      color: 'purple'
    },
    {
      title: 'Revenue',
      value: `$${(currentTarget?.revenue || 0).toLocaleString()}`,
      icon: <DollarSign size={24} />,
      color: 'yellow'
    }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Sales Targets</h2>
          <p className="text-gray-600">Track your progress towards sales goals</p>
        </div>
        <div className="flex gap-2">
          {(['monthly', 'quarterly', 'yearly'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-indigo-50'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Target Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {targetStats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Progress Overview
        </h3>
        
        {currentTarget && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">{currentTarget.description}</p>
                <p className="text-xs text-gray-500">
                  Deadline: {format(new Date(currentTarget.deadline), 'MMMM dd, yyyy')}
                </p>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentTarget.status)}`}>
                {getStatusIcon(currentTarget.status)}
                {currentTarget.status.replace('-', ' ').toUpperCase()}
              </div>
            </div>
            
            {/* Leads Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Leads Converted</span>
                <span className="text-sm text-gray-600">{currentTarget.achieved} / {currentTarget.target}</span>
              </div>
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all duration-500 ${
                      progressPercentage >= 100 ? 'bg-green-500' :
                      progressPercentage >= 80 ? 'bg-blue-500' :
                      progressPercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
                <div className="text-center text-sm font-medium text-gray-700 mt-1">
                  {Math.round(progressPercentage)}% Complete
                </div>
              </div>
            </div>

            {/* Revenue Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Revenue Target</span>
                <span className="text-sm text-gray-600">
                  ${currentTarget.revenue.toLocaleString()} / ${currentTarget.targetRevenue.toLocaleString()}
                </span>
              </div>
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all duration-500 ${
                      revenueProgressPercentage >= 100 ? 'bg-green-500' :
                      revenueProgressPercentage >= 80 ? 'bg-blue-500' :
                      revenueProgressPercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(revenueProgressPercentage, 100)}%` }}
                  />
                </div>
                <div className="text-center text-sm font-medium text-gray-700 mt-1">
                  {Math.round(revenueProgressPercentage)}% Complete
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Performance Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="target" name="Target" fill="#e5e7eb" />
                <Bar dataKey="achieved" name="Achieved" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Revenue Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Performance by Source</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourcePerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="leads" name="Total Leads" fill="#e5e7eb" />
                <Bar dataKey="converted" name="Converted" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Conversion Rate by Source</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourcePerformance.map(item => ({
                    name: item.source,
                    value: item.leads > 0 ? Math.round((item.converted / item.leads) * 100) : 0
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sourcePerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Conversion Rate']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* All Targets Overview */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">All Targets Overview</h3>
        <div className="space-y-4">
          {targets.map((target) => (
            <div key={target.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-gray-800 capitalize">{target.period} Target</h4>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(target.status)}`}>
                      {getStatusIcon(target.status)}
                      {target.status.replace('-', ' ')}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{target.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Leads: </span>
                      <span className="font-medium">{target.achieved}/{target.target}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Revenue: </span>
                      <span className="font-medium">${target.revenue.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Target Revenue: </span>
                      <span className="font-medium">${target.targetRevenue.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Deadline: </span>
                      <span className="font-medium">{format(new Date(target.deadline), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-2xl font-bold text-indigo-600">
                    {Math.round((target.achieved / target.target) * 100)}%
                  </div>
                  <div className="text-xs text-gray-500">Complete</div>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Leads Progress</span>
                    <span>{Math.round((target.achieved / target.target) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        (target.achieved / target.target) * 100 >= 100 ? 'bg-green-500' :
                        (target.achieved / target.target) * 100 >= 80 ? 'bg-blue-500' :
                        (target.achieved / target.target) * 100 >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((target.achieved / target.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Revenue Progress</span>
                    <span>{Math.round((target.revenue / target.targetRevenue) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        (target.revenue / target.targetRevenue) * 100 >= 100 ? 'bg-green-500' :
                        (target.revenue / target.targetRevenue) * 100 >= 80 ? 'bg-blue-500' :
                        (target.revenue / target.targetRevenue) * 100 >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((target.revenue / target.targetRevenue) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="text-blue-600" size={24} />
              <h4 className="font-medium text-blue-800">Best Performing Source</h4>
            </div>
            <p className="text-blue-700">
              {sourcePerformance.reduce((best, current) => 
                (current.leads > 0 && current.converted / current.leads) > (best.leads > 0 ? best.converted / best.leads : 0) ? current : best
              ).source} with {Math.round((sourcePerformance.reduce((best, current) => 
                (current.leads > 0 && current.converted / current.leads) > (best.leads > 0 ? best.converted / best.leads : 0) ? current : best
              ).converted / sourcePerformance.reduce((best, current) => 
                (current.leads > 0 && current.converted / current.leads) > (best.leads > 0 ? best.converted / best.leads : 0) ? current : best
              ).leads) * 100)}% conversion rate
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="text-green-600" size={24} />
              <h4 className="font-medium text-green-800">Average Deal Size</h4>
            </div>
            <p className="text-green-700">
              ${convertedLeads.length > 0 ? Math.round(totalRevenue / convertedLeads.length).toLocaleString() : 0} per converted lead
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-purple-600" size={24} />
              <h4 className="font-medium text-purple-800">Conversion Rate</h4>
            </div>
            <p className="text-purple-700">
              {myLeads.length > 0 ? Math.round((convertedLeads.length / myLeads.length) * 100) : 0}% overall conversion rate
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesTargets;