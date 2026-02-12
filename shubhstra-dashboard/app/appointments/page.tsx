'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';

interface Patient {
  id: string;
  name: string | null;
  phone_number: string;
}

interface Appointment {
  id: string;
  patient_id: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes: string | null;
  created_at: string;
  payment_status: 'pending' | 'paid' | 'partial';
  balance_amount: number;
  patients: Patient;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
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

      // Fetch appointments FILTERED BY DOCTOR_ID
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients (
            id,
            name,
            phone_number
          )
        `)
        .eq('doctor_id', doctorData.id)
        .order('appointment_time', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      // Get current user and doctor_id for security
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: doctorData } = await supabase
        .from('doctors')
        .select('id')
        .eq('email', user.email)
        .single();

      if (!doctorData) return;

      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId)
        .eq('doctor_id', doctorData.id); // Security: only update own appointments

      if (error) throw error;

      alert('Appointment status updated!');
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment');
    }
  };

  const handleOpenPaymentModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setPaymentAmount(appointment.balance_amount?.toString() || '0');
    setShowPaymentModal(true);
  };

  const handleUpdatePayment = async () => {
    if (!selectedAppointment) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount < 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      // Get current user and doctor_id for security
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: doctorData } = await supabase
        .from('doctors')
        .select('id')
        .eq('email', user.email)
        .single();

      if (!doctorData) return;

      const newBalance = selectedAppointment.balance_amount - amount;
      const newPaymentStatus = newBalance <= 0 ? 'paid' : 'partial';

      const { error } = await supabase
        .from('appointments')
        .update({
          payment_status: newPaymentStatus,
          balance_amount: Math.max(0, newBalance),
        })
        .eq('id', selectedAppointment.id)
        .eq('doctor_id', doctorData.id); // Security: only update own appointments

      if (error) throw error;

      alert('Payment updated successfully!');
      setShowPaymentModal(false);
      setSelectedAppointment(null);
      setPaymentAmount('');
      fetchAppointments();
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Failed to update payment');
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no_show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Appointments</h2>
          <p className="text-gray-600">Manage all patient appointments</p>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex gap-2">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Appointment Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                        No appointments found
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.patients?.name || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {appointment.patients?.phone_number || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(appointment.appointment_time)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              appointment.status
                            )}`}
                          >
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(
                              appointment.payment_status || 'pending'
                            )}`}
                          >
                            {(appointment.payment_status || 'pending').charAt(0).toUpperCase() + 
                             (appointment.payment_status || 'pending').slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(appointment.balance_amount || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {appointment.notes || 'No notes'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-y-2">
                          {appointment.status === 'pending' && (
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-colors block w-full"
                            >
                              Confirm
                            </button>
                          )}
                          {appointment.status === 'confirmed' && (
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md transition-colors block w-full"
                            >
                              Complete
                            </button>
                          )}
                          {appointment.payment_status !== 'paid' && (
                            <button
                              onClick={() => handleOpenPaymentModal(appointment)}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md transition-colors block w-full"
                            >
                              Update Payment
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Update Payment</h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Patient: <span className="font-semibold">{selectedAppointment.patients?.name || 'Unknown'}</span>
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Current Balance: <span className="font-semibold text-red-600">
                    {formatCurrency(selectedAppointment.balance_amount || 0)}
                  </span>
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount Paid (₹)
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-gray-500 mt-1">
                  New Balance: {formatCurrency(Math.max(0, (selectedAppointment.balance_amount || 0) - parseFloat(paymentAmount || '0')))}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedAppointment(null);
                    setPaymentAmount('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePayment}
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  Update Payment
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
