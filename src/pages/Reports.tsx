import React, { useState } from 'react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { Download, FileText, Filter, Users, TrendingUp, DollarSign, Target } from 'lucide-react';
import StatCard from '../components/StatCard';
import ActionButton from '../components/ActionButton';
import SearchFilter from '../components/SearchFilter';
import { useData } from '../context/DataContext';

const Reports: React.FC = () => {
  const { leads, salespeople } = useData();
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });
  const [sourceFilter, setSourceFilter] = useState('');
  const [salesFilter, setSalesFilter] = useState('');

  const filteredLeads = leads.filter(lead => {
    const leadDate = new Date(lead.createdAt);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    const matchesDate = leadDate >= startDate && leadDate <= endDate;
    const matchesSource = sourceFilter === '' || lead.source === sourceFilter;
    const matchesSales = salesFilter === '' || lead.assignedTo === salesFilter;
    
    return matchesDate && matchesSource && matchesSales;
  });

  // Calculate metrics from real data
  const totalLeads = filteredLeads.length;
  const convertedLeads = filteredLeads.filter(l => l.status === 'converted').length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0';
  const totalRevenue = filteredLeads
    .filter(l => l.status === 'converted')
    .reduce((sum, lead) => sum + (lead.pricePaid || lead.price || 0), 0);
  const avgDealSize = convertedLeads > 0 ? (totalRevenue / convertedLeads).toFixed(0) : '0';

  // Lead status distribution from real data
  const statusData = [
    { name: 'New', value: filteredLeads.filter(l => l.status === 'new').length },
    { name: 'Contacted', value: filteredLeads.filter(l => l.status === 'contacted').length },
    { name: 'Qualified', value: filteredLeads.filter(l => l.status === 'qualified').length },
    { name: 'Converted', value: filteredLeads.filter(l => l.status === 'converted').length },
    { name: 'Lost', value: filteredLeads.filter(l => l.status === 'lost').length }
  ];

  // Source distribution from real data
  const sourceData = [
    { name: 'Website', value: filteredLeads.filter(l => l.source === 'website').length },
    { name: 'Referral', value: filteredLeads.filter(l => l.source === 'referral').length },
    { name: 'Call', value: filteredLeads.filter(l => l.source === 'call').length },
    { name: 'Other', value: filteredLeads.filter(l => l.source === 'other').length }
  ];

  // Team performance from real data
  const teamData = salespeople.map(person => {
    const personLeads = filteredLeads.filter(l => l.assignedTo === person.id.toString());
    const personConverted = personLeads.filter(l => l.status === 'converted');
    const personRevenue = personConverted.reduce((sum, lead) => sum + (lead.pricePaid || lead.price || 0), 0);
    
    return {
      name: person.name,
      leads: personLeads.length,
      converted: personConverted.length,
      revenue: personRevenue,
      conversionRate: personLeads.length > 0 ? ((personConverted.length / personLeads.length) * 100).toFixed(1) : '0'
    };
  });

  const exportData = (format: 'csv' | 'pdf') => {
    // Implementation would go here
    console.log(`Exporting as ${format}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Reports & Analytics</h2>
        <div className="flex gap-2">
          <ActionButton
            label="Export CSV"
            icon={<FileText size={18} />}
            onClick={() => exportData('csv')}
            variant="secondary"
          />
          <ActionButton
            label="Export PDF"
            icon={<Download size={18} />}
            onClick={() => exportData('pdf')}
            variant="primary"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <SearchFilter
            searchPlaceholder=""
            onSearch={() => {}}
            filters={[
              {
                label: 'Source',
                value: sourceFilter,
                onChange: setSourceFilter,
                options: [
                  { value: 'website', label: 'Website' },
                  { value: 'referral', label: 'Referral' },
                  { value: 'call', label: 'Call' },
                  { value: 'other', label: 'Other' }
                ]
              },
              {
                label: 'Salesperson',
                value: salesFilter,
                onChange: setSalesFilter,
                options: salespeople.map(p => ({
                  value: p.id.toString(),
                  label: p.name
                }))
              }
            ]}
          />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Leads"
          value={totalLeads}
          icon={<Users size={24} />}
          color="blue"
        />
        <StatCard
          title="Converted Leads"
          value={convertedLeads}
          icon={<Target size={24} />}
          color="green"
        />
        <StatCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          icon={<TrendingUp size={24} />}
          color="purple"
        />
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={<DollarSign size={24} />}
          color="yellow"
        />
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Status Breakdown */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Lead Status Distribution</h3>
          <div className="space-y-3">
            {statusData.map((status, index) => (
              <div key={index} className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50">
                <span className="font-medium text-gray-700">{status.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {totalLeads > 0 ? Math.round((status.value / totalLeads) * 100) : 0}%
                  </span>
                  <span className="font-semibold text-indigo-600">{status.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Source Distribution */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Leads by Source</h3>
          <div className="space-y-3">
            {sourceData.map((source, index) => (
              <div key={index} className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50">
                <span className="font-medium text-gray-700">{source.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {totalLeads > 0 ? Math.round((source.value / totalLeads) * 100) : 0}%
                  </span>
                  <span className="font-semibold text-indigo-600">{source.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Performance */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Team Performance</h3>
        {teamData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Salesperson</th>
                  <th className="text-right py-3 px-4">Total Leads</th>
                  <th className="text-right py-3 px-4">Converted</th>
                  <th className="text-right py-3 px-4">Conversion Rate</th>
                  <th className="text-right py-3 px-4">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {teamData.map((person, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{person.name}</td>
                    <td className="py-3 px-4 text-right">{person.leads}</td>
                    <td className="py-3 px-4 text-right">{person.converted}</td>
                    <td className="py-3 px-4 text-right">{person.conversionRate}%</td>
                    <td className="py-3 px-4 text-right">${person.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No salespeople found</h3>
            <p className="mt-1 text-sm text-gray-500">Add salespeople to see performance data.</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{totalLeads}</div>
            <div className="text-sm text-gray-600">Total Leads in Period</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{conversionRate}%</div>
            <div className="text-sm text-gray-600">Overall Conversion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">${avgDealSize}</div>
            <div className="text-sm text-gray-600">Average Deal Size</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;