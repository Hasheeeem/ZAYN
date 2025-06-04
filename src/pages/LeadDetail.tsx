import React from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Lead } from '../types/data';

const LeadDetail: React.FC = () => {
  const { id } = useParams();
  const { leads } = useData();
  const lead = leads.find((l) => l.id === id);

  if (!lead) return <div className="p-4">Lead not found.</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Lead Details</h1>
      <div className="space-y-2">
        <p><strong>Name:</strong> {lead.firstName} {lead.lastName}</p>
        <p><strong>Email:</strong> {lead.email}</p>
        <p><strong>Phone:</strong> {lead.phone}</p>
        <p><strong>Status:</strong> {lead.status}</p>
        <p><strong>Source:</strong> {lead.source}</p>
        <p><strong>Notes:</strong> {lead.notes}</p>
        <p><strong>Created At:</strong> {lead.createdAt}</p>
      </div>
    </div>
  );
};

export default LeadDetail;