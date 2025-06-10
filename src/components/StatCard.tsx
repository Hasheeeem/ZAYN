import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const getGradient = () => {
    switch (color) {
      case 'blue':
        return 'from-blue-500 to-blue-600';
      case 'green':
        return 'from-green-500 to-green-600';
      case 'red':
        return 'from-red-500 to-red-600';
      case 'yellow':
        return 'from-yellow-500 to-yellow-600';
      case 'purple':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-indigo-500 to-purple-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 text-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${getGradient()} flex items-center justify-center text-white text-2xl`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
      <div className={`text-3xl font-bold bg-gradient-to-r ${getGradient()} bg-clip-text text-transparent`}>
        {value}
      </div>
    </div>
  );
};

export default StatCard;