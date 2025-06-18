import React, { useState } from 'react';
import { UserPlus, Users, Settings, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
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

interface EditUserFormData {
  name: string;
  email: string;
  phone_number: string;
  role: 'admin' | 'sales';
  password?: string;
}

const UserSettings: React.FC = () => {
  const { managementUsers, refreshData, userTargets, setUserTargets, getUserTargets } = useData();
  const { showNotification } = useNotification();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentUserTargets, setCurrentUserTargets] = useState<{ salesTarget: number; invoiceTarget: number } | null>(null);
  
  const [newUserForm, setNewUserForm] = useState<NewUserFormData>({
    name: '',
    password: '',
    email: '',
    phone_number: '',
    role: 'sales'
  });

  const [editUserForm, setEditUserForm] = useState<EditUserFormData>({
    name: '',
    email: '',
    phone_number: '',
    role: 'sales',
    password: ''
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

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;

    // Validate form
    if (!editUserForm.name || !editUserForm.email || !editUserForm.phone_number) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editUserForm.email)) {
      showNotification('Please enter a valid email address', 'error');
      return;
    }

    // Validate password if provided
    if (editUserForm.password && editUserForm.password.length < 6) {
      showNotification('Password must be at least 6 characters long', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const updateData: any = {
        name: editUserForm.name,
        email: editUserForm.email,
        phone_number: editUserForm.phone_number,
        role: editUserForm.role
      };

      // Only include password if it's provided
      if (editUserForm.password && editUserForm.password.trim()) {
        updateData.password = editUserForm.password;
      }

      const response = await apiService.updateUser(selectedUser.id.toString(), updateData);
      
      if (response.success) {
        showNotification('User updated successfully', 'success');
        setIsEditModalOpen(false);
        setSelectedUser(null);
        setEditUserForm({
          name: '',
          email: '',
          phone_number: '',
          role: 'sales',
          password: ''
        });
        // Refresh the data to show the updated user
        await refreshData();
      } else {
        showNotification(response.message || 'Failed to update user', 'error');
      }
    } catch (error: any) {
      console.error('Error updating user:', error);
      if (error.message?.includes('400')) {
        showNotification('Email already exists or invalid data', 'error');
      } else {
        showNotification('Failed to update user. Please try again.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      const response = await apiService.deleteUser(selectedUser.id.toString());
      
      if (response.success) {
        showNotification('User deleted successfully', 'success');
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
        // Refresh the data to remove the deleted user
        await refreshData();
      } else {
        showNotification(response.message || 'Failed to delete user', 'error');
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      showNotification('Failed to delete user. Please try again.', 'error');
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

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setEditUserForm({
      name: user.name,
      email: user.email,
      phone_number: user.phone_number || '',
      role: user.role,
      password: ''
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleInputChange = (field: keyof NewUserFormData, value: string) => {
    setNewUserForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditInputChange = (field: keyof EditUserFormData, value: string) => {
    setEditUserForm(prev => ({
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

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
    setEditUserForm({
      name: '',
      email: '',
      phone_number: '',
      role: 'sales',
      password: ''
    });
    setShowPassword(false);
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
          <button
            onClick={() => handleOpenEditModal(user)}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Edit User"
            disabled={isLoading}
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleOpenTargetModal(user)}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Set Targets"
            disabled={isLoading}
          >
            <Settings size={16} />
          </button>
          <button
            onClick={() => handleOpenDeleteModal(user)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete User"
            disabled={isLoading}
          >
            <Trash2 size={16} />
          </button>
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
        onClose={handleCloseEditModal}
        title="Edit User"
        size="md"
        preventClose={isLoading}
      >
        {selectedUser && (
          <form onSubmit={handleUpdateUser} className="p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="editName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="editName"
                  type="text"
                  value={editUserForm.name}
                  onChange={(e) => handleEditInputChange('name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter full name"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label htmlFor="editEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="editEmail"
                  type="email"
                  value={editUserForm.email}
                  onChange={(e) => handleEditInputChange('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter email address"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label htmlFor="editPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="editPhone"
                  type="tel"
                  value={editUserForm.phone_number}
                  onChange={(e) => handleEditInputChange('phone_number', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter phone number"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label htmlFor="editRole" className="block text-sm font-medium text-gray-700 mb-1">
                  User Role <span className="text-red-500">*</span>
                </label>
                <select
                  id="editRole"
                  value={editUserForm.role}
                  onChange={(e) => handleEditInputChange('role', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                  disabled={isLoading}
                >
                  <option value="sales">Sales</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="editPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password <span className="text-gray-500">(optional)</span>
                </label>
                <div className="relative">
                  <input
                    id="editPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={editUserForm.password}
                    onChange={(e) => handleEditInputChange('password', e.target.value)}
                    className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Leave blank to keep current password"
                    disabled={isLoading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to keep the current password. Minimum 6 characters if changing.
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <ActionButton
                label="Cancel"
                onClick={handleCloseEditModal}
                variant="secondary"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? 'Updating User...' : 'Update User'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
        size="md"
        preventClose={isLoading}
      >
        {selectedUser && (
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Delete User</h3>
                <p className="text-gray-600">This action cannot be undone.</p>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">
                Are you sure you want to delete <strong>{selectedUser.name}</strong>? 
                This will permanently remove the user and all associated data.
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <ActionButton
                label="Cancel"
                onClick={() => setIsDeleteModalOpen(false)}
                variant="secondary"
                disabled={isLoading}
              />
              <button
                onClick={handleDeleteUser}
                disabled={isLoading}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete User
                  </>
                )}
              </button>
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