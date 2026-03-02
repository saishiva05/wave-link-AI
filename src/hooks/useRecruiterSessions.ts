import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Tracks recruiter login/logout sessions.
 * Creates a session on mount, updates logged_out_at on unmount/tab close.
 */
export function useRecruiterSessionTracking() {
  const { recruiterId, user, role } = useAuth();
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (role !== "recruiter" || !recruiterId || !user) return;

    let mounted = true;

    const createSession = async () => {
      const { data, error } = await supabase
        .from("recruiter_sessions")
        .insert({
          recruiter_id: recruiterId,
          user_id: user.id,
          logged_in_at: new Date().toISOString(),
        })
        .select("session_id")
        .single();

      if (!error && data && mounted) {
        sessionIdRef.current = data.session_id;
      }
    };

    createSession();

    const endSession = () => {
      if (sessionIdRef.current) {
        // Use navigator.sendBeacon for tab close reliability
        const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/recruiter_sessions?session_id=eq.${sessionIdRef.current}`;
        const body = JSON.stringify({ logged_out_at: new Date().toISOString() });
        navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
        // Also try normal update
        supabase
          .from("recruiter_sessions")
          .update({ logged_out_at: new Date().toISOString() })
          .eq("session_id", sessionIdRef.current)
          .then(() => {});
      }
    };

    window.addEventListener("beforeunload", endSession);

    return () => {
      mounted = false;
      window.removeEventListener("beforeunload", endSession);
      endSession();
    };
  }, [recruiterId, user, role]);
}
