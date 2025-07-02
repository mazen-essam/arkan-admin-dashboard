import React, { useState, useEffect } from 'react';
import { useApi } from '../../context/context';
import { User, Mail, Phone } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'react-hot-toast';

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  image?: string | File;
}

const ProfileSettings: React.FC = () => {
  const { api , token } = useApi();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications'>('profile');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: true,
  });

  // Fetch profile data on component mount
 
useEffect(() => {
  if (!token) return; // ✅ Wait for token to be available

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.users.getProfile();
      if (response.data) {
        setProfileData({
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          image: response.data.image_url || '',
        });
        if (response.data.image_url) {
          setImagePreview(response.data.image_url);
        }
      }
    } catch (error) {
      toast.error('Failed to load profile data');
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, []); // ✅ Now waits for token

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">View your account information and preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'notifications' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Notifications
          </button>
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="space-y-6">
            {/* Profile Image */}
            <div className="flex items-center space-x-6">
              <div className="shrink-0">
                {imagePreview ? (
                  <img
                    className="h-16 w-16 object-cover rounded-full"
                    src={imagePreview}
                    alt="Current profile"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="text-gray-400" size={24} />
                  </div>
                )}
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <div className="flex items-center space-x-2 pl-1">
                  <User className="h-5 w-5 text-gray-400" />
                  <span>{profileData.first_name}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <div className="flex items-center space-x-2 pl-1">
                  <User className="h-5 w-5 text-gray-400" />
                  <span>{profileData.last_name}</span>
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="flex items-center space-x-2 pl-1">
                <Mail className="h-5 w-5 text-gray-400" />
                <span>{profileData.email}</span>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="flex items-center space-x-2 pl-1">
                <Phone className="h-5 w-5 text-gray-400" />
                <span>{profileData.phone}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Email Notifications</label>
                <p className="text-xs text-gray-500">Receive important updates via email</p>
              </div>
              <Switch checked={notificationSettings.emailNotifications} disabled />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Push Notifications</label>
                <p className="text-xs text-gray-500">Get browser notifications</p>
              </div>
              <Switch checked={notificationSettings.pushNotifications} disabled />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">SMS Notifications</label>
                <p className="text-xs text-gray-500">Receive text message alerts</p>
              </div>
              <Switch checked={notificationSettings.smsNotifications} disabled />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;