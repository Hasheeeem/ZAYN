import React, { useState } from 'react';
import { Settings2, Package, MapPin, Tags, Share2, Users } from 'lucide-react';
import ActionButton from '../components/ActionButton';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import SearchFilter from '../components/SearchFilter';
import { useNotification } from '../context/NotificationContext';
import { Brand, Product, Location, LeadStatus, LeadSource, LeadOwner } from '../types/data';

const SETTINGS_SECTIONS = [
  { id: 'brands', name: 'Brand Settings', icon: <Settings2 size={20} /> },
  { id: 'products', name: 'Product Settings', icon: <Package size={20} /> },
  { id: 'locations', name: 'Location Settings', icon: <MapPin size={20} /> },
  { id: 'statuses', name: 'Status Settings', icon: <Tags size={20} /> },
  { id: 'sources', name: 'Source Settings', icon: <Share2 size={20} /> },
  { id: 'ownership', name: 'Lead Ownership', icon: <Users size={20} /> }
];

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('brands');
  const { showNotification } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handleAdd = (section: string, data: any) => {
    showNotification(`${section} added successfully`, 'success');
    setIsModalOpen(false);
  };

  const handleEdit = (section: string, data: any) => {
    showNotification(`${section} updated successfully`, 'success');
    setIsModalOpen(false);
  };

  const handleDelete = (section: string, id: number) => {
    showNotification(`${section} deleted successfully`, 'success');
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setModalMode('edit');
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'brands':
        return <BrandSettings onAdd={openAddModal} onEdit={openEditModal} onDelete={handleDelete} />;
      case 'products':
        return <ProductSettings onAdd={openAddModal} onEdit={openEditModal} onDelete={handleDelete} />;
      case 'locations':
        return <LocationSettings onAdd={openAddModal} onEdit={openEditModal} onDelete={handleDelete} />;
      case 'statuses':
        return <StatusSettings onAdd={openAddModal} onEdit={openEditModal} onDelete={handleDelete} />;
      case 'sources':
        return <SourceSettings onAdd={openAddModal} onEdit={openEditModal} onDelete={handleDelete} />;
      case 'ownership':
        return <OwnershipSettings onAdd={openAddModal} onEdit={openEditModal} onDelete={handleDelete} />;
      default:
        return null;
    }
  };

  const renderModal = () => {
    switch (activeSection) {
      case 'brands':
        return (
          <BrandForm
            mode={modalMode}
            initialData={selectedItem}
            onSave={(data) => modalMode === 'add' ? handleAdd('brand', data) : handleEdit('brand', data)}
            onCancel={() => setIsModalOpen(false)}
          />
        );
      case 'products':
        return (
          <ProductForm
            mode={modalMode}
            initialData={selectedItem}
            onSave={(data) => modalMode === 'add' ? handleAdd('product', data) : handleEdit('product', data)}
            onCancel={() => setIsModalOpen(false)}
          />
        );
      // Add similar cases for other sections
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Admin Settings</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {SETTINGS_SECTIONS.map(section => (
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${modalMode === 'add' ? 'Add' : 'Edit'} ${activeSection.slice(0, -1)}`}
      >
        {renderModal()}
      </Modal>
    </div>
  );
};

// Individual section components
const BrandSettings: React.FC<any> = ({ onAdd, onEdit, onDelete }) => {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'status', label: 'Status' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Brands</h3>
        <ActionButton label="Add Brand" onClick={onAdd} variant="primary" />
      </div>
      <DataTable
        columns={columns}
        data={[]}
        actions={{
          edit: onEdit,
          delete: onDelete
        }}
      />
    </div>
  );
};

// Form components
const BrandForm: React.FC<any> = ({ mode, initialData, onSave, onCancel }) => {
  const [form, setForm] = useState(initialData || {
    name: '',
    description: '',
    status: 'active'
  });

  return (
    <div className="space-y-4 p-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          rows={3}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <ActionButton label="Cancel" onClick={onCancel} variant="secondary" />
        <ActionButton label="Save" onClick={() => onSave(form)} variant="primary" />
      </div>
    </div>
  );
};

// Add similar components for other sections (ProductSettings, LocationSettings, etc.)

export default Settings;