import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/client';

const TaxCalculator = () => {
  const navigate = useNavigate();
  const resultRef = useRef(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [taxCalculation, setTaxCalculation] = useState(null);

  const [newProperty, setNewProperty] = useState({
    propertyType: 'residential',
    propertySubType: 'house',
    propertyDetails: {
      name: '',
      address: { street: '', area: '', city: '', state: '', pincode: '', landmark: '' },
      plotNumber: '', surveyNumber: '',
    },
    dimensions: { builtUpArea: '', plotArea: '', carpetArea: '', numberOfFloors: 1, yearBuilt: '' },
    ownership: { ownershipType: 'owned', ownerName: '', purchaseDate: '', purchaseValue: '' },
    assessment: { currentMarketValue: '', annualRentalValue: '' },
    amenities: {
      waterConnection: false, electricityConnection: false, sewageConnection: false,
      roadAccess: false, parking: false, lift: false, generator: false,
      swimmingPool: false, garden: false, securitySystem: false,
    },
    usageDetails: { currentUse: 'self_occupied', rentAmount: '' },
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await api.get('/properties');
      setProperties(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error('Properties fetch error:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/properties', newProperty);
      toast.success('Property added successfully!');
      setShowAddForm(false);
      fetchProperties();
    } catch (error) {
      console.error('Add property error:', error);
      toast.error(error?.message || 'Failed to add property');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateTax = async (propertyId) => {
    try {
      setLoading(true);
      const response = await api.get(`/properties/${propertyId}/calculate-tax`);
      setTaxCalculation(response.data || response);
      setSelectedProperty(propertyId);
    } catch (error) {
      console.error('Tax calculation error:', error);
      toast.error('Failed to calculate tax');
    } finally {
      setLoading(false);
    }
  };

  const handlePayTax = async () => {
    if (!selectedProperty || !taxCalculation) {
      toast.error('Please calculate tax first');
      return;
    }
    // Ensure the calculation summary is visible before redirecting to payments
    if (resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    navigate('/payments', { 
      state: { 
        taxData: taxCalculation,
        amount: taxCalculation.pendingAmount || taxCalculation.annualTax,
        propertyId: selectedProperty,
        type: 'property_tax'
      } 
    });
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    try {
      await api.delete(`/properties/${propertyId}`);
      toast.success('Property deleted successfully');
      fetchProperties();
    } catch (error) {
      toast.error(error?.message || 'Failed to delete property');
    }
  };

  const propertyTypeOptions = {
    residential: ['house', 'apartment', 'villa', 'bungalow'],
    commercial: ['shop', 'office', 'warehouse', 'mall', 'hotel'],
    industrial: ['factory', 'manufacturing_unit', 'cold_storage'],
    plot: ['vacant_land', 'residential_plot', 'commercial_plot'],
    agricultural: ['farm', 'plantation'],
  };

  const formatCurrency = (amount) => `₹${amount?.toLocaleString('en-IN') || 0}`;
  const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-IN') : 'N/A';

  useEffect(() => {
    if (taxCalculation && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [taxCalculation]);

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Municipal Property Tax</h1>
            <p className="text-gray-600 mt-1">Manage your properties and pay municipal taxes</p>
          </div>
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary">
            {showAddForm ? 'Cancel' : '+ Add Property'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Add New Property</h2>
          <form onSubmit={handleAddProperty} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Property Type *</label>
                <select value={newProperty.propertyType} onChange={(e) => setNewProperty({ ...newProperty, propertyType: e.target.value, propertySubType: propertyTypeOptions[e.target.value][0] })} className="input" required>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                  <option value="plot">Plot/Land</option>
                  <option value="agricultural">Agricultural</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Property Sub-Type *</label>
                <select value={newProperty.propertySubType} onChange={(e) => setNewProperty({ ...newProperty, propertySubType: e.target.value })} className="input" required>
                  {propertyTypeOptions[newProperty.propertyType].map(subType => (
                    <option key={subType} value={subType}>{subType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Property Details</h3>
              <div className="space-y-4">
                <input type="text" value={newProperty.propertyDetails.name} onChange={(e) => setNewProperty({ ...newProperty, propertyDetails: { ...newProperty.propertyDetails, name: e.target.value } })} className="input" placeholder="Property Name *" required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" value={newProperty.propertyDetails.address.street} onChange={(e) => setNewProperty({ ...newProperty, propertyDetails: { ...newProperty.propertyDetails, address: { ...newProperty.propertyDetails.address, street: e.target.value } } })} className="input" placeholder="Street Address *" required />
                  <input type="text" value={newProperty.propertyDetails.address.area} onChange={(e) => setNewProperty({ ...newProperty, propertyDetails: { ...newProperty.propertyDetails, address: { ...newProperty.propertyDetails.address, area: e.target.value } } })} className="input" placeholder="Area/Locality *" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input type="text" value={newProperty.propertyDetails.address.city} onChange={(e) => setNewProperty({ ...newProperty, propertyDetails: { ...newProperty.propertyDetails, address: { ...newProperty.propertyDetails.address, city: e.target.value } } })} className="input" placeholder="City *" required />
                  <input type="text" value={newProperty.propertyDetails.address.state} onChange={(e) => setNewProperty({ ...newProperty, propertyDetails: { ...newProperty.propertyDetails, address: { ...newProperty.propertyDetails.address, state: e.target.value } } })} className="input" placeholder="State *" required />
                  <input type="text" value={newProperty.propertyDetails.address.pincode} onChange={(e) => setNewProperty({ ...newProperty, propertyDetails: { ...newProperty.propertyDetails, address: { ...newProperty.propertyDetails.address, pincode: e.target.value } } })} className="input" pattern="[0-9]{6}" placeholder="Pincode *" required />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Property Dimensions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="number" value={newProperty.dimensions.builtUpArea} onChange={(e) => setNewProperty({ ...newProperty, dimensions: { ...newProperty.dimensions, builtUpArea: e.target.value } })} className="input" placeholder="Built-up Area (sq ft) *" min="0" required />
                <input type="number" value={newProperty.dimensions.plotArea} onChange={(e) => setNewProperty({ ...newProperty, dimensions: { ...newProperty.dimensions, plotArea: e.target.value } })} className="input" placeholder="Plot Area (sq ft)" min="0" />
                <input type="number" value={newProperty.dimensions.numberOfFloors} onChange={(e) => setNewProperty({ ...newProperty, dimensions: { ...newProperty.dimensions, numberOfFloors: e.target.value } })} className="input" placeholder="Number of Floors" min="1" />
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Property Assessment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="number" value={newProperty.assessment.currentMarketValue} onChange={(e) => setNewProperty({ ...newProperty, assessment: { ...newProperty.assessment, currentMarketValue: e.target.value } })} className="input" placeholder="Current Market Value (₹) *" min="0" required />
                <input type="number" value={newProperty.assessment.annualRentalValue} onChange={(e) => setNewProperty({ ...newProperty, assessment: { ...newProperty.assessment, annualRentalValue: e.target.value } })} className="input" placeholder="Annual Rental Value (₹)" min="0" />
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Usage Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select value={newProperty.usageDetails.currentUse} onChange={(e) => setNewProperty({ ...newProperty, usageDetails: { ...newProperty.usageDetails, currentUse: e.target.value } })} className="input">
                  <option value="self_occupied">Self Occupied</option>
                  <option value="rented">Rented</option>
                  <option value="vacant">Vacant</option>
                  <option value="under_construction">Under Construction</option>
                </select>
                {newProperty.usageDetails.currentUse === 'rented' && (
                  <input type="number" value={newProperty.usageDetails.rentAmount} onChange={(e) => setNewProperty({ ...newProperty, usageDetails: { ...newProperty.usageDetails, rentAmount: e.target.value } })} className="input" placeholder="Monthly Rent (₹)" min="0" />
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Amenities (affects tax calculation)</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.keys(newProperty.amenities).map(amenity => (
                  <label key={amenity} className="flex items-center space-x-2">
                    <input type="checkbox" checked={newProperty.amenities[amenity]} onChange={(e) => setNewProperty({ ...newProperty, amenities: { ...newProperty.amenities, [amenity]: e.target.checked } })} className="rounded text-primary-600" />
                    <span className="text-sm">{amenity.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => setShowAddForm(false)} className="btn bg-gray-500 hover:bg-gray-600 text-white">Cancel</button>
              <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Adding...' : 'Add Property'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-bold mb-4">My Properties</h2>
        {loading && properties.length === 0 ? (
          <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div></div>
        ) : properties.length === 0 ? (
          <div className="text-center py-8 text-gray-500"><p>No properties added yet. Click "Add Property" to get started.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((property) => (
              <div key={property._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{property.propertyDetails?.name || 'Property'}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 capitalize">{property.propertyType} - {property.propertySubType?.replace('_', ' ')}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${property.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{property.verified ? 'Verified' : 'Pending'}</span>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>📍 {property.propertyDetails?.address?.city}, {property.propertyDetails?.address?.state}</p>
                  <p>📏 {property.dimensions?.builtUpArea} sq ft</p>
                  <p>💰 Market Value: {formatCurrency(property.assessment?.currentMarketValue)}</p>
                  <p className="font-semibold text-red-600">Tax Due: {formatCurrency(property.taxDetails?.pendingAmount || 0)}</p>
                  {property.taxDetails?.dueDate && <p className="text-xs">Due: {formatDate(property.taxDetails.dueDate)}</p>}
                </div>
                <div className="flex flex-col space-y-2">
                  <button onClick={() => handleCalculateTax(property._id)} className="btn btn-primary w-full text-sm">Calculate Tax</button>
                  {property.taxDetails?.pendingAmount > 0 && (
                    <button onClick={() => { setSelectedProperty(property._id); handleCalculateTax(property._id); }} className="btn bg-green-600 hover:bg-green-700 text-white w-full text-sm">Pay Tax</button>
                  )}
                  <button onClick={() => handleDeleteProperty(property._id)} className="btn bg-red-600 hover:bg-red-700 text-white w-full text-sm">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {taxCalculation && (
        <div ref={resultRef} className="card bg-gradient-to-br from-blue-50 to-indigo-50">
          <h2 className="text-xl font-bold mb-4">Tax Calculation Result</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-600">Property Type:</span><span className="font-medium capitalize">{taxCalculation.propertyType}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Market Value:</span><span className="font-medium">{formatCurrency(taxCalculation.marketValue)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Built-up Area:</span><span className="font-medium">{taxCalculation.builtUpArea} sq ft</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Base Tax Rate:</span><span className="font-medium">{taxCalculation.baseRate}%</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Usage Type:</span><span className="font-medium capitalize">{taxCalculation.usageType?.replace('_', ' ')}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Amenities Count:</span><span className="font-medium">{taxCalculation.amenitiesCount}</span></div>
            </div>
            <div className="flex flex-col justify-center items-center bg-white rounded-lg p-6">
              <p className="text-sm text-gray-600 mb-2">Annual Property Tax</p>
              <p className="text-4xl font-bold text-primary-600">{formatCurrency(taxCalculation.annualTax)}</p>
              {taxCalculation.pendingAmount > 0 && (
                <>
                  <p className="text-sm text-gray-600 mt-4 mb-1">Pending Amount</p>
                  <p className="text-2xl font-semibold text-red-600">{formatCurrency(taxCalculation.pendingAmount)}</p>
                </>
              )}
              <p className="text-xs text-gray-500 mt-4">Due Date: {formatDate(taxCalculation.dueDate)}</p>
              <button onClick={handlePayTax} disabled={loading} className="btn btn-primary w-full mt-6">{loading ? 'Processing...' : 'Pay Now'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxCalculator;
