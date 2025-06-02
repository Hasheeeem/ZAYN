import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Download, Edit2, Phone, Mail, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

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

const MyOpportunities = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    product: 'all',
    dateFrom: '',
    dateTo: '',
  });
  
  // Activity log for demo
  const [activityLog, setActivityLog] = useState<{
    id: number;
    opportunityId: number;
    type: string;
    note: string;
    timestamp: Date;
  }[]>([
    {
      id: 1,
      opportunityId: 1,
      type: 'call',
      note: 'Left voicemail about renewal options',
      timestamp: new Date(2023, 5, 15, 10, 30),
    },
    {
      id: 2,
      opportunityId: 2,
      type: 'email',
      note: 'Sent follow-up email with price quotes',
      timestamp: new Date(2023, 5, 14, 15, 45),
    },
  ]);
  
  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const response = await fetch('http://localhost:3001/opportunities');
        const data = await response.json();
        
        // Filter opportunities assigned to the current user
        if (user) {
          const myOpportunities = data.filter(
            (opp: Opportunity) => opp.assigned_user === user.id
          );
          setOpportunities(myOpportunities);
        }
      } catch (error) {
        console.error('Error fetching opportunities:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOpportunities();
  }, [user]);
  
  // Log a new activity
  const handleLogActivity = (opportunityId: number, type: string, note: string) => {
    const newActivity = {
      id: activityLog.length + 1,
      opportunityId,
      type,
      note,
      timestamp: new Date(),
    };
    
    setActivityLog([...activityLog, newActivity]);
  };
  
  // Get activities for a specific opportunity
  const getActivitiesForOpportunity = (opportunityId: number) => {
    return activityLog.filter(activity => activity.opportunityId === opportunityId);
  };
  
  // Filter opportunities based on search query and filters
  const filteredOpportunities = opportunities.filter(opp => {
    // Search query
    const matchesSearch =
      opp.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.customer_email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filters
    const matchesStatus = filters.status === 'all' || opp.status === filters.status;
    const matchesProduct = filters.product === 'all' || opp.product === filters.product;
    
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
    
    return matchesSearch && matchesStatus && matchesProduct && matchesDate;
  });
  
  // Get unique values for filter dropdowns
  const uniqueProducts = [...new Set(opportunities.map(opp => opp.product))];
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Opportunities</h1>
        <p className="text-gray-500">Manage your assigned leads and opportunities</p>
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
              Filters
            </button>
            <button className="btn btn-secondary flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Export
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <label className="form-label">Date Created</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
              className="form-input"
            />
          </div>
        </div>
      </div>
      
      {/* Opportunities Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredOpportunities.length === 0 ? (
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-500">No opportunities found matching your criteria.</p>
          </div>
        ) : (
          filteredOpportunities.map(opp => (
            <div key={opp.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{opp.customer_name}</h3>
                    <p className="text-sm text-gray-500">{opp.domain}</p>
                  </div>
                  <span className={`badge badge-${opp.status.toLowerCase()}`}>
                    {opp.status}
                  </span>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Product</p>
                    <p className="text-sm font-medium">{opp.product}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Value</p>
                    <p className="text-sm font-medium">${opp.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="text-sm font-medium">
                      {new Date(opp.date_created).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Source</p>
                    <p className="text-sm font-medium">{opp.source}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-xs text-gray-500">Notes</p>
                  <p className="text-sm">{opp.notes || 'No notes yet'}</p>
                </div>
                
                <div className="mt-4">
                  <p className="text-xs text-gray-500">Recent Activity</p>
                  <div className="mt-2 space-y-2">
                    {getActivitiesForOpportunity(opp.id).length > 0 ? (
                      getActivitiesForOpportunity(opp.id)
                        .slice(0, 2)
                        .map(activity => (
                          <div key={activity.id} className="flex items-start text-sm">
                            {activity.type === 'call' && (
                              <Phone className="h-4 w-4 text-accent-500 mr-2 mt-0.5" />
                            )}
                            {activity.type === 'email' && (
                              <Mail className="h-4 w-4 text-accent-500 mr-2 mt-0.5" />
                            )}
                            {activity.type === 'note' && (
                              <Edit2 className="h-4 w-4 text-accent-500 mr-2 mt-0.5" />
                            )}
                            <div>
                              <p className="text-gray-800">{activity.note}</p>
                              <p className="text-xs text-gray-500">
                                {activity.timestamp.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))
                    ) : (
                      <p className="text-sm text-gray-500">No recent activity</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Link
                    to={`/sales/opportunities/${opp.id}`}
                    className="btn btn-primary flex-1 text-center"
                  >
                    View Details
                  </Link>
                  
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleLogActivity(opp.id, 'call', 'Placed a call')}
                      className="flex items-center justify-center p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                      title="Log Call"
                    >
                      <Phone className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleLogActivity(opp.id, 'email', 'Sent an email')}
                      className="flex items-center justify-center p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                      title="Log Email"
                    >
                      <Mail className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleLogActivity(opp.id, 'note', 'Added a note')}
                      className="flex items-center justify-center p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                      title="Add Note"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Pagination (if needed) */}
      {filteredOpportunities.length > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-md">
          <div className="flex-1 flex justify-between">
            <button className="btn btn-secondary">Previous</button>
            <button className="btn btn-secondary">Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOpportunities;