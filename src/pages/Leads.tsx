import React, { useState } from 'react';
import { Plus, Trash2, UserPlus } from 'lucide-react';
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
    const matchesSearch = searchTerm === '' || 
      lead.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
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
      setIsViewModalOpen(false);
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
      key: 'domain',
      label: 'Domain',
      sortable: true,
      render: (value: string, item: Lead) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{item.firstName} {item.lastName}</div>
        </div>
      )
    },
    { key: 'price', label: 'Price', sortable: true, render: (value: number) => `$${value}` },
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
          <ActionButton
            label="Edit"
            variant="primary"
            size="sm"
            onClick={() => {
              setSelectedLead(item);
              setIsViewModalOpen(true);
            }}
          />
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
            label="New Lead"
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

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Lead"
      >
        <LeadForm onSave={handleAddLead} onCancel={() => setIsAddModalOpen(false)} />
      </Modal>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Edit Lead"
      >
        {selectedLead && (
          <LeadForm
            initialData={selectedLead}
            onSave={handleUpdateLead}
            onCancel={() => setIsViewModalOpen(false)}
          />
        )}
      </Modal>

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