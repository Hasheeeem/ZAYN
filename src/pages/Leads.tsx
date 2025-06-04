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

  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'new' | 'contacted' | 'qualified' | 'lost'>('new');
  const [source, setSource] = useState<'website' | 'referral' | 'social' | 'email'>('website');
  const [notes, setNotes] = useState('');

  // Opportunity form states
  const [domain, setDomain] = useState('');
  const [price, setPrice] = useState('');
  const [clicks, setClicks] = useState('');
  const [opportunityStatus, setOpportunityStatus] = useState('registered');
  const [description, setDescription] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  const filteredLeads = filterLeads(searchTerm, statusFilter, sourceFilter);

  const handleAddLead = () => {
    if (!firstName || !lastName || !email || !phone) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    addLead({
      name: `${firstName} ${lastName}`,
      email,
      phone,
      status,
      source,
      notes
    });

    showNotification('Lead added successfully', 'success');
    setIsLeadModalOpen(false);
    resetLeadForm();
  };

  const handleAddOpportunity = () => {
    if (!domain || !price || !clicks) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    // Add opportunity logic here
    showNotification('Opportunity added successfully', 'success');
    setIsOpportunityModalOpen(false);
    resetOpportunityForm();
  };

  const resetLeadForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setStatus('new');
    setSource('website');
    setNotes('');
  };

  const resetOpportunityForm = () => {
    setDomain('');
    setPrice('');
    setClicks('');
    setOpportunityStatus('registered');
    setDescription('');
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'status', label: 'Status' },
    { key: 'source', label: 'Source' },
    { key: 'date', label: 'Date Added' }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Lead Management</h2>
        <div className="flex gap-4">
          <ActionButton
            label="Add New Lead"
            icon={<Plus size={18} />}
            onClick={() => setIsLeadModalOpen(true)}
            variant="primary"
          />
          <ActionButton
            label="Add Opportunity"
            icon={<Plus size={18} />}
            onClick={() => setIsOpportunityModalOpen(true)}
            variant="success"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <SearchFilter
          searchPlaceholder="Search leads..."
          onSearch={setSearchTerm}
          filters={[
            {
              label: 'All Status',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: 'new', label: 'New' },
                { value: 'contacted', label: 'Contacted' },
                { value: 'qualified', label: 'Qualified' },
                { value: 'lost', label: 'Lost' }
              ]
            },
            {
              label: 'All Sources',
              value: sourceFilter,
              onChange: setSourceFilter,
              options: [
                { value: 'website', label: 'Website' },
                { value: 'referral', label: 'Referral' },
                { value: 'social', label: 'Social Media' },
                { value: 'email', label: 'Email Campaign' }
              ]
            }
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredLeads}
        actions={{
          edit: (id) => showNotification('Edit lead feature coming soon!', 'info'),
          view: (id) => showNotification('View lead feature coming soon!', 'info')
        }}
        statusType="lead"
      />

      {/* Lead Modal */}
      <Modal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        title="Add New Lead"
        footer={
          <>
            <ActionButton
              label="Cancel"
              onClick={() => setIsLeadModalOpen(false)}
              variant="secondary"
            />
            <ActionButton
              label="Add Lead"
              onClick={handleAddLead}
              variant="success"
            />
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="lost">Lost</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="website">Website</option>
              <option value="referral">Referral</option>
              <option value="social">Social Media</option>
              <option value="email">Email Campaign</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows={3}
            placeholder="Optional notes about the lead..."
          />
        </div>
      </Modal>

      {/* Opportunity Modal */}
      <Modal
        isOpen={isOpportunityModalOpen}
        onClose={() => setIsOpportunityModalOpen(false)}
        title="Add New Opportunity"
        footer={
          <>
            <ActionButton
              label="Cancel"
              onClick={() => setIsOpportunityModalOpen(false)}
              variant="secondary"
            />
            <ActionButton
              label="Add Opportunity"
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
            value={opportunityStatus}
            onChange={(e) => setOpportunityStatus(e.target.value)}
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

export default Leads;