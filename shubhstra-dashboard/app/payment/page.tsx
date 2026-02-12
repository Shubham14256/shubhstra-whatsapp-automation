'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, MessageCircle, Clock, CheckCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import QRCode from 'react-qr-code';

export default function PaymentPage() {
  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Real UPI details
  const UPI_ID = 'solatannasaheb56@okicici';
  const UPI_NAME = 'Shubhstra_Tech';
  const AMOUNT = '999';
  const SUPPORT_NUMBER = '919021816728';
  const SUPPORT_DISPLAY = '+91 9021816728';

  // Generate UPI payment string
  const upiString = `upi://pay?pa=${UPI_ID}&pn=${UPI_NAME}&am=${AMOUNT}&cu=INR`;

  useEffect(() => {
    fetchDoctorInfo();
  }, []);

  const fetchDoctorInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: doctorData } = await supabase
          .from('doctors')
          .select('name, subscription_status, plan_expiry_date')
          .eq('email', user.email)
          .single();

        setDoctorInfo(doctorData);
      }
    } catch (error) {
      console.error('Error fetching doctor info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactSupport = () => {
    // WhatsApp link to support with pre-filled message
    const message = encodeURIComponent('Hello, I have made the payment of ₹999 for Shubhstra Tech subscription. Here is the screenshot.');
    window.open(`https://wa.me/${SUPPORT_NUMBER}?text=${message}`, '_blank');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Subscription {doctorInfo?.subscription_status === 'expired' ? 'Expired' : 'Required'}
          </h1>
          <p className="text-gray-600">
            {doctorInfo?.name ? `Hi Dr. ${doctorInfo.name}, ` : ''}
            Your subscription has expired. Please renew to continue using the dashboard.
          </p>
        </div>

        {/* Subscription Info */}
        {doctorInfo?.plan_expiry_date && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
            <Clock className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Plan Expired On</p>
              <p className="text-sm text-red-600 mt-1">{formatDate(doctorInfo.plan_expiry_date)}</p>
            </div>
          </div>
        )}

        {/* Payment Details */}
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Renew Your Subscription</h2>
          
          {/* Price */}
          <div className="text-center mb-6">
            <p className="text-gray-600 text-sm mb-2">Monthly Plan</p>
            <p className="text-5xl font-bold text-primary-600">₹999</p>
            <p className="text-gray-500 text-sm mt-2">per month</p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-sm text-gray-700">Unlimited WhatsApp Automation</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-sm text-gray-700">AI-Powered Patient Management</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-sm text-gray-700">Appointment Reminders & Queue System</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-sm text-gray-700">Marketing Suite & Analytics</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-sm text-gray-700">24/7 Support</span>
            </div>
          </div>

          {/* QR Code - Real UPI Payment */}
          <div className="bg-white rounded-lg p-6 text-center">
            <p className="text-sm font-medium text-gray-700 mb-4">Scan QR Code to Pay</p>
            
            {/* Real QR Code with UPI String */}
            <div className="bg-white p-4 rounded-lg inline-block shadow-sm border-2 border-gray-200">
              <QRCode
                value={upiString}
                size={200}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 200 200`}
              />
            </div>
            
            <p className="text-xs text-gray-500 mt-4 mb-3">
              Scan with PhonePe / GPay / Paytm
            </p>
            
            <div className="bg-gray-50 rounded-lg p-3 mt-4">
              <p className="text-sm text-gray-600 mb-1">Or pay directly to UPI ID:</p>
              <p className="text-base font-mono font-semibold text-primary-600">{UPI_ID}</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">📋 Payment Instructions:</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Open any UPI app (PhonePe, GPay, Paytm, etc.)</li>
            <li>Scan the QR code above or use UPI ID: <span className="font-mono font-semibold">{UPI_ID}</span></li>
            <li>Verify amount is ₹999</li>
            <li>Complete the payment</li>
            <li>Take a screenshot of payment confirmation</li>
            <li>Click "I have Paid" button below</li>
            <li>Send screenshot to our support team on WhatsApp</li>
            <li>Your account will be activated within 1 hour</li>
          </ol>
        </div>

        {/* Action Button */}
        <button
          onClick={handleContactSupport}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-3 shadow-lg"
        >
          <MessageCircle className="w-6 h-6" />
          <span>I have Paid - Send Screenshot</span>
        </button>

        {/* Trust Indicators */}
        <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Instant Activation</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>24/7 Support</span>
          </div>
        </div>

        {/* Support Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact us at{' '}
            <a href={`tel:${SUPPORT_DISPLAY}`} className="text-primary-600 font-semibold hover:underline">
              {SUPPORT_DISPLAY}
            </a>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Available: Mon-Sat, 9 AM - 6 PM
          </p>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
