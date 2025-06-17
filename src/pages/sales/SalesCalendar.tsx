import React, { useState } from 'react';
import { Calendar, Clock, Plus, Phone, Mail, Video, MapPin, User, CheckCircle, AlertCircle, Edit, Trash2 } from 'lucide-react';
import ActionButton from '../../components/ActionButton';
import Modal from '../../components/Modal';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, isToday, subDays } from 'date-fns';
import { useNotification } from '../../context/NotificationContext';

interface CalendarEvent {
  id: number;
  title: string;
  type: 'call' | 'meeting' | 'demo' | 'follow-up' | 'task';
  date: string;
  time: string;
  duration: number;
  description: string;
  contact?: {
    name: string;
    email: string;
    phone: string;
  };
  location?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
}

const SalesCalendar: React.FC = () => {
  const { showNotification } = useNotification();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'view'>('add');

  // Event form state
  const [eventForm, setEventForm] = useState({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  // Comprehensive events data
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: 1,
      title: 'Demo Call with TechStartup',
      type: 'demo',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '10:00',
      duration: 60,
      description: 'Product demonstration for enterprise solution. Focus on scalability features.',
      contact: {
        name: 'John Doe',
        email: 'john@techstartup.com',
        phone: '+1 (555) 123-4567'
      },
      status: 'scheduled',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Follow-up with E-commerce Pro',
      type: 'follow-up',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '14:00',
      duration: 30,
      description: 'Follow up on proposal sent last week. Discuss pricing options.',
      contact: {
        name: 'Jane Smith',
        email: 'jane@ecommerce-pro.com',
        phone: '+1 (555) 234-5678'
      },
      status: 'scheduled',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Team Sales Meeting',
      type: 'meeting',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '16:00',
      duration: 90,
      description: 'Weekly sales team meeting - Q1 targets review',
      location: 'Conference Room A',
      status: 'scheduled',
      priority: 'medium'
    },
    {
      id: 4,
      title: 'Client Call - Fintech Solutions',
      type: 'call',
      date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      time: '09:00',
      duration: 45,
      description: 'Discovery call with fintech startup. Understand their domain needs.',
      contact: {
        name: 'Michael Johnson',
        email: 'mike@fintech-solutions.com',
        phone: '+1 (555) 345-6789'
      },
      status: 'scheduled',
      priority: 'high'
    },
    {
      id: 5,
      title: 'Proposal Presentation - HealthTech',
      type: 'demo',
      date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      time: '15:00',
      duration: 75,
      description: 'Final presentation of domain portfolio to HealthTech App team.',
      contact: {
        name: 'Sarah Wilson',
        email: 'sarah@healthtech-app.com',
        phone: '+1 (555) 456-7890'
      },
      status: 'scheduled',
      priority: 'high'
    },
    {
      id: 6,
      title: 'Contract Negotiation - AI Consulting',
      type: 'meeting',
      date: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
      time: '11:00',
      duration: 60,
      description: 'Negotiate final terms for AI-consulting.com domain purchase.',
      contact: {
        name: 'Emily Davis',
        email: 'emily@ai-consulting.com',
        phone: '+1 (555) 678-9012'
      },
      status: 'scheduled',
      priority: 'high'
    },
    {
      id: 7,
      title: 'Cold Outreach - Green Energy',
      type: 'call',
      date: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
      time: '10:30',
      duration: 30,
      description: 'Initial outreach call to green energy company.',
      contact: {
        name: 'Robert Miller',
        email: 'robert@green-energy.com',
        phone: '+1 (555) 789-0123'
      },
      status: 'scheduled',
      priority: 'medium'
    },
    {
      id: 8,
      title: 'Product Demo - Food Delivery',
      type: 'demo',
      date: format(addDays(new Date(), 4), 'yyyy-MM-dd'),
      time: '13:00',
      duration: 45,
      description: 'Showcase domain options for food delivery platform.',
      contact: {
        name: 'Lisa Anderson',
        email: 'lisa@fooddelivery-app.com',
        phone: '+1 (555) 890-1234'
      },
      status: 'scheduled',
      priority: 'medium'
    }
  ]);

  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.date), date));
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone size={16} />;
      case 'meeting':
        return <User size={16} />;
      case 'demo':
        return <Video size={16} />;
      case 'follow-up':
        return <Mail size={16} />;
      default:
        return <Calendar size={16} />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'call':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'meeting':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'demo':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'follow-up':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle size={12} />;
      case 'medium':
        return <Clock size={12} />;
      case 'low':
        return <CheckCircle size={12} />;
      default:
        return <Clock size={12} />;
    }
  };

  const handleCompleteEvent = (eventId: number) => {
    setEvents(events.map(event => 
      event.id === eventId ? { ...event, status: 'completed' } : event
    ));
    showNotification('Event marked as completed', 'success');
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventForm.title.trim()) {
      showNotification('Please enter a title for the event', 'error');
      return;
    }

    const newEvent: CalendarEvent = {
      id: Date.now(),
      title: eventForm.title,
      type: 'meeting',
      date: eventForm.date,
      time: eventForm.time,
      duration: 60,
      description: eventForm.description,
      status: 'scheduled',
      priority: eventForm.priority
    };

    setEvents(prev => [...prev, newEvent]);
    setEventForm({
      title: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '09:00',
      description: '',
      priority: 'medium'
    });
    setIsEventModalOpen(false);
    showNotification('Event created successfully', 'success');
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedEvent(null);
    setEventForm({
      title: '',
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: '09:00',
      description: '',
      priority: 'medium'
    });
    setIsEventModalOpen(true);
  };

  const openViewModal = (event: CalendarEvent) => {
    setModalMode('view');
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const todayEvents = getEventsForDate(new Date());
  const upcomingEvents = events.filter(event => new Date(event.date) > new Date()).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Calendar</h2>
          <p className="text-gray-600">Manage your schedule and appointments</p>
        </div>
        <div className="flex gap-2">
          <ActionButton
            label="New Event"
            icon={<Plus size={18} />}
            onClick={openAddModal}
            variant="primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-700">
                Week of {format(weekStart, 'MMMM dd, yyyy')}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentDate(addDays(currentDate, -7))}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1 text-indigo-600 hover:bg-indigo-50 rounded"
                >
                  Today
                </button>
                <button
                  onClick={() => setCurrentDate(addDays(currentDate, 7))}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {weekDays.map(day => {
                const dayEvents = getEventsForDate(day);
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[120px] p-2 border rounded-lg cursor-pointer transition-colors ${
                      isToday(day) ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className={`text-sm font-medium mb-2 ${
                      isToday(day) ? 'text-indigo-600' : 'text-gray-700'
                    }`}>
                      {format(day, 'd')}
                    </div>
                    
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded border ${getEventTypeColor(event.type)} relative`}
                          onClick={(e) => {
                            e.stopPropagation();
                            openViewModal(event);
                          }}
                        >
                          <div className="flex items-center gap-1">
                            {getEventTypeIcon(event.type)}
                            <span className="truncate flex-1">{event.title}</span>
                            <div className={`inline-flex items-center gap-1 px-1 rounded text-xs ${getPriorityColor(event.priority)}`}>
                              {getPriorityIcon(event.priority)}
                            </div>
                          </div>
                          <div>{event.time}</div>
                        </div>
                      ))}
                      
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Today's Schedule</h3>
            <div className="space-y-3">
              {todayEvents.length > 0 ? (
                todayEvents.map(event => (
                  <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getEventTypeColor(event.type)}`}>
                      {getEventTypeIcon(event.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-800">{event.title}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getPriorityColor(event.priority)}`}>
                          {getPriorityIcon(event.priority)}
                          {event.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{event.time} ({event.duration}min)</p>
                      {event.contact && (
                        <p className="text-xs text-gray-500">{event.contact.name}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No events scheduled for today</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Upcoming Events</h3>
            <div className="space-y-3">
              {upcomingEvents.map(event => (
                <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getEventTypeColor(event.type)}`}>
                    {getEventTypeIcon(event.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-800">{event.title}</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getPriorityColor(event.priority)}`}>
                        {getPriorityIcon(event.priority)}
                        {event.priority.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {format(new Date(event.date), 'MMM dd')} at {event.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setSelectedEvent(null);
        }}
        title={modalMode === 'add' ? 'New Event' : 'Event Details'}
      >
        <div className="p-6">
          {modalMode === 'view' && selectedEvent ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{selectedEvent.title}</h3>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedEvent.priority)}`}>
                    {getPriorityIcon(selectedEvent.priority)}
                    {selectedEvent.priority.toUpperCase()} PRIORITY
                  </span>
                </div>
                <p className="text-gray-600">{selectedEvent.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Date & Time</label>
                  <p className="font-medium">
                    {format(new Date(selectedEvent.date), 'MMMM dd, yyyy')} at {selectedEvent.time}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Duration</label>
                  <p className="font-medium">{selectedEvent.duration} minutes</p>
                </div>
              </div>

              {selectedEvent.contact && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact</label>
                  <div className="mt-1">
                    <p className="font-medium">{selectedEvent.contact.name}</p>
                    <p className="text-sm text-gray-600">{selectedEvent.contact.email}</p>
                    <p className="text-sm text-gray-600">{selectedEvent.contact.phone}</p>
                  </div>
                </div>
              )}

              {selectedEvent.location && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="font-medium">{selectedEvent.location}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <ActionButton
                  label="Close"
                  onClick={() => {
                    setIsEventModalOpen(false);
                    setSelectedEvent(null);
                  }}
                  variant="secondary"
                />
                <ActionButton
                  label="Mark Complete"
                  onClick={() => {
                    handleCompleteEvent(selectedEvent.id);
                    setIsEventModalOpen(false);
                    setSelectedEvent(null);
                  }}
                  variant="success"
                />
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                    Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="time"
                    type="time"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  id="priority"
                  value={eventForm.priority}
                  onChange={(e) => setEventForm({ ...eventForm, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                  placeholder="Enter event description"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <ActionButton
                  label="Cancel"
                  onClick={() => setIsEventModalOpen(false)}
                  variant="secondary"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Create Event
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default SalesCalendar;