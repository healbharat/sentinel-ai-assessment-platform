import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getSession, login as authLogin, logout as authLogout } from '../services/authService';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const session = getSession();
        if (session) {
            setUser(session);
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, pass: string) => {
        const user = await authLogin(email, pass);
        // Additional Check: Organization Status
        if (user.organizationId) {
            // We'd fetch org status here in a real app or embedded in user
            // For now, checks will happen in Dashboard
        }
        setUser(user);
    };

    const logout = () => {
        authLogout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
