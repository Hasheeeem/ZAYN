import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Lead } from '../types/data';
import ActionButton from '../components/ActionButton';
import apiService from '../services/api';

interface Props {
  onSave: (lead: Lead) => Promise<void>;
  onCancel: () => void;
  initialData?: Lead;
  isLoading?: boolean;
  isAdmin?: boolean;
}

interface DropdownOption {
  id: string;
  name: string;
}

const LeadForm: React.FC<Props> = ({ onSave, onCancel, initialData, isLoading = false, isAdmin = false }) => {
  const { showNotification } = useNotification();
  const { salespeople } = useData();
  const { authState } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  
  // Dropdown options state
  const [brands, setBrands] = useState<DropdownOption[]>([]);
  const [products, setProducts] = useState<DropdownOption[]>([]);
  const [locations, setLocations] = useState<DropdownOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  
  // Custom input states
  const [showCustomBrand, setShowCustomBrand] = useState(false);
  const [showCustomProduct, setShowCustomProduct] = useState(false);
  const [showCustomLocation, setShowCustomLocation] = useState(false);
  const [customBrand, setCustomBrand] = useState('');
  const [customProduct, setCustomProduct] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  
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
    invoiceBilled: initialData?.invoiceBilled || initialData?.clicks || 0,
    // Brand, Product, Location fields
    brand: initialData?.brand || '',
    product: initialData?.product || '',
    location: initialData?.location || ''
  });

  // Load dropdown options on component mount
  useEffect(() => {
    loadDropdownOptions();
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        // Ensure required fields are mapped correctly
        companyRepresentativeName: initialData.companyRepresentativeName || initialData.firstName || '',
        companyName: initialData.companyName || initialData.domain || '',
        pricePaid: initialData.pricePaid || initialData.price || 0,
        invoiceBilled: initialData.invoiceBilled || initialData.clicks || 0,
        brand: initialData.brand || '',
        product: initialData.product || '',
        location: initialData.location || ''
      });
    }
  }, [initialData]);

  const loadDropdownOptions = async () => {
    setLoadingOptions(true);
    try {
      const [brandsResponse, productsResponse, locationsResponse] = await Promise.all([
        apiService.getManagementData('brands'),
        apiService.getManagementData('products'),
        apiService.getManagementData('locations')
      ]);

      if (brandsResponse.success) {
        setBrands(brandsResponse.data.map((item: any) => ({ id: item.id, name: item.name })));
      }
      if (productsResponse.success) {
        setProducts(productsResponse.data.map((item: any) => ({ id: item.id, name: item.name })));
      }
      if (locationsResponse.success) {
        setLocations(locationsResponse.data.map((item: any) => ({ id: item.id, name: item.name })));
      }
    } catch (error) {
      console.error('Error loading dropdown options:', error);
      // Don't show error notification as these are optional fields
    } finally {
      setLoadingOptions(false);
    }
  };

  const addCustomOption = async (type: 'brands' | 'products' | 'locations', name: string) => {
    try {
      const data = {
        name: name.trim(),
        status: 'active'
      };

      // Add additional required fields based on type
      if (type === 'products') {
        data.sku = '';
        data.brandId = 0;
      } else if (type === 'locations') {
        data.region = '';
        data.currency = '';
      } else if (type === 'brands') {
        data.description = '';
      }

      const response = await apiService.createManagementItem(type, data);
      
      if (response.success) {
        const newOption = { id: response.data.id, name: response.data.name };
        
        // Update the appropriate dropdown
        if (type === 'brands') {
          setBrands(prev => [...prev, newOption]);
          setForm(prev => ({ ...prev, brand: response.data.name }));
          setShowCustomBrand(false);
          setCustomBrand('');
        } else if (type === 'products') {
          setProducts(prev => [...prev, newOption]);
          setForm(prev => ({ ...prev, product: response.data.name }));
          setShowCustomProduct(false);
          setCustomProduct('');
        } else if (type === 'locations') {
          setLocations(prev => [...prev, newOption]);
          setForm(prev => ({ ...prev, location: response.data.name }));
          setShowCustomLocation(false);
          setCustomLocation('');
        }
        
        showNotification(`${name} added successfully`, 'success');
      }
    } catch (error) {
      console.error(`Error adding custom ${type}:`, error);
      showNotification(`Failed to add ${name}`, 'error');
    }
  };

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
        price: parseFloat(form.pricePaid?.toString() || '0') || 0,
        email: form.email,
        phone: form.phone || null,
        clicks: parseFloat(form.invoiceBilled?.toString() || '0') || 0, // Map invoiceBilled to clicks
        status: form.status,
        source: form.source,
        assignedTo: form.assignedTo || null,
        notes: form.notes || null,
        // Keep the new fields for display purposes
        companyRepresentativeName: form.companyRepresentativeName,
        companyName: form.companyName,
        pricePaid: parseFloat(form.pricePaid?.toString() || '0') || 0,
        invoiceBilled: parseFloat(form.invoiceBilled?.toString() || '0') || 0,
        // Include the new Brand, Product, Location fields
        brand: form.brand || null,
        product: form.product || null,
        location: form.location || null
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
    
    // Handle numeric fields with decimal support
    if (name === 'pricePaid' || name === 'invoiceBilled') {
      // Allow only numbers and decimal points
      const numericValue = value.replace(/[^0-9.]/g, '');
      // Ensure only one decimal point
      const parts = numericValue.split('.');
      const formattedValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue;
      
      setForm(prev => ({ 
        ...prev, 
        [name]: formattedValue
      }));
    } else {
      setForm(prev => ({ 
        ...prev, 
        [name]: value 
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDropdownChange = (field: 'brand' | 'product' | 'location', value: string) => {
    if (value === 'custom') {
      if (field === 'brand') setShowCustomBrand(true);
      else if (field === 'product') setShowCustomProduct(true);
      else if (field === 'location') setShowCustomLocation(true);
    } else {
      setForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleCustomSubmit = (type: 'brands' | 'products' | 'locations', value: string) => {
    if (value.trim()) {
      addCustomOption(type, value.trim());
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
            type="text"
            value={form.pricePaid || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading || saving}
            placeholder="0.00"
          />
        </div>

        <div>
          <label htmlFor="invoiceBilled" className="block text-sm font-medium text-gray-700 mb-1">
            Invoice Billed
          </label>
          <input
            id="invoiceBilled"
            name="invoiceBilled"
            type="text"
            value={form.invoiceBilled || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading || saving}
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Brand, Product, Location Section */}
      <div className="border-t pt-4 mt-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Business Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Brand Field */}
          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
              Brand
            </label>
            {showCustomBrand ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter new brand"
                  disabled={isLoading || saving}
                />
                <button
                  type="button"
                  onClick={() => handleCustomSubmit('brands', customBrand)}
                  className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  disabled={isLoading || saving || !customBrand.trim()}
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomBrand(false);
                    setCustomBrand('');
                  }}
                  className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  disabled={isLoading || saving}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <select
                id="brand"
                value={form.brand || ''}
                onChange={(e) => handleDropdownChange('brand', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                disabled={isLoading || saving || loadingOptions}
              >
                <option value="">Select Brand</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.name}>
                    {brand.name}
                  </option>
                ))}
                <option value="custom">+ Add New Brand</option>
              </select>
            )}
          </div>

          {/* Product Field */}
          <div>
            <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">
              Product
            </label>
            {showCustomProduct ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customProduct}
                  onChange={(e) => setCustomProduct(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter new product"
                  disabled={isLoading || saving}
                />
                <button
                  type="button"
                  onClick={() => handleCustomSubmit('products', customProduct)}
                  className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  disabled={isLoading || saving || !customProduct.trim()}
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomProduct(false);
                    setCustomProduct('');
                  }}
                  className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  disabled={isLoading || saving}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <select
                id="product"
                value={form.product || ''}
                onChange={(e) => handleDropdownChange('product', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                disabled={isLoading || saving || loadingOptions}
              >
                <option value="">Select Product</option>
                {products.map(product => (
                  <option key={product.id} value={product.name}>
                    {product.name}
                  </option>
                ))}
                <option value="custom">+ Add New Product</option>
              </select>
            )}
          </div>

          {/* Location Field */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            {showCustomLocation ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter new location"
                  disabled={isLoading || saving}
                />
                <button
                  type="button"
                  onClick={() => handleCustomSubmit('locations', customLocation)}
                  className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  disabled={isLoading || saving || !customLocation.trim()}
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomLocation(false);
                    setCustomLocation('');
                  }}
                  className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  disabled={isLoading || saving}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <select
                id="location"
                value={form.location || ''}
                onChange={(e) => handleDropdownChange('location', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                disabled={isLoading || saving || loadingOptions}
              >
                <option value="">Select Location</option>
                {locations.map(location => (
                  <option key={location.id} value={location.name}>
                    {location.name}
                  </option>
                ))}
                <option value="custom">+ Add New Location</option>
              </select>
            )}
          </div>
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