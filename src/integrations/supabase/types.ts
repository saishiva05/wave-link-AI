export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ats_analyses: {
        Row: {
          analysis_id: string
          analysis_result: Json
          analyzed_at: string
          ats_score: number
          cv_id: string
          job_id: string
          recruiter_id: string
          webhook_response_time_ms: number | null
        }
        Insert: {
          analysis_id?: string
          analysis_result?: Json
          analyzed_at?: string
          ats_score: number
          cv_id: string
          job_id: string
          recruiter_id: string
          webhook_response_time_ms?: number | null
        }
        Update: {
          analysis_id?: string
          analysis_result?: Json
          analyzed_at?: string
          ats_score?: number
          cv_id?: string
          job_id?: string
          recruiter_id?: string
          webhook_response_time_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ats_analyses_cv_id_fkey"
            columns: ["cv_id"]
            isOneToOne: false
            referencedRelation: "cvs"
            referencedColumns: ["cv_id"]
          },
          {
            foreignKeyName: "ats_analyses_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scraped_jobs"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "ats_analyses_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "recruiters"
            referencedColumns: ["recruiter_id"]
          },
        ]
      }
      candidates: {
        Row: {
          assigned_recruiter_id: string
          candidate_id: string
          created_at: string
          created_by_recruiter_id: string
          current_job_title: string | null
          current_location: string | null
          experience_years: number | null
          phone: string | null
          skills: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_recruiter_id: string
          candidate_id?: string
          created_at?: string
          created_by_recruiter_id: string
          current_job_title?: string | null
          current_location?: string | null
          experience_years?: number | null
          phone?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_recruiter_id?: string
          candidate_id?: string
          created_at?: string
          created_by_recruiter_id?: string
          current_job_title?: string | null
          current_location?: string | null
          experience_years?: number | null
          phone?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidates_assigned_recruiter_id_fkey"
            columns: ["assigned_recruiter_id"]
            isOneToOne: false
            referencedRelation: "recruiters"
            referencedColumns: ["recruiter_id"]
          },
          {
            foreignKeyName: "candidates_created_by_recruiter_id_fkey"
            columns: ["created_by_recruiter_id"]
            isOneToOne: false
            referencedRelation: "recruiters"
            referencedColumns: ["recruiter_id"]
          },
          {
            foreignKeyName: "candidates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      cvs: {
        Row: {
          candidate_id: string
          cv_id: string
          file_name: string
          file_size_bytes: number | null
          file_type: string | null
          file_url: string
          is_primary: boolean
          last_used_for_ats_at: string | null
          recruiter_id: string
          uploaded_at: string
        }
        Insert: {
          candidate_id: string
          cv_id?: string
          file_name: string
          file_size_bytes?: number | null
          file_type?: string | null
          file_url: string
          is_primary?: boolean
          last_used_for_ats_at?: string | null
          recruiter_id: string
          uploaded_at?: string
        }
        Update: {
          candidate_id?: string
          cv_id?: string
          file_name?: string
          file_size_bytes?: number | null
          file_type?: string | null
          file_url?: string
          is_primary?: boolean
          last_used_for_ats_at?: string | null
          recruiter_id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cvs_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["candidate_id"]
          },
          {
            foreignKeyName: "cvs_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "recruiters"
            referencedColumns: ["recruiter_id"]
          },
        ]
      }
      generated_emails: {
        Row: {
          body: string
          created_at: string
          email_id: string
          job_id: string
          recruiter_id: string
          subject: string
          webhook_response: Json | null
          webhook_response_time_ms: number | null
        }
        Insert: {
          body: string
          created_at?: string
          email_id?: string
          job_id: string
          recruiter_id: string
          subject: string
          webhook_response?: Json | null
          webhook_response_time_ms?: number | null
        }
        Update: {
          body?: string
          created_at?: string
          email_id?: string
          job_id?: string
          recruiter_id?: string
          subject?: string
          webhook_response?: Json | null
          webhook_response_time_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_emails_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scraped_jobs"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "generated_emails_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "recruiters"
            referencedColumns: ["recruiter_id"]
          },
        ]
      }
      job_applications: {
        Row: {
          application_id: string
          application_status: Database["public"]["Enums"]["application_status"]
          applied_at: string
          ats_analysis_id: string | null
          candidate_id: string
          cv_id: string
          external_application_id: string | null
          job_id: string
          recruiter_id: string
          recruiter_notes: string | null
          status_updated_at: string
        }
        Insert: {
          application_id?: string
          application_status?: Database["public"]["Enums"]["application_status"]
          applied_at?: string
          ats_analysis_id?: string | null
          candidate_id: string
          cv_id: string
          external_application_id?: string | null
          job_id: string
          recruiter_id: string
          recruiter_notes?: string | null
          status_updated_at?: string
        }
        Update: {
          application_id?: string
          application_status?: Database["public"]["Enums"]["application_status"]
          applied_at?: string
          ats_analysis_id?: string | null
          candidate_id?: string
          cv_id?: string
          external_application_id?: string | null
          job_id?: string
          recruiter_id?: string
          recruiter_notes?: string | null
          status_updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_ats_analysis_id_fkey"
            columns: ["ats_analysis_id"]
            isOneToOne: false
            referencedRelation: "ats_analyses"
            referencedColumns: ["analysis_id"]
          },
          {
            foreignKeyName: "job_applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["candidate_id"]
          },
          {
            foreignKeyName: "job_applications_cv_id_fkey"
            columns: ["cv_id"]
            isOneToOne: false
            referencedRelation: "cvs"
            referencedColumns: ["cv_id"]
          },
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scraped_jobs"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_applications_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "recruiters"
            referencedColumns: ["recruiter_id"]
          },
        ]
      }
      recruiters: {
        Row: {
          company_name: string | null
          company_website: string | null
          created_at: string
          created_by_admin_id: string
          phone: string | null
          recruiter_id: string
          total_candidates_managed: number
          total_jobs_scraped: number
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name?: string | null
          company_website?: string | null
          created_at?: string
          created_by_admin_id: string
          phone?: string | null
          recruiter_id?: string
          total_candidates_managed?: number
          total_jobs_scraped?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string | null
          company_website?: string | null
          created_at?: string
          created_by_admin_id?: string
          phone?: string | null
          recruiter_id?: string
          total_candidates_managed?: number
          total_jobs_scraped?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recruiters_created_by_admin_id_fkey"
            columns: ["created_by_admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "recruiters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      scraped_jobs: {
        Row: {
          company_name: string
          contract_type: string | null
          experience_level: string | null
          external_job_id: string | null
          is_active: boolean
          job_apply_url: string
          job_description: string
          job_id: string
          job_title: string
          location: string
          platform_type: Database["public"]["Enums"]["platform_type"]
          published_date: string | null
          recruiter_id: string
          salary_range: string | null
          scrape_filters_used: Json
          scraped_at: string
          work_type: string | null
        }
        Insert: {
          company_name: string
          contract_type?: string | null
          experience_level?: string | null
          external_job_id?: string | null
          is_active?: boolean
          job_apply_url: string
          job_description: string
          job_id?: string
          job_title: string
          location: string
          platform_type: Database["public"]["Enums"]["platform_type"]
          published_date?: string | null
          recruiter_id: string
          salary_range?: string | null
          scrape_filters_used?: Json
          scraped_at?: string
          work_type?: string | null
        }
        Update: {
          company_name?: string
          contract_type?: string | null
          experience_level?: string | null
          external_job_id?: string | null
          is_active?: boolean
          job_apply_url?: string
          job_description?: string
          job_id?: string
          job_title?: string
          location?: string
          platform_type?: Database["public"]["Enums"]["platform_type"]
          published_date?: string | null
          recruiter_id?: string
          salary_range?: string | null
          scrape_filters_used?: Json
          scraped_at?: string
          work_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scraped_jobs_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "recruiters"
            referencedColumns: ["recruiter_id"]
          },
        ]
      }
      updated_cvs: {
        Row: {
          ats_analysis_id: string | null
          candidate_id: string
          created_at: string
          cv_id: string
          job_id: string
          original_file_name: string
          recruiter_id: string
          updated_cv_id: string
          updated_file_name: string
          updated_file_size_bytes: number | null
          updated_file_url: string
          webhook_response: Json | null
          webhook_response_time_ms: number | null
        }
        Insert: {
          ats_analysis_id?: string | null
          candidate_id: string
          created_at?: string
          cv_id: string
          job_id: string
          original_file_name: string
          recruiter_id: string
          updated_cv_id?: string
          updated_file_name: string
          updated_file_size_bytes?: number | null
          updated_file_url: string
          webhook_response?: Json | null
          webhook_response_time_ms?: number | null
        }
        Update: {
          ats_analysis_id?: string | null
          candidate_id?: string
          created_at?: string
          cv_id?: string
          job_id?: string
          original_file_name?: string
          recruiter_id?: string
          updated_cv_id?: string
          updated_file_name?: string
          updated_file_size_bytes?: number | null
          updated_file_url?: string
          webhook_response?: Json | null
          webhook_response_time_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "updated_cvs_ats_analysis_id_fkey"
            columns: ["ats_analysis_id"]
            isOneToOne: false
            referencedRelation: "ats_analyses"
            referencedColumns: ["analysis_id"]
          },
          {
            foreignKeyName: "updated_cvs_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["candidate_id"]
          },
          {
            foreignKeyName: "updated_cvs_cv_id_fkey"
            columns: ["cv_id"]
            isOneToOne: false
            referencedRelation: "cvs"
            referencedColumns: ["cv_id"]
          },
          {
            foreignKeyName: "updated_cvs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scraped_jobs"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "updated_cvs_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "recruiters"
            referencedColumns: ["recruiter_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          full_name: string
          is_active: boolean
          last_login_at: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          is_active?: boolean
          last_login_at?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          is_active?: boolean
          last_login_at?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_candidate_id: { Args: { _user_id: string }; Returns: string }
      get_recruiter_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "recruiter" | "candidate"
      application_status:
        | "pending"
        | "submitted"
        | "rejected"
        | "interview_scheduled"
        | "interviewed"
        | "offer_received"
        | "hired"
        | "declined"
      platform_type: "linkedin" | "jsearch"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "recruiter", "candidate"],
      application_status: [
        "pending",
        "submitted",
        "rejected",
        "interview_scheduled",
        "interviewed",
        "offer_received",
        "hired",
        "declined",
      ],
      platform_type: ["linkedin", "jsearch"],
    },
  },
} as const
