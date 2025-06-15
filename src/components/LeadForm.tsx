import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Lead } from '../types/data';
import ActionButton from '../components/ActionButton';

interface Props {
  onSave: (lead: Lead) => Promise<void>;
  onCancel: () => void;
  initialData?: Lead;
  isLoading?: boolean;
  isAdmin?: boolean;
}

const LeadForm: React.FC<Props> = ({ onSave, onCancel, initialData, isLoading = false, isAdmin = false }) => {
  const { showNotification } = useNotification();
  const { salespeople } = useData();
  const { authState } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState<Lead>({
    id: initialData?.id || '',
    firstName: initialData?.firstName || initialData?.companyRepresentativeName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    domain: initialData?.domain || initialData?.companyName || '',
    price: initialData?.price || initialData?.pricePaid || 0,
    clicks: initialData?.clicks || 0,
    status: initialData?.status || 'new',
    source: initialData?.source || 'website',
    assignedTo: initialData?.assignedTo || (isAdmin ? '' : authState.user?.id.toString() || ''),
    notes: initialData?.notes || '',
    update: initialData?.update || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    createdAt: initialData?.createdAt || new Date().toISOString(),
    // Keep the additional fields for compatibility
    companyRepresentativeName: initialData?.companyRepresentativeName || '',
    companyName: initialData?.companyName || '',
    pricePaid: initialData?.pricePaid || 0,
    invoiceBilled: initialData?.invoiceBilled || 0
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        // Ensure required fields are mapped correctly
        firstName: initialData.firstName || initialData.companyRepresentativeName || '',
        lastName: initialData.lastName || '',
        domain: initialData.domain || initialData.companyName || '',
        price: initialData.price || initialData.pricePaid || 0
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!form.domain?.trim()) {
      newErrors.domain = 'Domain is required';
    }

    if (form.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }

    if (form.clicks < 0) {
      newErrors.clicks = 'Clicks cannot be negative';
    }

    if (isAdmin && !form.assignedTo) {
      newErrors.assignedTo = 'Please assign the lead to a sales person';
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
      // Create the payload that matches the backend schema
      const leadPayload = {
        ...form,
        // Ensure we're sending the correct field names that the backend expects
        firstName: form.firstName,
        lastName: form.lastName || '',
        email: form.email,
        phone: form.phone || null,
        domain: form.domain,
        price: Number(form.price) || 0,
        clicks: Number(form.clicks) || 0,
        status: form.status,
        source: form.source,
        assignedTo: form.assignedTo || null,
        notes: form.notes || null
      };

      console.log('Submitting lead payload:', leadPayload);
      await onSave(leadPayload);
    } catch (error) {
      console.error('Error saving lead:', error);
      // Error is handled in the parent component
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: name === 'price' || name === 'clicks' ? parseFloat(value) || 0 : value 
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
            value={form.firstName || ''}
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
            value={form.lastName || ''}
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
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone || ''}
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
            value={form.domain || ''}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.domain ? 'border-red-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-indigo-500`}
            disabled={isLoading || saving}
            placeholder="example.com"
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
            step="0.01"
            value={form.price || 0}
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
          <label htmlFor="clicks" className="block text-sm font-medium text-gray-700 mb-1">
            Clicks
          </label>
          <input
            id="clicks"
            name="clicks"
            type="number"
            value={form.clicks || 0}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.clicks ? 'border-red-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-indigo-500`}
            disabled={isLoading || saving}
          />
          {errors.clicks && (
            <p className="mt-1 text-sm text-red-500">{errors.clicks}</p>
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
            Source
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

        {isAdmin && (
          <div>
            <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
              Assigned To *
            </label>
            <select
              id="assignedTo"
              name="assignedTo"
              value={form.assignedTo}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.assignedTo ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-indigo-500`}
              disabled={isLoading || saving}
            >
              <option value="">Select Sales Person</option>
              {salespeople.map(person => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
            {errors.assignedTo && (
              <p className="mt-1 text-sm text-red-500">{errors.assignedTo}</p>
            )}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={form.notes || ''}
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
        <button
          type="submit"
          disabled={isLoading || saving}
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {saving ? 'Saving...' : 'Save Lead'}
        </button>
      </div>
    </form>
  );
};

export default LeadForm;