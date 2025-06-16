import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Award, Target, TrendingUp, Edit2, Save, X, Briefcase, Star, Clock } from 'lucide-react';
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
  bio: string;
  achievements: string[];
  certifications: string[];
  skills: string[];
  targets: {
    monthly: number;
    quarterly: number;
    yearly: number;
  };
  performance: {
    leadsConverted: number;
    conversionRate: number;
    revenue: number;
    ranking: number;
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

  // Comprehensive sales profile data
  const [profile, setProfile] = useState<SalesProfile>({
    id: 1,
    name: authState.user?.name || 'Alex Sales',
    email: authState.user?.email || 'alex@lead.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    joinDate: '2023-01-15',
    bio: 'Experienced domain sales professional with 5+ years in B2B sales. Specialized in premium domain acquisitions, enterprise solutions, and building long-term client relationships. Consistently exceeds targets and maintains high client satisfaction ratings.',
    achievements: [
      'Top Performer Q4 2024',
      'Exceeded Annual Target by 150%',
      'Customer Satisfaction Award 2024',
      'New Client Acquisition Leader',
      'Million Dollar Club Member',
      'Sales Excellence Award'
    ],
    certifications: [
      'Certified Sales Professional (CSP)',
      'Domain Industry Certification',
      'Advanced Negotiation Techniques',
      'Customer Relationship Management'
    ],
    skills: [
      'Domain Valuation',
      'Client Relationship Management',
      'Negotiation & Closing',
      'Market Analysis',
      'Lead Generation',
      'Presentation Skills'
    ],
    targets: {
      monthly: 15,
      quarterly: 45,
      yearly: 180
    },
    performance: {
      leadsConverted: convertedLeads.length,
      conversionRate: Math.round(conversionRate),
      revenue: totalRevenue,
      ranking: 2,
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
      icon: <Target size={24} />,
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
      icon: <Award size={24} />,
      color: 'purple'
    },
    {
      title: 'Avg Deal Size',
      value: `$${profile.performance.avgDealSize.toLocaleString()}`,
      icon: <Briefcase size={24} />,
      color: 'yellow'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'conversion':
        return <Award className="text-green-600\" size={16} />;
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

            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold text-gray-800 mb-3">Team Ranking</h4>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">#{profile.performance.ranking}</div>
                  <div className="text-sm text-gray-500">out of 12 reps</div>
                </div>
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

          {/* Bio Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h4 className="font-semibold text-gray-800 mb-3">About Me</h4>
            {isEditing ? (
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                rows={4}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-gray-700">{profile.bio}</p>
            )}
          </div>

          {/* Skills & Certifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h4 className="font-semibold text-gray-800 mb-4">Core Skills</h4>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h4 className="font-semibold text-gray-800 mb-4">Certifications</h4>
              <div className="space-y-2">
                {profile.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Award className="text-indigo-600" size={16} />
                    <span className="text-sm text-gray-700">{cert}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h4 className="font-semibold text-gray-800 mb-4">Achievements & Awards</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profile.achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                  <Award className="text-indigo-600" size={20} />
                  <span className="font-medium text-gray-800">{achievement}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sales Targets */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h4 className="font-semibold text-gray-800 mb-4">Sales Targets</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{profile.targets.monthly}</div>
                <div className="text-sm text-gray-600">Monthly Target</div>
                <div className="text-xs text-gray-500 mt-1">
                  Current: {profile.performance.leadsConverted}
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((profile.performance.leadsConverted / profile.targets.monthly) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{profile.targets.quarterly}</div>
                <div className="text-sm text-gray-600">Quarterly Target</div>
                <div className="text-xs text-gray-500 mt-1">
                  Progress: {Math.round((profile.performance.leadsConverted / profile.targets.quarterly) * 100)}%
                </div>
                <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((profile.performance.leadsConverted / profile.targets.quarterly) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{profile.targets.yearly}</div>
                <div className="text-sm text-gray-600">Yearly Target</div>
                <div className="text-xs text-gray-500 mt-1">
                  Progress: {Math.round((profile.performance.leadsConverted / profile.targets.yearly) * 100)}%
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((profile.performance.leadsConverted / profile.targets.yearly) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
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
        </div>
      </div>
    </div>
  );
};

export default SalesProfile;