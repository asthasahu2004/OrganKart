import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const DonationRequestForm = () => {
  const [formData, setFormData] = useState({
    organName: '',
    category: '',
    images: [], // Store actual File objects
    pinCode: '',
    description: '',
    quantity: 1
  });
  const [imagePreview, setImagePreview] = useState([]); // Separate state for preview URLs
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const API_BASE_URL = 'http://localhost:8000';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/category/all-category`);
      console.log("Fetched categories:", response.data);

      if (response.data.Categories) {
        setCategories(response.data.Categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Store actual file objects
    setFormData(prev => ({
      ...prev,
      images: files
    }));

    // Create preview URLs
    const previewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreview(previewUrls);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.organName.trim()) newErrors.organName = 'Organ name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (formData.images.length === 0) newErrors.images = 'At least one image is required';
    if (!formData.pinCode || formData.pinCode.length !== 6) newErrors.pinCode = 'Valid 6-digit pin code is required';
    if (!formData.description.trim() || formData.description.length < 10) newErrors.description = 'Description must be at least 10 characters';
    if (!formData.quantity || formData.quantity < 1) newErrors.quantity = 'Quantity must be at least 1';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const rawToken = localStorage.getItem('jwt');
      let token;
      
      if (rawToken) {
        try {
          const parsed = JSON.parse(rawToken);
          token = parsed?.token;
        } catch (parseError) {
          token = rawToken;
        }
      }

      if (!token) {
        toast.error('Please login to submit a donation request');
        return;
      }

      // Create FormData for file upload
      const submitFormData = new FormData();
      submitFormData.append('organName', formData.organName);
      submitFormData.append('category', formData.category);
      submitFormData.append('pinCode', formData.pinCode);
      submitFormData.append('description', formData.description);
      submitFormData.append('quantity', formData.quantity);
      
      // Append all image files
      formData.images.forEach((file) => {
        submitFormData.append('images', file);
      });

      // Debug: Log what we're sending
      console.log('=== DEBUGGING FORM SUBMISSION ===');
      console.log('Form data values:');
      for (let [key, value] of submitFormData.entries()) {
        if (key === 'images') {
          console.log(`${key}:`, value.name, value.size, value.type);
        } else {
          console.log(`${key}:`, value);
        }
      }
      console.log('Token (first 20 chars):', token?.substring(0, 20));
      console.log('=== END DEBUG ===');

      const response = await axios.post(
        `${API_BASE_URL}/api/donation-request/create`, 
        submitFormData, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type manually for FormData - let axios handle it
          },
        }
      );

      if (response.data.success) {
        toast.success('Donation request submitted successfully!');
        
        // Reset form
        setFormData({
          organName: '',
          category: '',
          images: [],
          pinCode: '',
          description: '',
          quantity: 1,
        });
        setImagePreview([]);
        
        // Clear file input
        const fileInput = document.getElementById('images');
        if (fileInput) fileInput.value = '';
      }
    } catch (error) {
      console.error('=== ERROR DETAILS ===');
      console.error('Full error:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('Response headers:', error.response?.headers);
      console.error('=== END ERROR DETAILS ===');
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else if (error.response?.data?.errors) {
        toast.error(error.response.data.errors.join(', '));
      } else {
        toast.error(error.response?.data?.message || 'Failed to submit request');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Submit Organ Donation Request</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Organ Name</label>
          <input
            type="text"
            name="organName"
            value={formData.organName}
            onChange={handleInputChange}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.organName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter organ name"
            disabled={loading}
          />
          {errors.organName && <p className="text-red-500 text-sm mt-1">{errors.organName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.category ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          >
            <option value="">Select category</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.cName}</option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Images</label>
          <input
            id="images"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          {imagePreview.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {imagePreview.map((image, index) => (
                <div key={index} className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                  <img src={image} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                </div>
              ))}
            </div>
          )}
          {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Pin Code</label>
          <input
            type="text"
            name="pinCode"
            value={formData.pinCode}
            onChange={handleInputChange}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.pinCode ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter 6-digit pin code"
            maxLength="6"
            disabled={loading}
          />
          {errors.pinCode && <p className="text-red-500 text-sm mt-1">{errors.pinCode}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe the organ and its condition"
            disabled={loading}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Quantity</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleInputChange}
            min="1"
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.quantity ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
};

export default DonationRequestForm;