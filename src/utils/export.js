import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export const exportToExcel = (schedule, filename = 'schedule.xlsx') => {
    if (!schedule || schedule.length === 0) return;

    // Transform schedule to rows
    const rows = schedule.map(item => {
        // item.pair is an array of participants {name, email}
        const participants = item.pair.map(p => `${p.name} (${p.email})`).join(', ');
        
        return {
            Round: item.round,
            Table: item.table,
            Time: format(new Date(item.timeSlot), 'yyyy-MM-dd HH:mm'),
            Participants: participants
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Schedule");
    
    // Auto-width columns
    const max_width = rows.reduce((w, r) => Math.max(w, r.Participants.length), 10);
    worksheet["!cols"] = [ { wch: 10 }, { wch: 10 }, { wch: 20 }, { wch: max_width + 5 } ];

    // Memberwise Sheet
    const memberMap = new Map();
    const maxRound = Math.max(...schedule.map(s => s.round));
    
    schedule.forEach(meeting => {
        meeting.pair.forEach(p => {
             const key = `${p.name} (${p.email})`;
             if (!memberMap.has(key)) {
                 const baseObj = { "Member Name": p.name, "Email": p.email };
                 memberMap.set(key, baseObj);
             }
             memberMap.get(key)[`Round ${meeting.round}`] = meeting.table;
        });
    });

    const memberRows = Array.from(memberMap.values());
    const worksheet2 = XLSX.utils.json_to_sheet(memberRows);
    XLSX.utils.book_append_sheet(workbook, worksheet2, "Memberwise Schedule");

    const cols2 = [{wch: 25}, {wch: 30}];
    for(let i=1; i<=maxRound; i++) cols2.push({wch: 10});
    worksheet2["!cols"] = cols2;

    XLSX.writeFile(workbook, filename);
};
