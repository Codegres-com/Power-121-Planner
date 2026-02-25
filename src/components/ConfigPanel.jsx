import { useState } from 'react';
import { Settings, Calendar, Key, ChevronDown, ChevronUp, Clock, Type } from 'lucide-react';

const ConfigPanel = ({ config, setConfig }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showClientId, setShowClientId] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="bg-white p-5 md:p-6 rounded-xl shadow-lg border border-gray-100 mb-6 transition-all hover:shadow-xl">
      <div className="flex items-center gap-3 mb-5 md:mb-6 pb-4 border-b border-gray-100">
        <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
            <Settings size={20} />
        </div>
        <h2 className="text-lg md:text-xl font-bold text-gray-800">Configuration</h2>
      </div>

      <div className="space-y-6">
        {/* Scheduling Mode Section */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Scheduling Mode</label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <label className={`relative flex items-start gap-3 cursor-pointer p-3 md:p-4 border-2 rounded-xl transition-all ${config.mode === 'quick-pair' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input
                type="radio"
                name="mode"
                value="quick-pair"
                checked={config.mode === 'quick-pair'}
                onChange={handleChange}
                className="mt-1 accent-blue-600 w-4 h-4 shrink-0"
              />
              <div>
                  <span className={`font-bold block text-sm md:text-base ${config.mode === 'quick-pair' ? 'text-blue-700' : 'text-gray-700'}`}>Quick Pair</span>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Single time slot. Randomly pairs everyone once. Parallel meetings.</p>
              </div>
            </label>
            <label className={`relative flex items-start gap-3 cursor-pointer p-3 md:p-4 border-2 rounded-xl transition-all ${config.mode === 'round-robin' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input
                type="radio"
                name="mode"
                value="round-robin"
                checked={config.mode === 'round-robin'}
                onChange={handleChange}
                className="mt-1 accent-blue-600 w-4 h-4 shrink-0"
              />
              <div>
                  <span className={`font-bold block text-sm md:text-base ${config.mode === 'round-robin' ? 'text-blue-700' : 'text-gray-700'}`}>Round Robin</span>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Multiple time slots. Everyone meets everyone else sequentially.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Time Settings Section */}
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Time & Duration</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date & Time</label>
                        <div className="relative group">
                            <Calendar className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                            type="datetime-local"
                            name="startDate"
                            value={config.startDate}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-200 p-2.5 pl-10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-gray-700"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date & Time</label>
                        <div className="relative group">
                            <Calendar className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                            type="datetime-local"
                            name="endDate"
                            value={config.endDate}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-200 p-2.5 pl-10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-gray-700"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Meeting Duration (Minutes)</label>
                        <div className="relative group">
                            <Clock className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                type="number"
                                name="meetingDuration"
                                value={config.meetingDuration}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 p-2.5 pl-10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-gray-700"
                                min="15"
                                step="15"
                            />
                        </div>
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Meeting Title Prefix</label>
                        <div className="relative group">
                            <Type className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                type="text"
                                name="meetingTitle"
                                value={config.meetingTitle}
                                onChange={handleChange}
                                placeholder="e.g. 1:1 Sync"
                                className="w-full bg-gray-50 border border-gray-200 p-2.5 pl-10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-gray-700 placeholder:font-normal"
                            />
                        </div>
                    </div>

                    {config.mode === 'round-robin' && (
                        <div className="animate-fade-in">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Rounds Limit</label>
                            <input
                                type="number"
                                name="maxRounds"
                                value={config.maxRounds || ''}
                                onChange={handleChange}
                                placeholder="Default: All rounds"
                                className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-gray-700 placeholder:font-normal"
                                min="1"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Advanced Settings Toggle */}
        <div className="border-t border-gray-100 pt-4">
            <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
            >
                {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                Advanced Settings
            </button>

            {showAdvanced && (
                <div className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-200 animate-fade-in">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Key size={16} /> Google Client ID override
                    </label>
                    <div className="flex gap-2">
                        <input
                            type={showClientId ? "text" : "password"}
                            name="clientId"
                            value={config.clientId}
                            onChange={handleChange}
                            placeholder="Enter Google Cloud Client ID"
                            className="w-full border border-gray-300 p-2.5 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        />
                        <button
                            type="button"
                            onClick={() => setShowClientId(!showClientId)}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 text-sm font-medium transition"
                        >
                            {showClientId ? "Hide" : "Show"}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Only needed if not configured via environment variables.
                    </p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel;
