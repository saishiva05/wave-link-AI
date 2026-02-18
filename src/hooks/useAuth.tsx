import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type AppRole = "admin" | "recruiter" | "candidate";

interface UserProfile {
  user_id: string;
  email: string;
  full_name: string;
  phone: string | null;
  is_active: boolean;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: AppRole | null;
  recruiterId: string | null;
  candidateId: string | null;
  fullName: string | null;
  email: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null; role: AppRole | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [recruiterId, setRecruiterId] = useState<string | null>(null);
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserContext = useCallback(async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (roleData) {
        setRole(roleData.role as AppRole);
      }

      // Fetch recruiter_id if recruiter
      if (roleData?.role === "recruiter") {
        const { data: recruiterData } = await supabase
          .from("recruiters")
          .select("recruiter_id")
          .eq("user_id", userId)
          .single();
        if (recruiterData) {
          setRecruiterId(recruiterData.recruiter_id);
        }
      }

      // Fetch candidate_id if candidate
      if (roleData?.role === "candidate") {
        const { data: candidateData } = await supabase
          .from("candidates")
          .select("candidate_id")
          .eq("user_id", userId)
          .single();
        if (candidateData) {
          setCandidateId(candidateData.candidate_id);
        }
      }

      // Update last_login_at
      await supabase
        .from("users")
        .update({ last_login_at: new Date().toISOString() })
        .eq("user_id", userId);

      return roleData?.role as AppRole | null;
    } catch (err) {
      console.error("Error fetching user context:", err);
      return null;
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          // Use setTimeout to avoid Supabase deadlock
          setTimeout(() => {
            fetchUserContext(newSession.user.id);
          }, 0);
        } else {
          setProfile(null);
          setRole(null);
          setRecruiterId(null);
          setCandidateId(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      if (existingSession?.user) {
        fetchUserContext(existingSession.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserContext]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: error.message, role: null };
    }
    if (data.user) {
      const userRole = await fetchUserContext(data.user.id);
      return { error: null, role: userRole };
    }
    return { error: "Unknown error", role: null };
  }, [fetchUserContext]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
    setRecruiterId(null);
    setCandidateId(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error?.message ?? null };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        recruiterId,
        candidateId,
        fullName: profile?.full_name ?? null,
        email: profile?.email ?? null,
        isLoading,
        signIn,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
