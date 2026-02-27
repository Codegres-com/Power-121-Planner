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
            Time: format(new Date(item.timeSlot), 'yyyy-MM-dd HH:mm'),
            Participants: participants
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Schedule");
    
    // Auto-width columns
    const max_width = rows.reduce((w, r) => Math.max(w, r.Participants.length), 10);
    worksheet["!cols"] = [ { wch: 10 }, { wch: 20 }, { wch: max_width + 5 } ];

    XLSX.writeFile(workbook, filename);
};
