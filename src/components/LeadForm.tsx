import React, { useState } from 'react';
import { Lead } from '../types/data';
import ActionButton from './ActionButton';

interface Props {
  onSave: (lead: Lead) => void;
  onCancel: () => void;
  initialData?: Lead;
}

const LeadForm: React.FC<Props> = ({ onSave, onCancel, initialData }) => {
  const [form, setForm] = useState<Lead>(
    initialData || {
      id: Date.now().toString(),
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      status: 'new',
      source: 'website',
      notes: '',
      createdAt: new Date().toISOString(),
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  return (
    <div className="space-y-2">
      <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" className="w-full border p-2" />
      <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" className="w-full border p-2" />
      <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full border p-2" />
      <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="w-full border p-2" />
      <select name="status" value={form.status} onChange={handleChange} className="w-full border p-2">
        <option value="new">New</option>
        <option value="contacted">Contacted</option>
        <option value="qualified">Qualified</option>
        <option value="lost">Lost</option>
      </select>
      <select name="source" value={form.source} onChange={handleChange} className="w-full border p-2">
        <option value="website">Website</option>
        <option value="ads">Ads</option>
        <option value="referral">Referral</option>
        <option value="other">Other</option>
      </select>
      <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" className="w-full border p-2" />
      <div className="flex justify-end gap-2">
        <ActionButton label="Cancel" onClick={onCancel} />
        <ActionButton label="Save" onClick={() => onSave(form)} />
      </div>
    </div>
  );
};

export default LeadForm;