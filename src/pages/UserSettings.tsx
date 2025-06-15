import React, { useState } from 'react';
import { UserPlus, Users, Settings } from 'lucide-react';
import ActionButton from '../components/ActionButton';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import SearchFilter from '../components/SearchFilter';
import TargetForm from '../components/TargetForm';
import { useData } from '../context/DataContext';
import { useNotification } from '../context/NotificationContext';
import { User } from '../types/data';
import apiService from '../services/api';

interface NewUserFormData {
  name: string;
  password: string;
  email: string;
  phone_number: string;
  role: 'admin' | 'sales';
}

const UserSettings: React.FC = () => {
  const { managementUsers, refreshData, userTargets, setUserTargets, getUserTargets } = useData();
  const { showNotification } = useNotification();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserTargets, setCurrentUserTargets] = useState<{ salesTarget: number; invoiceTarget: number } | null>(null);
  const [newUserForm, setNewUserForm] = useState<NewUserFormData>({
    name: '',
    password: '',
    email: '',
    phone_number: '',
    role: 'sales'
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validate form
    if (!newUserForm.name || !newUserForm.password || !newUserForm.email || !newUserForm.phone_number) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserForm.email)) {
      showNotification('Please enter a valid email address', 'error');
      return;
    }

    // Validate password length
    if (newUserForm.password.length < 6) {
      showNotification('Password must be at least 6 characters long', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.createUser(newUserForm);
      
      if (response.success) {
        showNotification('User added successfully', 'success');
        setIsAddModalOpen(false);
        setNewUserForm({
          name: '',
          password: '',
          email: '',
          phone_number: '',
          role: 'sales'
        });
        // Refresh the data to show the new user
        await refreshData();
      } else {
        showNotification(response.message || 'Failed to create user', 'error');
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      if (error.message?.includes('400')) {
        showNotification('Email already exists or invalid data', 'error');
      } else {
        showNotification('Failed to create user. Please try again.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (userId: number, updates: Partial<User>) => {
    setIsLoading(true);
    try {
      const response = await apiService.updateUser(userId.toString(), updates);
      
      if (response.success) {
        showNotification('User updated successfully', 'success');
        setIsEditModalOpen(false);
        setSelectedUser(null);
        // Refresh the data to show the updated user
        await refreshData();
      } else {
        showNotification(response.message || 'Failed to update user', 'error');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showNotification('Failed to update user. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetTargets = async (targets: { salesTarget: number; invoiceTarget: number }) => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      await setUserTargets(selectedUser.id.toString(), targets);
      setIsTargetModalOpen(false);
      setSelectedUser(null);
      setCurrentUserTargets(null);
    } catch (error) {
      console.error('Error setting targets:', error);
      // Error is already handled in setUserTargets
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenTargetModal = async (user: User) => {
    setSelectedUser(user);
    setIsLoading(true);
    
    try {
      const targets = await getUserTargets(user.id.toString());
      setCurrentUserTargets(targets);
      setIsTargetModalOpen(true);
    } catch (error) {
      console.error('Error loading user targets:', error);
      setCurrentUserTargets(null);
      setIsTargetModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    handleUpdateUser(userId, { status: newStatus as 'active' | 'inactive' });
  };

  const handleInputChange = (field: keyof NewUserFormData, value: string) => {
    setNewUserForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setNewUserForm({
      name: '',
      password: '',
      email: '',
      phone_number: '',
      role: 'sales'
    });
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
      key: 'phone_number', 
      label: 'Phone Number',
      render: (value: string) => value || 'Not provided'
    },
    { 
      key: 'role',
      label: 'Role',
      render: (value: string) => (
        <span className="capitalize">{value}</span>
      )
    },
    { 
      key: 'targets',
      label: 'Monthly Targets',
      render: (value: string, user: User) => {
        const targets = userTargets[user.id.toString()];
        if (!targets || (targets.salesTarget === 0 && targets.invoiceTarget === 0)) {
          return <span className="text-gray-500 text-sm">Not set</span>;
        }
        return (
          <div className="text-sm">
            <div className="text-green-600">Sales: ${targets.salesTarget.toLocaleString()}</div>
            <div className="text-blue-600">Invoice: ${targets.invoiceTarget.toLocaleString()}</div>
          </div>
        );
      }
    },
    { 
      key: 'lastLogin', 
      label: 'Last Login',
      render: (value: string) => value || 'Never'
    },
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
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, user: User) => (
        <div className="flex justify-end gap-2">
          <ActionButton
            label="Set Targets"
            icon={<Settings size={16} />}
            onClick={() => handleOpenTargetModal(user)}
            variant="primary"
            size="sm"
            disabled={isLoading}
          />
        </div>
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

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        title="Add New User"
        size="md"
        preventClose={isLoading}
      >
        <form onSubmit={handleAddUser} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={newUserForm.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Enter full name"
                required
                disabled={isLoading}
                autoComplete="off"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={newUserForm.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Enter email address"
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                type="password"
                value={newUserForm.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Enter password (min 6 characters)"
                required
                disabled={isLoading}
                autoComplete="new-password"
                minLength={6}
              />
            </div>
            
            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="phone_number"
                type="tel"
                value={newUserForm.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Enter phone number"
                required
                disabled={isLoading}
                autoComplete="tel"
              />
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                User Role <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                value={newUserForm.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
                disabled={isLoading}
              >
                <option value="sales">Sales</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end gap-3">
            <ActionButton
              label="Cancel"
              onClick={handleCloseAddModal}
              variant="secondary"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? 'Adding User...' : 'Add User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User"
        size="md"
        preventClose={isLoading}
      >
        {selectedUser && (
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="editRole" className="block text-sm font-medium text-gray-700 mb-1">
                  User Role <span className="text-red-500">*</span>
                </label>
                <select
                  id="editRole"
                  value={selectedUser.role}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, role: e.target.value as 'admin' | 'sales' })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                  disabled={isLoading}
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
                disabled={isLoading}
              />
              <ActionButton
                label={isLoading ? 'Saving...' : 'Save Changes'}
                onClick={() => {
                  if (selectedUser) {
                    handleUpdateUser(selectedUser.id, {
                      role: selectedUser.role as 'admin' | 'sales'
                    });
                  }
                }}
                variant="primary"
                disabled={isLoading}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Set Targets Modal */}
      <Modal
        isOpen={isTargetModalOpen}
        onClose={() => {
          setIsTargetModalOpen(false);
          setSelectedUser(null);
          setCurrentUserTargets(null);
        }}
        title="Set Monthly Targets"
        size="lg"
        preventClose={isLoading}
      >
        {selectedUser && (
          <TargetForm
            userId={selectedUser.id.toString()}
            userName={selectedUser.name}
            currentTargets={currentUserTargets || undefined}
            onSave={handleSetTargets}
            onCancel={() => {
              setIsTargetModalOpen(false);
              setSelectedUser(null);
              setCurrentUserTargets(null);
            }}
            isLoading={isLoading}
          />
        )}
      </Modal>
    </div>
  );
};

export default UserSettings;