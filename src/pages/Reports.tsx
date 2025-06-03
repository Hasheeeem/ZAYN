import React from 'react';
import StatCard from '../components/StatCard';
import { TrendingUp, DollarSign, Target, Star } from 'lucide-react';

const Reports: React.FC = () => {
  const reportStats = [
    {
      id: 'growth',
      title: 'Monthly Growth',
      value: '+23%',
      icon: <TrendingUp size={24} />,
      color: 'blue'
    },
    {
      id: 'revenue',
      title: 'Revenue',
      value: '$47K',
      icon: <DollarSign size={24} />,
      color: 'green'
    },
    {
      id: 'conversion',
      title: 'Conversion',
      value: '12.5%',
      icon: <Target size={24} />,
      color: 'red'
    },
    {
      id: 'satisfaction',
      title: 'Satisfaction',
      value: '4.8/5',
      icon: <Star size={24} />,
      color: 'yellow'
    }
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Reports & Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {reportStats.map(stat => (
          <StatCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Lead Status Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">Chart visualization will appear here</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Lead Acquisition</h3>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">Chart visualization will appear here</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Conversion Funnel</h3>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">Chart visualization will appear here</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Top Performing Sources</h3>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">Chart visualization will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;