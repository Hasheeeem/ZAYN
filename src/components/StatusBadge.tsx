import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'lead' | 'opportunity' | 'user';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'lead' }) => {
  const getStatusClass = () => {
    // Lead statuses
    if (type === 'lead') {
      switch (status.toLowerCase()) {
        case 'new':
          return 'bg-green-100 text-green-800';
        case 'contacted':
          return 'bg-yellow-100 text-yellow-800';
        case 'qualified':
          return 'bg-blue-100 text-blue-800';
        case 'lost':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
    
    // Opportunity statuses
    if (type === 'opportunity') {
      switch (status.toLowerCase()) {
        case 'registered':
          return 'bg-green-100 text-green-800';
        case 'expiring':
          return 'bg-yellow-100 text-yellow-800';
        case 'expired':
          return 'bg-red-100 text-red-800';
        case 'flagged':
          return 'bg-blue-100 text-blue-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
    
    // User statuses
    if (type === 'user') {
      switch (status.toLowerCase()) {
        case 'active':
          return 'bg-green-100 text-green-800';
        case 'inactive':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }
    
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusClass()}`}>
      {status}
    </span>
  );
};

export default StatusBadge;