import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Phone, Mail, Video, MapPin, User, CheckCircle, AlertCircle, Edit, Trash2, Filter, Eye } from 'lucide-react';
import ActionButton from '../../components/ActionButton';
import Modal from '../../components/Modal';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, isToday, subDays } from 'date-fns';
import { useNotification } from '../../context/NotificationContext';
import apiService from '../../services/api';

interface CalendarEvent {
  id: string;
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
  createdAt: string;
  updatedAt: string;
  userId: string;
}

const SalesCalendar: React.FC = () => {
  const { showNotification } = useNotification();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isUpcomingModalOpen, setIsUpcomingModalOpen] = useState(false);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'view' | 'edit'>('add');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [eventFilter, setEventFilter] = useState<'all' | 'scheduled' | 'completed'>('all');

  // Event form state
  const [eventForm, setEventForm] = useState({
    title: '',
    type: 'meeting' as 'call' | 'meeting' | 'demo' | 'follow-up' | 'task',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    duration: 60,
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    location: ''
  });

  // Load events from backend
  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await apiService.getCalendarEvents();
      if (response.success) {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      showNotification('Failed to load calendar events', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getEventsForDate = (date: Date) => {
    const dayEvents = events.filter(event => isSameDay(new Date(event.date), date));
    if (eventFilter === 'all') return dayEvents;
    return dayEvents.filter(event => event.status === eventFilter);
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

  const getEventTypeColor = (type: string, status: string) => {
    const baseColors = {
      call: 'bg-green-100 text-green-800 border-green-200',
      meeting: 'bg-blue-100 text-blue-800 border-blue-200',
      demo: 'bg-purple-100 text-purple-800 border-purple-200',
      'follow-up': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      task: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    if (status === 'completed') {
      return 'bg-green-50 text-green-700 border-green-300 opacity-75';
    }

    return baseColors[type as keyof typeof baseColors] || baseColors.task;
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

  const handleCompleteEvent = async (eventId: string) => {
    try {
      const response = await apiService.updateCalendarEvent(eventId, { status: 'completed' });
      if (response.success) {
        setEvents(events.map(event => 
          event.id === eventId ? { ...event, status: 'completed' } : event
        ));
        showNotification('Event marked as completed', 'success');
      }
    } catch (error) {
      console.error('Error completing event:', error);
      showNotification('Failed to update event', 'error');
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventForm.title.trim()) {
      showNotification('Please enter a title for the event', 'error');
      return;
    }

    setLoading(true);
    try {
      const eventData = {
        title: eventForm.title,
        type: eventForm.type,
        date: eventForm.date,
        time: eventForm.time,
        duration: eventForm.duration,
        description: eventForm.description,
        priority: eventForm.priority,
        contactName: eventForm.contactName || null,
        contactEmail: eventForm.contactEmail || null,
        contactPhone: eventForm.contactPhone || null,
        location: eventForm.location || null
      };

      const response = await apiService.createCalendarEvent(eventData);
      if (response.success) {
        setEvents(prev => [...prev, response.data]);
        setEventForm({
          title: '',
          type: 'meeting',
          date: format(new Date(), 'yyyy-MM-dd'),
          time: '09:00',
          duration: 60,
          description: '',
          priority: 'medium',
          contactName: '',
          contactEmail: '',
          contactPhone: '',
          location: ''
        });
        setIsEventModalOpen(false);
        showNotification('Event created successfully', 'success');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      showNotification('Failed to create event', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEvent || !eventForm.title.trim()) {
      showNotification('Please enter a title for the event', 'error');
      return;
    }

    setLoading(true);
    try {
      const eventData = {
        title: eventForm.title,
        type: eventForm.type,
        date: eventForm.date,
        time: eventForm.time,
        duration: eventForm.duration,
        description: eventForm.description,
        priority: eventForm.priority,
        contactName: eventForm.contactName || null,
        contactEmail: eventForm.contactEmail || null,
        contactPhone: eventForm.contactPhone || null,
        location: eventForm.location || null
      };

      const response = await apiService.updateCalendarEvent(selectedEvent.id, eventData);
      if (response.success) {
        setEvents(events.map(event => 
          event.id === selectedEvent.id ? response.data : event
        ));
        setIsEventModalOpen(false);
        setSelectedEvent(null);
        showNotification('Event updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      showNotification('Failed to update event', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.deleteCalendarEvent(eventId);
      if (response.success) {
        setEvents(events.filter(event => event.id !== eventId));
        setIsEventModalOpen(false);
        setSelectedEvent(null);
        showNotification('Event deleted successfully', 'success');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      showNotification('Failed to delete event', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedEvent(null);
    setEventForm({
      title: '',
      type: 'meeting',
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: '09:00',
      duration: 60,
      description: '',
      priority: 'medium',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      location: ''
    });
    setIsEventModalOpen(true);
  };

  const openViewModal = (event: CalendarEvent) => {
    setModalMode('view');
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const openEditModal = (event: CalendarEvent) => {
    setModalMode('edit');
    setSelectedEvent(event);
    setEventForm({
      title: event.title,
      type: event.type,
      date: event.date,
      time: event.time,
      duration: event.duration,
      description: event.description || '',
      priority: event.priority,
      contactName: event.contact?.name || '',
      contactEmail: event.contact?.email || '',
      contactPhone: event.contact?.phone || '',
      location: event.location || ''
    });
    setIsEventModalOpen(true);
  };

  const todayEvents = getEventsForDate(new Date());
  const upcomingEvents = events.filter(event => 
    new Date(event.date) > new Date() && event.status === 'scheduled'
  ).slice(0, 5);
  const completedEvents = events.filter(event => event.status === 'completed').slice(0, 5);

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Calendar</h2>
          <p className="text-gray-600">Manage your schedule and appointments</p>
        </div>
        <div className="flex gap-2">
          <ActionButton
            label="View Upcoming"
            icon={<Clock size={18} />}
            onClick={() => setIsUpcomingModalOpen(true)}
            variant="secondary"
          />
          <ActionButton
            label="View Completed"
            icon={<CheckCircle size={18} />}
            onClick={() => setIsCompletedModalOpen(true)}
            variant="secondary"
          />
          <ActionButton
            label="New Event"
            icon={<Plus size={18} />}
            onClick={openAddModal}
            variant="primary"
          />
        </div>
      </div>

      {/* Event Filter */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter Events:</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEventFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                eventFilter === 'all' 
                  ? 'bg-indigo-100 text-indigo-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setEventFilter('scheduled')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                eventFilter === 'scheduled' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setEventFilter('completed')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                eventFilter === 'completed' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
          </div>
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
                          className={`text-xs p-1 rounded border ${getEventTypeColor(event.type, event.status)} relative cursor-pointer group`}
                          onClick={(e) => {
                            e.stopPropagation();
                            openViewModal(event);
                          }}
                        >
                          <div className="flex items-center gap-1">
                            {getEventTypeIcon(event.type)}
                            <span className="truncate flex-1">{event.title}</span>
                            {event.status === 'completed' && (
                              <CheckCircle size={12} className="text-green-600" />
                            )}
                            <div className={`inline-flex items-center gap-1 px-1 rounded text-xs ${getPriorityColor(event.priority)}`}>
                              {getPriorityIcon(event.priority)}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>{event.time}</span>
                            {event.status === 'scheduled' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCompleteEvent(event.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-green-200 rounded"
                                title="Mark as completed"
                              >
                                <CheckCircle size={10} className="text-green-600" />
                              </button>
                            )}
                          </div>
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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getEventTypeColor(event.type, event.status)}`}>
                      {getEventTypeIcon(event.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`font-medium ${event.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                          {event.title}
                        </p>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getPriorityColor(event.priority)}`}>
                          {getPriorityIcon(event.priority)}
                          {event.priority.toUpperCase()}
                        </span>
                        {event.status === 'completed' && (
                          <CheckCircle size={16} className="text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{event.time} ({event.duration}min)</p>
                      {event.contact && (
                        <p className="text-xs text-gray-500">{event.contact.name}</p>
                      )}
                      {event.status === 'scheduled' && (
                        <button
                          onClick={() => handleCompleteEvent(event.id)}
                          className="mt-2 text-xs text-green-600 hover:text-green-800 font-medium"
                        >
                          Mark as completed
                        </button>
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
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Events</span>
                <span className="font-semibold text-blue-600">
                  {events.filter(e => e.status === 'scheduled').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed Events</span>
                <span className="font-semibold text-green-600">
                  {events.filter(e => e.status === 'completed').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Week</span>
                <span className="font-semibold text-indigo-600">
                  {events.filter(e => {
                    const eventDate = new Date(e.date);
                    return eventDate >= weekStart && eventDate <= weekEnd;
                  }).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events Modal */}
      <Modal
        isOpen={isUpcomingModalOpen}
        onClose={() => setIsUpcomingModalOpen(false)}
        title="Upcoming Events"
        size="lg"
      >
        <div className="p-6">
          <div className="space-y-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(event => (
                <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getEventTypeColor(event.type, event.status)}`}>
                        {getEventTypeIcon(event.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{event.title}</h4>
                        <p className="text-sm text-gray-600">
                          {format(new Date(event.date), 'MMM dd, yyyy')} at {event.time}
                        </p>
                        {event.contact && (
                          <p className="text-xs text-gray-500">{event.contact.name}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(event.priority)}`}>
                        {event.priority.toUpperCase()}
                      </span>
                      <button
                        onClick={() => handleCompleteEvent(event.id)}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                        title="Mark as completed"
                      >
                        <CheckCircle size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No upcoming events</p>
            )}
          </div>
        </div>
      </Modal>

      {/* Completed Events Modal */}
      <Modal
        isOpen={isCompletedModalOpen}
        onClose={() => setIsCompletedModalOpen(false)}
        title="Completed Events"
        size="lg"
      >
        <div className="p-6">
          <div className="space-y-4">
            {completedEvents.length > 0 ? (
              completedEvents.map(event => (
                <div key={event.id} className="border rounded-lg p-4 bg-green-50">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getEventTypeColor(event.type, event.status)}`}>
                      {getEventTypeIcon(event.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-800">{event.title}</h4>
                        <CheckCircle size={16} className="text-green-600" />
                      </div>
                      <p className="text-sm text-gray-600">
                        {format(new Date(event.date), 'MMM dd, yyyy')} at {event.time}
                      </p>
                      {event.contact && (
                        <p className="text-xs text-gray-500">{event.contact.name}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(event.priority)}`}>
                      {event.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No completed events</p>
            )}
          </div>
        </div>
      </Modal>

      {/* Event Modal */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setSelectedEvent(null);
        }}
        title={modalMode === 'add' ? 'New Event' : modalMode === 'edit' ? 'Edit Event' : 'Event Details'}
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
                  {selectedEvent.status === 'completed' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <CheckCircle size={16} />
                      COMPLETED
                    </span>
                  )}
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

              <div className="flex justify-between items-center pt-4">
                <div className="flex gap-2">
                  <ActionButton
                    label="Edit"
                    icon={<Edit size={16} />}
                    onClick={() => openEditModal(selectedEvent)}
                    variant="primary"
                    size="sm"
                  />
                  <ActionButton
                    label="Delete"
                    icon={<Trash2 size={16} />}
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    variant="danger"
                    size="sm"
                  />
                </div>
                <div className="flex gap-2">
                  <ActionButton
                    label="Close"
                    onClick={() => {
                      setIsEventModalOpen(false);
                      setSelectedEvent(null);
                    }}
                    variant="secondary"
                  />
                  {selectedEvent.status !== 'completed' && (
                    <ActionButton
                      label="Mark Complete"
                      onClick={() => {
                        handleCompleteEvent(selectedEvent.id);
                        setIsEventModalOpen(false);
                        setSelectedEvent(null);
                      }}
                      variant="success"
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={modalMode === 'add' ? handleCreateEvent : handleUpdateEvent} className="space-y-4">
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
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Event Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="type"
                    value={eventForm.type}
                    onChange={(e) => setEventForm({ ...eventForm, type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    disabled={loading}
                  >
                    <option value="meeting">Meeting</option>
                    <option value="call">Call</option>
                    <option value="demo">Demo</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="task">Task</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="priority"
                    value={eventForm.priority}
                    onChange={(e) => setEventForm({ ...eventForm, priority: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    disabled={loading}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
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
                    disabled={loading}
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
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (min)
                  </label>
                  <input
                    id="duration"
                    type="number"
                    min="15"
                    max="480"
                    value={eventForm.duration}
                    onChange={(e) => setEventForm({ ...eventForm, duration: parseInt(e.target.value) || 60 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={loading}
                  />
                </div>
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
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name
                  </label>
                  <input
                    id="contactName"
                    type="text"
                    value={eventForm.contactName}
                    onChange={(e) => setEventForm({ ...eventForm, contactName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Contact person name"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    id="contactEmail"
                    type="email"
                    value={eventForm.contactEmail}
                    onChange={(e) => setEventForm({ ...eventForm, contactEmail: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="contact@example.com"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    id="contactPhone"
                    type="tel"
                    value={eventForm.contactPhone}
                    onChange={(e) => setEventForm({ ...eventForm, contactPhone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="+1 (555) 123-4567"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Meeting location or video link"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <ActionButton
                  label="Cancel"
                  onClick={() => setIsEventModalOpen(false)}
                  variant="secondary"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? 'Saving...' : modalMode === 'add' ? 'Create Event' : 'Update Event'}
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