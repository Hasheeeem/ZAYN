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

interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  category: 'follow-up' | 'admin' | 'prospecting' | 'other';
}

const SalesCalendar: React.FC = () => {
  const { showNotification } = useNotification();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [view, setView] = useState<'calendar' | 'tasks'>('calendar');

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

  // Comprehensive tasks data
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: 'Update CRM with new lead information',
      description: 'Add contact details and notes for 5 new leads from yesterday\'s inquiries',
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      priority: 'high',
      status: 'pending',
      category: 'admin'
    },
    {
      id: 2,
      title: 'Send proposal to ABC Corp',
      description: 'Prepare and send customized domain proposal with pricing tiers',
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      priority: 'high',
      status: 'pending',
      category: 'follow-up'
    },
    {
      id: 3,
      title: 'Research blockchain domain trends',
      description: 'Analyze market trends for blockchain-related domains for upcoming client',
      dueDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      priority: 'medium',
      status: 'pending',
      category: 'prospecting'
    },
    {
      id: 4,
      title: 'Follow up with TechStartup decision',
      description: 'Check on the status of domain purchase decision after demo',
      dueDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      priority: 'high',
      status: 'pending',
      category: 'follow-up'
    },
    {
      id: 5,
      title: 'Prepare Q1 sales report',
      description: 'Compile quarterly performance metrics and client feedback',
      dueDate: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
      priority: 'medium',
      status: 'pending',
      category: 'admin'
    },
    {
      id: 6,
      title: 'Identify 10 new prospects in fintech',
      description: 'Research and compile list of potential fintech clients for outreach',
      dueDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
      priority: 'medium',
      status: 'pending',
      category: 'prospecting'
    },
    {
      id: 7,
      title: 'Schedule follow-up calls',
      description: 'Book follow-up calls with 3 qualified leads from last week',
      dueDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      priority: 'high',
      status: 'pending',
      category: 'follow-up'
    },
    {
      id: 8,
      title: 'Update domain inventory spreadsheet',
      description: 'Add new premium domains and update pricing information',
      dueDate: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
      priority: 'low',
      status: 'pending',
      category: 'admin'
    },
    {
      id: 9,
      title: 'Competitor analysis report',
      description: 'Analyze competitor pricing and service offerings',
      dueDate: format(addDays(new Date(), 4), 'yyyy-MM-dd'),
      priority: 'medium',
      status: 'pending',
      category: 'other'
    },
    {
      id: 10,
      title: 'Client satisfaction survey',
      description: 'Send satisfaction surveys to recent customers',
      dueDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
      priority: 'low',
      status: 'completed',
      category: 'admin'
    }
  ]);

  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.date), date));
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => isSameDay(new Date(task.dueDate), date));
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
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleCompleteTask = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: 'completed' } : task
    ));
    showNotification('Task marked as completed', 'success');
  };

  const handleCompleteEvent = (eventId: number) => {
    setEvents(events.map(event => 
      event.id === eventId ? { ...event, status: 'completed' } : event
    ));
    showNotification('Event marked as completed', 'success');
  };

  const todayEvents = getEventsForDate(new Date());
  const todayTasks = getTasksForDate(new Date());
  const upcomingEvents = events.filter(event => new Date(event.date) > new Date()).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Calendar & Tasks</h2>
          <p className="text-gray-600">Manage your schedule and daily tasks</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                view === 'calendar' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setView('tasks')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                view === 'tasks' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              Tasks
            </button>
          </div>
          <ActionButton
            label="New Event"
            icon={<Plus size={18} />}
            onClick={() => setIsEventModalOpen(true)}
            variant="primary"
          />
        </div>
      </div>

      {view === 'calendar' ? (
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
                  const dayTasks = getTasksForDate(day);
                  
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
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded border ${getEventTypeColor(event.type)}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(event);
                              setIsEventModalOpen(true);
                            }}
                          >
                            <div className="flex items-center gap-1">
                              {getEventTypeIcon(event.type)}
                              <span className="truncate">{event.title}</span>
                            </div>
                            <div>{event.time}</div>
                          </div>
                        ))}
                        
                        {dayTasks.slice(0, 1).map(task => (
                          <div
                            key={task.id}
                            className="text-xs p-1 rounded bg-orange-100 text-orange-800 border border-orange-200"
                          >
                            <div className="flex items-center gap-1">
                              <CheckCircle size={12} />
                              <span className="truncate">{task.title}</span>
                            </div>
                          </div>
                        ))}
                        
                        {(dayEvents.length > 2 || dayTasks.length > 1) && (
                          <div className="text-xs text-gray-500">
                            +{(dayEvents.length - 2) + (dayTasks.length - 1)} more
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
                        <p className="font-medium text-gray-800">{event.title}</p>
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
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Today's Tasks</h3>
              <div className="space-y-3">
                {todayTasks.length > 0 ? (
                  todayTasks.map(task => (
                    <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          task.status === 'completed' 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {task.status === 'completed' && <CheckCircle size={12} />}
                      </button>
                      <div className="flex-1">
                        <p className={`font-medium ${
                          task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-800'
                        }`}>
                          {task.title}
                        </p>
                        <p className="text-sm text-gray-600">{task.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500 capitalize">{task.category}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No tasks due today</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Tasks View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-700">All Tasks</h3>
                <ActionButton
                  label="New Task"
                  icon={<Plus size={18} />}
                  onClick={() => setIsTaskModalOpen(true)}
                  variant="primary"
                  size="sm"
                />
              </div>

              <div className="space-y-4">
                {tasks.map(task => (
                  <div key={task.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-1 ${
                          task.status === 'completed' 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {task.status === 'completed' && <CheckCircle size={12} />}
                      </button>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className={`font-medium ${
                            task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-800'
                          }`}>
                            {task.title}
                          </h4>
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            task.priority === 'high' ? 'bg-red-100 text-red-800' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
                          <span className="capitalize">{task.category}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Task Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Tasks</span>
                  <span className="font-semibold">{tasks.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-semibold text-green-600">
                    {tasks.filter(t => t.status === 'completed').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-semibold text-orange-600">
                    {tasks.filter(t => t.status === 'pending').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">High Priority</span>
                  <span className="font-semibold text-red-600">
                    {tasks.filter(t => t.priority === 'high' && t.status === 'pending').length}
                  </span>
                </div>
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
                      <p className="font-medium text-gray-800">{event.title}</p>
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
      )}

      {/* Event Modal */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setSelectedEvent(null);
        }}
        title={selectedEvent ? 'Event Details' : 'New Event'}
      >
        <div className="p-6">
          {selectedEvent ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{selectedEvent.title}</h3>
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
            <div className="space-y-4">
              <p className="text-gray-600">Event creation form would go here...</p>
              <div className="flex justify-end gap-3">
                <ActionButton
                  label="Cancel"
                  onClick={() => setIsEventModalOpen(false)}
                  variant="secondary"
                />
                <ActionButton
                  label="Create Event"
                  onClick={() => {
                    showNotification('Event created successfully', 'success');
                    setIsEventModalOpen(false);
                  }}
                  variant="primary"
                />
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="New Task"
      >
        <div className="p-6">
          <div className="space-y-4">
            <p className="text-gray-600">Task creation form would go here...</p>
            <div className="flex justify-end gap-3">
              <ActionButton
                label="Cancel"
                onClick={() => setIsTaskModalOpen(false)}
                variant="secondary"
              />
              <ActionButton
                label="Create Task"
                onClick={() => {
                  showNotification('Task created successfully', 'success');
                  setIsTaskModalOpen(false);
                }}
                variant="primary"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SalesCalendar;