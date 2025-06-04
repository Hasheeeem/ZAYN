import React, { useState } from 'react';
import { Plus, UserPlus, Users } from 'lucide-react';
import ActionButton from '../components/ActionButton';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import SearchFilter from '../components/SearchFilter';
import { useData } from '../context/DataContext';
import { useNotification } from '../context/NotificationContext';
import { User } from '../types/data';

interface InviteFormData {
  email: string;
  role: 'admin' | 'sales' | 'viewer';
}

const Management: React.FC = () => {
  const { managementUsers } = useData();
  const { showNotification } = useNotification();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [inviteForm, setInviteForm] = useState<InviteFormData>({
    email: '',
    role: 'viewer'
  });

  const handleInviteUser = () => {
    // Simulate API call
    setTimeout(() => {
      showNotification(`Invitation sent to ${inviteForm.email}`, 'success');
      setIsInviteModalOpen(false);
      setInviteForm({ email: '', role: 'viewer' });
    }, 1000);
  };

  const handleUpdateUser = (userId: number, updates: Partial<User> & { role?: 'admin' | 'sales' | 'viewer' }) => {
    // Simulate API call
    setTimeout(() => {
      showNotification('User updated successfully', 'success');
      setIsEditModalOpen(false);
      setSelectedUser(null);
    }, 1000);
  };

  const handleToggleStatus = (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    handleUpdateUser(userId, { status: newStatus as 'active' | 'inactive' });
  };

  const columns = [
    { 
      key: 'name',
      label: 'Name',
      render: (value: string, user: User) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
            {value.charAt(0)}
          </div>
          <span>{value}</span>
        </div>
      )
    },
    { key: 'email', label: 'Email' },
    { 
      key: 'role',
      label: 'Role',
      render: (value: string) => (
        <span className="capitalize">{value}</span>
      )
    },
    { key: 'lastLogin', label: 'Last Login' },
    { 
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value === 'active' ? 'Active' : 'Disabled'}
        </span>
      )
    }
  ];

  const filteredUsers = managementUsers.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === '' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Team Management</h2>
        <ActionButton
          label="Invite User"
          icon={<UserPlus size={18} />}
          onClick={() => setIsInviteModalOpen(true)}
          variant="primary"
        />
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <SearchFilter
          searchPlaceholder="Search team members..."
          onSearch={setSearchTerm}
          filters={[
            {
              label: 'Role',
              value: roleFilter,
              onChange: setRoleFilter,
              options: [
                { value: 'admin', label: 'Admin' },
                { value: 'sales', label: 'Sales' },
                { value: 'viewer', label: 'Viewer' }
              ]
            }
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredUsers}
        actions={{
          edit: (id: number) => {
            const user = managementUsers.find(u => u.id === id);
            if (user) {
              setSelectedUser(user);
              setIsEditModalOpen(true);
            }
          },
          delete: (id: number) => {
            const user = managementUsers.find(u => u.id === id);
            if (user) {
              handleToggleStatus(id, user.status);
            }
          }
        }}
        statusType="user"
      />

      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Team Member"
      >
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={inviteForm.role}
                onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as 'admin' | 'sales' | 'viewer' })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="viewer">Viewer</option>
                <option value="sales">Sales</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <ActionButton
              label="Cancel"
              onClick={() => setIsInviteModalOpen(false)}
              variant="secondary"
            />
            <ActionButton
              label="Send Invite"
              onClick={handleInviteUser}
              variant="primary"
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Team Member"
      >
        {selectedUser && (
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={selectedUser.role}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, role: e.target.value as 'admin' | 'sales' | 'viewer' })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="viewer">Viewer</option>
                  <option value="sales">Sales</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <ActionButton
                label="Cancel"
                onClick={() => setIsEditModalOpen(false)}
                variant="secondary"
              />
              <ActionButton
                label="Save Changes"
                onClick={() => {
                  if (selectedUser) {
                    handleUpdateUser(selectedUser.id, {
                      role: selectedUser.role as 'admin' | 'sales' | 'viewer'
                    });
                  }
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

export default Management;
