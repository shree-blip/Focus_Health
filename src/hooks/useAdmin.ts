import { useEffect, useState, useRef, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';

export const useAdmin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const checkingRef = useRef(false);

  const checkAdminStatus = useCallback(async () => {
    if (checkingRef.current) return;
    checkingRef.current = true;

    try {
      const response = await fetch('/api/admin/session', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const payload = (await response.json()) as { isAdmin: boolean; email?: string };

      if (payload.isAdmin) {
        setUser(
          {
            id: 'admin-session',
            email: payload.email || 'info@getfocushealth.com',
          } as User,
        );
        setIsAdmin(true);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
      checkingRef.current = false;
    }
  }, []);

  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  return { user, isAdmin, loading };
};
