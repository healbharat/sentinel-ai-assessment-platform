import React, { createContext, useContext, useState, useEffect } from 'react';
import { OrganizationSettings } from '../types';

const DEFAULT_SETTINGS: OrganizationSettings = {
    orgName: 'Sentinel AI',
    orgLogoUrl: '',
    theme: 'light',
    securityLevel: 'high',
    emailBranding: true,
    plan: 'Free',
    primaryColor: '#4f46e5', // Indigo-600
    secondaryColor: '#ec4899', // Pink-500
    fontFamily: 'Inter, sans-serif'
};

interface SettingsContextType {
    settings: OrganizationSettings;
    updateSettings: (newSettings: Partial<OrganizationSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<OrganizationSettings>(DEFAULT_SETTINGS);

    useEffect(() => {
        const stored = localStorage.getItem('sentinel_org_settings');
        if (stored) {
            setSettings(JSON.parse(stored));
        }
    }, []);

    const updateSettings = (newSettings: Partial<OrganizationSettings>) => {
        setSettings(prev => {
            const updated = { ...prev, ...newSettings };
            localStorage.setItem('sentinel_org_settings', JSON.stringify(updated));
            return updated;
        });
    };

    // Apply Theme & Branding
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', settings.theme);
        if (settings.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        // Apply Branding Colors
        const styleId = 'dynamic-theme-styles';
        let styleTag = document.getElementById(styleId);
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = styleId;
            document.head.appendChild(styleTag);
        }

        styleTag.innerHTML = `
            :root { --color-primary: ${settings.primaryColor}; }
            .font-sans, body { font-family: ${settings.fontFamily} !important; }
            /* Global Color Overrides */
            .text-indigo-600, .text-indigo-700, .text-purple-600 { color: ${settings.primaryColor} !important; }
            .bg-indigo-600, .bg-indigo-700, .bg-purple-600 { background-color: ${settings.primaryColor} !important; }
            .bg-indigo-50, .bg-indigo-100 { background-color: ${settings.primaryColor}15 !important; } /* 10-20% opacity */
            .border-indigo-600, .border-indigo-200 { border-color: ${settings.primaryColor} !important; }
            .focus\\:ring-indigo-500:focus { --tw-ring-color: ${settings.primaryColor} !important; }
        `;

    }, [settings.theme, settings.primaryColor, settings.secondaryColor, settings.fontFamily]);

    // Apply Title
    useEffect(() => {
        document.title = `${settings.orgName} | Assessment Platform`;
    }, [settings.orgName]);

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
