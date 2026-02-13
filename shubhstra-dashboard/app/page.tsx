'use client';

import { useEffect, useState } from 'react';
import { supabase, type Appointment, type Patient } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';
import QRCode from 'react-qr-code';
import { createClient } from '@/utils/supabase/client';

interface Stats {
  totalPatients: number;
  todayAppointments: number;
  missedCallsRecovered: number;
}

interface AppointmentWithPatient extends Appointment {
  patients: Patient;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalPatients: 0,
    todayAppointments: 0,
    missedCallsRecovered: 5, // Demo value
  });
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorPhone, setDoctorPhone] = useState<string>('');
  const [doctorName, setDoctorName] = useState<string>('');
  const supabase = createClient();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error('No authenticated user found');
        return;
      }

      // Fetch doctor data including ID
      const { data: doctorData } = await supabase
        .from('doctors')
        .select('id, phone_number, name')
        .eq('email', user.email)
        .single();

      if (!doctorData) {
        console.error('Doctor not found for user email:', user.email);
        return;
      }

      const doctorId = doctorData.id;

      // Strip spaces, dashes, and other non-digit characters from phone
      if (doctorData.phone_number) {
        const cleanPhone = doctorData.phone_number.replace(/\D/g, '');
        setDoctorPhone(cleanPhone);
      }
      
      // Set doctor name
      if (doctorData.name) {
        setDoctorName(doctorData.name);
      }

      // Fetch total patients count - FILTERED BY DOCTOR_ID
      const { count: patientsCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', doctorId);

      // Fetch today's appointments count - FILTERED BY DOCTOR_ID
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { count: todayCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('doctor_id', doctorId)
        .gte('appointment_time', today.toISOString())
        .lt('appointment_time', tomorrow.toISOString());

      // Fetch recent appointments with patient details - FILTERED BY DOCTOR_ID
      const { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients (*)
        `)
        .eq('doctor_id', doctorId)
        .order('appointment_time', { ascending: false })
        .limit(10);

      if (error) throw error;

      setStats({
        totalPatients: patientsCount || 0,
        todayAppointments: todayCount || 0,
        missedCallsRecovered: 0, // Feature not yet implemented
      });

      setAppointments(appointmentsData as AppointmentWithPatient[] || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAppointmentDone = async (appointmentId: string) => {
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
        .update({ status: 'completed' })
        .eq('id', appointmentId)
        .eq('doctor_id', doctorData.id); // Security: only update own appointments

      if (error) throw error;

      // Refresh data
      fetchDashboardData();
      alert('Appointment marked as completed!');
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment');
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content - Add padding for mobile header */}
      <main className="md:ml-64 p-4 md:p-8 pt-20 md:pt-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-sm md:text-base text-gray-600">Welcome back! Here's what's happening today.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {/* Stats Cards - Mobile: Stack vertically, Desktop: 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              {/* Total Patients */}
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Patients</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalPatients}</p>
                  </div>
                  <div className="bg-blue-100 rounded-full p-3">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Today's Appointments */}
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats.todayAppointments}</p>
                  </div>
                  <div className="bg-green-100 rounded-full p-3">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Missed Calls Recovered */}
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Missed Calls Recovered</p>
                    <p className="text-3xl font-bold text-gray-400 mt-2">{stats.missedCallsRecovered}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                      Coming Soon
                    </span>
                  </div>
                  <div className="bg-purple-100 rounded-full p-3 opacity-50">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions & QR Code - Mobile: Stack, Desktop: Side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              {/* Quick Actions */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-4 md:p-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2">
                  <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg flex items-center space-x-2 transition-colors whitespace-nowrap text-sm md:text-base">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <span className="hidden sm:inline">Send Health Tip Broadcast</span>
                    <span className="sm:hidden">Broadcast</span>
                  </button>
                </div>
              </div>

              {/* Connect Patients - QR Code */}
              <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg shadow-md p-4 md:p-6 text-white">
                <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Connect Patients</h3>
                <div className="bg-white p-3 md:p-4 rounded-lg mb-3 md:mb-4 flex justify-center">
                  {doctorPhone ? (
                    <QRCode
                      value={`https://wa.me/${doctorPhone}`}
                      size={120}
                      className="w-full max-w-[120px] md:max-w-[160px]"
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      viewBox={`0 0 120 120`}
                    />
                  ) : (
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-200 flex items-center justify-center text-gray-500 text-xs md:text-sm">
                      Loading QR...
                    </div>
                  )}
                </div>
                {doctorPhone && (
                  <div className="text-center mb-2 md:mb-3">
                    <p className="text-xs opacity-75 mb-1">WhatsApp Number</p>
                    <p className="text-xs md:text-sm font-mono font-semibold">
                      +{doctorPhone.slice(0, 2)} {doctorPhone.slice(2, 7)} {doctorPhone.slice(7)}
                    </p>
                  </div>
                )}
                <p className="text-xs md:text-sm text-center">
                  📱 Scan to Chat with {doctorName ? `Dr. ${doctorName}'s` : 'Shubhstra'} Bot
                </p>
              </div>
            </div>

            {/* Recent Appointments Table - Mobile: Horizontal scroll */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
                <h3 className="text-base md:text-lg font-semibold text-gray-800">Recent Appointments</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
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
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          No appointments found. Start by adding patients and scheduling appointments!
                        </td>
                      </tr>
                    ) : (
                      appointments.map((appointment) => (
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
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {appointment.status !== 'completed' && (
                              <button
                                onClick={() => markAppointmentDone(appointment.id)}
                                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-colors"
                              >
                                Mark Done
                              </button>
                            )}
                            {appointment.status === 'completed' && (
                              <span className="text-green-600 font-medium">✓ Completed</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
