import { useState } from 'react';
import Papa from 'papaparse';
import { Upload, Plus, Trash2 } from 'lucide-react';

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
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Participants</h2>
        {participants.length > 0 && (
            <button onClick={handleClear} className="text-sm text-red-500 hover:underline">Clear All</button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <textarea
            className="w-full md:w-3/4 border p-2 rounded h-24 text-sm font-mono"
            placeholder="Paste CSV data (e.g. John Doe, john@example.com)"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
        />
        <div className="flex flex-col gap-2 w-full md:w-1/4">
            <button
                onClick={handleTextPaste}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2 transition"
                disabled={!textInput}
            >
                <Plus size={16} /> Add
            </button>
            <label className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded cursor-pointer flex items-center justify-center gap-2 transition border">
                <Upload size={16} /> Upload CSV
                <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
        </div>
      </div>

      <div className="max-h-60 overflow-y-auto border rounded bg-gray-50">
        {participants.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
                No participants added yet.
            </div>
        ) : (
            <ul className="divide-y divide-gray-200">
                {participants.map((p, idx) => (
                    <li key={idx} className="flex justify-between items-center p-3 hover:bg-white transition">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                {p.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-sm">{p.name}</span>
                                <span className="text-gray-500 text-xs">{p.email}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setParticipants(participants.filter((_, i) => i !== idx))}
                            className="text-gray-400 hover:text-red-500 transition"
                            title="Remove"
                        >
                            <Trash2 size={16} />
                        </button>
                    </li>
                ))}
            </ul>
        )}
      </div>
      <div className="mt-2 text-right text-xs text-gray-500">
        Total: {participants.length}
      </div>
    </div>
  );
};

export default ParticipantInput;
