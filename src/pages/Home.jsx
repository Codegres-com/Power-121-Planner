// We need to move the Auth logic out of Home so Header can use it.
// Re-writing Home to accept Auth Props.
import { useState } from 'react';
import { format, addHours, addMinutes, startOfHour, isAfter } from 'date-fns';
import { Calendar, CheckCircle, AlertCircle, Loader2, Download } from 'lucide-react';
import ParticipantInput from '../components/ParticipantInput';
import ConfigPanel from '../components/ConfigPanel';
import SchedulePreview from '../components/SchedulePreview';
import { generateSchedule } from '../utils/scheduler';
import { createCalendarEvent } from '../utils/googleApi';
import { exportToExcel } from '../utils/export';

function Home({ isSignedIn, userProfile, onSignIn }) {
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
    groupSize: 2,
  });

  // App State
  const [schedule, setSchedule] = useState([]);
  const [status, setStatus] = useState({ type: 'idle', message: '' }); // idle, loading, success, error
  const [progress, setProgress] = useState({ current: 0, total: 0 });

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
    const groupSize = parseInt(config.groupSize) || 2;
    const generated = generateSchedule(participants, {
        mode: config.mode,
        startDate: start,
        endDate: end,
        maxRounds: config.maxRounds ? parseInt(config.maxRounds) : null,
        duration: duration,
        groupSize: groupSize
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
        if (!config.clientId) {
            alert('Please enter a Google Client ID in the configuration panel first (Advanced Settings).');
            return;
        }
        onSignIn(config.clientId);
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
            
            const isGroup = meeting.pair.length > 2;
            const summaryTitle = isGroup
                 ? `${titlePrefix} ${meeting.table}`
                 : `${titlePrefix} (${meeting.table}) - ${meeting.pair[0].name} vs ${meeting.pair[1].name}`;

            const descriptionText = isGroup
                 ? `Group Meeting (Round ${meeting.round}, ${meeting.table}).\n\nParticipants:\n${meeting.pair.map(p => `- ${p.name} (${p.email})`).join('\n')}`
                 : `Round Robin Meeting (Round ${meeting.round}, ${meeting.table}).\n\nParticipants:\n- ${meeting.pair[0].name} (${meeting.pair[0].email})\n- ${meeting.pair[1].name} (${meeting.pair[1].email})`;

            await createCalendarEvent({
                summary: summaryTitle,
                description: descriptionText,
                start: meeting.timeSlot,
                end: addMinutes(meeting.timeSlot, duration), 
                attendees: meeting.pair.map(p => ({ email: p.email }))
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
      <main className="max-w-3xl mx-auto px-4 py-8 flex-grow w-full">
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

        <div className="grid grid-cols-1 gap-8">
            <div className="space-y-6">
                <ConfigPanel config={config} setConfig={setConfig} />
                <ParticipantInput participants={participants} setParticipants={setParticipants} />
                
                <button
                    onClick={handleGenerateSchedule}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition transform active:scale-95 flex items-center justify-center gap-2"
                >
                    <Calendar size={18} /> Generate Preview
                </button>
            </div>

            <div>
                {schedule.length > 0 ? (
                    <>
                        <SchedulePreview schedule={schedule} />
                        
                        <div className="flex flex-col sm:flex-row justify-end mt-4 gap-3">
                            <button
                                onClick={() => exportToExcel(schedule)}
                                className="px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition transform active:scale-95"
                            >
                                <Download size={18} /> Export Excel
                            </button>
                            <button
                                onClick={handleCreateEvents}
                                disabled={status.type === 'loading'}
                                className={`px-6 py-3 rounded-lg font-bold shadow-md flex items-center justify-center gap-2 transition ${
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
  );
}

export default Home;
