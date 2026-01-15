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
      assessment_questions: {
        Row: {
          assessment_id: string
          correct_answer: string
          created_at: string | null
          explanation: string | null
          explanation_ar: string | null
          id: string
          instruction_ar: string | null
          instruction_en: string | null
          options: Json | null
          points: number | null
          question_number: number
          question_text: string
          question_text_ar: string | null
          question_type: string
          section: string | null
          sort_order: number | null
        }
        Insert: {
          assessment_id: string
          correct_answer: string
          created_at?: string | null
          explanation?: string | null
          explanation_ar?: string | null
          id?: string
          instruction_ar?: string | null
          instruction_en?: string | null
          options?: Json | null
          points?: number | null
          question_number: number
          question_text: string
          question_text_ar?: string | null
          question_type: string
          section?: string | null
          sort_order?: number | null
        }
        Update: {
          assessment_id?: string
          correct_answer?: string
          created_at?: string | null
          explanation?: string | null
          explanation_ar?: string | null
          id?: string
          instruction_ar?: string | null
          instruction_en?: string | null
          options?: Json | null
          points?: number | null
          question_number?: number
          question_text?: string
          question_text_ar?: string | null
          question_type?: string
          section?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_questions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "level_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_lines: {
        Row: {
          audio_url: string | null
          conversation_id: string
          created_at: string | null
          id: string
          line_ar: string
          line_en: string
          line_order: number
          speaker: string
          speaker_gender: string
        }
        Insert: {
          audio_url?: string | null
          conversation_id: string
          created_at?: string | null
          id?: string
          line_ar: string
          line_en: string
          line_order: number
          speaker: string
          speaker_gender?: string
        }
        Update: {
          audio_url?: string | null
          conversation_id?: string
          created_at?: string | null
          id?: string
          line_ar?: string
          line_en?: string
          line_order?: number
          speaker?: string
          speaker_gender?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_lines_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_vocabulary: {
        Row: {
          conversation_id: string
          created_at: string | null
          definition_en: string | null
          example_sentence: string | null
          id: string
          word_ar: string
          word_en: string
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          definition_en?: string | null
          example_sentence?: string | null
          id?: string
          word_ar: string
          word_en: string
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          definition_en?: string | null
          example_sentence?: string | null
          id?: string
          word_ar?: string
          word_en?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_vocabulary_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          category: string
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          difficulty: string
          id: string
          is_active: boolean | null
          sort_order: number | null
          speakers_gender: string
          title_ar: string
          title_en: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          difficulty?: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          speakers_gender?: string
          title_ar: string
          title_en: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          difficulty?: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          speakers_gender?: string
          title_ar?: string
          title_en?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      lesson_exercises: {
        Row: {
          correct_answer: string
          created_at: string | null
          exercise_number: number
          exercise_type: string
          explanation_ar: string | null
          explanation_en: string | null
          id: string
          instruction_ar: string | null
          instruction_en: string | null
          lesson_number: number
          options: Json
          points: number | null
          pronunciation: string | null
          question: string
          sort_order: number | null
          unit_id: string
          updated_at: string | null
          word_ar: string | null
          word_en: string | null
        }
        Insert: {
          correct_answer: string
          created_at?: string | null
          exercise_number: number
          exercise_type: string
          explanation_ar?: string | null
          explanation_en?: string | null
          id?: string
          instruction_ar?: string | null
          instruction_en?: string | null
          lesson_number: number
          options?: Json
          points?: number | null
          pronunciation?: string | null
          question: string
          sort_order?: number | null
          unit_id: string
          updated_at?: string | null
          word_ar?: string | null
          word_en?: string | null
        }
        Update: {
          correct_answer?: string
          created_at?: string | null
          exercise_number?: number
          exercise_type?: string
          explanation_ar?: string | null
          explanation_en?: string | null
          id?: string
          instruction_ar?: string | null
          instruction_en?: string | null
          lesson_number?: number
          options?: Json
          points?: number | null
          pronunciation?: string | null
          question?: string
          sort_order?: number | null
          unit_id?: string
          updated_at?: string | null
          word_ar?: string | null
          word_en?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_exercises_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      level_assessments: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: string
          id: string
          is_active: boolean | null
          passing_score: number | null
          time_limit_minutes: number | null
          title: string
          title_ar: string
          total_questions: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty: string
          id?: string
          is_active?: boolean | null
          passing_score?: number | null
          time_limit_minutes?: number | null
          title: string
          title_ar: string
          total_questions?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: string
          id?: string
          is_active?: boolean | null
          passing_score?: number | null
          time_limit_minutes?: number | null
          title?: string
          title_ar?: string
          total_questions?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          ip_address: string
          success: boolean | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          ip_address: string
          success?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          ip_address?: string
          success?: boolean | null
        }
        Relationships: []
      }
      phrases: {
        Row: {
          audio_url: string | null
          category: string | null
          created_at: string | null
          difficulty: string
          id: string
          phrase_ar: string
          phrase_en: string
          pronunciation: string | null
        }
        Insert: {
          audio_url?: string | null
          category?: string | null
          created_at?: string | null
          difficulty?: string
          id?: string
          phrase_ar: string
          phrase_en: string
          pronunciation?: string | null
        }
        Update: {
          audio_url?: string | null
          category?: string | null
          created_at?: string | null
          difficulty?: string
          id?: string
          phrase_ar?: string
          phrase_en?: string
          pronunciation?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          current_level: string | null
          current_unit: number | null
          full_name: string | null
          id: string
          total_xp: number | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          current_level?: string | null
          current_unit?: number | null
          full_name?: string | null
          id: string
          total_xp?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          current_level?: string | null
          current_unit?: number | null
          full_name?: string | null
          id?: string
          total_xp?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      units: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: string
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          name_ar: string
          total_lessons: number | null
          unit_number: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          name_ar: string
          total_lessons?: number | null
          unit_number: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_ar?: string
          total_lessons?: number | null
          unit_number?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      user_assessment_results: {
        Row: {
          answers: Json | null
          assessment_id: string
          completed_at: string | null
          id: string
          passed: boolean
          percentage: number
          score: number
          time_taken_seconds: number | null
          total_questions: number
          user_id: string
        }
        Insert: {
          answers?: Json | null
          assessment_id: string
          completed_at?: string | null
          id?: string
          passed: boolean
          percentage: number
          score: number
          time_taken_seconds?: number | null
          total_questions: number
          user_id: string
        }
        Update: {
          answers?: Json | null
          assessment_id?: string
          completed_at?: string | null
          id?: string
          passed?: boolean
          percentage?: number
          score?: number
          time_taken_seconds?: number | null
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_assessment_results_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "level_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_conversation_progress: {
        Row: {
          completed: boolean | null
          conversation_id: string
          created_at: string | null
          id: string
          practiced_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          conversation_id: string
          created_at?: string | null
          id?: string
          practiced_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          conversation_id?: string
          created_at?: string | null
          id?: string
          practiced_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_conversation_progress_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_exercise_progress: {
        Row: {
          attempts: number | null
          completed_at: string | null
          created_at: string | null
          exercise_id: string
          id: string
          is_completed: boolean | null
          is_correct: boolean | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          attempts?: number | null
          completed_at?: string | null
          created_at?: string | null
          exercise_id: string
          id?: string
          is_completed?: boolean | null
          is_correct?: boolean | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          attempts?: number | null
          completed_at?: string | null
          created_at?: string | null
          exercise_id?: string
          id?: string
          is_completed?: boolean | null
          is_correct?: boolean | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_exercise_progress_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "lesson_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      user_phrase_progress: {
        Row: {
          created_at: string | null
          id: string
          is_deleted: boolean | null
          last_practiced_at: string | null
          mastery_level: number | null
          phrase_id: string | null
          times_practiced: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          last_practiced_at?: string | null
          mastery_level?: number | null
          phrase_id?: string | null
          times_practiced?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          last_practiced_at?: string | null
          mastery_level?: number | null
          phrase_id?: string | null
          times_practiced?: number | null
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
          current_lesson: number | null
          current_unit: number | null
          daily_completed: number | null
          daily_goal: number | null
          id: string
          last_activity_date: string | null
          streak_days: number | null
          total_xp: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_lesson?: number | null
          current_unit?: number | null
          daily_completed?: number | null
          daily_goal?: number | null
          id?: string
          last_activity_date?: string | null
          streak_days?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_lesson?: number | null
          current_unit?: number | null
          daily_completed?: number | null
          daily_goal?: number | null
          id?: string
          last_activity_date?: string | null
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
      user_word_progress: {
        Row: {
          created_at: string | null
          id: string
          is_deleted: boolean | null
          last_practiced_at: string | null
          mastery_level: number | null
          times_practiced: number | null
          user_id: string
          word_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          last_practiced_at?: string | null
          mastery_level?: number | null
          times_practiced?: number | null
          user_id: string
          word_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          last_practiced_at?: string | null
          mastery_level?: number | null
          times_practiced?: number | null
          user_id?: string
          word_id?: string | null
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
          audio_url: string | null
          category: string | null
          created_at: string | null
          difficulty: string
          example_sentence: string | null
          id: string
          image_url: string | null
          pronunciation: string | null
          word_ar: string
          word_en: string
        }
        Insert: {
          audio_url?: string | null
          category?: string | null
          created_at?: string | null
          difficulty?: string
          example_sentence?: string | null
          id?: string
          image_url?: string | null
          pronunciation?: string | null
          word_ar: string
          word_en: string
        }
        Update: {
          audio_url?: string | null
          category?: string | null
          created_at?: string | null
          difficulty?: string
          example_sentence?: string | null
          id?: string
          image_url?: string | null
          pronunciation?: string | null
          word_ar?: string
          word_en?: string
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
