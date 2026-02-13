'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Building2, Phone, Mail, Lock, Key } from 'lucide-react';

export default function AddDoctorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    // Auth credentials
    email: '',
    password: '',
    
    // Doctor info
    name: '',
    phone_number: '',
    clinic_name: '',
    clinic_address: '',
    specialization: '',
    consultation_fee: '',
    
    // WhatsApp credentials
    whatsapp_phone_number_id: '',
    whatsapp_business_account_id: '',
    whatsapp_access_token: '',
    
    // Optional
    welcome_message: 'Welcome! 👋 How can we help you today?',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.email || !formData.password || !formData.name || !formData.phone_number) {
        throw new Error('Please fill in all required fields');
      }

      // Call API route to create user and doctor
      const response = await fetch('/api/admin/create-doctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create doctor');
      }

      setSuccess(`✅ Doctor created successfully! Email: ${formData.email}`);
      
      // Reset form
      setFormData({
        email: '',
        password: '',
        name: '',
        phone_number: '',
        clinic_name: '',
        clinic_address: '',
        specialization: '',
        consultation_fee: '',
        whatsapp_phone_number_id: '',
        whatsapp_business_account_id: '',
        whatsapp_access_token: '',
        welcome_message: 'Welcome! 👋 How can we help you today?',
      });

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err: any) {
      console.error('Error creating doctor:', err);
      setError(err.message || 'Failed to create doctor');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Doctor</h1>
          <p className="text-gray-600">Create a new doctor account for the platform</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-green-900">{success}</p>
                <button
                  onClick={() => router.push('/')}
                  className="mt-2 text-sm text-green-700 underline hover:text-green-800"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-red-900">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 sm:p-8 space-y-6">
          
          {/* Authentication Section */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Lock className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Authentication Credentials</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="doctor@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Minimum 6 characters"
                    minLength={6}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Doctor will use this to login to dashboard</p>
              </div>
            </div>
          </div>

          {/* Doctor Information Section */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Building2 className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Doctor Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor's Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Dr. John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (WhatsApp Business) *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="919876543210"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Format: Country code + number (no spaces or +)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clinic Name
                </label>
                <input
                  type="text"
                  value={formData.clinic_name}
                  onChange={(e) => setFormData({ ...formData, clinic_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Shubhstra Health Clinic"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clinic Address
                </label>
                <textarea
                  value={formData.clinic_address}
                  onChange={(e) => setFormData({ ...formData, clinic_address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={2}
                  placeholder="123 Main Street, City, State, PIN"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="General Physician"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Consultation Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.consultation_fee}
                    onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="500"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Welcome Message
                </label>
                <textarea
                  value={formData.welcome_message}
                  onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  placeholder="Welcome! How can we help you today?"
                />
                <p className="text-xs text-gray-500 mt-1">First message patients receive from the bot</p>
              </div>
            </div>
          </div>

          {/* WhatsApp Credentials Section */}
          <div className="pb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Key className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">WhatsApp Meta Credentials</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number ID
                </label>
                <input
                  type="text"
                  value={formData.whatsapp_phone_number_id}
                  onChange={(e) => setFormData({ ...formData, whatsapp_phone_number_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                  placeholder="974036092461264"
                />
                <p className="text-xs text-gray-500 mt-1">From Meta Developer Console → WhatsApp → API Setup</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Account ID (WABA)
                </label>
                <input
                  type="text"
                  value={formData.whatsapp_business_account_id}
                  onChange={(e) => setFormData({ ...formData, whatsapp_business_account_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                  placeholder="772857265372269"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Access Token (Optional)
                </label>
                <textarea
                  value={formData.whatsapp_access_token}
                  onChange={(e) => setFormData({ ...formData, whatsapp_access_token: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-xs"
                  rows={3}
                  placeholder="EAATpl9Ci1zU..."
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to use master account credentials</p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Important Notes:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Email and password are required for dashboard login</li>
                  <li>Phone number must match WhatsApp Business number</li>
                  <li>WhatsApp credentials are optional (will use master account if empty)</li>
                  <li>Doctor can update settings after first login</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Create Doctor Account</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Back to Dashboard Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
