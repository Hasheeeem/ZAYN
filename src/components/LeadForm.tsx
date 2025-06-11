import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useData } from '../context/DataContext';
import { Lead } from '../types/data';
import ActionButton from '../components/ActionButton';

interface Props {
  onSave: (lead: Lead) => Promise<void>;
  onCancel: () => void;
  initialData?: Lead;
  isLoading?: boolean;
}

const LeadForm: React.FC<Props> = ({ onSave, onCancel, initialData, isLoading = false }) => {
  const { showNotification } = useNotification();
  const { salespeople } = useData();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState<Lead>({
    id: initialData?.id || '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    domain: '',
    price: 0,
    clicks: 0,
    update: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    status: 'new',
    source: 'website',
    notes: '',
    createdAt: new Date().toISOString(),
    assignedTo: ''
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!form.domain.trim()) {
      newErrors.domain = 'Domain is required';
    }

    if (form.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification('Please fix the errors in the form', 'error');
      return;
    }

    setSaving(true);
    try {
      await onSave(form);
    } catch (error) {
      // Error is handled in the parent component
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: name === 'price' ? parseFloat(value) || 0 : value 
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={form.firstName}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-indigo-500`}
            disabled={isLoading || saving}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={form.lastName}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading || saving}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-indigo-500`}
            disabled={isLoading || saving}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading || saving}
          />
        </div>

        <div>
          <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
            Domain *
          </label>
          <input
            id="domain"
            name="domain"
            type="text"
            value={form.domain}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.domain ? 'border-red-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-indigo-500`}
            disabled={isLoading || saving}
          />
          {errors.domain && (
            <p className="mt-1 text-sm text-red-500">{errors.domain}</p>
          )}
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Price
          </label>
          <input
            id="price"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.price ? 'border-red-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-indigo-500`}
            disabled={isLoading || saving}
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-500">{errors.price}</p>
          )}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading || saving}
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        <div>
          <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
            Lead Source
          </label>
          <select
            id="source"
            name="source"
            value={form.source}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading || saving}
          >
            <option value="website">Website</option>
            <option value="referral">Referral</option>
            <option value="call">Call</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
            Assigned To
          </label>
          <select
            id="assignedTo"
            name="assignedTo"
            value={form.assignedTo}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading || saving}
          >
            <option value="">Unassigned</option>
            {salespeople.map(person => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
          disabled={isLoading || saving}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <ActionButton
          label="Cancel"
          onClick={onCancel}
          variant="secondary"
          disabled={isLoading || saving}
        />
        <ActionButton
          label={saving ? 'Saving...' : 'Save Lead'}
          onClick={handleSubmit}
          variant="primary"
          disabled={isLoading || saving}
        />
      </div>
    </form>
  );
};

export default LeadForm;