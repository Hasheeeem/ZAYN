import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, TrendingUp, Edit2, Save, X, Clock, Star } from 'lucide-react';
import ActionButton from '../../components/ActionButton';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useNotification } from '../../context/NotificationContext';
import { format, subDays } from 'date-fns';

interface SalesProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  joinDate: string;
  performance: {
    leadsConverted: number;
    conversionRate: number;
    revenue: number;
    avgDealSize: number;
    clientSatisfaction: number;
  };
  recentActivity: Array<{
    id: number;
    type: 'conversion' | 'call' | 'meeting' | 'achievement';
    description: string;
    date: string;
    value?: string;
  }>;
}

const SalesProfile: React.FC = () => {
  const { authState } = useAuth();
  const { leads } = useData();
  const { showNotification } = useNotification();
  const [isEditing, setIsEditing] = useState(false);

  // Calculate actual performance from leads data
  const myLeads = leads.filter(lead => lead.assignedTo === authState.user?.id.toString());
  const convertedLeads = myLeads.filter(lead => lead.status === 'converted');
  const totalRevenue = convertedLeads.reduce((sum, lead) => sum + lead.price, 0);
  const avgDealSize = convertedLeads.length > 0 ? totalRevenue / convertedLeads.length : 0;
  const conversionRate = myLeads.length > 0 ? (convertedLeads.length / myLeads.length) * 100 : 0;

  // Simplified sales profile data
  const [profile, setProfile] = useState<SalesProfile>({
    id: 1,
    name: authState.user?.name || 'Alex Sales',
    email: authState.user?.email || 'alex@lead.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    joinDate: '2023-01-15',
    performance: {
      leadsConverted: convertedLeads.length,
      conversionRate: Math.round(conversionRate),
      revenue: totalRevenue,
      avgDealSize: Math.round(avgDealSize),
      clientSatisfaction: 4.8
    },
    recentActivity: [
      {
        id: 1,
        type: 'conversion',
        description: 'Successfully closed deal with HealthTech App',
        date: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
        value: '$8,900'
      },
      {
        id: 2,
        type: 'meeting',
        description: 'Product demo with TechStartup completed',
        date: format(subDays(new Date(), 2), 'yyyy-MM-dd')
      },
      {
        id: 3,
        type: 'call',
        description: 'Follow-up call with Fintech Solutions',
        date: format(subDays(new Date(), 3), 'yyyy-MM-dd')
      },
      {
        id: 4,
        type: 'conversion',
        description: 'Converted Blockchain Dev lead',
        date: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
        value: '$22,000'
      },
      {
        id: 5,
        type: 'achievement',
        description: 'Reached monthly target ahead of schedule',
        date: format(subDays(new Date(), 7), 'yyyy-MM-dd')
      }
    ]
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

  const performanceStats = [
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
      color: 'blue'
    },
    {
      title: 'Revenue Generated',
      value: `$${profile.performance.revenue.toLocaleString()}`,
      icon: <TrendingUp size={24} />,
      color: 'purple'
    },
    {
      title: 'Avg Deal Size',
      value: `$${profile.performance.avgDealSize.toLocaleString()}`,
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
      case 'meeting':
        return <User className="text-purple-600" size={16} />;
      case 'achievement':
        return <Star className="text-yellow-600" size={16} />;
      default:
        return <Clock className="text-gray-600" size={16} />;
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
              <div className="flex items-center justify-center gap-1 mt-2">
                <Star className="text-yellow-500 fill-current" size={16} />
                <span className="text-sm font-medium">{profile.performance.clientSatisfaction}/5.0</span>
                <span className="text-xs text-gray-500">Client Rating</span>
              </div>
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
            <div className="space-y-4">
              {profile.recentActivity.map((activity) => (
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
                   profile.performance.conversionRate >= 10 ? 'Average performance' : 'Room for improvement'}
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="text-green-600" size={24} />
                  <h4 className="font-medium text-green-800">Revenue Impact</h4>
                </div>
                <p className="text-green-700">
                  Generated ${profile.performance.revenue.toLocaleString()} in total revenue with {profile.performance.leadsConverted} conversions
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