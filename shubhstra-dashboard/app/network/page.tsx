'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';

interface ExternalDoctor {
  id: string;
  name: string;
  phone_number: string;
  commission_percentage: number;
  total_commission_due: number;
  created_at: string;
  referred_patients_count?: number;
}

export default function NetworkPage() {
  const [doctors, setDoctors] = useState<ExternalDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    commission_percentage: 10,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
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
        .select('id')
        .eq('email', user.email)
        .single();

      if (!doctorData) {
        console.error('Doctor not found for user email:', user.email);
        return;
      }

      const currentDoctorId = doctorData.id;

      // Fetch all external doctors (global for now)
      const { data, error } = await supabase
        .from('external_doctors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch referred patients count for each external doctor - FILTERED BY CURRENT DOCTOR
      const doctorsWithCount = await Promise.all(
        (data || []).map(async (doctor) => {
          const { count } = await supabase
            .from('patients')
            .select('*', { count: 'exact', head: true })
            .eq('referred_by_doctor_id', doctor.id)
            .eq('doctor_id', currentDoctorId); // Only count patients belonging to current doctor

          return {
            ...doctor,
            referred_patients_count: count || 0,
          };
        })
      );

      setDoctors(doctorsWithCount);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      alert('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone_number) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('external_doctors')
        .insert([
          {
            name: formData.name,
            phone_number: formData.phone_number,
            commission_percentage: formData.commission_percentage,
            total_commission_due: 0,
          },
        ]);

      if (error) throw error;

      alert('Doctor added successfully!');
      setShowModal(false);
      setFormData({ name: '', phone_number: '', commission_percentage: 10 });
      fetchDoctors();
    } catch (error) {
      console.error('Error adding doctor:', error);
      alert('Failed to add doctor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkPaid = async (doctorId: string, doctorName: string) => {
    if (!confirm(`Mark all commissions as paid for ${doctorName}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('external_doctors')
        .update({ total_commission_due: 0 })
        .eq('id', doctorId);

      if (error) throw error;

      alert('Commission marked as paid!');
      fetchDoctors();
    } catch (error) {
      console.error('Error marking paid:', error);
      alert('Failed to update commission');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <main className="md:ml-64 p-4 md:p-8 pt-20 md:pt-8">
        {/* Header */}
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Doctor Network</h2>
            <p className="text-sm md:text-base text-gray-600">Manage external doctor referrals and commissions</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="w-full md:w-auto bg-primary-600 hover:bg-primary-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm md:text-base"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New Doctor</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <div className="inline-block min-w-full align-middle px-4 md:px-0">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Referred
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commission %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Due
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {doctors.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No external doctors found. Click "Add New Doctor" to get started!
                      </td>
                    </tr>
                  ) : (
                    doctors.map((doctor) => (
                      <tr key={doctor.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{doctor.phone_number}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-primary-600">
                            {doctor.referred_patients_count || 0} patients
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{doctor.commission_percentage}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(doctor.total_commission_due)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {doctor.total_commission_due > 0 ? (
                            <button
                              onClick={() => handleMarkPaid(doctor.id, doctor.name)}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
                            >
                              Mark Paid
                            </button>
                          ) : (
                            <span className="text-gray-400">No dues</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        )}

        {/* Add Doctor Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 md:p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Add New Doctor</h3>
              
              <form onSubmit={handleAddDoctor}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doctor Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Dr. John Doe"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="919876543210"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commission Percentage
                  </label>
                  <input
                    type="number"
                    value={formData.commission_percentage}
                    onChange={(e) => setFormData({ ...formData, commission_percentage: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    min="0"
                    max="100"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFormData({ name: '', phone_number: '', commission_percentage: 10 });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    disabled={submitting}
                  >
                    {submitting ? 'Adding...' : 'Add Doctor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
