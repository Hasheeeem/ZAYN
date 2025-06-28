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
    salesTarget: currentTargets?.salesTarget?.toString() || '0',
    invoiceTarget: currentTargets?.invoiceTarget?.toString() || '0'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Function to handle numeric input with decimals
  const handleNumericInput = (value: string): string => {
    // Remove any non-numeric characters except decimal point
    let cleanValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      cleanValue = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      cleanValue = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    return cleanValue;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const salesValue = parseFloat(targets.salesTarget) || 0;
    const invoiceValue = parseFloat(targets.invoiceTarget) || 0;

    if (salesValue < 0) {
      newErrors.salesTarget = 'Sales target must be a positive number';
    }

    if (invoiceValue < 0) {
      newErrors.invoiceTarget = 'Invoice target must be a positive number';
    }

    if (targets.salesTarget && isNaN(salesValue)) {
      newErrors.salesTarget = 'Please enter a valid number';
    }

    if (targets.invoiceTarget && isNaN(invoiceValue)) {
      newErrors.invoiceTarget = 'Please enter a valid number';
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
      const salesTarget = parseFloat(targets.salesTarget) || 0;
      const invoiceTarget = parseFloat(targets.invoiceTarget) || 0;
      
      await onSave({ salesTarget, invoiceTarget });
    } catch (error) {
      console.error('Error saving targets:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: 'salesTarget' | 'invoiceTarget', value: string) => {
    const cleanValue = handleNumericInput(value);
    setTargets(prev => ({ ...prev, [field]: cleanValue }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, decimal point
    if ([8, 9, 27, 13, 46, 110, 190].indexOf(e.keyCode) !== -1 ||
        // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true)) {
      return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };

  const formatDisplayValue = (value: string): string => {
    if (!value || value === '0') return '0';
    const numValue = parseFloat(value);
    return isNaN(numValue) ? value : numValue.toLocaleString();
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
              type="text"
              value={targets.salesTarget}
              onChange={(e) => handleChange('salesTarget', e.target.value)}
              onKeyDown={handleKeyPress}
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
              type="text"
              value={targets.invoiceTarget}
              onChange={(e) => handleChange('invoiceTarget', e.target.value)}
              onKeyDown={handleKeyPress}
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
              ${formatDisplayValue(targets.salesTarget)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Invoice Target:</span>
            <span className="font-semibold text-blue-600 ml-2">
              ${formatDisplayValue(targets.invoiceTarget)}
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