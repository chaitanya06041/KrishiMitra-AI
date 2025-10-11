// components/AuthProvider.tsx
"use client";

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { createClient } from '@/lib/supabase/client';
import { setUser, clearUser } from '@/store/features/userSlice';
import { AppDispatch } from '@/store/store';

// This component will wrap our app and listen for auth changes.
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // 1. Check for an active session with Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (session?.user) {
          // 2. If a session exists, fetch the corresponding profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (profileError) throw profileError;

          // 3. Dispatch the setUser action to rehydrate the Redux store
          dispatch(setUser({
            user_id: session.user.id,
            email: session.user.email!,
            ...profileData
          }));
        } else {
            // If no session, ensure the user state is cleared
            dispatch(clearUser());
        }
      } catch (error) {
        console.error("Error checking auth session:", error);
        dispatch(clearUser()); // Clear user on error
      } finally {
        setLoading(false); // Stop loading once the check is complete
      }
    };
    
    checkSession();

    // Optional: You can also listen for auth state changes (e.g., token refreshed, user logs out in another tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (_event === 'SIGNED_OUT') {
            dispatch(clearUser());
        } else if (session?.user && _event !== 'USER_UPDATED') {
            // This part is optional but good for real-time updates.
            // You might want to re-fetch the profile here as well.
        }
    });

    // Cleanup subscription on component unmount
    return () => {
        subscription.unsubscribe();
    };

  }, [dispatch, supabase]);
  
  // Optional: Render a loading spinner while the session is being verified
  if (loading) {
    return <div>Loading session...</div>; // Or a proper spinner component
  }

  return <>{children}</>;
}