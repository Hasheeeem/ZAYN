import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Phone,
  Mail,
  Calendar,
  Clock,
  ExternalLink,
  ChevronDown,
  User,
  MapPin,
  Trash2,
  Save,
  Plus,
} from 'lucide-react';

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

// Activity log for demo
interface Activity {
  id: number;
  opportunityId: number;
  type: 'call' | 'email' | 'note' | 'meeting';
  note: string;
  timestamp: Date;
}

const OpportunityDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newActivityType, setNewActivityType] = useState<Activity['type']>('note');
  
  // Sample activities for demo
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: 1,
      opportunityId: 1,
      type: 'call',
      note: 'Initial discovery call, discussed requirements',
      timestamp: new Date(2023, 5, 15, 10, 30),
    },
    {
      id: 2,
      opportunityId: 1,
      type: 'email',
      note: 'Sent follow-up email with product details',
      timestamp: new Date(2023, 5, 16, 15, 45),
    },
    {
      id: 3,
      opportunityId: 1,
      type: 'meeting',
      note: 'Product demo meeting with technical team',
      timestamp: new Date(2023, 5, 18, 13, 0),
    },
    {
      id: 4,
      opportunityId: 2,
      type: 'call',
      note: 'Discussed pricing options',
      timestamp: new Date(2023, 5, 14, 11, 15),
    },
  ]);
  
  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        const response = await fetch(`http://localhost:3001/opportunities/${id}`);
        
        // For demo, we'll simulate the response
        const data = await fetch('http://localhost:3001/opportunities');
        const opportunities = await data.json();
        const opp = opportunities.find((o: Opportunity) => o.id === parseInt(id || '0'));
        
        if (opp) {
          setOpportunity(opp);
        } else {
          navigate('/sales/opportunities');
        }
      } catch (error) {
        console.error('Error fetching opportunity:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOpportunity();
  }, [id, navigate]);
  
  // Add a new activity
  const handleAddActivity = () => {
    if (!newNote.trim()) return;
    
    const newActivity: Activity = {
      id: activities.length + 1,
      opportunityId: parseInt(id || '0'),
      type: newActivityType,
      note: newNote,
      timestamp: new Date(),
    };
    
    setActivities([...activities, newActivity]);
    setNewNote('');
  };
  
  // Update opportunity status
  const handleStatusChange = (newStatus: Opportunity['status']) => {
    if (!opportunity) return;
    
    setOpportunity({
      ...opportunity,
      status: newStatus,
      last_update: new Date().toISOString(),
    });
    
    // Add a note about the status change
    const newActivity: Activity = {
      id: activities.length + 1,
      opportunityId: parseInt(id || '0'),
      type: 'note',
      note: `Status changed to ${newStatus}`,
      timestamp: new Date(),
    };
    
    setActivities([...activities, newActivity]);
  };
  
  // Filter activities for this opportunity
  const opportunityActivities = activities.filter(
    activity => activity.opportunityId === parseInt(id || '0')
  );
  
  // Sort activities by timestamp (newest first)
  const sortedActivities = [...opportunityActivities].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-500"></div>
      </div>
    );
  }
  
  if (!opportunity) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Opportunity not found. <a href="/sales/opportunities" className="underline">Go back</a>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/sales/opportunities')}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{opportunity.customer_name}</h1>
            <p className="text-gray-500">
              {opportunity.domain} • {opportunity.product}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setEditMode(!editMode)}
            className="btn btn-secondary flex items-center"
          >
            <Edit2 className="h-5 w-5 mr-2" />
            {editMode ? 'Cancel Edit' : 'Edit'}
          </button>
          {editMode && (
            <button className="btn btn-primary flex items-center">
              <Save className="h-5 w-5 mr-2" />
              Save Changes
            </button>
          )}
        </div>
      </div>
      
      {/* Main content - 2 column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Opportunity details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status & Details Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Opportunity Details</h2>
              <div className="relative inline-block text-left">
                <span
                  className={`badge badge-${opportunity.status.toLowerCase()} flex items-center cursor-pointer`}
                >
                  {opportunity.status}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </span>
                
                {/* Status Dropdown */}
                <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 hidden">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <button
                      onClick={() => handleStatusChange('New')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      New
                    </button>
                    <button
                      onClick={() => handleStatusChange('Expiring')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Expiring
                    </button>
                    <button
                      onClick={() => handleStatusChange('Registered')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Registered
                    </button>
                    <button
                      onClick={() => handleStatusChange('Flagged')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Flagged
                    </button>
                    <button
                      onClick={() => handleStatusChange('Expired')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Expired
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Customer Information</h3>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <User className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{opportunity.customer_name}</p>
                      <p className="text-sm text-gray-500">{opportunity.customer_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-sm text-gray-900">{opportunity.customer_phone || 'No phone provided'}</p>
                  </div>
                  <div className="flex items-center">
                    <ExternalLink className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-sm text-gray-900">{opportunity.domain}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Opportunity Details</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="text-sm font-medium text-gray-900">${opportunity.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Clicks</p>
                      <p className="text-sm font-medium text-gray-900">{opportunity.clicks}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Created Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(opportunity.date_created).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Update</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(opportunity.last_update).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Product</p>
                      <p className="text-sm font-medium text-gray-900">{opportunity.product}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Brand</p>
                      <p className="text-sm font-medium text-gray-900">{opportunity.brand}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Source</p>
                      <p className="text-sm font-medium text-gray-900">{opportunity.source}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Notes</h3>
              {editMode ? (
                <textarea
                  value={opportunity.notes}
                  onChange={e => setOpportunity({ ...opportunity, notes: e.target.value })}
                  className="form-input h-24"
                  placeholder="Add notes about this opportunity..."
                />
              ) : (
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                  {opportunity.notes || 'No notes yet'}
                </p>
              )}
            </div>
          </div>
          
          {/* Activity Timeline */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Activity Timeline</h2>
              <div className="flex items-center space-x-2">
                <div className="inline-flex rounded-md">
                  <button
                    onClick={() => setNewActivityType('note')}
                    className={`flex items-center px-3 py-1.5 border rounded-l-md text-sm ${
                      newActivityType === 'note'
                        ? 'bg-accent-100 border-accent-300 text-accent-700'
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Note
                  </button>
                  <button
                    onClick={() => setNewActivityType('call')}
                    className={`flex items-center px-3 py-1.5 border-t border-b border-r text-sm ${
                      newActivityType === 'call'
                        ? 'bg-accent-100 border-accent-300 text-accent-700'
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </button>
                  <button
                    onClick={() => setNewActivityType('email')}
                    className={`flex items-center px-3 py-1.5 border-t border-b border-r text-sm ${
                      newActivityType === 'email'
                        ? 'bg-accent-100 border-accent-300 text-accent-700'
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </button>
                  <button
                    onClick={() => setNewActivityType('meeting')}
                    className={`flex items-center px-3 py-1.5 border-t border-b border-r rounded-r-md text-sm ${
                      newActivityType === 'meeting'
                        ? 'bg-accent-100 border-accent-300 text-accent-700'
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Meeting
                  </button>
                </div>
              </div>
            </div>
            
            {/* Add New Activity */}
            <div className="mb-6">
              <div className="flex space-x-2">
                <textarea
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  className="form-input flex-1"
                  placeholder={`Add a ${newActivityType}...`}
                  rows={2}
                />
                <button
                  onClick={handleAddActivity}
                  disabled={!newNote.trim()}
                  className="btn btn-primary self-end flex-shrink-0"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Activity List */}
            <div className="flow-root">
              <ul className="-mb-8">
                {sortedActivities.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== sortedActivities.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span
                            className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              activity.type === 'call'
                                ? 'bg-accent-100 text-accent-600'
                                : activity.type === 'email'
                                ? 'bg-blue-100 text-blue-600'
                                : activity.type === 'meeting'
                                ? 'bg-purple-100 text-purple-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {activity.type === 'call' && <Phone className="h-5 w-5" />}
                            {activity.type === 'email' && <Mail className="h-5 w-5" />}
                            {activity.type === 'meeting' && <Calendar className="h-5 w-5" />}
                            {activity.type === 'note' && <Edit2 className="h-5 w-5" />}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-900">{activity.note}</p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500 flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <time dateTime={activity.timestamp.toISOString()}>
                              {activity.timestamp.toLocaleString()}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Right column - Actions & Info */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="btn btn-primary w-full flex items-center justify-center">
                <Phone className="h-5 w-5 mr-2" />
                Call Customer
              </button>
              <button className="btn btn-primary w-full flex items-center justify-center">
                <Mail className="h-5 w-5 mr-2" />
                Send Email
              </button>
              <button className="btn btn-primary w-full flex items-center justify-center">
                <Calendar className="h-5 w-5 mr-2" />
                Schedule Meeting
              </button>
              <button className="btn btn-secondary w-full flex items-center justify-center">
                <Edit2 className="h-5 w-5 mr-2" />
                Create Task
              </button>
            </div>
          </div>
          
          {/* Stage Progression */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Stage Progression</h2>
            <div className="space-y-4">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-accent-600 bg-accent-200">
                      Progress
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-accent-600">
                      {opportunity.status === 'New'
                        ? '20%'
                        : opportunity.status === 'Expiring'
                        ? '40%'
                        : opportunity.status === 'Flagged'
                        ? '60%'
                        : opportunity.status === 'Registered'
                        ? '100%'
                        : '0%'}
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-accent-200">
                  <div
                    style={{
                      width:
                        opportunity.status === 'New'
                          ? '20%'
                          : opportunity.status === 'Expiring'
                          ? '40%'
                          : opportunity.status === 'Flagged'
                          ? '60%'
                          : opportunity.status === 'Registered'
                          ? '100%'
                          : '0%',
                    }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-accent-500"
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => handleStatusChange('New')}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                    opportunity.status === 'New'
                      ? 'bg-accent-100 text-accent-700 font-medium'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  1. New Lead
                </button>
                <button
                  onClick={() => handleStatusChange('Expiring')}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                    opportunity.status === 'Expiring'
                      ? 'bg-accent-100 text-accent-700 font-medium'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  2. Contacted
                </button>
                <button
                  onClick={() => handleStatusChange('Flagged')}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                    opportunity.status === 'Flagged'
                      ? 'bg-accent-100 text-accent-700 font-medium'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  3. Qualified
                </button>
                <button
                  onClick={() => handleStatusChange('Registered')}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                    opportunity.status === 'Registered'
                      ? 'bg-accent-100 text-accent-700 font-medium'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  4. Registered
                </button>
                <button
                  onClick={() => handleStatusChange('Expired')}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                    opportunity.status === 'Expired'
                      ? 'bg-accent-100 text-accent-700 font-medium'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  4. Expired
                </button>
              </div>
            </div>
          </div>
          
          {/* Upcoming Tasks */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Tasks</h2>
            <div className="space-y-3">
              <div className="flex items-start p-3 rounded-md bg-gray-50">
                <Clock className="h-5 w-5 text-accent-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Follow up call</p>
                  <p className="text-xs text-gray-500">Tomorrow, 10:00 AM</p>
                </div>
              </div>
              <div className="flex items-start p-3 rounded-md bg-gray-50">
                <Mail className="h-5 w-5 text-accent-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Send proposal</p>
                  <p className="text-xs text-gray-500">Friday, 2:00 PM</p>
                </div>
              </div>
              
              <button className="btn btn-secondary w-full flex items-center justify-center mt-4">
                <Plus className="h-5 w-5 mr-2" />
                Add Task
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetails;