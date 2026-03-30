import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id_auth', userId)
        .maybeSingle(); 
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  };

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id).then(profile => {
          setUser({ ...session.user, ...profile });
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // 2. Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth Event:", event, !!session);
      setSession(session);
      
      if (session) {
        // Refresh profile on sign in or metadata update
        if (!user || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          setLoading(true);
          try {
            const profile = await fetchProfile(session.user.id);
            setUser({ ...session.user, ...profile });
          } catch (err) {
            console.error("Auth profile fetch error:", err);
          } finally {
            setLoading(false);
          }
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const value = { 
    user, 
    session, 
    logout, 
    loading, 
    isAdmin: user?.role === 'admin' 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
