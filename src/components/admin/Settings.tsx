
import React, { useState } from 'react';
import { Save, Bell, Shield, Globe, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    siteName: 'My Admin Panel',
    siteDescription: 'A powerful admin dashboard',
    emailNotifications: true,
    pushNotifications: false,
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    twoFactorAuth: false,
  });

  const handleToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleInputChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your application settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center mb-4">
            <Globe className="text-blue-600 mr-2" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site Name
              </label>
              <Input
                value={settings.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                placeholder="Enter site name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site Description
              </label>
              <Input
                value={settings.siteDescription}
                onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                placeholder="Enter site description"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Maintenance Mode</label>
                <p className="text-xs text-gray-500">Temporarily disable site access</p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={() => handleToggle('maintenanceMode')}
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center mb-4">
            <Bell className="text-blue-600 mr-2" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Email Notifications</label>
                <p className="text-xs text-gray-500">Receive notifications via email</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={() => handleToggle('emailNotifications')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Push Notifications</label>
                <p className="text-xs text-gray-500">Receive browser push notifications</p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={() => handleToggle('pushNotifications')}
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center mb-4">
            <Shield className="text-blue-600 mr-2" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Security</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Allow Registration</label>
                <p className="text-xs text-gray-500">Allow new users to register</p>
              </div>
              <Switch
                checked={settings.allowRegistration}
                onCheckedChange={() => handleToggle('allowRegistration')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Email Verification</label>
                <p className="text-xs text-gray-500">Require email verification for new accounts</p>
              </div>
              <Switch
                checked={settings.requireEmailVerification}
                onCheckedChange={() => handleToggle('requireEmailVerification')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Two-Factor Authentication</label>
                <p className="text-xs text-gray-500">Enable 2FA for enhanced security</p>
              </div>
              <Switch
                checked={settings.twoFactorAuth}
                onCheckedChange={() => handleToggle('twoFactorAuth')}
              />
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center mb-4">
            <Palette className="text-blue-600 mr-2" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Appearance</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme Color
              </label>
              <div className="flex gap-2">
                {['blue', 'green', 'purple', 'red'].map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full bg-${color}-600 hover:scale-110 transition-transform`}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo URL
              </label>
              <Input placeholder="https://example.com/logo.png" />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Save size={20} className="mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default Settings;
