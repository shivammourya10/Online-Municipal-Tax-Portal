import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import apiClient from '../../api/client';
import toast from 'react-hot-toast';

const BuildingPlans = () => {
  const { user } = useSelector((state) => state.auth);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [properties, setProperties] = useState([]);
  const [formData, setFormData] = useState({
    propertyId: '',
    applicationType: 'new_construction',
    buildingDetails: {
      plotArea: '',
      builtUpArea: '',
      numberOfFloors: 1,
      buildingHeight: '',
      buildingType: 'residential',
      proposedUse: '',
    },
    architectDetails: {
      name: '',
      licenseNumber: '',
      contactNumber: '',
    },
  });

  const applicationTypes = [
    { value: 'new_construction', label: 'New Construction' },
    { value: 'addition', label: 'Addition/Extension' },
    { value: 'renovation', label: 'Renovation' },
    { value: 'demolition', label: 'Demolition' },
  ];

  const buildingTypes = [
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'mixed', label: 'Mixed Use' },
  ];

  useEffect(() => {
    fetchPlans();
    fetchProperties();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await apiClient.get('/building-plans/my-plans');
      setPlans(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch building plans');
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
      await apiClient.post('/building-plans/submit', formData);
      toast.success('Building plan application submitted successfully');
      setShowApplicationForm(false);
      fetchPlans();
      // Reset form
      setFormData({
        propertyId: '',
        applicationType: 'new_construction',
        buildingDetails: {
          plotArea: '',
          builtUpArea: '',
          numberOfFloors: 1,
          buildingHeight: '',
          buildingType: 'residential',
          proposedUse: '',
        },
        architectDetails: {
          name: '',
          licenseNumber: '',
          contactNumber: '',
        },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    }
  };

  const getWorkflowColor = (stage) => {
    const colors = {
      submission: 'bg-blue-100 text-blue-800',
      document_verification: 'bg-yellow-100 text-yellow-800',
      site_inspection: 'bg-purple-100 text-purple-800',
      technical_scrutiny: 'bg-indigo-100 text-indigo-800',
      committee_review: 'bg-orange-100 text-orange-800',
      approval: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
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
        <h1 className="text-2xl font-bold text-gray-900">Building Plans</h1>
        <button
          onClick={() => setShowApplicationForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Submit New Application
        </button>
      </div>

      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Submit Building Plan Application</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Property</label>
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
                  Application Type
                </label>
                <select
                  value={formData.applicationType}
                  onChange={(e) => setFormData({ ...formData, applicationType: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  {applicationTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Building Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Plot Area (sq. meters)
                    </label>
                    <input
                      type="number"
                      value={formData.buildingDetails.plotArea}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          buildingDetails: {
                            ...formData.buildingDetails,
                            plotArea: e.target.value,
                          },
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Built-Up Area (sq. meters)
                    </label>
                    <input
                      type="number"
                      value={formData.buildingDetails.builtUpArea}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          buildingDetails: {
                            ...formData.buildingDetails,
                            builtUpArea: e.target.value,
                          },
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Number of Floors
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.buildingDetails.numberOfFloors}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          buildingDetails: {
                            ...formData.buildingDetails,
                            numberOfFloors: parseInt(e.target.value),
                          },
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Building Height (meters)
                    </label>
                    <input
                      type="number"
                      value={formData.buildingDetails.buildingHeight}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          buildingDetails: {
                            ...formData.buildingDetails,
                            buildingHeight: e.target.value,
                          },
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Building Type</label>
                    <select
                      value={formData.buildingDetails.buildingType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          buildingDetails: {
                            ...formData.buildingDetails,
                            buildingType: e.target.value,
                          },
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    >
                      {buildingTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Proposed Use</label>
                    <input
                      type="text"
                      value={formData.buildingDetails.proposedUse}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          buildingDetails: {
                            ...formData.buildingDetails,
                            proposedUse: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g., Apartment, Office, Warehouse"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Architect Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={formData.architectDetails.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          architectDetails: {
                            ...formData.architectDetails,
                            name: e.target.value,
                          },
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      License Number
                    </label>
                    <input
                      type="text"
                      value={formData.architectDetails.licenseNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          architectDetails: {
                            ...formData.architectDetails,
                            licenseNumber: e.target.value,
                          },
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      value={formData.architectDetails.contactNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          architectDetails: {
                            ...formData.architectDetails,
                            contactNumber: e.target.value,
                          },
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
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

      {/* Plans List */}
      {plans.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No building plan applications found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <div key={plan._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Application #{plan.applicationNumber}
                  </h3>
                  <p className="text-sm text-gray-500 capitalize">
                    {plan.applicationType.replace('_', ' ')}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getWorkflowColor(
                    plan.workflowStage
                  )}`}
                >
                  {plan.workflowStage.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-600">Plot Area:</span>
                  <p className="font-medium">{plan.buildingDetails.plotArea} sq.m</p>
                </div>
                <div>
                  <span className="text-gray-600">Built-Up Area:</span>
                  <p className="font-medium">{plan.buildingDetails.builtUpArea} sq.m</p>
                </div>
                <div>
                  <span className="text-gray-600">Floors:</span>
                  <p className="font-medium">{plan.buildingDetails.numberOfFloors}</p>
                </div>
                <div>
                  <span className="text-gray-600">Building Type:</span>
                  <p className="font-medium capitalize">{plan.buildingDetails.buildingType}</p>
                </div>
              </div>

              {plan.fees && (
                <div className="p-4 bg-blue-50 rounded-lg mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-900 font-semibold">Application Fee:</span>
                    <span className="text-blue-900 text-lg font-bold">₹{plan.fees.totalFee}</span>
                  </div>
                  {plan.fees.paymentStatus === 'paid' && (
                    <p className="text-xs text-blue-700 mt-2">
                      Paid on: {new Date(plan.fees.paidAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {plan.approvalDetails && plan.workflowStage === 'approval' && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Approved</h4>
                  <p className="text-sm text-green-800">
                    Approval Number: {plan.approvalDetails.approvalNumber}
                  </p>
                  <p className="text-sm text-green-800">
                    Valid Until: {new Date(plan.approvalDetails.validUntil).toLocaleDateString()}
                  </p>
                </div>
              )}

              {plan.rejectionDetails && plan.workflowStage === 'rejected' && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-900 mb-2">Rejected</h4>
                  <p className="text-sm text-red-800">{plan.rejectionDetails.reason}</p>
                </div>
              )}

              {plan.siteInspection && (
                <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Site Inspection</h4>
                  <p className="text-sm text-purple-800">
                    Scheduled: {new Date(plan.siteInspection.scheduledDate).toLocaleDateString()}
                  </p>
                  {plan.siteInspection.report && (
                    <p className="text-sm text-purple-800 mt-2">
                      Status: {plan.siteInspection.report.status}
                    </p>
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

export default BuildingPlans;
