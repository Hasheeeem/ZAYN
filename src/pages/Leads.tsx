import React, { useState } from 'react';
import { Plus, Trash2, UserPlus, Eye, Edit } from 'lucide-react';
import DataTable from '../components/DataTable';
import ActionButton from '../components/ActionButton';
import Modal from '../components/Modal';
import SearchFilter from '../components/SearchFilter';
import LeadForm from '../components/LeadForm';
import { useData } from '../context/DataContext';
import { useNotification } from '../context/NotificationContext';
import { Lead } from '../types/data';
import StatusBadge from '../components/StatusBadge';

const ITEMS_PER_PAGE = 10;

const Leads: React.FC = () => {
  const { leads, salespeople, loading, addLead, updateLead, deleteLead, bulkDeleteLeads, bulkAssignLeads } = useData();
  const { showNotification } = useNotification();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLeads, setSelectedLeads] = useState<Set<number | string>>(new Set());
  const [assignToSalesperson, setAssignToSalesperson] = useState('');

  const filteredLeads = leads.filter(lead => {
    const searchableText = `${lead.companyRepresentativeName || ''} ${lead.companyName || ''} ${lead.firstName || ''} ${lead.lastName || ''} ${lead.domain || ''} ${lead.email}`.toLowerCase();
    const matchesSearch = searchTerm === '' || searchableText.includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || lead.status === statusFilter;
    const matchesSource = sourceFilter === '' || lead.source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleAddLead = async (lead: Lead) => {
    try {
      await addLead(lead);
      setIsAddModalOpen(false);
    } catch (error) {
      // Error is handled in the context
    }
  };

  const handleUpdateLead = async (lead: Lead) => {
    try {
      await updateLead(lead);
      setIsEditModalOpen(false);
      setSelectedLead(null);
    } catch (error) {
      // Error is handled in the context
    }
  };

  const handleDeleteLead = async () => {
    if (selectedLead) {
      try {
        await deleteLead(selectedLead.id.toString());
        setIsDeleteModalOpen(false);
        setSelectedLead(null);
      } catch (error) {
        // Error is handled in the context
      }
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteLeads(Array.from(selectedLeads).map(id => id.toString()));
      setSelectedLeads(new Set());
      setIsDeleteModalOpen(false);
    } catch (error) {
      // Error is handled in the context
    }
  };

  const handleBulkAssign = async () => {
    if (!assignToSalesperson) {
      showNotification('Please select a salesperson', 'error');
      return;
    }

    try {
      await bulkAssignLeads(Array.from(selectedLeads).map(id => id.toString()), assignToSalesperson);
      setSelectedLeads(new Set());
      setIsAssignModalOpen(false);
      setAssignToSalesperson('');
    } catch (error) {
      // Error is handled in the context
    }
  };

  const columns = [
    { 
      key: 'company',
      label: 'Company',
      sortable: true,
      render: (value: string, item: Lead) => (
        <div>
          <div className="font-medium">{item.companyName || item.domain || 'N/A'}</div>
          <div className="text-sm text-gray-500">{item.companyRepresentativeName || `${item.firstName || ''} ${item.lastName || ''}`.trim() || 'N/A'}</div>
        </div>
      )
    },
    { 
      key: 'contact',
      label: 'Contact',
      render: (value: string, item: Lead) => (
        <div>
          <div className="text-sm">{item.email}</div>
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
    { 
      key: 'assignedTo',
      label: 'Assigned To',
      sortable: true,
      render: (value: string) => {
        const person = salespeople?.find(p => p.id.toString() === value);
        return person ? person.name : 'Unassigned';
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, item: Lead) => (
        <div className="flex justify-end gap-2">
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
            title="Edit Lead"
          >
            <Edit size={16} />
          </button>
          <ActionButton
            label="Delete"
            variant="danger"
            size="sm"
            onClick={() => {
              setSelectedLead(item);
              setIsDeleteModalOpen(true);
            }}
          />
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading leads...</div>
      </div>
    );
  }

  return (
    <div className="max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Lead Management</h2>
        <div className="flex gap-2">
          {selectedLeads.size > 0 && (
            <>
              <ActionButton
                label={`Delete (${selectedLeads.size})`}
                icon={<Trash2 size={18} />}
                onClick={() => setIsDeleteModalOpen(true)}
                variant="danger"
              />
              <ActionButton
                label={`Assign (${selectedLeads.size})`}
                icon={<UserPlus size={18} />}
                onClick={() => setIsAssignModalOpen(true)}
                variant="secondary"
              />
            </>
          )}
          <ActionButton
            label="Add New Lead"
            icon={<Plus size={18} />}
            onClick={() => setIsAddModalOpen(true)}
            variant="primary"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6">
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
          data={paginatedLeads}
          pageSize={ITEMS_PER_PAGE}
          selectable={true}
          onSelectionChange={(ids) => setSelectedLeads(new Set(ids))}
          statusType="lead"
        />
        
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredLeads.length)} of {filteredLeads.length} leads
          </div>
          <div className="flex gap-2">
            <ActionButton
              label="Previous"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              variant="secondary"
              disabled={currentPage === 1}
            />
            <ActionButton
              label="Next"
              onClick={() => setCurrentPage(p => p + 1)}
              variant="secondary"
              disabled={currentPage * ITEMS_PER_PAGE >= filteredLeads.length}
            />
          </div>
        </div>
      </div>

      {/* Add Lead Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Lead"
        size="lg"
      >
        <LeadForm onSave={handleAddLead} onCancel={() => setIsAddModalOpen(false)} isAdmin={true} />
      </Modal>

      {/* Edit Lead Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedLead(null);
        }}
        title="Edit Lead"
        size="lg"
      >
        {selectedLead && (
          <LeadForm
            initialData={selectedLead}
            onSave={handleUpdateLead}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedLead(null);
            }}
            isAdmin={true}
          />
        )}
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
                  <div>
                    <label className="text-sm font-medium text-gray-500">Assigned To</label>
                    <p className="font-medium">
                      {salespeople?.find(p => p.id.toString() === selectedLead.assignedTo)?.name || 'Unassigned'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Brand, Product, Location Section */}
            {(selectedLead.brand || selectedLead.product || selectedLead.location) && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Business Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Brand</label>
                    <p className="font-medium">{selectedLead.brand || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Product</label>
                    <p className="font-medium">{selectedLead.product || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <p className="font-medium">{selectedLead.location || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            )}
            
            {selectedLead.notes && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Notes</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedLead.notes}</p>
              </div>
            )}
            
            <div className="flex justify-end pt-4 border-t">
              <ActionButton
                label="Edit Lead"
                onClick={() => {
                  setIsViewModalOpen(false);
                  setIsEditModalOpen(true);
                }}
                variant="primary"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
      >
        <div className="p-6">
          <p className="mb-4">Are you sure you want to delete {selectedLeads.size > 0 ? `${selectedLeads.size} leads` : 'this lead'}?</p>
          <div className="flex justify-end gap-2">
            <ActionButton
              label="Cancel"
              onClick={() => setIsDeleteModalOpen(false)}
              variant="secondary"
            />
            <ActionButton
              label="Delete"
              onClick={selectedLeads.size > 0 ? handleBulkDelete : handleDeleteLead}
              variant="danger"
            />
          </div>
        </div>
      </Modal>

      {/* Bulk Assign Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Leads"
      >
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign {selectedLeads.size} leads to:
            </label>
            <select
              value={assignToSalesperson}
              onChange={(e) => setAssignToSalesperson(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Salesperson</option>
              {salespeople.map(person => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <ActionButton
              label="Cancel"
              onClick={() => setIsAssignModalOpen(false)}
              variant="secondary"
            />
            <ActionButton
              label="Assign"
              onClick={handleBulkAssign}
              variant="primary"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Leads;