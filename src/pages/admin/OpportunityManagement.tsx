import { useState, useEffect } from 'react';
import { Search, Filter, Download, PlusCircle, Edit2, Trash2, Info } from 'lucide-react';

interface Opportunity {
  id: number;
  domain: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  price: number;
  clicks: number;
  date_created: string;
  last_update: string;
  status: 'Expiring' | 'Registered' | 'Flagged' | 'Expired' | 'New';
  product: string;
  brand: string;
  source: string;
  assigned_user: number;
  notes: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'sales';
}

const OpportunityManagement = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    user: 'all',
    status: 'all',
    product: 'all',
    brand: 'all',
    source: 'all',
    dateFrom: '',
    dateTo: '',
  });

  // New opportunity form
  const [newOpportunity, setNewOpportunity] = useState<Partial<Opportunity>>({
    domain: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    price: 0,
    status: 'New',
    product: '',
    brand: '',
    source: '',
    assigned_user: 0,
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [opportunitiesResponse, usersResponse] = await Promise.all([
          fetch('http://localhost:3001/opportunities'),
          fetch('http://localhost:3001/users'),
        ]);
        
        const opportunitiesData = await opportunitiesResponse.json();
        const usersData = await usersResponse.json();
        
        setOpportunities(opportunitiesData);
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleAddOpportunity = () => {
    // Validate required fields
    if (!newOpportunity.customer_name) {
      alert('Customer name is required');
      return;
    }
    
    // In a real app, we would make an API call to create the opportunity
    // For demo purposes, we'll simulate it by adding to our local state
    const newOpportunityObj = {
      id: opportunities.length + 1,
      domain: newOpportunity.domain || '',
      customer_name: newOpportunity.customer_name || '',
      customer_email: newOpportunity.customer_email || '',
      customer_phone: newOpportunity.customer_phone || '',
      price: newOpportunity.price || 0,
      clicks: 0,
      date_created: new Date().toISOString().split('T')[0],
      last_update: new Date().toISOString(),
      status: newOpportunity.status as 'New',
      product: newOpportunity.product || '',
      brand: newOpportunity.brand || '',
      source: newOpportunity.source || '',
      assigned_user: newOpportunity.assigned_user || 0,
      notes: newOpportunity.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    setOpportunities([...opportunities, newOpportunityObj]);
    setShowAddModal(false);
    setNewOpportunity({
      domain: '',
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      price: 0,
      status: 'New',
      product: '',
      brand: '',
      source: '',
      assigned_user: 0,
      notes: '',
    });
  };

  const handleDeleteOpportunity = (id: number) => {
    if (confirm('Are you sure you want to delete this opportunity?')) {
      setOpportunities(opportunities.filter(opp => opp.id !== id));
    }
  };

  const handleUpdateStatus = (id: number, newStatus: Opportunity['status']) => {
    setOpportunities(
      opportunities.map(opp => {
        if (opp.id === id) {
          return {
            ...opp,
            status: newStatus,
            last_update: new Date().toISOString(),
          };
        }
        return opp;
      })
    );
  };

  // Filter opportunities based on search query and filters
  const filteredOpportunities = opportunities.filter(opp => {
    // Search query
    const matchesSearch =
      opp.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.customer_email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filters
    const matchesUser = filters.user === 'all' || opp.assigned_user.toString() === filters.user;
    const matchesStatus = filters.status === 'all' || opp.status === filters.status;
    const matchesProduct = filters.product === 'all' || opp.product === filters.product;
    const matchesBrand = filters.brand === 'all' || opp.brand === filters.brand;
    const matchesSource = filters.source === 'all' || opp.source === filters.source;
    
    // Date filters
    let matchesDate = true;
    if (filters.dateFrom && filters.dateTo) {
      const oppDate = new Date(opp.date_created);
      const fromDate = new Date(filters.dateFrom);
      const toDate = new Date(filters.dateTo);
      toDate.setDate(toDate.getDate() + 1); // Include the end date
      
      matchesDate = oppDate >= fromDate && oppDate <= toDate;
    } else if (filters.dateFrom) {
      const oppDate = new Date(opp.date_created);
      const fromDate = new Date(filters.dateFrom);
      matchesDate = oppDate >= fromDate;
    } else if (filters.dateTo) {
      const oppDate = new Date(opp.date_created);
      const toDate = new Date(filters.dateTo);
      toDate.setDate(toDate.getDate() + 1); // Include the end date
      matchesDate = oppDate <= toDate;
    }
    
    return (
      matchesSearch &&
      matchesUser &&
      matchesStatus &&
      matchesProduct &&
      matchesBrand &&
      matchesSource &&
      matchesDate
    );
  });

  // Get unique values for filter dropdowns
  const uniqueProducts = [...new Set(opportunities.map(opp => opp.product))];
  const uniqueBrands = [...new Set(opportunities.map(opp => opp.brand))];
  const uniqueSources = [...new Set(opportunities.map(opp => opp.source))];

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
          <h1 className="text-2xl font-bold text-gray-900">Opportunity Management</h1>
          <p className="text-gray-500">Manage and track sales opportunities</p>
        </div>
        <button
          className="btn btn-primary flex items-center"
          onClick={() => setShowAddModal(true)}
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Add New Opportunity
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row justify-between mb-4">
          <div className="relative flex-1 mb-4 md:mb-0 md:mr-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search opportunities..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 form-input"
            />
          </div>
          <div className="flex space-x-2">
            <button className="btn btn-secondary flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Advanced Filters
            </button>
            <button className="btn btn-secondary flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div>
            <label className="form-label">User</label>
            <select
              value={filters.user}
              onChange={e => setFilters({ ...filters, user: e.target.value })}
              className="form-input"
            >
              <option value="all">All Users</option>
              {users.map(user => (
                <option key={user.id} value={user.id.toString()}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Status</label>
            <select
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}
              className="form-input"
            >
              <option value="all">All Status</option>
              <option value="New">New</option>
              <option value="Expiring">Expiring</option>
              <option value="Registered">Registered</option>
              <option value="Flagged">Flagged</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          <div>
            <label className="form-label">Product</label>
            <select
              value={filters.product}
              onChange={e => setFilters({ ...filters, product: e.target.value })}
              className="form-input"
            >
              <option value="all">All Products</option>
              {uniqueProducts.map(product => (
                <option key={product} value={product}>
                  {product}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Brand</label>
            <select
              value={filters.brand}
              onChange={e => setFilters({ ...filters, brand: e.target.value })}
              className="form-input"
            >
              <option value="all">All Brands</option>
              {uniqueBrands.map(brand => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Opportunities Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="w-8">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              </th>
              <th>Domain</th>
              <th>Customer</th>
              <th>Price</th>
              <th>Clicks</th>
              <th>Date</th>
              <th>Status</th>
              <th>Product</th>
              <th>Brand</th>
              <th>Source</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredOpportunities.map(opp => (
              <tr key={opp.id}>
                <td>
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                </td>
                <td className="font-medium text-gray-900">{opp.domain}</td>
                <td>
                  <div>{opp.customer_name}</div>
                  <div className="text-xs text-gray-500">{opp.customer_email}</div>
                </td>
                <td>${opp.price.toFixed(2)}</td>
                <td>{opp.clicks}</td>
                <td>{new Date(opp.date_created).toLocaleDateString()}</td>
                <td>
                  <span className={`badge badge-${opp.status.toLowerCase()}`}>
                    {opp.status}
                  </span>
                </td>
                <td>{opp.product}</td>
                <td>{opp.brand}</td>
                <td>{opp.source}</td>
                <td>
                  <div className="flex space-x-2">
                    <button
                      className="text-primary-600 hover:text-primary-900"
                      title="View Details"
                    >
                      <Info className="h-5 w-5" />
                    </button>
                    <button
                      className="text-primary-600 hover:text-primary-900"
                      title="Edit"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteOpportunity(opp.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-lg">
        <div className="flex-1 flex justify-between sm:hidden">
          <button className="btn btn-secondary">Previous</button>
          <button className="btn btn-secondary">Next</button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to{' '}
              <span className="font-medium">{filteredOpportunities.length}</span> of{' '}
              <span className="font-medium">{opportunities.length}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Previous
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                1
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-primary-50 text-sm font-medium text-primary-600 hover:bg-primary-100">
                2
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                3
              </button>
              <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Add Opportunity Modal */}
      {showAddModal && (
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
                    <PlusCircle className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Opportunity</h3>
                    <div className="mt-4 grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label htmlFor="domain" className="form-label">Domain</label>
                        <input
                          type="text"
                          id="domain"
                          value={newOpportunity.domain}
                          onChange={e => setNewOpportunity({ ...newOpportunity, domain: e.target.value })}
                          className="form-input"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="customer_name" className="form-label">Customer Name *</label>
                        <input
                          type="text"
                          id="customer_name"
                          value={newOpportunity.customer_name}
                          onChange={e => setNewOpportunity({ ...newOpportunity, customer_name: e.target.value })}
                          className="form-input"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="customer_email" className="form-label">Customer Email</label>
                        <input
                          type="email"
                          id="customer_email"
                          value={newOpportunity.customer_email}
                          onChange={e => setNewOpportunity({ ...newOpportunity, customer_email: e.target.value })}
                          className="form-input"
                        />
                      </div>

                      <div>
                        <label htmlFor="customer_phone" className="form-label">Customer Phone</label>
                        <input
                          type="text"
                          id="customer_phone"
                          value={newOpportunity.customer_phone}
                          onChange={e => setNewOpportunity({ ...newOpportunity, customer_phone: e.target.value })}
                          className="form-input"
                        />
                      </div>

                      <div>
                        <label htmlFor="price" className="form-label">Price</label>
                        <input
                          type="number"
                          id="price"
                          min="0"
                          step="0.01"
                          value={newOpportunity.price}
                          onChange={e => setNewOpportunity({ ...newOpportunity, price: parseFloat(e.target.value) })}
                          className="form-input"
                        />
                      </div>

                      <div>
                        <label htmlFor="status" className="form-label">Status</label>
                        <select
                          id="status"
                          value={newOpportunity.status}
                          onChange={e => setNewOpportunity({ ...newOpportunity, status: e.target.value as any })}
                          className="form-input"
                        >
                          <option value="New">New</option>
                          <option value="Expiring">Expiring</option>
                          <option value="Registered">Registered</option>
                          <option value="Flagged">Flagged</option>
                          <option value="Expired">Expired</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="product" className="form-label">Product</label>
                        <input
                          type="text"
                          id="product"
                          value={newOpportunity.product}
                          onChange={e => setNewOpportunity({ ...newOpportunity, product: e.target.value })}
                          className="form-input"
                        />
                      </div>

                      <div>
                        <label htmlFor="brand" className="form-label">Brand</label>
                        <input
                          type="text"
                          id="brand"
                          value={newOpportunity.brand}
                          onChange={e => setNewOpportunity({ ...newOpportunity, brand: e.target.value })}
                          className="form-input"
                        />
                      </div>

                      <div>
                        <label htmlFor="source" className="form-label">Source</label>
                        <input
                          type="text"
                          id="source"
                          value={newOpportunity.source}
                          onChange={e => setNewOpportunity({ ...newOpportunity, source: e.target.value })}
                          className="form-input"
                        />
                      </div>

                      <div>
                        <label htmlFor="assigned_user" className="form-label">Assigned User</label>
                        <select
                          id="assigned_user"
                          value={newOpportunity.assigned_user}
                          onChange={e => setNewOpportunity({ ...newOpportunity, assigned_user: parseInt(e.target.value) })}
                          className="form-input"
                        >
                          <option value={0}>Unassigned</option>
                          {users.filter(user => user.role === 'sales').map(user => (
                            <option key={user.id} value={user.id}>
                              {user.username}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="notes" className="form-label">Notes</label>
                        <textarea
                          id="notes"
                          rows={3}
                          value={newOpportunity.notes}
                          onChange={e => setNewOpportunity({ ...newOpportunity, notes: e.target.value })}
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="btn btn-primary sm:ml-3"
                  onClick={handleAddOpportunity}
                >
                  Add Opportunity
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
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

export default OpportunityManagement;