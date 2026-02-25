import { format } from 'date-fns';

const SchedulePreview = ({ schedule }) => {
  if (!schedule || schedule.length === 0) return null;

  // Group by round
  const rounds = schedule.reduce((acc, item) => {
    const roundKey = item.round || 1;
    if (!acc[roundKey]) acc[roundKey] = [];
    acc[roundKey].push(item);
    return acc;
  }, {});

  // Sort rounds by round number
  const sortedRounds = Object.entries(rounds).sort(([a], [b]) => Number(a) - Number(b));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6 animate-fade-in">
       <div className="flex justify-between items-center mb-4 border-b pb-2">
           <h2 className="text-xl font-semibold">Proposed Schedule</h2>
           <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
               {schedule.length} Meetings
           </span>
       </div>

       <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
         {sortedRounds.length === 0 && (
             <p className="text-gray-500 text-center py-4">No meetings scheduled.</p>
         )}

         {sortedRounds.map(([round, meetings]) => (
            <div key={round} className="border rounded-lg overflow-hidden shadow-sm bg-gray-50/50">
                <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center sticky top-0 z-10 shadow-sm">
                    <span className="font-semibold text-gray-800">Round {round}</span>
                    <span className="text-sm text-gray-600 flex items-center gap-1 font-mono bg-white px-2 py-0.5 rounded border">
                        {format(new Date(meetings[0].timeSlot), 'PPP p')}
                    </span>
                </div>
                <div className="divide-y divide-gray-200 bg-white">
                    {meetings.map((meeting, idx) => (
                        <div key={idx} className="px-4 py-3 flex flex-col md:flex-row justify-between items-center hover:bg-blue-50/30 transition gap-3">
                            <div className="flex gap-3 items-center w-full md:w-auto justify-center md:justify-start">
                                <div className="flex items-center gap-2 min-w-[150px] justify-end">
                                    <span className="font-medium text-gray-900 truncate max-w-[120px]" title={meeting.pair[0].name}>
                                        {meeting.pair[0].name}
                                    </span>
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shadow-sm border border-blue-200">
                                        {meeting.pair[0].name.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <span className="text-gray-400 text-xs font-mono font-bold">VS</span>
                                <div className="flex items-center gap-2 min-w-[150px]">
                                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold shadow-sm border border-green-200">
                                        {meeting.pair[1].name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-medium text-gray-900 truncate max-w-[120px]" title={meeting.pair[1].name}>
                                        {meeting.pair[1].name}
                                    </span>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400 flex gap-2 font-mono">
                                <span className="truncate max-w-[100px]" title={meeting.pair[0].email}>{meeting.pair[0].email}</span>
                                <span>/</span>
                                <span className="truncate max-w-[100px]" title={meeting.pair[1].email}>{meeting.pair[1].email}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
         ))}
       </div>
    </div>
  );
};

export default SchedulePreview;
