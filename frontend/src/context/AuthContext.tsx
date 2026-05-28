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
    // In a real app, we would fetch the user from the backend session
    // For now, we'll check if there's a session or a cookie
    const fetchUser = async () => {
      try {
        // Mocking an API call to get current user
        // const response = await fetch('/api/v1/auth/me');
        // if (response.ok) {
        //   const data = await response.json();
        //   setUser(data);
        // }
        
        // Simulating no user initially
        setUser(null);
      } catch (error) {
        console.error("Failed to fetch user", error);
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
