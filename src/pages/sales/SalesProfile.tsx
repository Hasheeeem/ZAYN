import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, TrendingUp, Edit2, Save, X } from 'lucide-react';
import ActionButton from '../../components/ActionButton';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { format, subDays } from 'date-fns';

const SalesProfile: React.FC = () => {
  const { authState } = useAuth();
  const { leads } = useData();
  const { showNotification } = useNotification();
  const [isEditing, setIsEditing] = useState(false);

  // Calculate actual performance from leads data
  const myLeads = leads.filter(lead => lead.assignedTo === authState.user?.id.toString());
  const convertedLeads = myLeads.filter(lead => lead.status === 'converted');
  const totalRevenue = convertedLeads.reduce((sum, lead) => sum + (lead.pricePaid || lead.price || 0), 0);
  const avgDealSize = convertedLeads.length > 0 ? totalRevenue / convertedLeads.length : 0;
  const conversionRate = myLeads.length > 0 ? (convertedLeads.length / myLeads.length) * 100 : 0;

  // Profile data with real metrics
  const [profile, setProfile] = useState({
    id: 1,
    name: authState.user?.name || 'Sales Representative',
    email: authState.user?.email || 'sales@lead.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    joinDate: '2023-01-15',
    performance: {
      leadsConverted: convertedLeads.length,
      conversionRate: Math.round(conversionRate),
      revenue: totalRevenue,
      avgDealSize: Math.round(avgDealSize),
      totalLeads: myLeads.length
    }
  });

  const [editForm, setEditForm] = useState(profile);

  const handleSave = () => {
    setProfile(editForm);
    setIsEditing(false);
    showNotification('Profile updated successfully', 'success');
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  // Recent activity from actual leads
  const recentActivity = myLeads
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((lead, index) => ({
      id: index + 1,
      type: lead.status === 'converted' ? 'conversion' : 
            lead.status === 'contacted' ? 'call' : 
            lead.status === 'qualified' ? 'qualification' : 'new-lead',
      description: `${lead.status === 'converted' ? 'Successfully converted' : 
                    lead.status === 'contacted' ? 'Contacted' : 
                    lead.status === 'qualified' ? 'Qualified' : 'New lead assigned'}: ${lead.companyName || lead.domain}`,
      date: format(new Date(lead.createdAt), 'yyyy-MM-dd'),
      value: lead.status === 'converted' ? `$${lead.pricePaid || lead.price || 0}` : undefined
    }));

  const performanceStats = [
    {
      title: 'Total Leads',
      value: profile.performance.totalLeads,
      icon: <User size={24} />,
      color: 'blue'
    },
    {
      title: 'Leads Converted',
      value: profile.performance.leadsConverted,
      icon: <TrendingUp size={24} />,
      color: 'green'
    },
    {
      title: 'Conversion Rate',
      value: `${profile.performance.conversionRate}%`,
      icon: <TrendingUp size={24} />,
      color: 'purple'
    },
    {
      title: 'Total Revenue',
      value: `$${profile.performance.revenue.toLocaleString()}`,
      icon: <TrendingUp size={24} />,
      color: 'yellow'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'conversion':
        return <TrendingUp className="text-green-600" size={16} />;
      case 'call':
        return <Phone className="text-blue-600" size={16} />;
      case 'qualification':
        return <User className="text-purple-600" size={16} />;
      case 'new-lead':
        return <User className="text-gray-600" size={16} />;
      default:
        return <User className="text-gray-600" size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">My Profile</h2>
        {!isEditing ? (
          <ActionButton
            label="Edit Profile"
            icon={<Edit2 size={18} />}
            onClick={() => setIsEditing(true)}
            variant="primary"
          />
        ) : (
          <div className="flex gap-2">
            <ActionButton
              label="Cancel"
              icon={<X size={18} />}
              onClick={handleCancel}
              variant="secondary"
            />
            <ActionButton
              label="Save"
              icon={<Save size={18} />}
              onClick={handleSave}
              variant="success"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                {profile.name.charAt(0)}
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="text-xl font-semibold text-center w-full border rounded-lg px-3 py-2"
                />
              ) : (
                <h3 className="text-xl font-semibold text-gray-800">{profile.name}</h3>
              )}
              <p className="text-gray-600">Sales Representative</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="text-gray-400" size={20} />
                {isEditing ? (
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="flex-1 border rounded-lg px-3 py-2"
                  />
                ) : (
                  <span className="text-gray-700">{profile.email}</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Phone className="text-gray-400" size={20} />
                {isEditing ? (
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="flex-1 border rounded-lg px-3 py-2"
                  />
                ) : (
                  <span className="text-gray-700">{profile.phone}</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="text-gray-400" size={20} />
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="flex-1 border rounded-lg px-3 py-2"
                  />
                ) : (
                  <span className="text-gray-700">{profile.location}</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="text-gray-400" size={20} />
                <span className="text-gray-700">
                  Joined {format(new Date(profile.joinDate), 'MMMM yyyy')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {performanceStats.map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
              />
            ))}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h4 className="font-semibold text-gray-800 mb-4">Recent Activity</h4>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-gray-500">{format(new Date(activity.date), 'MMM dd, yyyy')}</p>
                        {activity.value && (
                          <span className="text-sm font-medium text-green-600">{activity.value}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
                <p className="text-gray-500">Your lead activities will appear here.</p>
              </div>
            )}
          </div>

          {/* Performance Insights */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h4 className="font-semibold text-gray-800 mb-4">Performance Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="text-blue-600" size={24} />
                  <h4 className="font-medium text-blue-800">Conversion Performance</h4>
                </div>
                <p className="text-blue-700">
                  {profile.performance.conversionRate >= 20 ? 'Excellent conversion rate!' : 
                   profile.performance.conversionRate >= 15 ? 'Good conversion performance' :
                   profile.performance.conversionRate >= 10 ? 'Average performance' : 
                   profile.performance.totalLeads > 0 ? 'Room for improvement' : 'No leads assigned yet'}
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="text-green-600" size={24} />
                  <h4 className="font-medium text-green-800">Revenue Impact</h4>
                </div>
                <p className="text-green-700">
                  {profile.performance.revenue > 0 ? 
                    `Generated $${profile.performance.revenue.toLocaleString()} in total revenue with ${profile.performance.leadsConverted} conversions` :
                    'No revenue generated yet'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesProfile;