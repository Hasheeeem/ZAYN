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
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    domain: initialData?.domain || '',
    price: initialData?.price || 0,
    clicks: initialData?.clicks || 0,
    status: initialData?.status || 'new',
    source: initialData?.source || 'website',
    assignedTo: initialData?.assignedTo || (isAdmin ? '' : authState.user?.id.toString() || ''),
    notes: initialData?.notes || '',
    update: initialData?.update || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    createdAt: initialData?.createdAt || new Date().toISOString(),
    // New fields for the updated form
    companyRepresentativeName: initialData?.companyRepresentativeName || initialData?.firstName || '',
    companyName: initialData?.companyName || initialData?.domain || '',
    pricePaid: initialData?.pricePaid || initialData?.price || 0,
    invoiceBilled: initialData?.invoiceBilled || 0
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        // Ensure required fields are mapped correctly
        companyRepresentativeName: initialData.companyRepresentativeName || initialData.firstName || '',
        companyName: initialData.companyName || initialData.domain || '',
        pricePaid: initialData.pricePaid || initialData.price || 0,
        invoiceBilled: initialData.invoiceBilled || 0
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.companyRepresentativeName?.trim()) {
      newErrors.companyRepresentativeName = 'Company representative name is required';
    }

    if (!form.companyName?.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (form.pricePaid < 0) {
      newErrors.pricePaid = 'Price paid cannot be negative';
    }

    if (form.invoiceBilled < 0) {
      newErrors.invoiceBilled = 'Invoice billed cannot be negative';
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
        // Map the new fields to the existing schema
        firstName: form.companyRepresentativeName,
        lastName: '',
        domain: form.companyName,
        price: Number(form.pricePaid) || 0,
        email: form.email,
        phone: form.phone || null,
        clicks: Number(form.clicks) || 0,
        status: form.status,
        source: form.source,
        assignedTo: form.assignedTo || null,
        notes: form.notes || null,
        // Keep the new fields for display purposes
        companyRepresentativeName: form.companyRepresentativeName,
        companyName: form.companyName,
        pricePaid: Number(form.pricePaid) || 0,
        invoiceBilled: Number(form.invoiceBilled) || 0
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
      [name]: name === 'pricePaid' || name === 'invoiceBilled' || name === 'clicks' ? parseFloat(value) || 0 : value 
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="companyRepresentativeName" className="block text-sm font-medium text-gray-700 mb-1">
            Company Representative Name *
          </label>
          <input
            id="companyRepresentativeName"
            name="companyRepresentativeName"
            type="text"
            value={form.companyRepresentativeName || ''}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.companyRepresentativeName ? 'border-red-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-indigo-500`}
            disabled={isLoading || saving}
          />
          {errors.companyRepresentativeName && (
            <p className="mt-1 text-sm text-red-500">{errors.companyRepresentativeName}</p>
          )}
        </div>

        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
            Company Name *
          </label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            value={form.companyName || ''}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.companyName ? 'border-red-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-indigo-500`}
            disabled={isLoading || saving}
          />
          {errors.companyName && (
            <p className="mt-1 text-sm text-red-500">{errors.companyName}</p>
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

        <div>
          <label htmlFor="pricePaid" className="block text-sm font-medium text-gray-700 mb-1">
            Price Paid (Sales Done)
          </label>
          <input
            id="pricePaid"
            name="pricePaid"
            type="number"
            step="0.01"
            value={form.pricePaid || 0}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.pricePaid ? 'border-red-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-indigo-500`}
            disabled={isLoading || saving}
          />
          {errors.pricePaid && (
            <p className="mt-1 text-sm text-red-500">{errors.pricePaid}</p>
          )}
        </div>

        <div>
          <label htmlFor="invoiceBilled" className="block text-sm font-medium text-gray-700 mb-1">
            Invoice Billed
          </label>
          <input
            id="invoiceBilled"
            name="invoiceBilled"
            type="number"
            step="0.01"
            value={form.invoiceBilled || 0}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.invoiceBilled ? 'border-red-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-indigo-500`}
            disabled={isLoading || saving}
          />
          {errors.invoiceBilled && (
            <p className="mt-1 text-sm text-red-500">{errors.invoiceBilled}</p>
          )}
        </div>
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