import React, { useState } from 'react';
import { CheckCircle, Clock, Plus, Calendar, AlertTriangle, Target, User, Phone, Mail, Edit, Trash2 } from 'lucide-react';
import ActionButton from '../../components/ActionButton';
import Modal from '../../components/Modal';
import { format, addDays, isToday, isPast, isTomorrow } from 'date-fns';
import { useNotification } from '../../context/NotificationContext';

interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  category: 'follow-up' | 'admin' | 'prospecting' | 'other';
  assignedTo?: string;
  relatedLead?: string;
}

const SalesTasks: React.FC = () => {
  const { showNotification } = useNotification();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Task form state
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: 'other' as 'follow-up' | 'admin' | 'prospecting' | 'other'
  });

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
      dueDate: format(addDays(new Date(), -1), 'yyyy-MM-dd'),
      priority: 'low',
      status: 'completed',
      category: 'admin'
    }
  ]);

  const handleCompleteTask = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: 'completed' } : task
    ));
    showNotification('Task marked as completed', 'success');
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskForm.title.trim()) {
      showNotification('Please enter a title for the task', 'error');
      return;
    }

    const newTask: Task = {
      id: Date.now(),
      title: taskForm.title,
      description: taskForm.description,
      dueDate: taskForm.dueDate,
      priority: taskForm.priority,
      status: 'pending',
      category: taskForm.category
    };

    setTasks(prev => [...prev, newTask]);
    setTaskForm({
      title: '',
      description: '',
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      priority: 'medium',
      category: 'other'
    });
    setIsTaskModalOpen(false);
    showNotification('Task created successfully', 'success');
  };

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTask || !taskForm.title.trim()) {
      showNotification('Please enter a title for the task', 'error');
      return;
    }

    setTasks(tasks.map(task => 
      task.id === selectedTask.id 
        ? { 
            ...task, 
            title: taskForm.title,
            description: taskForm.description,
            dueDate: taskForm.dueDate,
            priority: taskForm.priority,
            category: taskForm.category
          }
        : task
    ));

    setIsTaskModalOpen(false);
    setSelectedTask(null);
    showNotification('Task updated successfully', 'success');
  };

  const handleDeleteTask = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    showNotification('Task deleted successfully', 'success');
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedTask(null);
    setTaskForm({
      title: '',
      description: '',
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      priority: 'medium',
      category: 'other'
    });
    setIsTaskModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setModalMode('edit');
    setSelectedTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      category: task.category
    });
    setIsTaskModalOpen(true);
  };

  const openViewModal = (task: Task) => {
    setModalMode('view');
    setSelectedTask(task);
    setIsTaskModalOpen(true);
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'follow-up':
        return <Phone size={16} />;
      case 'admin':
        return <User size={16} />;
      case 'prospecting':
        return <Target size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getDateStatus = (dueDate: string) => {
    const date = new Date(dueDate);
    if (isPast(date) && !isToday(date)) {
      return { label: 'Overdue', color: 'text-red-600' };
    } else if (isToday(date)) {
      return { label: 'Due Today', color: 'text-orange-600' };
    } else if (isTomorrow(date)) {
      return { label: 'Due Tomorrow', color: 'text-yellow-600' };
    } else {
      return { label: format(date, 'MMM dd'), color: 'text-gray-600' };
    }
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const overdueTasks = tasks.filter(task => task.status === 'pending' && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)));
  const todayTasks = tasks.filter(task => task.status === 'pending' && isToday(new Date(task.dueDate)));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">My Tasks</h2>
          <p className="text-gray-600">Manage your daily tasks and to-dos</p>
        </div>
        <ActionButton
          label="New Task"
          icon={<Plus size={18} />}
          onClick={openAddModal}
          variant="primary"
        />
      </div>

      {/* Task Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="text-blue-600" size={24} />
          </div>
          <div className="text-2xl font-bold text-blue-600">{pendingTasks.length}</div>
          <div className="text-sm text-gray-600">Pending Tasks</div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="text-green-600" size={24} />
          </div>
          <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="text-red-600" size={24} />
          </div>
          <div className="text-2xl font-bold text-red-600">{overdueTasks.length}</div>
          <div className="text-sm text-gray-600">Overdue</div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar className="text-orange-600" size={24} />
          </div>
          <div className="text-2xl font-bold text-orange-600">{todayTasks.length}</div>
          <div className="text-sm text-gray-600">Due Today</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Tasks</h3>
        <div className="space-y-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => {
              const dateStatus = getDateStatus(task.dueDate);
              return (
                <div key={task.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
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
                        <h4 
                          className={`font-medium cursor-pointer hover:text-indigo-600 ${
                            task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-800'
                          }`}
                          onClick={() => openViewModal(task)}
                        >
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded border ${getPriorityColor(task.priority)}`}>
                            {task.priority.toUpperCase()}
                          </span>
                          <button
                            onClick={() => openEditModal(task)}
                            className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <div className="flex items-center gap-1">
                          {getCategoryIcon(task.category)}
                          <span className="capitalize text-gray-500">{task.category}</span>
                        </div>
                        <div className={`flex items-center gap-1 ${dateStatus.color}`}>
                          <Calendar size={12} />
                          <span>{dateStatus.label}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <Clock className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">No tasks found</p>
            </div>
          )}
        </div>
      </div>

      {/* Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        title={
          modalMode === 'add' ? 'New Task' : 
          modalMode === 'edit' ? 'Edit Task' : 'Task Details'
        }
      >
        <div className="p-6">
          {modalMode === 'view' && selectedTask ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{selectedTask.title}</h3>
                <p className="text-gray-600 mt-2">{selectedTask.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Due Date</label>
                  <p className="font-medium">{format(new Date(selectedTask.dueDate), 'MMMM dd, yyyy')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Priority</label>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPriorityColor(selectedTask.priority)}`}>
                    {selectedTask.priority.toUpperCase()}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Category</label>
                <div className="flex items-center gap-2 mt-1">
                  {getCategoryIcon(selectedTask.category)}
                  <span className="capitalize">{selectedTask.category}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <ActionButton
                  label="Close"
                  onClick={() => {
                    setIsTaskModalOpen(false);
                    setSelectedTask(null);
                  }}
                  variant="secondary"
                />
                <ActionButton
                  label="Edit Task"
                  onClick={() => {
                    setModalMode('edit');
                    setTaskForm({
                      title: selectedTask.title,
                      description: selectedTask.description,
                      dueDate: selectedTask.dueDate,
                      priority: selectedTask.priority,
                      category: selectedTask.category
                    });
                  }}
                  variant="primary"
                />
              </div>
            </div>
          ) : (
            <form onSubmit={modalMode === 'add' ? handleCreateTask : handleEditTask} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="dueDate"
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    id="priority"
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={taskForm.category}
                  onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="follow-up">Follow-up</option>
                  <option value="admin">Admin</option>
                  <option value="prospecting">Prospecting</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <ActionButton
                  label="Cancel"
                  onClick={() => setIsTaskModalOpen(false)}
                  variant="secondary"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
                >
                  {modalMode === 'add' ? 'Create Task' : 'Update Task'}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default SalesTasks;