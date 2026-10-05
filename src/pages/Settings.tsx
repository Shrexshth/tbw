import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';

export default function Settings() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);

  const [formState, setFormState] = useState({ ...settings });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormState({ ...settings });
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      updateSettings(formState);
      setSaving(false);
    }, 600);
  };

  const toggles = [
    { key: 'notifyMismatches' as const, label: 'Mismatch Alerts', description: 'Get notified when new mismatches are detected' },
    { key: 'notifyUploads' as const, label: 'Upload Confirmations', description: 'Receive confirmation when uploads complete' },
    { key: 'notifyApprovals' as const, label: 'Approval Reminders', description: 'Daily reminders for pending approval items' },
    { key: 'weeklyDigest' as const, label: 'Weekly Digest', description: 'Summary email every Monday morning' },
  ];

  return (
    <div className="max-w-2xl">
      <h1 className="text-[22px] font-bold text-slate-900 tracking-[-0.025em] mb-6">Settings</h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Firm details */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-[14px] font-semibold text-slate-900 mb-4">Practice Details</h2>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[13px] font-medium text-neutral-800 block">Firm Name</label>
              <input
                type="text"
                value={formState.firmName}
                onChange={(e) => setFormState({ ...formState, firmName: e.target.value })}
                className="w-full h-10 px-3 bg-white border border-neutral-300 rounded-[10px] text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:border-[#6D4FF0] focus:outline-none focus:ring-2 focus:ring-[#6D4FF0]/15 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[13px] font-medium text-neutral-800 block">Email</label>
              <input
                type="email"
                value={formState.email}
                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                className="w-full h-10 px-3 bg-white border border-neutral-300 rounded-[10px] text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:border-[#6D4FF0] focus:outline-none focus:ring-2 focus:ring-[#6D4FF0]/15 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[13px] font-medium text-neutral-800 block">Default GSTIN</label>
              <input
                type="text"
                value={formState.defaultGstin}
                onChange={(e) => setFormState({ ...formState, defaultGstin: e.target.value })}
                className="w-full h-10 px-3 bg-white border border-neutral-300 rounded-[10px] text-[14px] text-neutral-900 font-mono placeholder:text-neutral-400 focus:border-[#6D4FF0] focus:outline-none focus:ring-2 focus:ring-[#6D4FF0]/15 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-[14px] font-semibold text-slate-900 mb-4">Notifications</h2>
          <div className="space-y-1">
            {toggles.map((toggle) => (
              <div key={toggle.key} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                <div>
                  <p className="text-[13px] font-medium text-slate-900">{toggle.label}</p>
                  <p className="text-[12px] text-slate-500">{toggle.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormState({ ...formState, [toggle.key]: !formState[toggle.key] })}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                    formState[toggle.key] ? 'bg-[#6D4FF0]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      formState[toggle.key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-[#6D4FF0] hover:bg-[#5B3BDC] text-white text-[14px] font-semibold transition-all shadow-sm disabled:opacity-60 flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
