'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Sidebar from '@/components/Sidebar';
import { Search, FileText, Download, Send } from 'lucide-react';

interface Patient {
  id: string;
  name: string | null;
  phone_number: string;
  email: string | null;
}

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searching, setSearching] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      alert('Please enter a patient name or phone number');
      return;
    }

    try {
      setSearching(true);

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

      // Search patients FILTERED BY DOCTOR_ID
      const { data, error } = await supabase
        .from('patients')
        .select('id, name, phone_number, email')
        .eq('doctor_id', doctorData.id)
        .or(`name.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;

      setPatients(data || []);
      
      if (data?.length === 0) {
        alert('No patients found matching your search');
      }
    } catch (error) {
      console.error('Error searching patients:', error);
      alert('Failed to search patients');
    } finally {
      setSearching(false);
    }
  };

  const handleGenerateReport = async (patient: Patient) => {
    if (!confirm(`Generate and send PDF report for ${patient.name || patient.phone_number}?`)) {
      return;
    }

    try {
      setGenerating(patient.id);

      // Call backend API to generate and send PDF
      const response = await fetch('http://localhost:3000/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: patient.id,
          patientName: patient.name,
          phoneNumber: patient.phone_number,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const result = await response.json();
      alert(`Report generated and sent successfully to ${patient.phone_number}!`);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Make sure the backend is running.');
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <main className="md:ml-64 p-4 md:p-8 pt-20 md:pt-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Patient Reports</h2>
          <p className="text-sm md:text-base text-gray-600">Generate and send PDF reports to patients</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-8 mb-6 md:mb-8">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6 flex items-center space-x-2">
            <Search className="w-5 h-5 md:w-6 md:h-6 text-primary-600" />
            <span>Search Patient</span>
          </h3>

          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter patient name or phone number..."
            />
            <button
              onClick={handleSearch}
              className="w-full md:w-auto bg-primary-600 hover:bg-primary-700 text-white px-6 md:px-8 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 text-sm md:text-base"
              disabled={searching}
            >
              <Search className="w-4 h-4 md:w-5 md:h-5" />
              <span>{searching ? 'Searching...' : 'Search'}</span>
            </button>
          </div>
        </div>

        {/* Results Section */}
        {patients.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
              <h3 className="text-base md:text-lg font-semibold text-gray-800">Search Results</h3>
            </div>

            <div className="overflow-x-auto -mx-4 md:mx-0">
              <div className="inline-block min-w-full align-middle px-4 md:px-0">
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
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {patient.name || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{patient.phone_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{patient.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleGenerateReport(patient)}
                          className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-3 md:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 text-sm"
                          disabled={generating === patient.id}
                        >
                          {generating === patient.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span className="hidden md:inline">Generate & Send PDF</span>
                              <span className="md:hidden">Send PDF</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 md:mt-8 p-4 md:p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-2">How it works</h4>
              <ul className="text-xs md:text-sm text-blue-800 space-y-1">
                <li>• Search for a patient by name or phone number</li>
                <li>• Click "Generate & Send PDF" to create a report</li>
                <li>• The report includes patient info and last 5 appointments</li>
                <li>• PDF is automatically sent to the patient via WhatsApp</li>
                <li>• The file is deleted from the server after sending</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
