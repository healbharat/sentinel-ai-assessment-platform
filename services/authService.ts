import { User, UserRole, Organization, OrganizationType } from '../types';
import { db } from './db';

const SESSION_KEY = 'sentinel_session';

// Initialize Mock Users in DB if not present
const seedUsers = async () => {
    const users = await db.getUsers();
    if (users.length === 0) {
        await db.addUser({
            id: 'admin',
            name: 'Super Admin',
            email: 'admin@sentinel.ai',
            role: UserRole.SUPER_ADMIN,
            avatarUrl: 'https://ui-avatars.com/api/?name=Super+Admin',
            // @ts-ignore
            password: 'password123'
        });
    }
};

seedUsers(); // Fire and forget during init

export const login = async (email: string, password: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    // Quick Fix: Use the DB to find user.
    const users = await db.getUsers() as any[];
    const user = users.find((u: any) => u.email === email);

    if (user && user.password === password) { // Strict check
        const { password, ...safeUser } = user;
        localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
        return safeUser;
    }
    throw new Error('Invalid credentials');
};

export const logout = () => {
    localStorage.removeItem(SESSION_KEY);
};

export const getSession = (): User | null => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
};

export const registerOrganizationRequest = async (
    orgDetails: { name: string; type: OrganizationType; email: string; phone: string; authPerson: string; address: string },
    paymentId: string
): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API

    const orgId = 'org_' + Math.random().toString(36).substr(2, 9);

    const newOrg: Organization = {
        id: orgId,
        name: orgDetails.name,
        type: orgDetails.type,
        email: orgDetails.email,
        phone: orgDetails.phone,
        address: orgDetails.address,
        authPersonName: orgDetails.authPerson,
        status: 'PAID_PENDING_APPROVAL', // Direct to paid pending
        plan: 'ENTERPRISE_YEARLY',
        createdAt: new Date().toISOString(),
        payment: {
            referenceId: paymentId,
            amount: 9999,
            date: new Date().toISOString(),
            status: 'SUCCESS'
        }
    };

    const newAdmin: User = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        name: orgDetails.authPerson,
        email: orgDetails.email,
        role: orgDetails.type === 'COLLEGE' ? UserRole.COLLEGE_ADMIN : UserRole.COMPANY_HR,
        organizationId: orgId,
        avatarUrl: `https://ui-avatars.com/api/?name=${orgDetails.authPerson}`
    };

    // Store in DB
    db.addOrganization(newOrg);
    db.addUser({ ...newAdmin, password: 'password123' } as any); // Default password for new users

    // Log it
    db.addLog({
        actor: 'System (Public)',
        action: 'New Access Request',
        details: `Org: ${newOrg.name} (${newOrg.type}). Payment: ${paymentId}`,
        severity: 'Info'
    });

    return newAdmin; // Return user to auto-login (or we force them to login)
};



