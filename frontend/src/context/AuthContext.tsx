import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  enterGuestMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if the user is authenticated via the backend
    const fetchUser = async () => {
      try {
        // Pointing to the arqulat_auth service
        const authApiUrl = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8080';
        const response = await fetch(`${authApiUrl}/api/v1/user/me`, {
          credentials: 'include' // Important for session cookies
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser({
            id: data.id,
            email: data.email,
            name: data.name,
            picture: '' // Auth response might not have picture yet
          });
          setIsGuest(false);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = () => {
    // Redirect to the arqulat_auth OAuth2 endpoint
    const authApiUrl = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8080';
    window.location.href = `${authApiUrl}/oauth2/authorization/google`;
  };

  const logout = async () => {
    // If guest, just reset guest status
    if (isGuest) {
      setIsGuest(false);
      return;
    }
    
    try {
      // Call arqulat_auth logout endpoint to blacklist token and clear cookie
      const authApiUrl = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8080';
      await fetch(`${authApiUrl}/api/v1/user/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (e) {
      console.error("Logout failed", e);
    }
    
    // Redirect to home or force reload
    window.location.href = '/';
  };

  const enterGuestMode = () => {
    setIsGuest(true);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isGuest,
      isLoading, 
      login, 
      logout,
      enterGuestMode
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
