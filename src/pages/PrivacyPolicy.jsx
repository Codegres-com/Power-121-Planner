import React from 'react';
import { Shield } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Shield size={32} className="text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
      </div>
      
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 prose prose-blue max-w-none">
        <p className="text-gray-600 mb-6">Last Updated: {new Date().toLocaleDateString()}</p>

        <h3>1. Introduction</h3>
        <p>
          Welcome to the 1:1 Round Robin Scheduler ("we," "our," or "us"). We are committed to protecting your privacy. 
          This Privacy Policy explains how we handle your information when you use our web application.
        </p>

        <h3>2. Data We Collect</h3>
        <p>
          <strong>We do not store your data on our servers.</strong> This application is a client-side application running 
          directly in your browser. All data processing happens locally on your device.
        </p>
        <ul>
          <li><strong>Participant Data:</strong> Names and email addresses you input are processed in your browser memory solely for the purpose of generating a schedule.</li>
          <li><strong>Google Account Information:</strong> If you choose to sign in with Google, we receive an authentication token and basic profile information (email address) to facilitate Google Calendar integration.</li>
        </ul>

        <h3>3. How We Use Your Data</h3>
        <p>
          We use the data you provide strictly to:
        </p>
        <ul>
          <li>Generate meeting schedules based on your inputs.</li>
          <li>Create events on your Google Calendar (only when explicitly authorized by you).</li>
        </ul>
        <p>
          We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties.
        </p>

        <h3>4. Google User Data</h3>
        <p>
          Our application's use of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a>, including the Limited Use requirements.
        </p>

        <h3>5. Third-Party Services</h3>
        <p>
          We use Google Identity Services for authentication and the Google Calendar API for event creation. 
          Please review <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google's Privacy Policy</a> to understand how they handle your data.
        </p>

        <h3>6. Changes to This Policy</h3>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
        </p>

        <h3>7. Contact Us</h3>
        <p>
          If you have any questions about this Privacy Policy, please contact us.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
