import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getUserProfile, UserProfile } from '../services/workdayService';

interface WorkdayAuthContextType {
    user: any; // Firebase user
    profile: UserProfile | null;
    isLoading: boolean;
    logout: () => void;
    refreshProfile: () => Promise<void>;
}

const WorkdayAuthContext = createContext<WorkdayAuthContextType | undefined>(undefined);

export const WorkdayAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshProfile = async () => {
        if (user) {
            const p = await getUserProfile(user.uid);
            setProfile(p);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentFirebaseUser) => {
            setUser(currentFirebaseUser);
            if (currentFirebaseUser) {
                const p = await getUserProfile(currentFirebaseUser.uid);
                setProfile(p);
            } else {
                setProfile(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <WorkdayAuthContext.Provider value={{ user, profile, isLoading, logout, refreshProfile }}>
            {children}
        </WorkdayAuthContext.Provider>
    );
};

export const useWorkdayAuth = () => {
    const context = useContext(WorkdayAuthContext);
    if (context === undefined) {
        throw new Error('useWorkdayAuth must be used within a WorkdayAuthProvider');
    }
    return context;
};
