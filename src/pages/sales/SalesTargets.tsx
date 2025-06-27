import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, DollarSign, Users, AlertCircle } from 'lucide-react';
import StatCard from '../../components/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { format, subMonths } from 'date-fns';

const SalesTargets: React.FC = () => {
  const { leads, userTargets, calculateUserProgress, getUserTargets } = useData();
  const { authState } = useAuth();
  const [currentTargets, setCurrentTargets] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filter leads assigned to current sales user
  const myLeads = leads.filter(lead => lead.assignedTo === authState.user?.id.toString());
  const convertedLeads = myLeads.filter(lead => lead.status === 'converted');
  
  // Load user targets on component mount
  useEffect(() => {
    const loadTargets = async () => {
      if (authState.user?.id) {
        setLoading(true);
        try {
          const targets = await getUserTargets(authState.user.id.toString());
          setCurrentTargets(targets);
        } catch (error) {
          console.error('Error loading targets:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadTargets();
  }, [authState.user?.id, getUserTargets]);

  // Get current user's targets from context or loaded data
  const userTargetsData = userTargets[authState.user?.id.toString() || ''] || currentTargets;
  const salesAchieved = userTargetsData?.salesAchieved || 0;
  const invoiceAchieved = userTargetsData?.invoiceAchieved || 0;
  const salesTarget = userTargetsData?.salesTarget || 0;
  const invoiceTarget = userTargetsData?.invoiceTarget || 0;

  // Calculate progress
  const { salesProgress, invoiceProgress } = calculateUserProgress(authState.user?.id.toString() || '');

  // Performance by lead source from real data
  const sourcePerformance = [
    { source: 'Website', leads: myLeads.filter(l => l.source === 'website').length, converted: convertedLeads.filter(l => l.source === 'website').length },
    { source: 'Referral', leads: myLeads.filter(l => l.source === 'referral').length, converted: convertedLeads.filter(l => l.source === 'referral').length },
    { source: 'Call', leads: myLeads.filter(l => l.source === 'call').length, converted: convertedLeads.filter(l => l.source === 'call').length },
    { source: 'Other', leads: myLeads.filter(l => l.source === 'other').length, converted: convertedLeads.filter(l => l.source === 'other').length }
  ].filter(item => item.leads > 0); // Only show sources with data

  // Monthly performance data from real leads
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(new Date(), 5 - i);
    const monthLeads = myLeads.filter(lead => {
      const createdAt = new Date(lead.createdAt);
      return format(createdAt, 'yyyy-MM') === format(month, 'yyyy-MM');
    });

    return {
      month: format(month, 'MMM'),
      salesAchieved: monthLeads.filter(l => l.status === 'converted').reduce((sum, lead) => sum + (lead.pricePaid || lead.price || 0), 0),
      invoiceAchieved: monthLeads.filter(l => l.status === 'converted').reduce((sum, lead) => sum + (lead.invoiceBilled || lead.clicks || 0), 0),
      leads: monthLeads.length,
      converted: monthLeads.filter(l => l.status === 'converted').length
    };
  });

  const targetStats = [
    {
      title: 'Sales Target',
      value: `$${salesTarget.toLocaleString()}`,
      icon: <DollarSign size={24} />,
      color: 'blue'
    },
    {
      title: 'Sales Achieved',
      value: `$${salesAchieved.toLocaleString()}`,
      icon: <Target size={24} />,
      color: 'green'
    },
    {
      title: 'Invoice Target',
      value: `$${invoiceTarget.toLocaleString()}`,
      icon: <Target size={24} />,
      color: 'purple'
    },
    {
      title: 'Invoice Achieved',
      value: `$${invoiceAchieved.toLocaleString()}`,
      icon: <TrendingUp size={24} />,
      color: 'yellow'
    }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading targets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">My Sales Targets</h2>
          <p className="text-gray-600">Track your progress towards monthly goals</p>
        </div>
        {!salesTarget && !invoiceTarget && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-yellow-600" size={20} />
              <p className="text-yellow-800 text-sm">
                No targets set yet. Contact your admin to set monthly targets.
              </p>
            </div>
          </div>
        )}
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

      {/* Progress Overview - Only show if targets are set */}
      {(salesTarget > 0 || invoiceTarget > 0) && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-6">Monthly Progress Overview</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sales Progress */}
            {salesTarget > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="text-green-600" size={20} />
                    <span className="font-medium text-gray-700">Sales Target Progress</span>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    salesProgress >= 100 ? 'bg-green-100 text-green-800' :
                    salesProgress >= 80 ? 'bg-blue-100 text-blue-800' :
                    salesProgress >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {salesProgress >= 100 ? 'EXCEEDED' :
                     salesProgress >= 80 ? 'ON TRACK' :
                     salesProgress >= 60 ? 'PROGRESSING' : 'BEHIND'}
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Price Paid from Converted Leads</span>
                    <span>${salesAchieved.toLocaleString()} / ${salesTarget.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div
                      className={`h-6 rounded-full transition-all duration-500 flex items-center justify-center text-white text-sm font-medium ${
                        salesProgress >= 100 ? 'bg-green-500' :
                        salesProgress >= 80 ? 'bg-blue-500' :
                        salesProgress >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(salesProgress, 100)}%` }}
                    >
                      {salesProgress >= 20 && `${Math.round(salesProgress)}%`}
                    </div>
                  </div>
                  {salesProgress < 20 && (
                    <div className="text-center text-sm font-medium text-gray-700 mt-1">
                      {Math.round(salesProgress)}% Complete
                    </div>
                  )}
                </div>
                
                <div className="mt-3 text-sm text-gray-600">
                  Remaining: ${Math.max(0, salesTarget - salesAchieved).toLocaleString()}
                </div>
              </div>
            )}

            {/* Invoice Progress */}
            {invoiceTarget > 0 && (
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="text-blue-600" size={20} />
                    <span className="font-medium text-gray-700">Invoice Target Progress</span>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    invoiceProgress >= 100 ? 'bg-green-100 text-green-800' :
                    invoiceProgress >= 80 ? 'bg-blue-100 text-blue-800' :
                    invoiceProgress >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {invoiceProgress >= 100 ? 'EXCEEDED' :
                     invoiceProgress >= 80 ? 'ON TRACK' :
                     invoiceProgress >= 60 ? 'PROGRESSING' : 'BEHIND'}
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Invoice Billed from Converted Leads</span>
                    <span>${invoiceAchieved.toLocaleString()} / ${invoiceTarget.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div
                      className={`h-6 rounded-full transition-all duration-500 flex items-center justify-center text-white text-sm font-medium ${
                        invoiceProgress >= 100 ? 'bg-green-500' :
                        invoiceProgress >= 80 ? 'bg-blue-500' :
                        invoiceProgress >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(invoiceProgress, 100)}%` }}
                    >
                      {invoiceProgress >= 20 && `${Math.round(invoiceProgress)}%`}
                    </div>
                  </div>
                  {invoiceProgress < 20 && (
                    <div className="text-center text-sm font-medium text-gray-700 mt-1">
                      {Math.round(invoiceProgress)}% Complete
                    </div>
                  )}
                </div>
                
                <div className="mt-3 text-sm text-gray-600">
                  Remaining: ${Math.max(0, invoiceTarget - invoiceAchieved).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Charts - Only show if there's data */}
      {myLeads.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Performance Trend */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Performance Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                  <Legend />
                  <Bar dataKey="salesAchieved" name="Sales Achieved" fill="#10b981" />
                  <Bar dataKey="invoiceAchieved" name="Invoice Achieved" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Lead Performance */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Lead Performance</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="leads" stroke="#8884d8" strokeWidth={3} name="Total Leads" />
                  <Line type="monotone" dataKey="converted" stroke="#10b981" strokeWidth={3} name="Converted" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance by Source - Only show if there's source data */}
          {sourcePerformance.length > 0 && (
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
          )}

          {/* Conversion Rate by Source - Only show if there's source data */}
          {sourcePerformance.length > 0 && (
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
          )}
        </div>
      )}

      {/* Performance Insights - Only show if there's data */}
      {myLeads.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Performance Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="text-blue-600" size={24} />
                <h4 className="font-medium text-blue-800">Best Performing Source</h4>
              </div>
              <p className="text-blue-700">
                {sourcePerformance.length > 0 ? 
                  `${sourcePerformance.reduce((best, current) => 
                    (current.leads > 0 && current.converted / current.leads) > (best.leads > 0 ? best.converted / best.leads : 0) ? current : best
                  ).source} with ${Math.round((sourcePerformance.reduce((best, current) => 
                    (current.leads > 0 && current.converted / current.leads) > (best.leads > 0 ? best.converted / best.leads : 0) ? current : best
                  ).converted / sourcePerformance.reduce((best, current) => 
                    (current.leads > 0 && current.converted / current.leads) > (best.leads > 0 ? best.converted / best.leads : 0) ? current : best
                  ).leads) * 100) || 0}% conversion rate` :
                  'No source data available'
                }
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="text-green-600" size={24} />
                <h4 className="font-medium text-green-800">Sales Progress</h4>
              </div>
              <p className="text-green-700">
                {salesTarget > 0 ? (
                  salesProgress >= 100 ? 'Target exceeded!' : 
                  salesProgress >= 80 ? 'On track to meet target' :
                  salesProgress >= 50 ? 'Making good progress' : 'Need to accelerate efforts'
                ) : 'No sales target set'}
              </p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Users className="text-purple-600" size={24} />
                <h4 className="font-medium text-purple-800">Total Leads</h4>
              </div>
              <p className="text-purple-700">
                {myLeads.length} leads assigned with {convertedLeads.length} converted
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No data state */}
      {myLeads.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No leads assigned yet</h3>
          <p className="text-gray-500">You don't have any leads assigned to you yet. Contact your admin to get started.</p>
        </div>
      )}
    </div>
  );
};

export default SalesTargets;