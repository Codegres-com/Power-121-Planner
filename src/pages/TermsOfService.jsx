import React from 'react';
import { FileText } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <FileText size={32} className="text-gray-600" />
        <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 prose prose-blue max-w-none">
        <p className="text-gray-600 mb-6">Last Updated: {new Date().toLocaleDateString()}</p>

        <h3>1. Acceptance of Terms</h3>
        <p>
          By accessing and using our web application, you agree to be bound by these Terms of Service.
          If you do not agree to these terms, please do not use our services.
        </p>

        <h3>2. Description of Service</h3>
        <p>
          We provide a web-based tool for generating round-robin and mesh topology meeting schedules.
          The Service allows you to input participants, generate schedules, and integrate with Google Calendar.
        </p>

        <h3>3. User Responsibilities</h3>
        <ul>
          <li>You are responsible for the accuracy of the data (names, emails) you input.</li>
          <li>You agree not to use the Service for any unlawful or unauthorized purpose.</li>
          <li>You are responsible for maintaining the confidentiality of your Google account credentials.</li>
        </ul>

        <h3>4. Intellectual Property</h3>
        <p>
          The Service and its original content, features, and functionality are and will remain the exclusive property of the developers.
        </p>

        <h3>5. Termination</h3>
        <p>
          We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever.
        </p>

        <h3>6. Disclaimer of Warranties</h3>
        <p>
          The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, expressed or implied,
          regarding the reliability, accuracy, or availability of the Service.
        </p>

        <h3>7. Limitation of Liability</h3>
        <p>
          In no event shall we be liable for any indirect, incidental, special, consequential or punitive damages,
          including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
        </p>

        <h3>8. Changes to Terms</h3>
        <p>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
        </p>

        <h3>9. Contact Us</h3>
        <p>
          If you have any questions about these Terms, please contact us.
        </p>
      </div>
    </div>
  );
};

export default TermsOfService;
