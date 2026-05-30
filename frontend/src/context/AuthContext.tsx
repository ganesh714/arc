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
        const response = await fetch('http://localhost:8080/api/v1/auth/me', {
          credentials: 'include' // Important for session cookies
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data);
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
    // Redirect to the backend OAuth2 endpoint
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const logout = () => {
    // If guest, just reset guest status
    if (isGuest) {
      setIsGuest(false);
      return;
    }
    // Redirect to the backend logout endpoint
    window.location.href = 'http://localhost:8080/logout';
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
