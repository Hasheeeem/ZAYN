import React from 'react';
import { 
  BarChart3, 
  LineChart, 
  PieChart,
  Download,
  Calendar,
  Filter
} from 'lucide-react';

const Reports: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" size={18} />
            <select className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 appearance-none">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
              <option>Last year</option>
            </select>
          </div>
          
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300">
            <Download size={18} className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Total Revenue', value: '$124,563.00', change: '+12.5%' },
          { title: 'Conversion Rate', value: '24.8%', change: '+3.2%' },
          { title: 'Average Deal Size', value: '$2,864', change: '-0.4%' }
        ].map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</h3>
            <div className="mt-2 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
              <span className={`ml-2 text-sm font-medium ${
                stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Trend</h2>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Filter size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          <div className="h-80 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
            <LineChart size={48} className="text-gray-400" />
          </div>
        </div>

        {/* Lead Sources */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lead Sources</h2>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Filter size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          <div className="h-80 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
            <PieChart size={48} className="text-gray-400" />
          </div>
        </div>

        {/* Conversion Rates */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conversion Rates</h2>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Filter size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          <div className="h-80 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
            <BarChart3 size={48} className="text-gray-400" />
          </div>
        </div>

        {/* Sales Pipeline */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sales Pipeline</h2>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Filter size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          <div className="h-80 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
            <BarChart3 size={48} className="text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;