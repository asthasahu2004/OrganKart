import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const DonationRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState({});

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No authentication token found');
        navigate('/admin/login');
        return;
      }

      const response = await axios.get(`/api/donation-request/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.data) {
        setRequest(response.data.data);
        // Initialize admin notes if they exist
        if (response.data.data.adminNotes) {
          setAdminNotes(response.data.data.adminNotes);
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching request details:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch request details';
      toast.error(errorMessage);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        navigate('/admin/login');
      } else if (error.response?.status === 404) {
        toast.error('Donation request not found');
        navigate('/admin/donation-requests');
      } else {
        navigate('/admin/donation-requests');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this donation request?')) return;
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No authentication token found');
        navigate('/admin/login');
        return;
      }

      await axios.put(`/api/donation-request/approve/${id}`, {
        adminNotes: adminNotes.trim()
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      toast.success('Request approved successfully!');
      await fetchRequestDetails(); // Refresh the data
    } catch (error) {
      console.error('Error approving request:', error);
      const errorMessage = error.response?.data?.message || 'Failed to approve request';
      toast.error(errorMessage);
      
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    
    if (rejectionReason.trim().length < 10) {
      toast.error('Rejection reason must be at least 10 characters');
      return;
    }
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No authentication token found');
        navigate('/admin/login');
        return;
      }

      await axios.put(`/api/donation-request/reject/${id}`, {
        rejectionReason: rejectionReason.trim(),
        adminNotes: adminNotes.trim()
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      toast.success('Request rejected successfully!');
      setShowRejectForm(false);
      setRejectionReason('');
      await fetchRequestDetails(); // Refresh the data
    } catch (error) {
      console.error('Error rejecting request:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reject request';
      toast.error(errorMessage);
      
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleImageLoad = (index) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [index]: false
    }));
  };

  const handleImageError = (index) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [index]: false
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const handleCloseRejectForm = () => {
    setShowRejectForm(false);
    setRejectionReason('');
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading request details...</span>
      </div>
    );
  }

  // Error state - request not found
  if (!request) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 mb-4">Request not found</div>
        <button
          onClick={() => navigate('/admin/donation-requests')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Requests
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Donation Request Details</h1>
            <button
              onClick={() => navigate('/admin/donation-requests')}
              className="text-white hover:text-blue-200 transition duration-200"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="px-6 py-3 border-b border-gray-200">
          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
            request.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
            request.status === 'Approved' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {request.status}
          </span>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Organ Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Organ Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Organ Name</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">{request.organName || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <p className="mt-1 text-gray-900">{request.category?.name || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <p className="mt-1 text-gray-900">{request.quantity || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Pin Code</label>
                <p className="mt-1 text-gray-900">{request.pinCode || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-gray-900 leading-relaxed">{request.description || 'No description provided'}</p>
              </div>
            </div>

            {/* User Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Requester Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-gray-900">{request.requestedBy?.name || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">{request.requestedBy?.email || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-gray-900">{request.requestedBy?.phone || 'Not provided'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Request Date</label>
                <p className="mt-1 text-gray-900">{formatDate(request.createdAt)}</p>
              </div>

              {request.approvedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {request.status === 'Approved' ? 'Approved Date' : 'Rejected Date'}
                  </label>
                  <p className="mt-1 text-gray-900">{formatDate(request.approvedAt)}</p>
                </div>
              )}

              {request.approvedBy && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {request.status === 'Approved' ? 'Approved By' : 'Rejected By'}
                  </label>
                  <p className="mt-1 text-gray-900">{request.approvedBy?.name || 'N/A'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Images */}
          {request.images && request.images.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {request.images.map((image, index) => (
                  <div key={index} className="relative">
                    {imageLoadingStates[index] !== false && (
                      <div className="absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                    <img
                      src={image}
                      alt={`Organ ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border shadow-sm hover:shadow-md transition duration-200"
                      onLoad={() => handleImageLoad(index)}
                      onError={() => handleImageError(index)}
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rejection Reason */}
          {request.rejectionReason && (
            <div className="mt-6 p-4 bg-red-50 rounded-lg">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Rejection Reason</h3>
              <p className="text-red-700">{request.rejectionReason}</p>
            </div>
          )}

          {/* Admin Notes */}
          {request.adminNotes && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Admin Notes</h3>
              <p className="text-blue-700">{request.adminNotes}</p>
            </div>
          )}

          {/* Admin Actions */}
          {request.status === 'Pending' && (
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  maxLength={500}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any notes about this request..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  {adminNotes.length}/500 characters
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                >
                  {actionLoading ? 'Processing...' : 'Approve Request'}
                </button>
                
                <button
                  onClick={() => setShowRejectForm(true)}
                  disabled={actionLoading}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                >
                  Reject Request
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reject Form Modal */}
      {showRejectForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Donation Request</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  maxLength={500}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Please provide a detailed reason for rejection (minimum 10 characters)..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  {rejectionReason.length}/500 characters (minimum 10)
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCloseRejectForm}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading || rejectionReason.trim().length < 10}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                >
                  {actionLoading ? 'Processing...' : 'Reject Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationRequestDetails;