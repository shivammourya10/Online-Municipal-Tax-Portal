import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [taxProfileData, setTaxProfileData] = useState({
    pan: '',
    aadhaar: '',
    category: 'individual',
    residentialStatus: 'resident',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      console.log('Fetching profile from /auth/me...');
      const response = await api.get('/auth/me');
      console.log('Profile API response:', response);
      
      // Handle response - API interceptor already extracts .data
      const userData = response?.data || response;
      console.log('User data:', userData);
      
      // Set profile data with safe defaults
      setProfileData({
        firstName: userData?.profile?.firstName || '',
        lastName: userData?.profile?.lastName || '',
        phone: userData?.profile?.phone || '',
        dateOfBirth: userData?.profile?.dateOfBirth ? 
          new Date(userData.profile.dateOfBirth).toISOString().split('T')[0] : '',
        address: {
          street: userData?.profile?.address?.street || '',
          city: userData?.profile?.address?.city || '',
          state: userData?.profile?.address?.state || '',
          pincode: userData?.profile?.address?.pincode || '',
          country: userData?.profile?.address?.country || 'India',
        },
      });

      // Fetch tax profile if exists
      if (userData?.taxProfile) {
        fetchTaxProfile();
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      const errorMsg = error?.message || 'Failed to load profile';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaxProfile = async () => {
    try {
      const response = await api.get('/tax-profile');
      const taxData = response.data.data;
      setTaxProfileData({
        pan: taxData.pan?.number || '',
        aadhaar: taxData.aadhaar?.number || '',
        category: taxData.category || 'individual',
        residentialStatus: taxData.residentialStatus || 'resident',
      });
    } catch (error) {
      console.error('Tax profile not found');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.put('/auth/profile', profileData);
      console.log('Profile update response:', response);
      toast.success('Profile updated successfully');
      setIsEditing(false);
      // Refresh to get updated data
      await fetchProfile();
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleTaxProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/tax-profile', {
        pan: { number: taxProfileData.pan },
        aadhaar: { number: taxProfileData.aadhaar },
        category: taxProfileData.category,
        residentialStatus: taxProfileData.residentialStatus,
      });
      toast.success('Tax profile updated successfully');
      fetchTaxProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update tax profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profileData.firstName) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-3xl font-bold text-primary-600">
            {(profileData.firstName?.charAt(0) || '?').toUpperCase()}
            {(profileData.lastName?.charAt(0) || '').toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {profileData.firstName || 'User'} {profileData.lastName || ''}
            </h1>
            <p className="text-gray-600">{user?.email || 'No email'}</p>
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
              user?.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            }`}>
              {user?.role?.toUpperCase() || 'USER'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                activeTab === 'personal'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Personal Information
            </button>
            <button
              onClick={() => setActiveTab('tax')}
              className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                activeTab === 'tax'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Tax Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                activeTab === 'security'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Security
            </button>
          </nav>
        </div>

        {/* Personal Information Tab */}
        {activeTab === 'personal' && (
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            {/* Edit Button */}
            <div className="flex justify-end">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="btn btn-primary"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      fetchProfile(); // Reset to original data
                    }}
                    className="btn bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name *</label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  className="input"
                  disabled={!isEditing}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name *</label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="input"
                  disabled={!isEditing}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="input"
                  placeholder="10-digit phone number"
                  pattern="[0-9]{10}"
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                  className="input"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Address</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Street Address</label>
                  <input
                    type="text"
                    value={profileData.address.street}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      address: { ...profileData.address, street: e.target.value }
                    })}
                    className="input"
                    disabled={!isEditing}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input
                      type="text"
                      value={profileData.address.city}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        address: { ...profileData.address, city: e.target.value }
                      })}
                      className="input"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State</label>
                    <input
                      type="text"
                      value={profileData.address.state}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        address: { ...profileData.address, state: e.target.value }
                      })}
                      className="input"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Pincode</label>
                    <input
                      type="text"
                      value={profileData.address.pincode}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        address: { ...profileData.address, pincode: e.target.value }
                      })}
                      className="input"
                      pattern="[0-9]{6}"
                      placeholder="6-digit pincode"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <input
                      type="text"
                      value={profileData.address.country}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        address: { ...profileData.address, country: e.target.value }
                      })}
                      className="input"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Tax Profile Tab */}
        {activeTab === 'tax' && (
          <form onSubmit={handleTaxProfileUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">PAN Number *</label>
                <input
                  type="text"
                  value={taxProfileData.pan}
                  onChange={(e) => setTaxProfileData({ ...taxProfileData, pan: e.target.value.toUpperCase() })}
                  className="input uppercase"
                  placeholder="ABCDE1234F"
                  pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Format: ABCDE1234F</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Aadhaar Number *</label>
                <input
                  type="text"
                  value={taxProfileData.aadhaar}
                  onChange={(e) => setTaxProfileData({ ...taxProfileData, aadhaar: e.target.value })}
                  className="input"
                  placeholder="1234 5678 9012"
                  pattern="[0-9]{12}"
                  maxLength="12"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">12-digit Aadhaar number</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Taxpayer Category *</label>
                <select
                  value={taxProfileData.category}
                  onChange={(e) => setTaxProfileData({ ...taxProfileData, category: e.target.value })}
                  className="input"
                  required
                >
                  <option value="individual">Individual</option>
                  <option value="huf">HUF (Hindu Undivided Family)</option>
                  <option value="company">Company</option>
                  <option value="firm">Firm</option>
                  <option value="llp">LLP</option>
                  <option value="trust">Trust</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Residential Status *</label>
                <select
                  value={taxProfileData.residentialStatus}
                  onChange={(e) => setTaxProfileData({ ...taxProfileData, residentialStatus: e.target.value })}
                  className="input"
                  required
                >
                  <option value="resident">Resident</option>
                  <option value="non_resident">Non-Resident</option>
                  <option value="rnor">Resident but Not Ordinarily Resident (RNOR)</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">📋 Important Information</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Ensure your PAN and Aadhaar are linked</li>
                <li>• PAN is mandatory for filing income tax returns</li>
                <li>• Aadhaar is required for various tax-related services</li>
                <li>• Keep your tax profile updated for seamless filing</li>
              </ul>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Tax Profile'}
            </button>
          </form>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-yellow-900 mb-2">🔐 Password Requirements</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Minimum 6 characters</li>
                <li>• Include uppercase and lowercase letters</li>
                <li>• Include at least one number</li>
                <li>• Avoid common passwords</li>
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Current Password *</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">New Password *</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="input"
                minLength="6"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Confirm New Password *</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="input"
                minLength="6"
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
