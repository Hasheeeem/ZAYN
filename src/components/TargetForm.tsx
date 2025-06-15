import React, { useState } from 'react';
import { Target, DollarSign } from 'lucide-react';
import ActionButton from './ActionButton';
import { useNotification } from '../context/NotificationContext';

interface TargetFormProps {
  userId: string;
  userName: string;
  currentTargets?: {
    salesTarget: number;
    invoiceTarget: number;
  };
  onSave: (targets: { salesTarget: number; invoiceTarget: number }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const TargetForm: React.FC<TargetFormProps> = ({
  userId,
  userName,
  currentTargets,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const { showNotification } = useNotification();
  const [targets, setTargets] = useState({
    salesTarget: currentTargets?.salesTarget || 0,
    invoiceTarget: currentTargets?.invoiceTarget || 0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (targets.salesTarget < 0) {
      newErrors.salesTarget = 'Sales target must be a positive number';
    }

    if (targets.invoiceTarget < 0) {
      newErrors.invoiceTarget = 'Invoice target must be a positive number';
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
      await onSave(targets);
    } catch (error) {
      console.error('Error saving targets:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: 'salesTarget' | 'invoiceTarget', value: string) => {
    const numericValue = parseFloat(value) || 0;
    setTargets(prev => ({ ...prev, [field]: numericValue }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
          {userName.charAt(0)}
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Set Monthly Targets</h3>
        <p className="text-gray-600">for {userName}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="salesTarget" className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-green-600" />
              Monthly Sales Target
            </div>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              id="salesTarget"
              type="number"
              min="0"
              step="0.01"
              value={targets.salesTarget}
              onChange={(e) => handleChange('salesTarget', e.target.value)}
              className={`w-full pl-8 pr-4 py-3 rounded-lg border ${
                errors.salesTarget ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
              placeholder="0.00"
              disabled={isLoading || saving}
            />
          </div>
          {errors.salesTarget && (
            <p className="mt-1 text-sm text-red-500">{errors.salesTarget}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Target based on "Price Paid" field from leads
          </p>
        </div>

        <div>
          <label htmlFor="invoiceTarget" className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-blue-600" />
              Monthly Invoice Target
            </div>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              id="invoiceTarget"
              type="number"
              min="0"
              step="0.01"
              value={targets.invoiceTarget}
              onChange={(e) => handleChange('invoiceTarget', e.target.value)}
              className={`w-full pl-8 pr-4 py-3 rounded-lg border ${
                errors.invoiceTarget ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
              placeholder="0.00"
              disabled={isLoading || saving}
            />
          </div>
          {errors.invoiceTarget && (
            <p className="mt-1 text-sm text-red-500">{errors.invoiceTarget}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Target based on "Invoice Billed" field from leads
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-2">Target Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Sales Target:</span>
            <span className="font-semibold text-green-600 ml-2">
              ${targets.salesTarget.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Invoice Target:</span>
            <span className="font-semibold text-blue-600 ml-2">
              ${targets.invoiceTarget.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <ActionButton
          label="Cancel"
          onClick={onCancel}
          variant="secondary"
          disabled={isLoading || saving}
        />
        <button
          type="submit"
          disabled={isLoading || saving}
          className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            'Set Targets'
          )}
        </button>
      </div>
    </form>
  );
};

export default TargetForm;