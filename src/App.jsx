import { useState, useEffect } from 'react';
import { format, addHours, addMinutes, startOfHour, isAfter } from 'date-fns';
import { Calendar, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import ParticipantInput from './components/ParticipantInput';
import ConfigPanel from './components/ConfigPanel';
import SchedulePreview from './components/SchedulePreview';
import AuthButton from './components/AuthButton';
import { generateSchedule } from './utils/scheduler';
import {
  loadGoogleScripts,
  initializeGapiClient,
  initializeGoogleAuth,
  signIn,
  signOut,
  createCalendarEvent
} from './utils/googleApi';

function App() {
  // Config State
  const [participants, setParticipants] = useState([]);
  const [config, setConfig] = useState({
    mode: 'quick-pair', // or 'round-robin'
    startDate: format(startOfHour(addHours(new Date(), 1)), "yyyy-MM-dd'T'HH:mm"),
    endDate: format(addHours(startOfHour(addHours(new Date(), 1)), 4), "yyyy-MM-dd'T'HH:mm"),
    maxRounds: '',
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    meetingTitle: '',
    meetingDuration: 60,
  });

  // App State
  const [schedule, setSchedule] = useState([]);
  const [isScriptsLoaded, setIsScriptsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [status, setStatus] = useState({ type: 'idle', message: '' }); // idle, loading, success, error
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // Load Google Scripts on mount
  useEffect(() => {
    loadGoogleScripts()
      .then(() => {
        setIsScriptsLoaded(true);
        // Try to init client if possible (but we need auth first usually for full access? No, discovery docs can be loaded without auth)
        initializeGapiClient()
            .then(() => console.log('GAPI Client Initialized'))
            .catch(err => console.error('GAPI Init Error', err));
      })
      .catch(err => {
        console.error('Failed to load Google Scripts', err);
        setStatus({ type: 'error', message: 'Failed to load Google API scripts. Check your internet connection.' });
      });
  }, []);

  // Initialize Auth when Client ID is available
  useEffect(() => {
    if (isScriptsLoaded && config.clientId) {
      try {
        initializeGoogleAuth(config.clientId, (tokenResponse) => {
            setIsSignedIn(true);
            // Fetch user profile
            fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
            })
            .then(res => res.json())
            .then(data => setUserProfile(data))
            .catch(console.error);
        });
      } catch (e) {
        console.error("Auth Init Error", e);
      }
    }
  }, [isScriptsLoaded, config.clientId]);

  const handleSignIn = () => {
    if (!config.clientId) {
        alert('Please enter a Google Client ID in the configuration panel first.');
        return;
    }
    signIn();
  };

  const handleSignOut = () => {
    signOut();
    setIsSignedIn(false);
    setUserProfile(null);
  };

  const handleGenerateSchedule = () => {
    if (participants.length < 2) {
        setStatus({ type: 'error', message: 'Need at least 2 participants.' });
        return;
    }

    const start = new Date(config.startDate);
    const end = new Date(config.endDate);

    if (isAfter(start, end)) {
        setStatus({ type: 'error', message: 'Start date must be before end date.' });
        return;
    }

    const duration = parseInt(config.meetingDuration) || 60;
    const generated = generateSchedule(participants, {
        mode: config.mode,
        startDate: start,
        endDate: end,
        maxRounds: config.maxRounds ? parseInt(config.maxRounds) : null,
        duration: duration
    });

    if (generated.length === 0) {
        setStatus({ type: 'error', message: 'Could not generate any meetings within the time constraints.' });
    } else {
        setSchedule(generated);
        setStatus({ type: 'idle', message: '' });
    }
  };

  const handleCreateEvents = async () => {
    if (!isSignedIn) {
        handleSignIn();
        return;
    }

    if (schedule.length === 0) return;

    if (!confirm(`Ready to create ${schedule.length} calendar events? This will send emails to participants.`)) {
        return;
    }

    setStatus({ type: 'loading', message: 'Creating calendar events...' });
    setProgress({ current: 0, total: schedule.length });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < schedule.length; i++) {
        const meeting = schedule[i];
        try {
            const titlePrefix = config.meetingTitle ? config.meetingTitle.trim() : '1:1';
            const duration = parseInt(config.meetingDuration) || 60;

            await createCalendarEvent({
                summary: `${titlePrefix} - ${meeting.pair[0].name} vs ${meeting.pair[1].name}`,
                description: `Round Robin Meeting (Round ${meeting.round}).\n\nParticipants:\n- ${meeting.pair[0].name} (${meeting.pair[0].email})\n- ${meeting.pair[1].name} (${meeting.pair[1].email})`,
                start: meeting.timeSlot,
                end: addMinutes(meeting.timeSlot, duration),
                attendees: [
                    { email: meeting.pair[0].email },
                    { email: meeting.pair[1].email }
                ]
            });
            successCount++;
        } catch (error) {
            console.error('Failed to create event', error);
            failCount++;
        }

        setProgress({ current: i + 1, total: schedule.length });
        // Small delay to avoid rate limits
        await new Promise(r => setTimeout(r, 500));
    }

    setStatus({
        type: failCount === 0 ? 'success' : 'error',
        message: `Finished! Created ${successCount} events. Failed: ${failCount}.`
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
                <Calendar size={24} />
            </div>
            <div>
                <h1 className="text-xl font-bold text-gray-800 leading-none">1:1 Scheduler</h1>
                <p className="text-xs text-gray-500">Round Robin & Mesh Meetings</p>
            </div>
          </div>

          <AuthButton
            isSignedIn={isSignedIn}
            userEmail={userProfile?.email}
            onSignIn={handleSignIn}
            onSignOut={handleSignOut}
          />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Status Messages */}
        {status.message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
                {status.type === 'loading' && <Loader2 className="animate-spin" size={20} />}
                {status.type === 'success' && <CheckCircle size={20} />}
                {status.type === 'error' && <AlertCircle size={20} />}
                <div>
                    <span className="font-medium">{status.message}</span>
                    {status.type === 'loading' && progress.total > 0 && (
                        <div className="w-full bg-blue-200 rounded-full h-1.5 mt-2">
                            <div
                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${(progress.current / progress.total) * 100}%` }}
                            ></div>
                        </div>
                    )}
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Inputs */}
            <div className="lg:col-span-1 space-y-6">
                <ConfigPanel config={config} setConfig={setConfig} />
                <ParticipantInput participants={participants} setParticipants={setParticipants} />

                <button
                    onClick={handleGenerateSchedule}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition transform active:scale-95 flex items-center justify-center gap-2"
                >
                    <Calendar size={18} /> Generate Preview
                </button>
            </div>

            {/* Right Column: Preview & Action */}
            <div className="lg:col-span-2">
                {schedule.length > 0 ? (
                    <>
                        <SchedulePreview schedule={schedule} />

                        <div className="flex justify-end mt-4">
                            <button
                                onClick={handleCreateEvents}
                                disabled={status.type === 'loading'}
                                className={`px-6 py-3 rounded-lg font-bold shadow-md flex items-center gap-2 transition ${
                                    status.type === 'loading'
                                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                    : 'bg-green-600 hover:bg-green-700 text-white transform active:scale-95'
                                }`}
                            >
                                {status.type === 'loading' ? (
                                    <>Creating Events...</>
                                ) : (
                                    <>Schedule & Send Invites ({schedule.length})</>
                                )}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg p-12 bg-white min-h-[400px]">
                        <Calendar size={48} className="mb-4 text-gray-300" />
                        <p className="text-lg font-medium text-gray-500">No schedule generated yet.</p>
                        <p className="text-sm">Add participants and configure settings to begin.</p>
                    </div>
                )}
            </div>
        </div>
      </main>

      <footer className="text-center py-8 text-gray-400 text-sm">
        <p>Google Calendar Integration • Frontend Only • React + Vite</p>
      </footer>
    </div>
  );
}

export default App;
