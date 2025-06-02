import React from 'react';
import { 
  BarChart3, 
  DollarSign, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight
} from 'lucide-react';

// Mock data for the dashboard
const stats = [
  { 
    id: 1, 
    title: 'Total Leads', 
    value: '2,453', 
    change: '+12.5%',
    trend: 'up',
    icon: <Users size={22} />,
    color: 'bg-blue-600'
  },
  { 
    id: 2, 
    title: 'Conversion Rate', 
    value: '23.8%', 
    change: '+2.3%',
    trend: 'up',
    icon: <BarChart3 size={22} />,
    color: 'bg-teal-500'
  },
  { 
    id: 3, 
    title: 'Average Value', 
    value: '$342', 
    change: '-4.1%',
    trend: 'down',
    icon: <DollarSign size={22} />,
    color: 'bg-purple-600'
  }
];

const recentLeads = [
  { id: 1, name: 'Michael Smith', email: 'michael@example.com', source: 'Website', date: '1 hour ago', status: 'New' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', source: 'Referral', date: '3 hours ago', status: 'Contacted' },
  { id: 3, name: 'David Williams', email: 'david@example.com', source: 'Social Media', date: '5 hours ago', status: 'New' },
  { id: 4, name: 'Emma Brown', email: 'emma@example.com', source: 'Website', date: '1 day ago', status: 'Qualified' },
  { id: 5, name: 'James Davis', email: 'james@example.com', source: 'Email', date: '1 day ago', status: 'Contacted' }
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="mt-4 sm:mt-0">
          <div className="inline-flex bg-gray-800 p-1 rounded-md">
            <button className="px-4 py-1.5 text-sm font-medium rounded-md bg-blue-600 text-white">
              Today
            </button>
            <button className="px-4 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md">
              Week
            </button>
            <button className="px-4 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md">
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map(stat => (
          <div key={stat.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-transform hover:scale-[1.01]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                <h3 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{stat.value}</h3>
              </div>
              <div className={`${stat.color} p-3 rounded-lg text-white`}>
                {stat.icon}
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stat.trend === 'up' ? (
                <ArrowUpRight size={16} className="text-green-500 mr-1" />
              ) : (
                <ArrowDownRight size={16} className="text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1.5">vs last period</span>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Lead Acquisition Overview</h2>
          <button className="text-sm text-blue-600 dark:text-blue-500 font-medium flex items-center">
            View All 
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
        
        {/* Placeholder for chart - in a real app you'd use a charting library */}
        <div className="h-80 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 size={48} className="mx-auto text-gray-400" />
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              Lead acquisition chart would appear here
            </p>
          </div>
        </div>
      </div>

      {/* Recent Leads Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Leads</h2>
          <button className="text-sm text-blue-600 dark:text-blue-500 font-medium flex items-center">
            View All 
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Source</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {recentLeads.map(lead => (
                <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{lead.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-300">{lead.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-300">{lead.source}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-300">{lead.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      lead.status === 'New' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                        : lead.status === 'Contacted' 
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 dark:text-blue-500 hover:text-blue-900 dark:hover:text-blue-400">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;