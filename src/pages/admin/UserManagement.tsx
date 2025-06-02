import { useState, useEffect } from 'react';
import { Users, PlusCircle, Trash2, Edit2, Search, Check, X } from 'lucide-react';

interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  role: 'admin' | 'sales';
  status: 'active' | 'inactive';
  created_at: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form state for new user
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'sales' as const,
  });

  // Form validation
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3001/users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAddUser = () => {
    // Validate form
    const newErrors = {
      username: !newUser.username ? 'Username is required' : '',
      email: !newUser.email ? 'Email is required' : '',
      password: !newUser.password ? 'Password is required' : '',
    };

    if (newErrors.username || newErrors.email || newErrors.password) {
      setErrors(newErrors);
      return;
    }

    // In a real app, we would make an API call to create the user
    // For demo purposes, we'll simulate it by adding to our local state
    const newUserObj = {
      id: users.length + 1,
      username: newUser.username,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      status: 'active' as const,
      created_at: new Date().toISOString(),
    };

    setUsers([...users, newUserObj]);
    setShowAddUserModal(false);
    setNewUser({
      username: '',
      email: '',
      phone: '',
      password: '',
      role: 'sales',
    });
    setErrors({
      username: '',
      email: '',
      password: '',
    });
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const handleToggleStatus = (userId: number) => {
    setUsers(
      users.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            status: user.status === 'active' ? 'inactive' : 'active',
          };
        }
        return user;
      })
    );
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    setUsers(
      users.map(user => {
        if (user.id === editingUser.id) {
          return editingUser;
        }
        return user;
      })
    );
    setEditingUser(null);
  };

  // Filter users based on search query and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500">Manage user accounts and permissions</p>
        </div>
        <button
          className="btn btn-primary flex items-center"
          onClick={() => setShowAddUserModal(true)}
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Add New User
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 form-input"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="form-input"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="sales">Sales</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="form-input"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td className="font-medium text-gray-900">
                  {editingUser?.id === user.id ? (
                    <input
                      type="text"
                      value={editingUser.username}
                      onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
                      className="form-input"
                    />
                  ) : (
                    user.username
                  )}
                </td>
                <td>
                  {editingUser?.id === user.id ? (
                    <input
                      type="email"
                      value={editingUser.email}
                      onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                      className="form-input"
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td>
                  {editingUser?.id === user.id ? (
                    <input
                      type="text"
                      value={editingUser.phone}
                      onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })}
                      className="form-input"
                    />
                  ) : (
                    user.phone
                  )}
                </td>
                <td>
                  {editingUser?.id === user.id ? (
                    <select
                      value={editingUser.role}
                      onChange={e => setEditingUser({ ...editingUser, role: e.target.value as 'admin' | 'sales' })}
                      className="form-input"
                    >
                      <option value="admin">Admin</option>
                      <option value="sales">Sales</option>
                    </select>
                  ) : (
                    <span className={`badge ${user.role === 'admin' ? 'bg-primary-100 text-primary-800' : 'bg-accent-100 text-accent-800'}`}>
                      {user.role}
                    </span>
                  )}
                </td>
                <td>
                  {editingUser?.id === user.id ? (
                    <select
                      value={editingUser.status}
                      onChange={e => setEditingUser({ ...editingUser, status: e.target.value as 'active' | 'inactive' })}
                      className="form-input"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  ) : (
                    <span
                      className={`badge ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.status}
                    </span>
                  )}
                </td>
                <td>
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td>
                  <div className="flex space-x-2">
                    {editingUser?.id === user.id ? (
                      <>
                        <button
                          onClick={handleUpdateUser}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setEditingUser(null)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingUser(user)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className={`${
                            user.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {user.status === 'active' ? (
                            <X className="h-5 w-5" />
                          ) : (
                            <Check className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Users className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Add New User</h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="username" className="form-label">
                          Username
                        </label>
                        <input
                          type="text"
                          id="username"
                          value={newUser.username}
                          onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                          className={`form-input ${errors.username ? 'border-red-500' : ''}`}
                        />
                        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                      </div>

                      <div>
                        <label htmlFor="email" className="form-label">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={newUser.email}
                          onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                          className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <label htmlFor="phone" className="form-label">
                          Phone
                        </label>
                        <input
                          type="text"
                          id="phone"
                          value={newUser.phone}
                          onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
                          className="form-input"
                        />
                      </div>

                      <div>
                        <label htmlFor="password" className="form-label">
                          Password
                        </label>
                        <input
                          type="password"
                          id="password"
                          value={newUser.password}
                          onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                          className={`form-input ${errors.password ? 'border-red-500' : ''}`}
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                      </div>

                      <div>
                        <label htmlFor="role" className="form-label">
                          Role
                        </label>
                        <select
                          id="role"
                          value={newUser.role}
                          onChange={e => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'sales' })}
                          className="form-input"
                        >
                          <option value="admin">Admin</option>
                          <option value="sales">Sales</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="btn btn-primary sm:ml-3"
                  onClick={handleAddUser}
                >
                  Add User
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddUserModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;