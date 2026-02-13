'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';
import { ArrowRight, RotateCcw, Users } from 'lucide-react';

interface QueueItem {
  id: string;
  patient_id: string;
  token_number: number;
  status: 'waiting' | 'current' | 'completed';
  created_at: string;
  patients: {
    name: string | null;
    phone_number: string;
  };
}

export default function QueuePage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentToken, setCurrentToken] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
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

      // Fetch queue FILTERED BY DOCTOR_ID (if column exists)
      const { data, error } = await supabase
        .from('queue')
        .select(`
          *,
          patients (
            name,
            phone_number
          )
        `)
        .eq('doctor_id', doctorData.id)
        .in('status', ['waiting', 'current'])
        .order('token_number', { ascending: true });

      if (error) throw error;

      setQueue(data || []);
      
      // Find current token
      const current = data?.find((item) => item.status === 'current');
      setCurrentToken(current?.token_number || null);
    } catch (error) {
      console.error('Error fetching queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPatient = async () => {
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

      // Mark current as completed
      if (currentToken) {
        await supabase
          .from('queue')
          .update({ status: 'completed' })
          .eq('token_number', currentToken)
          .eq('doctor_id', doctorData.id)
          .eq('status', 'current');
      }

      // Get next waiting patient
      const nextPatient = queue.find((item) => item.status === 'waiting');
      
      if (nextPatient) {
        await supabase
          .from('queue')
          .update({ status: 'current' })
          .eq('id', nextPatient.id)
          .eq('doctor_id', doctorData.id);
      }

      fetchQueue();
    } catch (error) {
      console.error('Error moving to next patient:', error);
      alert('Failed to move to next patient');
    }
  };

  const handleResetQueue = async () => {
    if (!confirm('Are you sure you want to reset the entire queue?')) {
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

      await supabase
        .from('queue')
        .update({ status: 'completed' })
        .eq('doctor_id', doctorData.id)
        .in('status', ['waiting', 'current']);

      fetchQueue();
      alert('Queue reset successfully!');
    } catch (error) {
      console.error('Error resetting queue:', error);
      alert('Failed to reset queue');
    }
  };

  const waitingPatients = queue.filter((item) => item.status === 'waiting');

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <main className="md:ml-64 p-4 md:p-8 pt-20 md:pt-8">
        {/* Header */}
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Queue Management</h2>
            <p className="text-sm md:text-base text-gray-600">Live waiting room display</p>
          </div>
          <div className="flex gap-2 md:gap-3">
            <button
              onClick={handleNextPatient}
              className="flex-1 md:flex-none bg-primary-600 hover:bg-primary-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm md:text-base"
            >
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              <span>Next</span>
            </button>
            <button
              onClick={handleResetQueue}
              className="flex-1 md:flex-none bg-red-600 hover:bg-red-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm md:text-base"
            >
              <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {/* Current Token Display - Big Screen */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-2xl p-6 md:p-12 mb-6 md:mb-8 text-center">
              <div className="text-white">
                <p className="text-lg md:text-2xl font-medium mb-2 md:mb-4 opacity-90">Current Token</p>
                {currentToken ? (
                  <div className="text-6xl md:text-9xl font-bold mb-2 md:mb-4">#{currentToken}</div>
                ) : (
                  <div className="text-4xl md:text-6xl font-bold mb-2 md:mb-4 opacity-75">No Active Token</div>
                )}
                <div className="flex items-center justify-center space-x-2 text-base md:text-xl opacity-90">
                  <Users className="w-5 h-5 md:w-6 md:h-6" />
                  <span>{waitingPatients.length} patients waiting</span>
                </div>
              </div>
            </div>

            {/* Next Patients List */}
            <div className="bg-white rounded-lg shadow-md p-4 md:p-8">
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">Next in Queue</h3>
              
              {waitingPatients.length === 0 ? (
                <div className="text-center py-8 md:py-12 text-gray-500">
                  <Users className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg md:text-xl">No patients in queue</p>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {waitingPatients.slice(0, 5).map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 md:p-6 bg-gray-50 rounded-lg border-l-4 border-primary-500 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3 md:space-x-6">
                        <div className="bg-primary-100 text-primary-700 rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg md:text-2xl font-bold">#{item.token_number}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-base md:text-xl font-semibold text-gray-800 truncate">
                            {item.patients?.name || 'Unknown Patient'}
                          </p>
                          <p className="text-sm md:text-base text-gray-500 truncate">{item.patients?.phone_number}</p>
                        </div>
                      </div>
                      {index === 0 && (
                        <span className="bg-green-100 text-green-800 px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold flex-shrink-0">
                          Next
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
