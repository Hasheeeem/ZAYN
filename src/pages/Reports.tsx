import React, { useState } from 'react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { Download, FileText, Filter } from 'lucide-react';
import StatCard from '../components/StatCard';
import ActionButton from '../components/ActionButton';
import SearchFilter from '../components/SearchFilter';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
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

  // Calculate metrics
  const totalLeads = filteredLeads.length;
  const convertedLeads = filteredLeads.filter(l => l.status === 'converted').length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0';
  
  // Lead status distribution
  const statusData = Object.entries(
    filteredLeads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Source distribution
  const sourceData = Object.entries(
    filteredLeads.reduce((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Team performance
  const teamData = salespeople.map(person => ({
    name: person.name,
    leads: filteredLeads.filter(l => l.assignedTo === person.id.toString()).length,
    converted: filteredLeads.filter(l => 
      l.assignedTo === person.id.toString() && l.status === 'converted'
    ).length
  }));

  const exportData = (format: 'csv' | 'pdf') => {
    // Implementation would go here
    console.log(`Exporting as ${format}`);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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
                  { value: 'ads', label: 'Ads' },
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Leads"
          value={totalLeads}
          icon={<Filter size={24} />}
          color="blue"
        />
        <StatCard
          title="Converted Leads"
          value={convertedLeads}
          icon={<Filter size={24} />}
          color="green"
        />
        <StatCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          icon={<Filter size={24} />}
          color="purple"
        />
        <StatCard
          title="Average Deal Size"
          value="$2,450"
          icon={<Filter size={24} />}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Lead Status Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Leads by Source</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Team Performance</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="leads" fill="#8884d8" name="Total Leads" />
                <Bar dataKey="converted" fill="#82ca9d" name="Converted" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;