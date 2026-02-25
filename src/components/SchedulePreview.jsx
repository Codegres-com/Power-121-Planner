import { format } from 'date-fns';
import { Calendar, Clock, User } from 'lucide-react';

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
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6 animate-fade-in hover:shadow-xl transition-all">
       <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
           <div className="flex items-center gap-3">
               <div className="bg-green-50 p-2 rounded-lg text-green-600">
                   <Calendar size={20} />
               </div>
               <h2 className="text-xl font-bold text-gray-800">Proposed Schedule</h2>
           </div>
           <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
               {schedule.length} Meetings
           </span>
       </div>

       <div className="space-y-8 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
         {sortedRounds.length === 0 && (
             <p className="text-gray-500 text-center py-8">No meetings scheduled.</p>
         )}

         {sortedRounds.map(([round, meetings]) => (
            <div key={round} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
                <div className="bg-gray-50/80 backdrop-blur-sm px-4 py-3 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                         <span className="font-bold text-gray-700 bg-white border border-gray-200 px-2 py-0.5 rounded text-sm shadow-sm">
                            Round {round}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                        <Clock size={14} className="text-blue-500" />
                        {format(new Date(meetings[0].timeSlot), 'MMM d, h:mm a')}
                    </div>
                </div>
                <div className="divide-y divide-gray-100">
                    {meetings.map((meeting, idx) => (
                        <div key={idx} className="px-4 py-4 flex flex-col md:flex-row justify-between items-center hover:bg-gray-50/50 transition-colors gap-3 group">
                            <div className="flex gap-4 items-center w-full md:w-auto justify-center md:justify-start">
                                {/* Player 1 */}
                                <div className="flex items-center gap-3 min-w-[140px] justify-end">
                                    <div className="flex flex-col items-end">
                                        <span className="font-semibold text-gray-900 truncate max-w-[120px]" title={meeting.pair[0].name}>
                                            {meeting.pair[0].name}
                                        </span>
                                        <span className="text-[10px] text-gray-400 truncate max-w-[100px]">{meeting.pair[0].email}</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center text-sm font-bold shadow-sm border-2 border-white ring-1 ring-gray-100">
                                        {meeting.pair[0].name.charAt(0).toUpperCase()}
                                    </div>
                                </div>

                                <span className="text-gray-300 text-xs font-black italic tracking-widest">VS</span>

                                {/* Player 2 */}
                                <div className="flex items-center gap-3 min-w-[140px]">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600 flex items-center justify-center text-sm font-bold shadow-sm border-2 border-white ring-1 ring-gray-100">
                                        {meeting.pair[1].name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-900 truncate max-w-[120px]" title={meeting.pair[1].name}>
                                            {meeting.pair[1].name}
                                        </span>
                                        <span className="text-[10px] text-gray-400 truncate max-w-[100px]">{meeting.pair[1].email}</span>
                                    </div>
                                </div>
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
