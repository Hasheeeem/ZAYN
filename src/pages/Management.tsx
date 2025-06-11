import React, { useState, useEffect } from 'react';
import { Settings2, Package, MapPin, Tags, Share2, Users } from 'lucide-react';
import ActionButton from '../components/ActionButton';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import SearchFilter from '../components/SearchFilter';
import { useNotification } from '../context/NotificationContext';
import { useData } from '../context/DataContext';
import apiService from '../services/api';

interface Brand {
  id: number | string;
  name: string;
  logo?: string;
  defaultSalesperson?: string;
  description: string;
  status: 'active' | 'inactive';
}

interface Product {
  id: number | string;
  name: string;
  sku: string;
  price?: number;
  brandId: number;
  status: 'active' | 'inactive';
}

interface Location {
  id: number | string;
  name: string;
  region: string;
  currency?: string;
  assignedTo?: string;
  parentId?: number;
  status: 'active' | 'inactive';
}

interface LeadStatus {
  id: number | string;
  name: string;
  color: string;
  isLocked: boolean;
  order: number;
}

interface LeadSource {
  id: number | string;
  name: string;
  status: 'active' | 'inactive';
}

interface OwnershipRule {
  id: number | string;
  name: string;
  condition: {
    type: 'location' | 'brand';
    value: string;
  };
  salesPersonId: string;
  isActive: boolean;
}

const LEAD_SOURCES = [
  'Website',
  'Referral',
  'Word of Mouth',
  'Social Media',
  'Email Campaign',
  'Trade Show',
  'Cold Call',
  'Partner',
  'Advertisement',
  'Other'
];

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
  { code: 'SEK', name: 'Swedish Krona', flag: '🇸🇪' },
  { code: 'NZD', name: 'New Zealand Dollar', flag: '🇳🇿' },
  { code: 'MXN', name: 'Mexican Peso', flag: '🇲🇽' },
  { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'HKD', name: 'Hong Kong Dollar', flag: '🇭🇰' },
  { code: 'NOK', name: 'Norwegian Krone', flag: '🇳🇴' },
  { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷' },
  { code: 'TRY', name: 'Turkish Lira', flag: '🇹🇷' },
  { code: 'RUB', name: 'Russian Ruble', flag: '🇷🇺' },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷' },
  { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦' }
];

const SETTINGS_SECTIONS = [
  { id: 'brands', name: 'Brand Settings', icon: <Settings2 size={20} /> },
  { id: 'products', name: 'Product Settings', icon: <Package size={20} /> },
  { id: 'locations', name: 'Location Settings', icon: <MapPin size={20} /> },
  { id: 'statuses', name: 'Status Settings', icon: <Tags size={20} /> },
  { id: 'sources', name: 'Source Settings', icon: <Share2 size={20} /> },
  { id: 'ownership', name: 'Lead Ownership', icon: <Users size={20} /> }
];

const Management: React.FC = () => {
  const [activeSection, setActiveSection] = useState('brands');
  const { showNotification } = useNotification();
  const { salespeople } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // State for each section's data
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [statuses, setStatuses] = useState<LeadStatus[]>([]);
  const [sources, setSources] = useState<LeadSource[]>([]);
  const [ownershipRules, setOwnershipRules] = useState<OwnershipRule[]>([]);

  // Load data when section changes
  useEffect(() => {
    loadSectionData(activeSection);
  }, [activeSection]);

  const loadSectionData = async (section: string) => {
    setLoading(true);
    try {
      const response = await apiService.getManagementData(section);
      if (response.success) {
        switch (section) {
          case 'brands':
            setBrands(response.data);
            break;
          case 'products':
            setProducts(response.data);
            break;
          case 'locations':
            setLocations(response.data);
            break;
          case 'statuses':
            setStatuses(response.data);
            break;
          case 'sources':
            setSources(response.data);
            break;
          case 'ownership':
            setOwnershipRules(response.data);
            break;
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showNotification('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (section: string, data: any) => {
    try {
      const response = await apiService.createManagementItem(section, data);
      if (response.success) {
        // Update local state
        switch (section) {
          case 'brands':
            setBrands([...brands, response.data]);
            break;
          case 'products':
            setProducts([...products, response.data]);
            break;
          case 'locations':
            setLocations([...locations, response.data]);
            break;
          case 'statuses':
            setStatuses([...statuses, response.data]);
            break;
          case 'sources':
            setSources([...sources, response.data]);
            break;
          case 'ownership':
            setOwnershipRules([...ownershipRules, response.data]);
            break;
        }
        showNotification(`${section.slice(0, -1)} added successfully`, 'success');
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding item:', error);
      showNotification('Failed to add item', 'error');
    }
  };

  const handleEdit = async (section: string, data: any) => {
    try {
      const response = await apiService.updateManagementItem(section, data.id, data);
      if (response.success) {
        // Update local state
        switch (section) {
          case 'brands':
            setBrands(brands.map(item => item.id === data.id ? response.data : item));
            break;
          case 'products':
            setProducts(products.map(item => item.id === data.id ? response.data : item));
            break;
          case 'locations':
            setLocations(locations.map(item => item.id === data.id ? response.data : item));
            break;
          case 'statuses':
            setStatuses(statuses.map(item => item.id === data.id ? response.data : item));
            break;
          case 'sources':
            setSources(sources.map(item => item.id === data.id ? response.data : item));
            break;
          case 'ownership':
            setOwnershipRules(ownershipRules.map(item => item.id === data.id ? response.data : item));
            break;
        }
        showNotification(`${section.slice(0, -1)} updated successfully`, 'success');
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error updating item:', error);
      showNotification('Failed to update item', 'error');
    }
  };

  const handleDelete = async (section: string, id: number | string) => {
    try {
      const response = await apiService.deleteManagementItem(section, id.toString());
      if (response.success) {
        // Update local state
        switch (section) {
          case 'brands':
            setBrands(brands.filter(item => item.id !== id));
            break;
          case 'products':
            setProducts(products.filter(item => item.id !== id));
            break;
          case 'locations':
            setLocations(locations.filter(item => item.id !== id));
            break;
          case 'statuses':
            setStatuses(statuses.filter(item => item.id !== id));
            break;
          case 'sources':
            setSources(sources.filter(item => item.id !== id));
            break;
          case 'ownership':
            setOwnershipRules(ownershipRules.filter(item => item.id !== id));
            break;
        }
        showNotification(`${section.slice(0, -1)} deleted successfully`, 'success');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      showNotification('Failed to delete item', 'error');
    }
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

  const getDataForSection = (section: string) => {
    switch (section) {
      case 'brands':
        return brands;
      case 'products':
        return products;
      case 'locations':
        return locations;
      case 'statuses':
        return statuses;
      case 'sources':
        return sources;
      case 'ownership':
        return ownershipRules;
      default:
        return [];
    }
  };

  const renderContent = () => {
    const commonProps = {
      onAdd: openAddModal,
      onEdit: openEditModal,
      onDelete: (id: number | string) => handleDelete(activeSection, id),
      data: getDataForSection(activeSection),
      loading
    };

    switch (activeSection) {
      case 'brands':
        return <BrandSettings {...commonProps} />;
      case 'products':
        return <ProductSettings {...commonProps} />;
      case 'locations':
        return <LocationSettings {...commonProps} />;
      case 'statuses':
        return <StatusSettings {...commonProps} />;
      case 'sources':
        return <SourceSettings {...commonProps} />;
      case 'ownership':
        return <OwnershipSettings {...commonProps} salespeople={salespeople} />;
      default:
        return null;
    }
  };

  const renderModal = () => {
    const commonProps = {
      mode: modalMode,
      initialData: selectedItem,
      onSave: (data: any) => modalMode === 'add' ? handleAdd(activeSection, data) : handleEdit(activeSection, data),
      onCancel: () => setIsModalOpen(false),
      salespeople
    };

    switch (activeSection) {
      case 'brands':
        return <BrandForm {...commonProps} />;
      case 'products':
        return <ProductForm {...commonProps} />;
      case 'locations':
        return <LocationForm {...commonProps} />;
      case 'statuses':
        return <StatusForm {...commonProps} />;
      case 'sources':
        return <SourceForm {...commonProps} />;
      case 'ownership':
        return <OwnershipForm {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Management</h2>
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

// Brand Settings Component
const BrandSettings: React.FC<any> = ({ onAdd, onEdit, onDelete, data, loading }) => {
  const columns = [
    { 
      key: 'name',
      label: 'Brand',
      render: (value: string, item: Brand) => (
        <div className="flex items-center gap-3">
          {item.logo && (
            <img src={item.logo} alt={value} className="w-8 h-8 object-contain rounded" />
          )}
          <span>{value}</span>
        </div>
      )
    },
    { key: 'description', label: 'Description' },
    { 
      key: 'defaultSalesperson',
      label: 'Default Salesperson',
      render: (value: string) => value || 'Not assigned'
    },
    { key: 'status', label: 'Status' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, item: Brand) => (
        <div className="flex justify-end gap-2">
          <ActionButton
            label="Edit"
            variant="primary"
            size="sm"
            onClick={() => onEdit(item)}
          />
          <ActionButton
            label="Delete"
            variant="danger"
            size="sm"
            onClick={() => onDelete(item.id)}
          />
        </div>
      )
    }
  ];

  if (loading) {
    return <div className="text-center py-8">Loading brands...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Brands</h3>
        <ActionButton label="Add Brand" onClick={onAdd} variant="primary" />
      </div>
      <DataTable
        columns={columns}
        data={data}
      />
    </div>
  );
};

// Product Settings Component
const ProductSettings: React.FC<any> = ({ onAdd, onEdit, onDelete, data, loading }) => {
  const columns = [
    { key: 'name', label: 'Product Name' },
    { key: 'sku', label: 'SKU/Code' },
    { key: 'price', label: 'Price', render: (value: number) => value ? `$${value.toFixed(2)}` : '-' },
    { key: 'brandId', label: 'Brand' },
    { key: 'status', label: 'Status' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, item: Product) => (
        <div className="flex justify-end gap-2">
          <ActionButton
            label="Edit"
            variant="primary"
            size="sm"
            onClick={() => onEdit(item)}
          />
          <ActionButton
            label="Delete"
            variant="danger"
            size="sm"
            onClick={() => onDelete(item.id)}
          />
        </div>
      )
    }
  ];

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Products</h3>
        <ActionButton label="Add Product" onClick={onAdd} variant="primary" />
      </div>
      <DataTable
        columns={columns}
        data={data}
      />
    </div>
  );
};

// Location Settings Component
const LocationSettings: React.FC<any> = ({ onAdd, onEdit, onDelete, data, loading }) => {
  const columns = [
    { key: 'name', label: 'Location' },
    { 
      key: 'currency', 
      label: 'Currency',
      render: (value: string) => {
        const currency = CURRENCIES.find(c => c.code === value);
        return currency ? `${currency.flag} ${currency.code}` : value;
      }
    },
    { key: 'status', label: 'Status' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, item: Location) => (
        <div className="flex justify-end gap-2">
          <ActionButton
            label="Edit"
            variant="primary"
            size="sm"
            onClick={() => onEdit(item)}
          />
          <ActionButton
            label="Delete"
            variant="danger"
            size="sm"
            onClick={() => onDelete(item.id)}
          />
        </div>
      )
    }
  ];

  if (loading) {
    return <div className="text-center py-8">Loading locations...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Locations</h3>
        <ActionButton label="Add Location" onClick={onAdd} variant="primary" />
      </div>
      <DataTable
        columns={columns}
        data={data}
      />
    </div>
  );
};

// Status Settings Component
const StatusSettings: React.FC<any> = ({ onAdd, onEdit, onDelete, data, loading }) => {
  const columns = [
    { 
      key: 'name',
      label: 'Status',
      render: (value: string, item: LeadStatus) => (
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span>{value}</span>
        </div>
      )
    },
    { 
      key: 'isLocked',
      label: 'Final Status',
      render: (value: boolean) => value ? 'Yes' : 'No'
    },
    { key: 'order', label: 'Order' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, item: LeadStatus) => (
        <div className="flex justify-end gap-2">
          <ActionButton
            label="Edit"
            variant="primary"
            size="sm"
            onClick={() => onEdit(item)}
          />
          <ActionButton
            label="Delete"
            variant="danger"
            size="sm"
            onClick={() => onDelete(item.id)}
          />
        </div>
      )
    }
  ];

  if (loading) {
    return <div className="text-center py-8">Loading statuses...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Lead Statuses</h3>
        <ActionButton label="Add Status" onClick={onAdd} variant="primary" />
      </div>
      <DataTable
        columns={columns}
        data={data}
      />
    </div>
  );
};

// Source Settings Component
const SourceSettings: React.FC<any> = ({ onAdd, onEdit, onDelete, data, loading }) => {
  const columns = [
    { key: 'name', label: 'Source' },
    { key: 'status', label: 'Status' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, item: LeadSource) => (
        <div className="flex justify-end gap-2">
          <ActionButton
            label="Edit"
            variant="primary"
            size="sm"
            onClick={() => onEdit(item)}
          />
          <ActionButton
            label="Delete"
            variant="danger"
            size="sm"
            onClick={() => onDelete(item.id)}
          />
        </div>
      )
    }
  ];

  if (loading) {
    return <div className="text-center py-8">Loading sources...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Lead Sources</h3>
        <ActionButton label="Add Source" onClick={onAdd} variant="primary" />
      </div>
      <DataTable
        columns={columns}
        data={data}
      />
    </div>
  );
};

// Ownership Settings Component
const OwnershipSettings: React.FC<any> = ({ onAdd, onEdit, onDelete, data, loading, salespeople }) => {
  const columns = [
    { key: 'name', label: 'Rule Name' },
    { 
      key: 'condition',
      label: 'Condition',
      render: (value: { type: string; value: string }) => 
        `${value.type === 'location' ? 'Location' : 'Brand'}: ${value.value}`
    },
    { 
      key: 'salesPersonId', 
      label: 'Assigned To',
      render: (value: string) => {
        const person = salespeople?.find((p: any) => p.id.toString() === value);
        return person ? person.name : 'Unknown';
      }
    },
    { 
      key: 'isActive',
      label: 'Status',
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, item: OwnershipRule) => (
        <div className="flex justify-end gap-2">
          <ActionButton
            label="Edit"
            variant="primary"
            size="sm"
            onClick={() => onEdit(item)}
          />
          <ActionButton
            label="Delete"
            variant="danger"
            size="sm"
            onClick={() => onDelete(item.id)}
          />
        </div>
      )
    }
  ];

  if (loading) {
    return <div className="text-center py-8">Loading ownership rules...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Lead Ownership Rules</h3>
        <ActionButton label="Add Rule" onClick={onAdd} variant="primary" />
      </div>
      <DataTable
        columns={columns}
        data={data}
      />
    </div>
  );
};

// Form Components
const BrandForm: React.FC<any> = ({ mode, initialData, onSave, onCancel }) => {
  const [form, setForm] = useState<Brand>(initialData || {
    id: '',
    name: '',
    logo: '',
    description: '',
    status: 'active'
  });

  const handleSubmit = () => {
    if (!form.name) {
      return;
    }
    onSave(form);
  };

  return (
    <div className="space-y-4 p-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Brand Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Logo URL
        </label>
        <input
          type="text"
          value={form.logo}
          onChange={(e) => setForm({ ...form, logo: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          placeholder="https://example.com/logo.png"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status <span className="text-red-500">*</span>
        </label>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          required
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <ActionButton label="Cancel" onClick={onCancel} variant="secondary" />
        <ActionButton label="Save" onClick={handleSubmit} variant="primary" />
      </div>
    </div>
  );
};

const ProductForm: React.FC<any> = ({ mode, initialData, onSave, onCancel }) => {
  const [form, setForm] = useState<Product>(initialData || {
    id: '',
    name: '',
    sku: '',
    price: 0,
    brandId: 0,
    status: 'active'
  });

  const handleSubmit = () => {
    if (!form.name) {
      return;
    }
    onSave(form);
  };

  return (
    <div className="space-y-4 p-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          SKU/Code
        </label>
        <input
          type="text"
          value={form.sku}
          onChange={(e) => setForm({ ...form, sku: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Price
        </label>
        <input
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status <span className="text-red-500">*</span>
        </label>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          required
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <ActionButton label="Cancel" onClick={onCancel} variant="secondary" />
        <ActionButton label="Save" onClick={handleSubmit} variant="primary" />
      </div>
    </div>
  );
};

const LocationForm: React.FC<any> = ({ mode, initialData, onSave, onCancel }) => {
  const [form, setForm] = useState<Location>(initialData || {
    id: '',
    name: '',
    region: '',
    currency: '',
    status: 'active'
  });

  const handleSubmit = () => {
    if (!form.name) {
      return;
    }
    onSave(form);
  };

  return (
    <div className="space-y-4 p-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Region
        </label>
        <input
          type="text"
          value={form.region}
          onChange={(e) => setForm({ ...form, region: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Currency
        </label>
        <select
          value={form.currency}
          onChange={(e) => setForm({ ...form, currency: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select Currency</option>
          {CURRENCIES.map(currency => (
            <option key={currency.code} value={currency.code}>
              {currency.flag} {currency.code} - {currency.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <ActionButton label="Cancel" onClick={onCancel} variant="secondary" />
        <ActionButton label="Save" onClick={handleSubmit} variant="primary" />
      </div>
    </div>
  );
};

const StatusForm: React.FC<any> = ({ mode, initialData, onSave, onCancel }) => {
  const [form, setForm] = useState<LeadStatus>(initialData || {
    id: '',
    name: '',
    color: '#6366f1',
    isLocked: false,
    order: 0
  });

  return (
    <div className="space-y-4 p-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
        <input
          type="color"
          value={form.color}
          onChange={(e) => setForm({ ...form, color: e.target.value })}
          className="w-full h-10 px-1 py-1 rounded-lg cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
        <input
          type="number"
          value={form.order}
          onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isLocked"
          checked={form.isLocked}
          onChange={(e) => setForm({ ...form, isLocked: e.target.checked })}
          className="rounded text-indigo-600"
        />
        <label htmlFor="isLocked" className="text-sm font-medium text-gray-700">
          Lock as final status
        </label>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <ActionButton label="Cancel" onClick={onCancel} variant="secondary" />
        <ActionButton label="Save" onClick={() => onSave(form)} variant="primary" />
      </div>
    </div>
  );
};

const SourceForm: React.FC<any> = ({ mode, initialData, onSave, onCancel }) => {
  const [form, setForm] = useState<LeadSource>(initialData || {
    id: '',
    name: '',
    status: 'active'
  });

  const handleSubmit = () => {
    if (!form.name) {
      return;
    }
    onSave(form);
  };

  return (
    <div className="space-y-4 p-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Source <span className="text-red-500">*</span>
        </label>
        <select
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          required
        >
          <option value="">Select Source</option>
          {LEAD_SOURCES.map(source => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status <span className="text-red-500">*</span>
        </label>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          required
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <ActionButton label="Cancel" onClick={onCancel} variant="secondary" />
        <ActionButton label="Save" onClick={handleSubmit} variant="primary" />
      </div>
    </div>
  );
};

const OwnershipForm: React.FC<any> = ({ mode, initialData, onSave, onCancel, salespeople }) => {
  const [form, setForm] = useState<OwnershipRule>(initialData || {
    id: '',
    name: '',
    condition: { type: 'location', value: '' },
    salesPersonId: '',
    isActive: true
  });

  const handleSubmit = () => {
    if (!form.name || !form.condition.value || !form.salesPersonId) {
      return;
    }
    onSave(form);
  };

  return (
    <div className="space-y-4 p-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rule Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Condition Type <span className="text-red-500">*</span>
        </label>
        <select
          value={form.condition.type}
          onChange={(e) => setForm({ 
            ...form, 
            condition: { ...form.condition, type: e.target.value as 'location' | 'brand' }
          })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          required
        >
          <option value="location">Location</option>
          <option value="brand">Brand</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Condition Value <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.condition.value}
          onChange={(e) => setForm({ 
            ...form, 
            condition: { ...form.condition, value: e.target.value }
          })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Assign To <span className="text-red-500">*</span>
        </label>
        <select
          value={form.salesPersonId}
          onChange={(e) => setForm({ ...form, salesPersonId: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          required
        >
          <option value="">Select Salesperson</option>
          {salespeople?.map((person: any) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          className="rounded text-indigo-600"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
          Active Rule
        </label>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <ActionButton label="Cancel" onClick={onCancel} variant="secondary" />
        <ActionButton label="Save" onClick={handleSubmit} variant="primary" />
      </div>
    </div>
  );
};

export default Management;