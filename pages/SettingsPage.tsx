import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { Button } from '../components/ui/Button';
import { Check, Shield, Zap, Layout, Type, Globe, Building, DollarSign } from 'lucide-react';

export const SettingsPage: React.FC = () => {
    const { settings, updateSettings } = useSettings();
    const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'billing'>('general');
    const [isSaving, setIsSaving] = useState(false);

    // Local state for forms
    const [orgName, setOrgName] = useState(settings.orgName);
    const [logoUrl, setLogoUrl] = useState(settings.orgLogoUrl);
    const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
    const [font, setFont] = useState(settings.fontFamily);

    const handleSaveGeneral = () => {
        setIsSaving(true);
        setTimeout(() => {
            updateSettings({ orgName, orgLogoUrl: logoUrl });
            setIsSaving(false);
            alert("Settings Saved!");
        }, 800);
    };

    const handleSaveBranding = () => {
        setIsSaving(true);
        setTimeout(() => {
            updateSettings({ primaryColor, fontFamily: font });
            setIsSaving(false);
            alert("Branding Applied Globally!");
        }, 800);
    };

    const handleUpgrade = () => {
        setIsSaving(true);
        // Simulate payment gateway
        setTimeout(() => {
            updateSettings({ plan: 'Enterprise' });
            setIsSaving(false);
            alert("Upgrade Successful! Enterprise features unlocked.");
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col p-8 font-sans">
            <div className="max-w-5xl mx-auto w-full">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings & Configuration</h1>
                <p className="text-gray-500 mb-8">Manage your organization profile and white-label branding.</p>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-8">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'general' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        General Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('branding')}
                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'branding' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <Layout className="w-4 h-4" /> Branding
                    </button>
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 min-h-[400px]">

                    {/* GENERAL TAB */}
                    {activeTab === 'general' && (
                        <div className="max-w-md space-y-6 animate-fade-in">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Organization Name</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={orgName}
                                        onChange={(e) => setOrgName(e.target.value)}
                                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Logo URL (Square)</label>
                                <input
                                    type="text"
                                    value={logoUrl}
                                    onChange={(e) => setLogoUrl(e.target.value)}
                                    placeholder="https://example.com/logo.png"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                                {logoUrl && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-4">
                                        <img src={logoUrl} alt="Preview" className="w-12 h-12 rounded object-cover" />
                                        <span className="text-sm text-gray-500">Logo Preview</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700">Enable Email Notifications</label>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Turn off if EmailJS quota is reached. Links can be copied manually.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => updateSettings({ emailEnabled: !settings.emailEnabled })}
                                        className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${settings.emailEnabled ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                    >
                                        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${settings.emailEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>

                            <Button onClick={handleSaveGeneral} disabled={isSaving} className="w-full mt-4">
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    )}

                    {/* BRANDING TAB */}
                    {activeTab === 'branding' && (
                        <div className="animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Brand Color</label>
                                        <div className="flex gap-4 items-center">
                                            <input
                                                type="color"
                                                value={primaryColor}
                                                onChange={(e) => setPrimaryColor(e.target.value)}
                                                className="w-12 h-12 rounded-lg cursor-pointer border-0"
                                            />
                                            <span className="text-gray-600 font-mono">{primaryColor}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Font Family</label>
                                        <div className="space-y-2">
                                            {['Inter, sans-serif', 'Roboto, sans-serif', 'Playfair Display, serif', 'Courier Prime, monospace'].map(f => (
                                                <label key={f} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                                    <input
                                                        type="radio"
                                                        name="font"
                                                        value={f}
                                                        checked={font === f}
                                                        onChange={(e) => setFont(e.target.value)}
                                                        className="text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <span style={{ fontFamily: f }}>{f.split(',')[0]} (AaBbCc)</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Custom Domain (CNAME)</label>
                                        <div className="flex gap-2">
                                            <div className="bg-gray-100 p-3 rounded-l-lg border border-r-0 border-gray-300 text-gray-500">https://</div>
                                            <input
                                                type="text"
                                                placeholder="assessments.yourcompany.com"
                                                className="flex-1 p-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">Requires DNS verification.</p>
                                    </div>
                                    <Button onClick={handleSaveBranding} disabled={isSaving} className="w-full">
                                        {isSaving ? 'Applying Config...' : 'Apply Branding'}
                                    </Button>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 flex flex-col items-center justify-center">
                                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Live Preview</h4>

                                    {/* PReview Component */}
                                    <div className="w-64 bg-white rounded-lg shadow-lg overflow-hidden transform scale-110">
                                        <div className="h-12 flex items-center px-4" style={{ backgroundColor: primaryColor }}>
                                            <div className="w-20 h-3 bg-white/30 rounded"></div>
                                        </div>
                                        <div className="p-4 space-y-3" style={{ fontFamily: font }}>
                                            <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
                                            <div className="h-20 w-full bg-gray-50 rounded border border-gray-100"></div>
                                            <button className="w-full py-2 rounded text-white text-xs font-bold" style={{ backgroundColor: primaryColor }}>
                                                Submit Application
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div >
    );
};

