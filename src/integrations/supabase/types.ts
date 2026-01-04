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
      blocked_ips: {
        Row: {
          blocked_until: string | null
          created_at: string | null
          id: string
          ip_address: string
          permanent: boolean | null
          reason: string | null
        }
        Insert: {
          blocked_until?: string | null
          created_at?: string | null
          id?: string
          ip_address: string
          permanent?: boolean | null
          reason?: string | null
        }
        Update: {
          blocked_until?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string
          permanent?: boolean | null
          reason?: string | null
        }
        Relationships: []
      }
      daily_sessions: {
        Row: {
          ai_feedback: string | null
          created_at: string | null
          id: string
          session_date: string | null
          user_id: string
          words_learned_today: number | null
          words_mastered_today: number | null
        }
        Insert: {
          ai_feedback?: string | null
          created_at?: string | null
          id?: string
          session_date?: string | null
          user_id: string
          words_learned_today?: number | null
          words_mastered_today?: number | null
        }
        Update: {
          ai_feedback?: string | null
          created_at?: string | null
          id?: string
          session_date?: string | null
          user_id?: string
          words_learned_today?: number | null
          words_mastered_today?: number | null
        }
        Relationships: []
      }
      files: {
        Row: {
          created_at: string | null
          file_name: string
          file_type: string | null
          file_url: string
          id: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_type?: string | null
          file_url: string
          id?: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_type?: string | null
          file_url?: string
          id?: string
        }
        Relationships: []
      }
      languages: {
        Row: {
          code: string
          created_at: string | null
          flag_emoji: string
          id: string
          name_ar: string
          name_native: string
        }
        Insert: {
          code: string
          created_at?: string | null
          flag_emoji: string
          id?: string
          name_ar: string
          name_native: string
        }
        Update: {
          code?: string
          created_at?: string | null
          flag_emoji?: string
          id?: string
          name_ar?: string
          name_native?: string
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          attempt_type: string | null
          block_reason: string | null
          city: string | null
          country_code: string | null
          country_name: string | null
          created_at: string | null
          email: string | null
          id: string
          ip_address: string
          is_blocked: boolean | null
          is_hosting: boolean | null
          is_proxy: boolean | null
          is_vpn: boolean | null
          success: boolean | null
          user_agent: string | null
        }
        Insert: {
          attempt_type?: string | null
          block_reason?: string | null
          city?: string | null
          country_code?: string | null
          country_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          ip_address: string
          is_blocked?: boolean | null
          is_hosting?: boolean | null
          is_proxy?: boolean | null
          is_vpn?: boolean | null
          success?: boolean | null
          user_agent?: string | null
        }
        Update: {
          attempt_type?: string | null
          block_reason?: string | null
          city?: string | null
          country_code?: string | null
          country_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          ip_address?: string
          is_blocked?: boolean | null
          is_hosting?: boolean | null
          is_proxy?: boolean | null
          is_vpn?: boolean | null
          success?: boolean | null
          user_agent?: string | null
        }
        Relationships: []
      }
      phrases: {
        Row: {
          category: string | null
          created_at: string | null
          difficulty: string | null
          id: string
          language: string | null
          phrase: string
          pronunciation: string | null
          sort_order: number | null
          translation: string
          unit_id: string | null
          word_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          difficulty?: string | null
          id?: string
          language?: string | null
          phrase: string
          pronunciation?: string | null
          sort_order?: number | null
          translation: string
          unit_id?: string | null
          word_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          difficulty?: string | null
          id?: string
          language?: string | null
          phrase?: string
          pronunciation?: string | null
          sort_order?: number | null
          translation?: string
          unit_id?: string | null
          word_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "phrases_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "phrases_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          current_level: string | null
          full_name: string | null
          id: string
          last_active_at: string | null
          total_words_learned: number | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          current_level?: string | null
          full_name?: string | null
          id: string
          last_active_at?: string | null
          total_words_learned?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          current_level?: string | null
          full_name?: string | null
          id?: string
          last_active_at?: string | null
          total_words_learned?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_answer: string
          created_at: string | null
          explanation: string | null
          file_id: string | null
          id: string
          options: Json
          question: string
        }
        Insert: {
          correct_answer: string
          created_at?: string | null
          explanation?: string | null
          file_id?: string | null
          id?: string
          options?: Json
          question: string
        }
        Update: {
          correct_answer?: string
          created_at?: string | null
          explanation?: string | null
          file_id?: string | null
          id?: string
          options?: Json
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_results: {
        Row: {
          completed_at: string | null
          file_id: string | null
          id: string
          score: number
          total_questions: number
        }
        Insert: {
          completed_at?: string | null
          file_id?: string | null
          id?: string
          score?: number
          total_questions?: number
        }
        Update: {
          completed_at?: string | null
          file_id?: string | null
          id?: string
          score?: number
          total_questions?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_results_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
        ]
      }
      study_group_items: {
        Row: {
          created_at: string | null
          group_id: string
          id: string
          phrase_id: string | null
          word_id: string | null
        }
        Insert: {
          created_at?: string | null
          group_id: string
          id?: string
          phrase_id?: string | null
          word_id?: string | null
        }
        Update: {
          created_at?: string | null
          group_id?: string
          id?: string
          phrase_id?: string | null
          word_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_group_items_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_group_items_phrase_id_fkey"
            columns: ["phrase_id"]
            isOneToOne: false
            referencedRelation: "phrases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_group_items_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
        ]
      }
      study_groups: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          language: string | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          language?: string | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          language?: string | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      unit_items: {
        Row: {
          created_at: string
          id: string
          sort_order: number
          unit_id: string
          word_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          sort_order?: number
          unit_id: string
          word_id: string
        }
        Update: {
          created_at?: string
          id?: string
          sort_order?: number
          unit_id?: string
          word_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_items_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_items_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          created_at: string
          description: string | null
          difficulty: string
          icon: string | null
          id: string
          language: string
          name: string
          name_ar: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty?: string
          icon?: string | null
          id?: string
          language?: string
          name: string
          name_ar: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: string
          icon?: string | null
          id?: string
          language?: string
          name?: string
          name_ar?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_language_levels: {
        Row: {
          created_at: string | null
          id: string
          language: string
          level: string
          test_completed_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          language: string
          level?: string
          test_completed_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          language?: string
          level?: string
          test_completed_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_phrase_progress: {
        Row: {
          created_at: string | null
          id: string
          mastery_level: string | null
          next_review_date: string | null
          phrase_id: string
          times_correct: number | null
          times_reviewed: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          mastery_level?: string | null
          next_review_date?: string | null
          phrase_id: string
          times_correct?: number | null
          times_reviewed?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          mastery_level?: string | null
          next_review_date?: string | null
          phrase_id?: string
          times_correct?: number | null
          times_reviewed?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_phrase_progress_phrase_id_fkey"
            columns: ["phrase_id"]
            isOneToOne: false
            referencedRelation: "phrases"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          created_at: string | null
          daily_completed: number | null
          daily_goal: number | null
          id: string
          last_activity_date: string | null
          selected_language: string | null
          streak_days: number | null
          total_xp: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          daily_completed?: number | null
          daily_goal?: number | null
          id?: string
          last_activity_date?: string | null
          selected_language?: string | null
          streak_days?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          daily_completed?: number | null
          daily_goal?: number | null
          id?: string
          last_activity_date?: string | null
          selected_language?: string | null
          streak_days?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          device_type: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          started_at: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          started_at?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string | null
          email: string | null
          expires_at: string | null
          id: string
          is_premium: boolean | null
          platform: string | null
          product_id: string | null
          purchase_token: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          is_premium?: boolean | null
          platform?: string | null
          product_id?: string | null
          purchase_token?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          is_premium?: boolean | null
          platform?: string | null
          product_id?: string | null
          purchase_token?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_word_progress: {
        Row: {
          created_at: string | null
          id: string
          is_deleted: boolean
          mastery_level: string | null
          next_review_date: string | null
          session_id: string | null
          times_correct: number | null
          times_reviewed: number | null
          updated_at: string | null
          user_id: string
          word_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_deleted?: boolean
          mastery_level?: string | null
          next_review_date?: string | null
          session_id?: string | null
          times_correct?: number | null
          times_reviewed?: number | null
          updated_at?: string | null
          user_id: string
          word_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_deleted?: boolean
          mastery_level?: string | null
          next_review_date?: string | null
          session_id?: string | null
          times_correct?: number | null
          times_reviewed?: number | null
          updated_at?: string | null
          user_id?: string
          word_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_word_progress_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "words"
            referencedColumns: ["id"]
          },
        ]
      }
      words: {
        Row: {
          category: string | null
          created_at: string | null
          difficulty: string | null
          id: string
          image_url: string | null
          language: string | null
          meaning: string | null
          pronunciation: string | null
          translation: string
          word: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          difficulty?: string | null
          id?: string
          image_url?: string | null
          language?: string | null
          meaning?: string | null
          pronunciation?: string | null
          translation: string
          word: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          difficulty?: string | null
          id?: string
          image_url?: string | null
          language?: string | null
          meaning?: string | null
          pronunciation?: string | null
          translation?: string
          word?: string
        }
        Relationships: []
      }
      words_audio: {
        Row: {
          audio_url: string
          created_at: string | null
          id: string
          language: string
          provider: string | null
          word: string
        }
        Insert: {
          audio_url: string
          created_at?: string | null
          id?: string
          language?: string
          provider?: string | null
          word: string
        }
        Update: {
          audio_url?: string
          created_at?: string | null
          id?: string
          language?: string
          provider?: string | null
          word?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
