import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';

const Complaints = () => {
  const { user } = useSelector((state) => state.auth);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [formData, setFormData] = useState({
    category: 'water_supply',
    subject: '',
    description: '',
    location: {
      address: '',
      area: '',
      landmark: '',
    },
    priority: 'medium',
  });
  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    comments: '',
  });

  const complaintCategories = [
    { value: 'water_supply', label: 'Water Supply' },
    { value: 'sewerage', label: 'Sewerage' },
    { value: 'road_maintenance', label: 'Road Maintenance' },
    { value: 'street_lights', label: 'Street Lights' },
    { value: 'waste_management', label: 'Waste Management' },
    { value: 'drainage', label: 'Drainage' },
    { value: 'parks_gardens', label: 'Parks & Gardens' },
    { value: 'encroachment', label: 'Encroachment' },
    { value: 'property_tax', label: 'Property Tax' },
    { value: 'building_violation', label: 'Building Violation' },
    { value: 'public_health', label: 'Public Health' },
    { value: 'birth_death_certificate', label: 'Birth/Death Certificate' },
    { value: 'trade_license', label: 'Trade License' },
    { value: 'others', label: 'Others' },
  ];

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await apiClient.get('/complaints/my-complaints');
      setComplaints(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/complaints', formData);
      toast.success('Complaint filed successfully');
      setShowComplaintForm(false);
      fetchComplaints();
      // Reset form
      setFormData({
        category: 'water_supply',
        subject: '',
        description: '',
        location: { address: '', area: '', landmark: '' },
        priority: 'medium',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to file complaint');
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post(`/complaints/${selectedComplaint._id}/feedback`, feedbackData);
      toast.success('Feedback submitted successfully');
      setShowFeedbackForm(false);
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (error) {
      toast.error('Failed to submit feedback');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-purple-100 text-purple-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
        <button
          onClick={() => setShowComplaintForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          File New Complaint
        </button>
      </div>

      {/* Complaint Form Modal */}
      {showComplaintForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">File a Complaint</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  {complaintCategories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, address: e.target.value },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Area</label>
                  <input
                    type="text"
                    value={formData.location.area}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: { ...formData.location, area: e.target.value },
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Landmark</label>
                  <input
                    type="text"
                    value={formData.location.landmark}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: { ...formData.location, landmark: e.target.value },
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowComplaintForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Submit Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Form Modal */}
      {showFeedbackForm && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Submit Feedback</h2>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={feedbackData.rating}
                  onChange={(e) =>
                    setFeedbackData({ ...feedbackData, rating: parseInt(e.target.value) })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Comments</label>
                <textarea
                  value={feedbackData.comments}
                  onChange={(e) => setFeedbackData({ ...feedbackData, comments: e.target.value })}
                  rows="4"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowFeedbackForm(false);
                    setSelectedComplaint(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complaints List */}
      {complaints.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No complaints filed yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <div key={complaint._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{complaint.subject}</h3>
                  <p className="text-sm text-gray-500">
                    Complaint #{complaint.complaintNumber}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      complaint.status
                    )}`}
                  >
                    {complaint.status}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                      complaint.priority
                    )}`}
                  >
                    {complaint.priority}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{complaint.description}</p>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-600">Category:</span>
                  <span className="ml-2 font-medium capitalize">
                    {complaint.category.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Location:</span>
                  <span className="ml-2 font-medium">{complaint.location.address}</span>
                </div>
                <div>
                  <span className="text-gray-600">Filed on:</span>
                  <span className="ml-2 font-medium">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {complaint.slaDeadline && (
                  <div>
                    <span className="text-gray-600">SLA Deadline:</span>
                    <span className="ml-2 font-medium">
                      {new Date(complaint.slaDeadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {complaint.resolution && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Resolution</h4>
                  <p className="text-sm text-green-800">{complaint.resolution.description}</p>
                  <p className="text-xs text-green-700 mt-2">
                    Resolved on: {new Date(complaint.resolution.resolvedAt).toLocaleDateString()}
                  </p>
                </div>
              )}

              {complaint.status === 'resolved' && !complaint.feedback && (
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setSelectedComplaint(complaint);
                      setShowFeedbackForm(true);
                    }}
                    className="w-full bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 font-medium"
                  >
                    Submit Feedback
                  </button>
                </div>
              )}

              {complaint.feedback && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Your Feedback</h4>
                  <div className="flex items-center mb-2">
                    <span className="text-sm text-gray-600">Rating:</span>
                    <span className="ml-2 text-yellow-500">{'⭐'.repeat(complaint.feedback.rating)}</span>
                  </div>
                  {complaint.feedback.comments && (
                    <p className="text-sm text-gray-700">{complaint.feedback.comments}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Complaints;
