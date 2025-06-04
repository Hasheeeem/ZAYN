import React, { useState } from 'react';
import DataTable from '../components/DataTable';
import ActionButton from '../components/ActionButton';
import Modal from '../components/Modal';
import SearchFilter from '../components/SearchFilter';
import { useData } from '../context/DataContext';
import { useNotification } from '../context/NotificationContext';
import { Plus } from 'lucide-react';

const Leads: React.FC = () => {
  const { leads, addLead, filterLeads } = useData();
  const { showNotification } = useNotification();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [domain, setDomain] = useState('');
  const [price, setPrice] = useState('');
  const [clicks, setClicks] = useState('');
  const [status, setStatus] = useState<'registered' | 'expiring' | 'expired' | 'flagged'>('registered');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredLeads = filterLeads(searchTerm, statusFilter);

  const handleAddLead = () => {
    if (!domain || !price || !clicks) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    addLead({
      domain,
      price: Number(price),
      clicks: Number(clicks),
      update: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      status
    });

    showNotification('Lead added successfully', 'success');
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setDomain('');
    setPrice('');
    setClicks('');
    setStatus('registered');
  };

  const columns = [
    { key: 'domain', label: 'Domain' },
    { key: 'price', label: 'Price', render: (value: number) => `$${value}` },
    { key: 'clicks', label: 'Clicks' },
    { key: 'update', label: 'Update' },
    { key: 'status', label: 'Status' }
  ];

  return (
    <div className="max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Lead Management</h2>
        <ActionButton
          label="New Opportunity"
          icon={<Plus size={18} />}
          onClick={() => setIsModalOpen(true)}
          variant="primary"
        />
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
        <SearchFilter
          searchPlaceholder="Search domains..."
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
            }
          ]}
        />
      </div>

      <div className="overflow-x-auto">
        <DataTable
          columns={columns}
          data={filteredLeads}
          actions={{
            edit: (id) => showNotification('Edit lead feature coming soon!', 'info'),
            view: (id) => showNotification('View lead feature coming soon!', 'info')
          }}
          statusType="lead"
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Opportunity"
        footer={
          <>
            <ActionButton
              label="Cancel"
              onClick={() => setIsModalOpen(false)}
              variant="secondary"
            />
            <ActionButton
              label="Add Opportunity"
              onClick={handleAddLead}
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

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Expected Clicks</label>
          <input
            type="number"
            value={clicks}
            onChange={(e) => setClicks(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
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
      </Modal>
    </div>
  );
};

export default Leads;