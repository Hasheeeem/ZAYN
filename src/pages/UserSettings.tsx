import React, { useState } from 'react';
import { UserPlus, Users } from 'lucide-react';
import ActionButton from '../components/ActionButton';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import SearchFilter from '../components/SearchFilter';
import { useData } from '../context/DataContext';
import { useNotification } from '../context/NotificationContext';
import { User } from '../types/data';

interface NewUserFormData {
  username: string;
  password: string;
  email: string;
  phoneNumber: string;
  role: 'admin' | 'sales';
}

const UserSettings: React.FC = () => {
  const { managementUsers } = useData();
  const { showNotification } = useNotification();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [newUserForm, setNewUserForm] = useState<NewUserFormData>({
    username: '',
    password: '',
    email: '',
    phoneNumber: '',
    role: 'sales'
  });

  const handleAddUser = () => {
    // Validate form
    if (!newUserForm.username || !newUserForm.password || !newUserForm.email || !newUserForm.phoneNumber) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    // Simulate API call
    setTimeout(() => {
      showNotification('User added successfully', 'success');
      setIsAddModalOpen(false);
      setNewUserForm({
        username: '',
        password: '',
        email: '',
        phoneNumber: '',
        role: 'sales'
      });
    }, 1000);
  };

  const handleUpdateUser = (userId: number, updates: Partial<User>) => {
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
    { key: 'phoneNumber', label: 'Phone Number' },
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
        <h2 className="text-2xl font-semibold text-gray-800">User Settings</h2>
        <ActionButton
          label="Add New User"
          icon={<UserPlus size={18} />}
          onClick={() => setIsAddModalOpen(true)}
          variant="primary"
        />
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <SearchFilter
          searchPlaceholder="Search users..."
          onSearch={setSearchTerm}
          filters={[
            {
              label: 'Role',
              value: roleFilter,
              onChange: setRoleFilter,
              options: [
                { value: 'admin', label: 'Admin' },
                { value: 'sales', label: 'Sales' }
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
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New User"
      >
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newUserForm.username}
                onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={newUserForm.password}
                onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter password"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={newUserForm.email}
                onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter email address"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={newUserForm.phoneNumber}
                onChange={(e) => setNewUserForm({ ...newUserForm, phoneNumber: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter phone number"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User Level <span className="text-red-500">*</span>
              </label>
              <select
                value={newUserForm.role}
                onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as 'admin' | 'sales' })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="sales">Sales</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <ActionButton
              label="Cancel"
              onClick={() => setIsAddModalOpen(false)}
              variant="secondary"
            />
            <ActionButton
              label="Add User"
              onClick={handleAddUser}
              variant="primary"
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User"
      >
        {selectedUser && (
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedUser.role}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, role: e.target.value as 'admin' | 'sales' })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                >
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
                      role: selectedUser.role as 'admin' | 'sales'
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

export default UserSettings;