import React from 'react';
import StatCard from '../components/StatCard';
import { useData } from '../context/DataContext';
import { Users, Briefcase, UserCheck, BarChart4 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { leads } = useData();
  
  const dashboardStats = [
    {
      id: 'leads',
      title: 'Total Leads',
      value: leads?.length || 0,
      icon: <Users size={24} />,
      color: 'blue'
    },
    {
      id: 'opportunities',
      title: 'Opportunities',
      value: leads?.length || 0,
      icon: <Briefcase size={24} />,
      color: 'green'
    },
    {
      id: 'users',
      title: 'Active Users',
      value: '24',
      icon: <UserCheck size={24} />,
      color: 'red'
    },
    {
      id: 'conversion',
      title: 'Conversion Rate',
      value: '7.2%',
      icon: <BarChart4 size={24} />,
      color: 'yellow'
    }
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Welcome to ZownLead CRM</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardStats.map(stat => (
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
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(item => (
              <div key={item} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Users size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">New lead added: John Smith</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Upcoming Tasks</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(item => (
              <div key={item} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500 h-5 w-5" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Follow up with Sarah Johnson</p>
                  <p className="text-xs text-gray-500">Due: Jun 10, 2025</p>
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