import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserSession, UserCredential, UserRole } from '../types';
import { INITIAL_CREDENTIALS } from '../data/initialData';

interface AuthContextType {
  currentUser: UserSession | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserSession | null>>;
  effectiveUser: UserSession | null;
  effectiveRole: UserRole | undefined;
  simulatedRole: UserRole | null;
  setSimulatedRole: (role: UserRole | null) => void;
  credentials: UserCredential[];
  setCredentials: React.Dispatch<React.SetStateAction<UserCredential[]>>;
  login: (session: UserSession) => void;
  logout: () => void;
  tambahCredential: (cred: UserCredential) => void;
  hapusCredential: (id: string) => void;
  updateCredential: (cred: UserCredential) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{
  children: ReactNode;
  initialCredentials?: UserCredential[];
}> = ({ children, initialCredentials = INITIAL_CREDENTIALS }) => {
  const [credentials, setCredentials] = useState<UserCredential[]>(initialCredentials);
  const [simulatedRole, setSimulatedRole] = useState<UserRole | null>(null);

  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    if (typeof window !== 'undefined') {
      const savedSession = sessionStorage.getItem('gasemraya_auth');
      if (savedSession) {
        try {
          return JSON.parse(savedSession);
        } catch (e) {
          console.error('Failed to parse saved session:', e);
        }
      }
    }
    return null;
  });

  // Effective user & role considering developer impersonation
  const effectiveUser: UserSession | null = currentUser
    ? currentUser.role === 'developer' && simulatedRole
      ? { ...currentUser, role: simulatedRole }
      : currentUser
    : null;

  const effectiveRole: UserRole | undefined = effectiveUser?.role;

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('gasemraya_auth', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('gasemraya_auth');
      setSimulatedRole(null);
    }
  }, [currentUser]);

  const login = (session: UserSession) => {
    setCurrentUser(session);
    setSimulatedRole(null);
    sessionStorage.setItem('gasemraya_auth', JSON.stringify(session));
  };

  const logout = () => {
    if (typeof window !== 'undefined' && window.confirm('Apakah Anda yakin ingin keluar dari sistem Gasem Raya RT 02?')) {
      setCurrentUser(null);
      setSimulatedRole(null);
      sessionStorage.removeItem('gasemraya_auth');
      localStorage.removeItem('gasemraya_auth');
    }
  };

  const tambahCredential = (cred: UserCredential) => {
    setCredentials(prev => [...prev, cred]);
  };

  const hapusCredential = (id: string) => {
    setCredentials(prev => prev.filter(c => c.id !== id));
  };

  const updateCredential = (cred: UserCredential) => {
    setCredentials(prev => prev.map(c => (c.id === cred.id ? cred : c)));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        effectiveUser,
        effectiveRole,
        simulatedRole,
        setSimulatedRole,
        credentials,
        setCredentials,
        login,
        logout,
        tambahCredential,
        hapusCredential,
        updateCredential,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
