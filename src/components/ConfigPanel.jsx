import { useState } from 'react';
import { Settings, Calendar, Key } from 'lucide-react';

const ConfigPanel = ({ config, setConfig }) => {
  const [showClientId, setShowClientId] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex items-center gap-2 mb-4 border-b pb-2">
        <Settings className="text-gray-600" size={20} />
        <h2 className="text-xl font-semibold">Configuration</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Scheduling Mode</label>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer p-2 border rounded hover:bg-gray-50 transition">
              <input
                type="radio"
                name="mode"
                value="quick-pair"
                checked={config.mode === 'quick-pair'}
                onChange={handleChange}
                className="accent-blue-600 w-4 h-4"
              />
              <div>
                  <span className="font-medium">Quick Pair</span>
                  <p className="text-xs text-gray-500">Single 1-hour slot. Pair everyone once.</p>
              </div>
            </label>
            <label className="flex items-center gap-2 cursor-pointer p-2 border rounded hover:bg-gray-50 transition">
              <input
                type="radio"
                name="mode"
                value="round-robin"
                checked={config.mode === 'round-robin'}
                onChange={handleChange}
                className="accent-blue-600 w-4 h-4"
              />
              <div>
                  <span className="font-medium">Round Robin</span>
                  <p className="text-xs text-gray-500">Multiple slots. Everyone meets everyone.</p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
              <div className="relative">
                <Calendar className="absolute left-2 top-2.5 text-gray-400 pointer-events-none" size={16} />
                <input
                  type="datetime-local"
                  name="startDate"
                  value={config.startDate}
                  onChange={handleChange}
                  className="w-full border p-2 pl-9 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
              <div className="relative">
                <Calendar className="absolute left-2 top-2.5 text-gray-400 pointer-events-none" size={16} />
                <input
                  type="datetime-local"
                  name="endDate"
                  value={config.endDate}
                  onChange={handleChange}
                  className="w-full border p-2 pl-9 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Min)</label>
                   <input
                     type="number"
                     name="meetingDuration"
                     value={config.meetingDuration}
                     onChange={handleChange}
                     className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                     min="1"
                   />
                </div>
                {config.mode === 'round-robin' && (
                   <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Max Rounds</label>
                       <input
                         type="number"
                         name="maxRounds"
                         value={config.maxRounds || ''}
                         onChange={handleChange}
                         placeholder="All"
                         className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                         min="1"
                       />
                   </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title Prefix</label>
                <input
                    type="text"
                    name="meetingTitle"
                    value={config.meetingTitle}
                    onChange={handleChange}
                    placeholder="e.g. 1:1 Sync"
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-[10px] text-gray-500 mt-1">Appended with " - Name vs Name"</p>
            </div>
        </div>


        <div className="md:col-span-2 border-t pt-4 mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Key size={16} /> Google Client ID
            </label>
            <div className="flex gap-2">
                <input
                    type={showClientId ? "text" : "password"}
                    name="clientId"
                    value={config.clientId}
                    onChange={handleChange}
                    placeholder="Enter Google Cloud Client ID (e.g., 123...apps.googleusercontent.com)"
                    className="w-full border p-2 rounded text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                    type="button"
                    onClick={() => setShowClientId(!showClientId)}
                    className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm font-medium transition"
                >
                    {showClientId ? "Hide" : "Show"}
                </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
                Required for scheduling. This ID is used to authenticate with Google Calendar.
            </p>
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel;
