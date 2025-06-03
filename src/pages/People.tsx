import React, { useState } from 'react';
import DataTable from '../components/DataTable';
import ActionButton from '../components/ActionButton';
import Modal from '../components/Modal';
import SearchFilter from '../components/SearchFilter';
import { useData } from '../context/DataContext';
import { useNotification } from '../context/NotificationContext';
import { User } from '../types/auth';
import { Plus } from 'lucide-react';

const People: React.FC = () => {
  const { managementUsers } = useData();
  const { showNotification } = useNotification();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'manager' | 'user'>('user');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Simple filtering function for demo
  const filteredUsers = managementUsers.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === '' || user.role === roleFilter;
    const matchesStatus = statusFilter === '' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });
  
  const handleAddUser = () => {
    if (!firstName || !lastName || !email) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    showNotification('User added successfully', 'success');
    setIsModalOpen(false);
    resetForm();
  };
  
  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setRole('user');
    setStatus('active');
  };
  
  const handleEditUser = (id: number) => {
    showNotification('Edit user feature coming soon!', 'info');
  };
  
  const handleViewUser = (id: number) => {
    showNotification('View user feature coming soon!', 'info');
  };
  
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (value: string) => value.charAt(0).toUpperCase() + value.slice(1) },
    { key: 'status', label: 'Status' },
    { key: 'lastLogin', label: 'Last Login' }
  ];
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">User Management</h2>
        <ActionButton 
          label="Add New User" 
          icon={<Plus size={18} />}
          onClick={() => setIsModalOpen(true)} 
          variant="primary"
        />
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <SearchFilter 
          searchPlaceholder="Search users..." 
          onSearch={setSearchTerm}
          filters={[
            {
              label: 'All Roles',
              value: roleFilter,
              onChange: setRoleFilter,
              options: [
                { value: 'admin', label: 'Admin' },
                { value: 'manager', label: 'Manager' },
                { value: 'user', label: 'User' }
              ]
            },
            {
              label: 'All Status',
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ]
            }
          ]}
        />
      </div>
      
      <DataTable 
        columns={columns} 
        data={filteredUsers} 
        actions={{
          edit: handleEditUser,
          view: handleViewUser
        }}
        statusType="user"
      />
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Add New User"
        footer={
          <>
            <ActionButton 
              label="Cancel" 
              onClick={() => setIsModalOpen(false)} 
              variant="secondary"
            />
            <ActionButton 
              label="Add User" 
              onClick={handleAddUser} 
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="user">User</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter temporary password"
            required
          />
          <p className="mt-1 text-xs text-gray-500">User will be prompted to change this on first login</p>
        </div>
      </Modal>
    </div>
  );
};

export default People;