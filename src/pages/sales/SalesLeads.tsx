import React, { useState } from 'react';
import { Phone, Mail, MessageSquare, Calendar, Edit, Eye, Plus } from 'lucide-react';
import DataTable from '../../components/DataTable';
import ActionButton from '../../components/ActionButton';
import Modal from '../../components/Modal';
import SearchFilter from '../../components/SearchFilter';
import LeadForm from '../../components/LeadForm';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Lead } from '../../types/data';
import StatusBadge from '../../components/StatusBadge';

const SalesLeads: React.FC = () => {
  const { leads, updateLead, addLead } = useData();
  const { authState } = useAuth();
  const { showNotification } = useNotification();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  // Filter leads assigned to current sales user
  const myLeads = leads.filter(lead => lead.assignedTo === authState.user?.id.toString());

  const filteredLeads = myLeads.filter(lead => {
    const searchableText = `${lead.companyRepresentativeName || ''} ${lead.companyName || ''} ${lead.firstName || ''} ${lead.lastName || ''} ${lead.domain || ''} ${lead.email}`.toLowerCase();
    const matchesSearch = searchTerm === '' || searchableText.includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || lead.status === statusFilter;
    const matchesSource = sourceFilter === '' || lead.source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  const handleAddLead = async (lead: Lead) => {
    try {
      await addLead(lead);
      setIsAddModalOpen(false);
    } catch (error) {
      // Error is handled in the context
    }
  };

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
          <div className="font-medium">{item.companyRepresentativeName || `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'N/A'}</div>
          <div className="text-sm text-gray-500">{item.companyName || item.domain || 'N/A'}</div>
          <div className="text-sm text-gray-500">{item.email}</div>
          <div className="text-sm text-gray-500">{item.phone || 'N/A'}</div>
        </div>
      )
    },
    { 
      key: 'financial',
      label: 'Financial',
      render: (value: string, item: Lead) => (
        <div>
          <div className="text-sm">Paid: ${item.pricePaid || item.price || 0}</div>
          <div className="text-sm text-gray-500">Billed: ${item.invoiceBilled || item.clicks || 0}</div>
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
        <div className="flex items-center gap-4">
          <ActionButton
            label="Add New Lead"
            icon={<Plus size={18} />}
            onClick={() => setIsAddModalOpen(true)}
            variant="primary"
          />
          <div className="text-right">
            <div className="text-2xl font-bold text-indigo-600">{myLeads.length}</div>
            <div className="text-sm text-gray-500">Total Leads</div>
          </div>
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

      {/* Add Lead Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Lead"
        size="lg"
      >
        <LeadForm onSave={handleAddLead} onCancel={() => setIsAddModalOpen(false)} isAdmin={false} />
      </Modal>

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
                    <label className="text-sm font-medium text-gray-500">Representative Name</label>
                    <p className="font-medium">{selectedLead.companyRepresentativeName || `${selectedLead.firstName || ''} ${selectedLead.lastName || ''}`.trim() || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Company Name</label>
                    <p className="font-medium">{selectedLead.companyName || selectedLead.domain || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="font-medium">{selectedLead.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="font-medium">{selectedLead.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Lead Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Price Paid</label>
                    <p className="font-medium">${selectedLead.pricePaid || selectedLead.price || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Invoice Billed</label>
                    <p className="font-medium">${selectedLead.invoiceBilled || selectedLead.clicks || 0}</p>
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
        size="lg"
      >
        {selectedLead && (
          <LeadForm
            initialData={selectedLead}
            onSave={async (updatedLead) => {
              await updateLead(updatedLead);
              setIsEditModalOpen(false);
            }}
            onCancel={() => setIsEditModalOpen(false)}
            isAdmin={false}
          />
        )}
      </Modal>
    </div>
  );
};

export default SalesLeads;