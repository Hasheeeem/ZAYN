import React from 'react';

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  onClick,
  variant = 'primary',
  size = 'md',
  icon
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:from-indigo-600 hover:to-purple-700';
      case 'secondary':
        return 'bg-gray-500 text-white hover:bg-gray-600';
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-teal-500 text-white hover:shadow-lg hover:from-green-600 hover:to-teal-600';
      case 'danger':
        return 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-lg hover:from-red-600 hover:to-pink-600';
      default:
        return 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:from-indigo-600 hover:to-purple-700';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1 text-sm';
      case 'md':
        return 'px-4 py-2';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`rounded-lg font-medium transition-all duration-200 transform hover:-translate-y-0.5 flex items-center gap-2 ${getVariantClasses()} ${getSizeClasses()}`}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
};

export default ActionButton;