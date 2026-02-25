import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Home from './pages/Home';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AuthButton from './components/AuthButton';
import {
  loadGoogleScripts,
  initializeGapiClient,
  initializeGoogleAuth,
  signIn,
  signOut
} from './utils/googleApi';
import logo from './assets/logo.png';

function Layout({ children, isSignedIn, userProfile, onSignIn, onSignOut }) {
    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
          {/* Header */}
          <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-3xl mx-auto px-4 py-3 md:py-4 flex flex-wrap justify-between items-center gap-4">
              <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <img src={logo} alt="Logo" className="w-10 h-10 md:w-12 md:h-12 object-contain" />
                <div className="flex flex-col">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">Power121</h1>
                    <div className="flex flex-col leading-tight">
                        <span className="text-xs md:text-sm font-semibold text-blue-600">1:1 Scheduler</span>
                        <span className="text-[10px] md:text-xs text-gray-500 font-medium hidden sm:inline-block">Round Robin & Mesh Meetings</span>
                    </div>
                </div>
              </Link>

              <div className="flex items-center gap-4">
                  <AuthButton
                    isSignedIn={isSignedIn}
                    userEmail={userProfile?.email}
                    onSignIn={onSignIn}
                    onSignOut={onSignOut}
                  />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-grow flex flex-col w-full max-w-full overflow-x-hidden">
             {children}
          </div>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-100 py-6 md:py-8 mt-auto">
            <div className="max-w-3xl mx-auto px-4 flex flex-col-reverse md:flex-row justify-between items-center gap-4 text-sm text-gray-500 text-center md:text-left">
                <p>&copy; {new Date().getFullYear()} Power121. All rights reserved.</p>
                <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                    <Link to="/privacy-policy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
                    <Link to="/terms-of-service" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
                </div>
            </div>
          </footer>
        </div>
    );
}

function App() {
  // Global Auth State
  const [isScriptsLoaded, setIsScriptsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [authInited, setAuthInited] = useState(false);

  // Load Google Scripts on mount
  useEffect(() => {
    loadGoogleScripts()
      .then(() => {
        setIsScriptsLoaded(true);
        initializeGapiClient()
            .then(() => console.log('GAPI Client Initialized'))
            .catch(err => console.error('GAPI Init Error', err));
      })
      .catch(err => {
        console.error('Failed to load Google Scripts', err);
      });
  }, []);

  const envClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Initialize Auth once if env variable exists
  useEffect(() => {
    if (isScriptsLoaded && envClientId && !authInited) {
       initAuth(envClientId);
    }
  }, [isScriptsLoaded, envClientId, authInited]);

  const initAuth = (clientId) => {
      try {
        initializeGoogleAuth(clientId, (tokenResponse) => {
            setIsSignedIn(true);
            // Fetch user profile
            fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
            })
            .then(res => res.json())
            .then(data => setUserProfile(data))
            .catch(console.error);
        });
        setAuthInited(true);
      } catch (e) {
        console.error("Auth Init Error", e);
      }
  };

  const handleSignIn = () => {
    if (!authInited && !envClientId) {
        alert("Please configure Google Client ID first in the settings (Advanced).");
        return;
    }
    signIn();
  };

  const handleSignOut = () => {
    signOut();
    setIsSignedIn(false);
    setUserProfile(null);
  };

  return (
    <Router>
        <Layout
            isSignedIn={isSignedIn}
            userProfile={userProfile}
            onSignIn={handleSignIn}
            onSignOut={handleSignOut}
        >
            <Routes>
                <Route path="/" element={
                    <Home
                        isSignedIn={isSignedIn}
                        userProfile={userProfile}
                        onSignIn={(clientId) => {
                            if(clientId && !authInited) {
                                initAuth(clientId);
                                setTimeout(() => signIn(), 500);
                            } else {
                                signIn();
                            }
                        }}
                    />
                } />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
            </Routes>
        </Layout>
    </Router>
  );
}

export default App;
