import React, { useState } from 'react';
import { Phone, Mail, MessageSquare, Calendar, Edit, Eye } from 'lucide-react';
import DataTable from '../../components/DataTable';
import ActionButton from '../../components/ActionButton';
import Modal from '../../components/Modal';
import SearchFilter from '../../components/SearchFilter';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Lead } from '../../types/data';
import StatusBadge from '../../components/StatusBadge';

const SalesLeads: React.FC = () => {
  const { leads, updateLead } = useData();
  const { authState } = useAuth();
  const { showNotification } = useNotification();

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  // Filter leads assigned to current sales user
  const myLeads = leads.filter(lead => lead.assignedTo === authState.user?.id.toString());

  const filteredLeads = myLeads.filter(lead => {
    const matchesSearch = searchTerm === '' || 
      lead.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || lead.status === statusFilter;
    const matchesSource = sourceFilter === '' || lead.source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  const handleUpdateStatus = (leadId: number | string, newStatus: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      updateLead({ ...lead, status: newStatus as any });
      showNotification(`Lead status updated to ${newStatus}`, 'success');
    }
  };

  const handleContactLead = (lead: Lead, method: 'phone' | 'email' | 'message') => {
    switch (method) {
      case 'phone':
        window.open(`tel:${lead.phone}`);
        break;
      case 'email':
        window.open(`mailto:${lead.email}`);
        break;
      case 'message':
        showNotification('Message feature coming soon', 'info');
        break;
    }
  };

  const columns = [
    { 
      key: 'contact',
      label: 'Contact',
      render: (value: string, item: Lead) => (
        <div>
          <div className="font-medium">{item.firstName} {item.lastName}</div>
          <div className="text-sm text-gray-500">{item.email}</div>
          <div className="text-sm text-gray-500">{item.phone}</div>
        </div>
      )
    },
    { 
      key: 'domain',
      label: 'Domain',
      sortable: true,
      render: (value: string, item: Lead) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">${item.price}</div>
        </div>
      )
    },
    { key: 'source', label: 'Source', sortable: true },
    { 
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => <StatusBadge status={value} type="lead" />
    },
    { key: 'update', label: 'Last Update', sortable: true },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, item: Lead) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => handleContactLead(item, 'phone')}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Call"
          >
            <Phone size={16} />
          </button>
          <button
            onClick={() => handleContactLead(item, 'email')}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Email"
          >
            <Mail size={16} />
          </button>
          <button
            onClick={() => {
              setSelectedLead(item);
              setIsViewModalOpen(true);
            }}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => {
              setSelectedLead(item);
              setIsEditModalOpen(true);
            }}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">My Leads</h2>
          <p className="text-gray-600">Manage and track your assigned leads</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-indigo-600">{myLeads.length}</div>
          <div className="text-sm text-gray-500">Total Leads</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <SearchFilter
          searchPlaceholder="Search leads..."
          onSearch={setSearchTerm}
          filters={[
            {
              label: 'Status',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: 'new', label: 'New' },
                { value: 'contacted', label: 'Contacted' },
                { value: 'qualified', label: 'Qualified' },
                { value: 'converted', label: 'Converted' },
                { value: 'lost', label: 'Lost' }
              ]
            },
            {
              label: 'Source',
              value: sourceFilter,
              onChange: setSourceFilter,
              options: [
                { value: 'website', label: 'Website' },
                { value: 'referral', label: 'Referral' },
                { value: 'call', label: 'Call' },
                { value: 'other', label: 'Other' }
              ]
            }
          ]}
        />
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredLeads}
          pageSize={10}
          statusType="lead"
        />
      </div>

      {/* View Lead Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Lead Details"
        size="lg"
      >
        {selectedLead && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="font-medium">{selectedLead.firstName} {selectedLead.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="font-medium">{selectedLead.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="font-medium">{selectedLead.phone}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Lead Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Domain</label>
                    <p className="font-medium">{selectedLead.domain}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Price</label>
                    <p className="font-medium">${selectedLead.price}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Source</label>
                    <p className="font-medium capitalize">{selectedLead.source}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      <StatusBadge status={selectedLead.status} type="lead" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {selectedLead.notes && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Notes</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedLead.notes}</p>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex gap-2">
                <ActionButton
                  label="Call"
                  icon={<Phone size={16} />}
                  onClick={() => handleContactLead(selectedLead, 'phone')}
                  variant="success"
                />
                <ActionButton
                  label="Email"
                  icon={<Mail size={16} />}
                  onClick={() => handleContactLead(selectedLead, 'email')}
                  variant="primary"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={selectedLead.status}
                  onChange={(e) => handleUpdateStatus(selectedLead.id, e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Lead Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Lead"
      >
        {selectedLead && (
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={selectedLead.status}
                  onChange={(e) => {
                    setSelectedLead({ ...selectedLead, status: e.target.value as any });
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={selectedLead.notes || ''}
                  onChange={(e) => {
                    setSelectedLead({ ...selectedLead, notes: e.target.value });
                  }}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Add notes about this lead..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <ActionButton
                label="Cancel"
                onClick={() => setIsEditModalOpen(false)}
                variant="secondary"
              />
              <ActionButton
                label="Save Changes"
                onClick={() => {
                  updateLead(selectedLead);
                  showNotification('Lead updated successfully', 'success');
                  setIsEditModalOpen(false);
                }}
                variant="primary"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SalesLeads;