import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';

const WaterConnections = () => {
  const { user } = useSelector((state) => state.auth);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [properties, setProperties] = useState([]);
  const [formData, setFormData] = useState({
    propertyId: '',
    connectionType: 'domestic',
    pipeSize: '15mm',
    numberOfTaps: 1,
    applicantDetails: {
      name: user?.profile?.firstName + ' ' + user?.profile?.lastName || '',
      contactNumber: user?.profile?.phone || '',
      email: user?.email || '',
    },
  });

  useEffect(() => {
    fetchConnections();
    fetchProperties();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await apiClient.get('/water-connections/my-connections');
      setConnections(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch water connections');
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await apiClient.get('/properties');
      setProperties(response.data.data);
    } catch (error) {
      console.error('Failed to fetch properties');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/water-connections/apply', formData);
      toast.success('Water connection application submitted successfully');
      setShowApplicationForm(false);
      fetchConnections();
      // Reset form
      setFormData({
        ...formData,
        propertyId: '',
        connectionType: 'domestic',
        pipeSize: '15mm',
        numberOfTaps: 1,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      disconnected: 'bg-red-100 text-red-800',
      suspended: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
        <h1 className="text-2xl font-bold text-gray-900">Water Connections</h1>
        <button
          onClick={() => setShowApplicationForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Apply for New Connection
        </button>
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Apply for Water Connection</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Select Property
                </label>
                <select
                  value={formData.propertyId}
                  onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a property</option>
                  {properties.map((property) => (
                    <option key={property._id} value={property._id}>
                      {property.propertyDetails.name} - {property.propertyDetails.address.city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Connection Type
                </label>
                <select
                  value={formData.connectionType}
                  onChange={(e) => setFormData({ ...formData, connectionType: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="domestic">Domestic</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pipe Size
                </label>
                <select
                  value={formData.pipeSize}
                  onChange={(e) => setFormData({ ...formData, pipeSize: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="15mm">15mm</option>
                  <option value="20mm">20mm</option>
                  <option value="25mm">25mm</option>
                  <option value="32mm">32mm</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Number of Taps
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.numberOfTaps}
                  onChange={(e) => setFormData({ ...formData, numberOfTaps: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowApplicationForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Connections List */}
      {connections.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No water connections found</p>
          <button
            onClick={() => setShowApplicationForm(true)}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Apply for your first connection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connections.map((connection) => (
            <div key={connection._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {connection.connectionNumber}
                  </h3>
                  <p className="text-sm text-gray-500 capitalize">
                    {connection.connectionType}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    connection.connectionDetails.connectionStatus
                  )}`}
                >
                  {connection.connectionDetails.connectionStatus}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Meter Number:</span>
                  <span className="font-medium">
                    {connection.connectionDetails.meterNumber || 'Not assigned'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pipe Size:</span>
                  <span className="font-medium">{connection.connectionDetails.pipeSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Arrears:</span>
                  <span className="font-medium text-red-600">₹{connection.arrears || 0}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="w-full bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 font-medium">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WaterConnections;
