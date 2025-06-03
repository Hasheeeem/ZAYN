import React, { useState } from 'react';
import DataTable from '../components/DataTable';
import ActionButton from '../components/ActionButton';
import Modal from '../components/Modal';
import SearchFilter from '../components/SearchFilter';
import { useData } from '../context/DataContext';
import { useNotification } from '../context/NotificationContext';
import { Opportunity } from '../types/data';
import { Plus } from 'lucide-react';

const Opportunities: React.FC = () => {
  const { opportunities, addOpportunity, filterOpportunities } = useData();
  const { showNotification } = useNotification();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [domain, setDomain] = useState('');
  const [price, setPrice] = useState('');
  const [clicks, setClicks] = useState('');
  const [updateDate, setUpdateDate] = useState('');
  const [status, setStatus] = useState<'registered' | 'expiring' | 'expired' | 'flagged'>('registered');
  const [description, setDescription] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  const filteredOpportunities = filterOpportunities(searchTerm, statusFilter, dateFilter);
  
  const handleAddOpportunity = () => {
    if (!domain || !price || !clicks || !updateDate) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    addOpportunity({
      domain,
      price: Number(price),
      clicks: Number(clicks),
      update: new Date(updateDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      status,
      description
    });
    
    showNotification('Opportunity added successfully', 'success');
    setIsModalOpen(false);
    resetForm();
  };
  
  const resetForm = () => {
    setDomain('');
    setPrice('');
    setClicks('');
    setUpdateDate('');
    setStatus('registered');
    setDescription('');
  };
  
  const handleEditOpportunity = (id: number) => {
    showNotification('Edit opportunity feature coming soon!', 'info');
  };
  
  const handleViewOpportunity = (id: number) => {
    showNotification('View opportunity feature coming soon!', 'info');
  };
  
  const columns = [
    { key: 'domain', label: 'Domain' },
    { key: 'price', label: 'Price', render: (value: number) => `$${value}` },
    { key: 'clicks', label: 'Clicks', render: (value: number) => value.toLocaleString() },
    { key: 'update', label: 'Update' },
    { key: 'status', label: 'Status' }
  ];
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Opportunities</h2>
        <ActionButton 
          label="New Opportunity" 
          icon={<Plus size={18} />}
          onClick={() => setIsModalOpen(true)} 
          variant="primary"
        />
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <SearchFilter 
          searchPlaceholder="Search opportunities..." 
          onSearch={setSearchTerm}
          filters={[
            {
              label: 'All Status',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: 'registered', label: 'Registered' },
                { value: 'expiring', label: 'Expiring' },
                { value: 'expired', label: 'Expired' },
                { value: 'flagged', label: 'Flagged' }
              ]
            },
            {
              label: 'All Dates',
              value: dateFilter,
              onChange: setDateFilter,
              options: [
                { value: 'today', label: 'Today' },
                { value: 'this-week', label: 'This Week' },
                { value: 'this-month', label: 'This Month' }
              ]
            }
          ]}
        />
      </div>
      
      <DataTable 
        columns={columns} 
        data={filteredOpportunities} 
        actions={{
          edit: handleEditOpportunity,
          view: handleViewOpportunity
        }}
        statusType="opportunity"
      />
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="New Opportunity"
        footer={
          <>
            <ActionButton 
              label="Cancel" 
              onClick={() => setIsModalOpen(false)} 
              variant="secondary"
            />
            <ActionButton 
              label="Save Opportunity" 
              onClick={handleAddOpportunity} 
              variant="success"
            />
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Domain Name</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Clicks</label>
            <input
              type="number"
              value={clicks}
              onChange={(e) => setClicks(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Update Date</label>
            <input
              type="date"
              value={updateDate}
              onChange={(e) => setUpdateDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="registered">Registered</option>
            <option value="expiring">Expiring</option>
            <option value="expired">Expired</option>
            <option value="flagged">Flagged</option>
          </select>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows={3}
            placeholder="Optional description..."
          />
        </div>
      </Modal>
    </div>
  );
};

export default Opportunities;