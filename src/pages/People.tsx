import React, { useState } from 'react';
import { Settings2, Users, Package, MapPin, Tags, Share2, UserCircle } from 'lucide-react';
import ActionButton from '../components/ActionButton';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import SearchFilter from '../components/SearchFilter';
import { useData } from '../context/DataContext';
import { useNotification } from '../context/NotificationContext';

const MANAGEMENT_SECTIONS = [
  { id: 'users', name: 'User Management', icon: <Users size={20} /> },
  { id: 'brands', name: 'Brand Management', icon: <Settings2 size={20} /> },
  { id: 'products', name: 'Product Management', icon: <Package size={20} /> },
  { id: 'locations', name: 'Location Management', icon: <MapPin size={20} /> },
  { id: 'statuses', name: 'Status Management', icon: <Tags size={20} /> },
  { id: 'sources', name: 'Source Management', icon: <Share2 size={20} /> },
  { id: 'ownership', name: 'Lead Ownership', icon: <UserCircle size={20} /> }
];

const People: React.FC = () => {
  const [activeSection, setActiveSection] = useState('users');
  const { showNotification } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <UserManagement />;
      case 'brands':
        return <BrandManagement />;
      case 'products':
        return <ProductManagement />;
      case 'locations':
        return <LocationManagement />;
      case 'statuses':
        return <StatusManagement />;
      case 'sources':
        return <SourceManagement />;
      case 'ownership':
        return <OwnershipManagement />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <div>
      <div className="flex flex-col space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {MANAGEMENT_SECTIONS.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`p-4 rounded-lg flex flex-col items-center justify-center space-y-2 transition-all ${
                activeSection === section.id
                  ? 'bg-indigo-500 text-white shadow-lg'
                  : 'bg-white hover:bg-indigo-50'
              }`}
            >
              {section.icon}
              <span className="text-sm font-medium">{section.name}</span>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

// Placeholder components for each management section
const UserManagement = () => (
  <div>
    <h2 className="text-xl font-semibold mb-4">User Management</h2>
    {/* User management content */}
  </div>
);

const BrandManagement = () => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Brand Management</h2>
    {/* Brand management content */}
  </div>
);

const ProductManagement = () => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Product Management</h2>
    {/* Product management content */}
  </div>
);

const LocationManagement = () => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Location Management</h2>
    {/* Location management content */}
  </div>
);

const StatusManagement = () => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Status Management</h2>
    {/* Status management content */}
  </div>
);

const SourceManagement = () => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Source Management</h2>
    {/* Source management content */}
  </div>
);

const OwnershipManagement = () => (
  <div>
    <h2 className="text-xl font-semibold mb-4">Lead Ownership</h2>
    {/* Lead ownership content */}
  </div>
);

export default People;