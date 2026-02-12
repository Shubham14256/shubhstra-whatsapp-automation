'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';
import { Building2, Clock, MessageSquare, Calendar, IndianRupee } from 'lucide-react';

interface ClinicConfig {
  id: string;
  doctor_id: string;
  opening_time: string;
  closing_time: string;
  welcome_message: string;
  holidays: string[];
  created_at: string;
  updated_at: string;
}

interface DoctorInfo {
  id: string;
  clinic_name: string | null;
  clinic_address: string | null;
  consultation_fee: number | null;
}

export default function SettingsPage() {
  const [config, setConfig] = useState<ClinicConfig | null>(null);
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    // Clinic Identity
    clinic_name: '',
    clinic_address: '',
    consultation_fee: '',
    welcome_message: '',  // Moved to doctors table
    // Configuration
    opening_time: '09:00',
    closing_time: '18:00',
    holidays: '',
    // Links
    calendly_link: '',
    review_link: '',
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);

      // Get current user and doctor_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        return;
      }

      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('id, clinic_name, clinic_address, consultation_fee, welcome_message')
        .eq('email', user.email)
        .single();

      if (doctorError) {
        console.error('Error fetching doctor:', doctorError);
        return;
      }

      if (!doctorData) {
        console.error('Doctor not found for user email:', user.email);
        return;
      }

      setDoctorInfo(doctorData);

      // Fetch clinic config FILTERED BY DOCTOR_ID
      const { data: configData, error: configError } = await supabase
        .from('clinic_config')
        .select('*')
        .eq('doctor_id', doctorData.id)
        .limit(1)
        .single();

      if (configError && configError.code !== 'PGRST116') {
        throw configError;
      }

      if (configData) {
        setConfig(configData);
      }

      // Set form data with both doctor info and config
      setFormData({
        // Clinic Identity from doctors table
        clinic_name: doctorData.clinic_name || '',
        clinic_address: doctorData.clinic_address || '',
        consultation_fee: doctorData.consultation_fee?.toString() || '',
        welcome_message: doctorData.welcome_message || '',  // From doctors table
        // Configuration from clinic_config table
        opening_time: configData?.opening_time || '09:00',
        closing_time: configData?.closing_time || '18:00',
        holidays: configData?.holidays ? configData.holidays.join(', ') : '',
        // Links from clinic_config table
        calendly_link: configData?.calendly_link || '',
        review_link: configData?.review_link || '',
      });
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      console.log('🔄 Starting save process...');

      // Get current user and doctor_id
      console.log('1️⃣ Getting user...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('❌ User error:', userError);
        throw new Error(`Auth error: ${userError.message}`);
      }
      
      if (!user) {
        console.error('❌ No user found');
        throw new Error('No authenticated user found');
      }
      
      console.log('✅ User found:', user.email);

      console.log('2️⃣ Getting doctor data...');
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('id')
        .eq('email', user.email)
        .single();

      if (doctorError) {
        console.error('❌ Doctor error:', doctorError);
        throw new Error(`Doctor fetch error: ${doctorError.message}`);
      }
      
      if (!doctorData) {
        console.error('❌ No doctor found for email:', user.email);
        throw new Error('Doctor not found');
      }
      
      console.log('✅ Doctor found:', doctorData.id);

      // 1. Update doctor info (clinic identity + welcome message)
      console.log('3️⃣ Updating doctor info...');
      const doctorUpdateData = {
        clinic_name: formData.clinic_name || null,
        clinic_address: formData.clinic_address || null,
        consultation_fee: formData.consultation_fee ? parseFloat(formData.consultation_fee) : null,
        welcome_message: formData.welcome_message || null,  // Save to doctors table
      };
      
      console.log('Doctor update data:', doctorUpdateData);

      const { error: doctorUpdateError } = await supabase
        .from('doctors')
        .update(doctorUpdateData)
        .eq('id', doctorData.id);

      if (doctorUpdateError) {
        console.error('❌ Doctor update error:', doctorUpdateError);
        throw new Error(`Doctor update failed: ${doctorUpdateError.message}`);
      }
      
      console.log('✅ Doctor info updated');

      // 2. Update or insert clinic config
      console.log('4️⃣ Updating clinic config...');
      const holidaysArray = formData.holidays
        .split(',')
        .map((h) => h.trim())
        .filter((h) => h.length > 0);

      const configData = {
        opening_time: formData.opening_time,
        closing_time: formData.closing_time,
        holidays: holidaysArray,
        calendly_link: formData.calendly_link || null,
        review_link: formData.review_link || null,
        // welcome_message removed - now in doctors table
      };
      
      console.log('Config data:', configData);
      console.log('Existing config:', config);

      if (config) {
        // Update existing config
        console.log('Updating existing config...');
        const { error } = await supabase
          .from('clinic_config')
          .update(configData)
          .eq('id', config.id)
          .eq('doctor_id', doctorData.id);

        if (error) {
          console.error('❌ Config update error:', error);
          throw new Error(`Config update failed: ${error.message}`);
        }
        console.log('✅ Config updated');
      } else {
        // Insert new config
        console.log('Inserting new config...');
        const { error } = await supabase
          .from('clinic_config')
          .insert([
            {
              ...configData,
              doctor_id: doctorData.id,
            },
          ]);

        if (error) {
          console.error('❌ Config insert error:', error);
          throw new Error(`Config insert failed: ${error.message}`);
        }
        console.log('✅ Config inserted');
      }

      console.log('✅ All updates successful!');
      alert('Settings saved successfully!');
      fetchConfig();
    } catch (error: any) {
      console.error('❌ SAVE ERROR:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error?.message);
      console.error('Error details:', error?.details);
      console.error('Error hint:', error?.hint);
      console.error('Error code:', error?.code);
      console.error('Full error:', JSON.stringify(error, null, 2));
      alert(`Failed to save settings: ${error?.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Clinic Settings</h2>
          <p className="text-gray-600">Manage your clinic configuration and preferences</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Clinic Identity Section */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200">
                <Building2 className="w-6 h-6 text-primary-600" />
                <h3 className="text-xl font-bold text-gray-800">Clinic Identity</h3>
              </div>

              <div className="space-y-6">
                {/* Clinic Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clinic Name *
                  </label>
                  <input
                    type="text"
                    value={formData.clinic_name}
                    onChange={(e) => setFormData({ ...formData, clinic_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Shubhstra Health Clinic"
                    required
                  />
                </div>

                {/* Clinic Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clinic Address *
                  </label>
                  <textarea
                    value={formData.clinic_address}
                    onChange={(e) => setFormData({ ...formData, clinic_address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter complete clinic address with city and pincode"
                    required
                  />
                </div>

                {/* Consultation Fee */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consultation Fee *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <IndianRupee className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={formData.consultation_fee}
                      onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
                      className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="500"
                      min="0"
                      step="1"
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Default consultation fee for appointments
                  </p>
                </div>

                {/* Welcome Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Welcome Message *</span>
                  </label>
                  <textarea
                    value={formData.welcome_message}
                    onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={4}
                    placeholder="Welcome to our clinic! How can we help you today?"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This message will be sent to patients when they first contact the bot
                  </p>
                </div>
              </div>
            </div>

            {/* Configuration Section */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200">
                <Clock className="w-6 h-6 text-primary-600" />
                <h3 className="text-xl font-bold text-gray-800">Clinic Configuration</h3>
              </div>

              <div className="space-y-6">
                {/* Opening & Closing Time - Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Opening Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opening Time *
                    </label>
                    <input
                      type="time"
                      value={formData.opening_time}
                      onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Closing Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Closing Time *
                    </label>
                    <input
                      type="time"
                      value={formData.closing_time}
                      onChange={(e) => setFormData({ ...formData, closing_time: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Holidays */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Holidays (comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.holidays}
                    onChange={(e) => setFormData({ ...formData, holidays: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="2024-12-25, 2024-01-01, Sunday"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter dates (YYYY-MM-DD) or day names separated by commas
                  </p>
                </div>
              </div>
            </div>

            {/* Appointment & Review Links Section */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <h3 className="text-xl font-bold text-gray-800">Appointment & Review Links</h3>
              </div>

              <div className="space-y-6">
                {/* Calendly Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calendly Appointment Link
                  </label>
                  <input
                    type="url"
                    value={formData.calendly_link}
                    onChange={(e) => setFormData({ ...formData, calendly_link: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://calendly.com/your-clinic/appointment"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Patients will receive this link when they request to book an appointment
                  </p>
                </div>

                {/* Review Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Review / Feedback Link
                  </label>
                  <input
                    type="url"
                    value={formData.review_link}
                    onChange={(e) => setFormData({ ...formData, review_link: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://g.page/r/YOUR_GOOGLE_PLACE_ID/review"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Patients will receive this link when they give 5-star rating or request to leave feedback
                  </p>
                </div>

                {/* Info Box */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-semibold text-green-900 mb-1">How to Get These Links</h4>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>• <strong>Calendly:</strong> Sign up at calendly.com and copy your booking page URL</li>
                        <li>• <strong>Google Review:</strong> Search your business on Google Maps → Share → Copy review link</li>
                        <li>• If links are empty, bot will ask patients to contact clinic directly</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2 shadow-md"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Save All Settings</span>
                  </>
                )}
              </button>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">Settings Guide</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Clinic identity and welcome message are displayed to patients</li>
                    <li>• Consultation fee is used as default for new appointments</li>
                    <li>• Opening/closing times control appointment scheduling</li>
                    <li>• Holidays prevent appointment booking on specified dates</li>
                    <li>• Calendly and Review links are sent automatically by the bot</li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
