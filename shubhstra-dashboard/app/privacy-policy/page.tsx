export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mb-8">Last Updated: February 13, 2026</p>

        <div className="space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to Shubhstra WhatsApp Automation Platform. We are committed to protecting your privacy 
              and ensuring the security of your personal information. This Privacy Policy explains how we 
              collect, use, disclose, and safeguard your information when you interact with our WhatsApp bot 
              and use our healthcare services.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
            <p className="text-gray-700 mb-4">
              When you interact with our WhatsApp bot, we collect the following information:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li><strong>Contact Information:</strong> Phone number, name (if provided)</li>
              <li><strong>Communication Data:</strong> Messages sent to and received from the bot</li>
              <li><strong>Appointment Information:</strong> Appointment dates, times, and preferences</li>
              <li><strong>Health Information:</strong> Symptoms, medical queries, and consultation details (only what you share)</li>
              <li><strong>Payment Information:</strong> Payment status and transaction details (we do not store credit card numbers)</li>
              <li><strong>Usage Data:</strong> Interaction patterns, response times, and service usage statistics</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li><strong>Service Delivery:</strong> To respond to your queries and provide healthcare information</li>
              <li><strong>Appointment Management:</strong> To schedule, confirm, and manage your appointments</li>
              <li><strong>Reminders:</strong> To send appointment reminders and follow-up messages</li>
              <li><strong>Payment Processing:</strong> To process consultation fees and track payment status</li>
              <li><strong>Communication:</strong> To send health tips, clinic updates, and important notifications</li>
              <li><strong>Service Improvement:</strong> To analyze usage patterns and improve our services</li>
              <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
            </ul>
          </section>

          {/* Data Sharing and Disclosure */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Sharing and Disclosure</h2>
            <p className="text-gray-700 mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your 
              information only in the following circumstances:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li><strong>Healthcare Providers:</strong> With your doctor and authorized clinic staff for treatment purposes</li>
              <li><strong>Service Providers:</strong> With trusted third-party service providers (WhatsApp, payment processors) who assist in service delivery</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulations</li>
              <li><strong>Emergency Situations:</strong> To protect your vital interests or those of others in emergency situations</li>
              <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement appropriate technical and organizational security measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>End-to-end encryption for WhatsApp messages</li>
              <li>Secure cloud storage with access controls</li>
              <li>Regular security audits and updates</li>
              <li>Staff training on data protection and confidentiality</li>
              <li>Limited access to personal information on a need-to-know basis</li>
            </ul>
            <p className="text-gray-700 mt-4">
              However, no method of transmission over the internet or electronic storage is 100% secure. 
              While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Retention</h2>
            <p className="text-gray-700">
              We retain your personal information for as long as necessary to fulfill the purposes outlined 
              in this Privacy Policy, unless a longer retention period is required by law. Medical records 
              and consultation data are retained in accordance with healthcare regulations and professional 
              standards (typically 5-7 years). You may request deletion of your data at any time, subject 
              to legal and regulatory requirements.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
            <p className="text-gray-700 mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li><strong>Access:</strong> Request access to your personal data we hold</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal requirements)</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications at any time</li>
              <li><strong>Data Portability:</strong> Request a copy of your data in a structured format</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing where applicable</li>
              <li><strong>Complaint:</strong> Lodge a complaint with relevant data protection authorities</li>
            </ul>
            <p className="text-gray-700 mt-4">
              To exercise any of these rights, please contact us using the information provided below.
            </p>
          </section>

          {/* WhatsApp-Specific Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">WhatsApp-Specific Information</h2>
            <p className="text-gray-700 mb-4">
              Our service uses WhatsApp Business API for communication. Please note:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-700">
              <li>Messages are encrypted end-to-end by WhatsApp</li>
              <li>WhatsApp's own privacy policy applies to the messaging platform</li>
              <li>We do not have access to your WhatsApp profile picture or status</li>
              <li>You can block our number at any time to stop receiving messages</li>
              <li>Message history is stored securely in our systems for service delivery</li>
            </ul>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Children's Privacy</h2>
            <p className="text-gray-700">
              Our services are not directed to individuals under the age of 18. If you are a parent or 
              guardian and believe your child has provided us with personal information, please contact us. 
              For minors, we require parental consent before providing services.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time to reflect changes in our practices or 
              legal requirements. We will notify you of any material changes by posting the new Privacy 
              Policy on this page and updating the "Last Updated" date. We encourage you to review this 
              Privacy Policy periodically.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data 
              practices, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-700 mb-2">
                <strong>Email:</strong> shubhamsolat36@gmail.com
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Phone:</strong> +91 9545816728
              </p>
              <p className="text-gray-700">
                <strong>Address:</strong> India
              </p>
            </div>
          </section>

          {/* Consent */}
          <section className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h2 className="text-2xl font-semibold text-blue-900 mb-4">Your Consent</h2>
            <p className="text-blue-900">
              By using our WhatsApp bot and services, you acknowledge that you have read, understood, and 
              agree to the terms of this Privacy Policy. If you do not agree with this policy, please do 
              not use our services.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            © 2026 Shubhstra WhatsApp Automation Platform. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
