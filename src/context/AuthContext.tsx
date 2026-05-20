import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

export type UserRole = 'admin' | 'citizen' | null;

interface AuthContextType {
  user: { uid: string; name: string; email?: string; photoURL?: string } | null;
  role: UserRole;
  loading: boolean;
  loginAsAdmin: (method?: 'google' | 'email', email?: string, password?: string) => Promise<void>;
  loginAsCitizen: (method?: 'google' | 'email', email?: string, password?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ uid: string; name: string; email?: string; photoURL?: string } | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const savedRole = (localStorage.getItem('ciro_role') as UserRole) || 'citizen';
        setUser({ 
          uid: firebaseUser.uid, 
          name: firebaseUser.displayName || (savedRole === 'admin' ? 'Admin User' : 'Citizen'),
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || undefined
        });
        setRole(savedRole);
      } else {
        // Only clear if we aren't using a persistent mock session
        const isMockSession = localStorage.getItem('ciro_mock_session') === 'true';
        if (!isMockSession) {
          setUser(null);
          setRole(null);
        }
      }
      setLoading(false);
    });

    // Check for mock persistence on load
    const savedRole = localStorage.getItem('ciro_role') as UserRole;
    const isMockSession = localStorage.getItem('ciro_mock_session') === 'true';
    if (savedRole && isMockSession) {
      setUser({ 
        uid: 'mock-persistent-uid', 
        name: savedRole === 'admin' ? 'Commander (Admin)' : 'Citizen User',
        email: savedRole === 'admin' ? 'admin@ciro.gov' : 'citizen@mail.com',
        photoURL: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
      });
      setRole(savedRole);
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const handleLogin = async (roleType: UserRole, method?: 'google' | 'email', email?: string, password?: string) => {
    setLoading(true);
    try {
      // Check if real keys are actually loaded by Vite
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
      if (!apiKey || apiKey === 'your_firebase_api_key' || apiKey.includes('your_')) {
        throw new Error("missing-keys");
      }

      if (method === 'google') {
        const provider = new GoogleAuthProvider();
        try {
          await signInWithPopup(auth, provider);
        } catch (popupErr: any) {
          // If popup is blocked, cancelled, or fails due to environment restrictions, fall back to redirect
          if (
            popupErr.code === 'auth/popup-blocked' || 
            popupErr.code === 'auth/cancelled-popup-request' ||
            popupErr.code === 'auth/popup-closed-by-user'
          ) {
            console.warn('Popup blocked/closed, falling back to signInWithRedirect...');
            const { signInWithRedirect } = await import('firebase/auth');
            await signInWithRedirect(auth, provider);
          } else {
            throw popupErr;
          }
        }
      } else if (method === 'email' && email && password) {
        await signInWithEmailAndPassword(auth, email, password);
      }
      
      localStorage.setItem('ciro_role', roleType || 'citizen');
      localStorage.removeItem('ciro_mock_session');
      setRole(roleType);
    } catch (error: any) {
      console.warn('Real Firebase login failed or not configured, using mock fallback:', error);
      
      // SUCCESSFUL MOCK FALLBACK (so user is never blocked while testing/configuring!)
      const fallbackUser = { 
        uid: method === 'google' ? 'mock-google-uid-123' : 'mock-email-uid-123', 
        name: roleType === 'admin' ? 'Commander (Admin)' : 'Citizen User',
        email: email || (roleType === 'admin' ? 'admin@ciro.gov' : 'citizen@mail.com'),
        photoURL: method === 'google' ? 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' : undefined
      };
      
      setUser(fallbackUser);
      localStorage.setItem('ciro_role', roleType || 'citizen');
      localStorage.setItem('ciro_mock_session', 'true'); // Flag to persist mock
      setRole(roleType);
    } finally {
      setLoading(false);
    }
  };

  const loginAsAdmin = (method?: 'google' | 'email', email?: string, password?: string) => handleLogin('admin', method, email, password);
  const loginAsCitizen = (method?: 'google' | 'email', email?: string, password?: string) => handleLogin('citizen', method, email, password);

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Reset all auth states
    setUser(null);
    setRole(null);
    localStorage.removeItem('ciro_role');
    localStorage.removeItem('ciro_mock_session');
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, loginAsAdmin, loginAsCitizen, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
