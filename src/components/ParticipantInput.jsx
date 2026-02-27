import { useState } from 'react';
import Papa from 'papaparse';
import { Upload, Plus, Trash2, Users, FileText } from 'lucide-react';

const ParticipantInput = ({ participants, setParticipants }) => {
  const [textInput, setTextInput] = useState('');

  const processData = (data) => {
    const newParticipants = data.map((row) => {
        // Safe access
        const p1 = row[0] ? String(row[0]).trim() : '';
        const p2 = row[1] ? String(row[1]).trim() : '';
        
        let name = p1;
        let email = p2;

        // If only one column provided
        if (!p2 && p1.includes('@')) {
            // Check for Name <email> format
            const emailMatch = p1.match(/<([^>]+)>/);
            if (emailMatch && emailMatch[1].includes('@')) {
                email = emailMatch[1];
                name = p1.split('<')[0].trim();
            } else {
                email = p1;
                name = p1.split('@')[0];
            }
        } 
        // If first column is email
        else if (p1.includes('@') && !p2.includes('@')) {
            email = p1;
            name = p2 || p1.split('@')[0];
        }
        // If second column is email (Standard: Name, Email)
        else if (p2.includes('@')) {
            email = p2;
            name = p1;
        }

        // Clean up name if it contains email brackets
        if (name && name.includes('<')) {
            name = name.split('<')[0].trim();
        }
        
        // Remove brackets from email if present
        if (email) {
            email = email.replace(/[<>]/g, '');
        }

        return { name: name || 'Unknown', email: email || '' };
    }).filter(p => p.email && p.email.includes('@'));

    // Check for duplicates?
    // For now, allow duplicates but maybe warn?
    // Let's filter duplicates based on email
    const existingEmails = new Set(participants.map(p => p.email.toLowerCase()));
    const uniqueNew = newParticipants.filter(p => !existingEmails.has(p.email.toLowerCase()));

    if (uniqueNew.length < newParticipants.length) {
        // Could show a toast, but for now just adding unique
    }

    setParticipants([...participants, ...uniqueNew]);
  };

  const handleTextPaste = () => {
    if (!textInput) return;
    Papa.parse(textInput, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        processData(results.data);
      }
    });
    setTextInput('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
            processData(results.data);
        }
      });
      // Reset input
      e.target.value = null; 
    }
  };

  const handleClear = () => {
    if(confirm('Are you sure you want to clear all participants?')) {
        setParticipants([]);
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6 transition-all hover:shadow-xl">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
             <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                <Users size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Participants</h2>
        </div>
        {participants.length > 0 && (
            <button 
                onClick={handleClear} 
                className="text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-full transition-colors font-medium"
            >
                Clear All
            </button>
        )}
      </div>
      
      <div className="flex flex-col gap-4 mb-6">
        <div className="relative">
             <textarea
                className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl h-32 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-y placeholder:text-gray-400"
                placeholder="Paste CSV data here...&#10;Format: Name, Email&#10;Example: John Doe, john@example.com"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
            />
            <FileText className="absolute right-4 top-4 text-gray-300 pointer-events-none" size={20} />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
            <button 
                onClick={handleTextPaste}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all font-medium shadow-sm hover:shadow active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!textInput}
            >
                <Plus size={18} /> Add List
            </button>
            <label className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg cursor-pointer flex items-center justify-center gap-2 transition-all font-medium shadow-sm hover:shadow">
                <Upload size={18} /> Upload CSV
                <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
        </div>
      </div>
      
      <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-xl bg-gray-50/50 custom-scrollbar">
        {participants.length === 0 ? (
            <div className="py-12 px-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3 text-gray-400">
                    <Users size={24} />
                </div>
                <p className="text-gray-500 font-medium">No participants added yet.</p>
                <p className="text-xs text-gray-400 mt-1">Add names and emails to start scheduling.</p>
            </div>
        ) : (
            <ul className="divide-y divide-gray-100">
                {participants.map((p, idx) => (
                    <li key={idx} className="flex justify-between items-center p-3 hover:bg-white transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 flex items-center justify-center text-sm font-bold shadow-sm border border-white">
                                {p.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-sm text-gray-800">{p.name}</span> 
                                <span className="text-gray-500 text-xs font-mono">{p.email}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => setParticipants(participants.filter((_, i) => i !== idx))}
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="Remove"
                        >
                            <Trash2 size={16} />
                        </button>
                    </li>
                ))}
            </ul>
        )}
      </div>
      <div className="mt-3 flex justify-end">
         <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-md">
            Total: {participants.length}
         </span>
      </div>
    </div>
  );
};

export default ParticipantInput;
