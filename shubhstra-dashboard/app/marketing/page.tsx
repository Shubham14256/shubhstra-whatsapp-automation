'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';
import { Instagram, Youtube, Globe, Send, Trophy } from 'lucide-react';

interface SocialLinks {
  instagram?: string;
  youtube?: string;
  website?: string;
  facebook?: string;
}

interface TopReferrer {
  id: string;
  name: string | null;
  phone_number: string;
  referral_count: number;
  referral_code: string | null;
}

export default function MarketingPage() {
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    instagram: '',
    youtube: '',
    website: '',
    facebook: '',
  });
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingRecall, setSendingRecall] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Get current user and doctor_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        return;
      }

      const { data: doctorData } = await supabase
        .from('doctors')
        .select('id, social_links')
        .eq('email', user.email)
        .single();

      if (!doctorData) {
        console.error('Doctor not found for user email:', user.email);
        return;
      }

      const currentDoctorId = doctorData.id;

      // Set social links
      if (doctorData.social_links) {
        setSocialLinks(doctorData.social_links);
      }

      // Fetch top referrers - FILTERED BY DOCTOR_ID
      const { data: referrersData, error: referrersError } = await supabase
        .from('patients')
        .select('id, name, phone_number, referral_count, referral_code')
        .eq('doctor_id', currentDoctorId)
        .gt('referral_count', 0)
        .order('referral_count', { ascending: false })
        .limit(10);

      if (referrersError) throw referrersError;

      setTopReferrers(referrersData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSocialLinks = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      // Get current user and doctor_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('id')
        .eq('email', user.email)
        .single();

      if (doctorError) throw doctorError;

      const { error } = await supabase
        .from('doctors')
        .update({ social_links: socialLinks })
        .eq('id', doctorData.id);

      if (error) throw error;

      alert('Social links updated successfully!');
    } catch (error) {
      console.error('Error saving social links:', error);
      alert('Failed to save social links');
    } finally {
      setSaving(false);
    }
  };

  const handleSendRecallCampaign = async () => {
    if (!confirm('Send recall messages to all eligible patients?')) {
      return;
    }

    try {
      setSendingRecall(true);

      // Call the backend API to trigger recall campaign
      const response = await fetch('http://localhost:3000/api/trigger-recall', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to trigger recall campaign');
      }

      alert('Recall campaign triggered successfully! Messages will be sent shortly.');
    } catch (error) {
      console.error('Error triggering recall:', error);
      alert('Failed to trigger recall campaign');
    } finally {
      setSendingRecall(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Marketing Suite</h2>
          <p className="text-gray-600">Manage social media, referrals, and campaigns</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Social Media Links Section */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <Globe className="w-6 h-6 text-primary-600" />
                <span>Social Media Links</span>
              </h3>

              <form onSubmit={handleSaveSocialLinks}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Instagram */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                      <Instagram className="w-4 h-4 text-pink-600" />
                      <span>Instagram</span>
                    </label>
                    <input
                      type="url"
                      value={socialLinks.instagram || ''}
                      onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://instagram.com/yourprofile"
                    />
                  </div>

                  {/* YouTube */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                      <Youtube className="w-4 h-4 text-red-600" />
                      <span>YouTube</span>
                    </label>
                    <input
                      type="url"
                      value={socialLinks.youtube || ''}
                      onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://youtube.com/@yourchannel"
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span>Website</span>
                    </label>
                    <input
                      type="url"
                      value={socialLinks.website || ''}
                      onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  {/* Facebook */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-blue-700" />
                      <span>Facebook</span>
                    </label>
                    <input
                      type="url"
                      value={socialLinks.facebook || ''}
                      onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Social Links'}
                  </button>
                </div>
              </form>
            </div>

            {/* Top Referrers Section */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <Trophy className="w-6 h-6 text-yellow-600" />
                <span>Top Referrers</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Referral Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Referrals
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topReferrers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          No referrals yet
                        </td>
                      </tr>
                    ) : (
                      topReferrers.map((referrer, index) => (
                        <tr key={referrer.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {index === 0 && <span className="text-2xl">🥇</span>}
                              {index === 1 && <span className="text-2xl">🥈</span>}
                              {index === 2 && <span className="text-2xl">🥉</span>}
                              {index > 2 && <span className="text-gray-600 font-medium">#{index + 1}</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {referrer.name || 'Unknown'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{referrer.phone_number}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-mono">
                              {referrer.referral_code || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-lg font-bold text-primary-600">
                              {referrer.referral_count}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recall Campaign Section */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <Send className="w-6 h-6 text-primary-600" />
                <span>Patient Recall Campaign</span>
              </h3>
              <p className="text-gray-600 mb-6">
                Send recall messages to patients who haven't visited in the last 6 months
              </p>
              <button
                onClick={handleSendRecallCampaign}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
                disabled={sendingRecall}
              >
                <Send className="w-5 h-5" />
                <span>{sendingRecall ? 'Sending...' : 'Send Recall Campaign'}</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
