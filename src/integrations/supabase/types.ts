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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      availability_blocks: {
        Row: {
          created_at: string
          end_date: string
          external_uid: string | null
          id: string
          reason: string | null
          source: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          external_uid?: string | null
          id?: string
          reason?: string | null
          source?: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          external_uid?: string | null
          id?: string
          reason?: string | null
          source?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          adults: number
          balance_due: number | null
          channel: string
          channel_commission: number
          check_in: string
          check_out: string
          children: number
          created_at: string
          deposit_paid: number
          extras: Json
          fds_amount: number | null
          fds_min_per_night: number | null
          fds_share_pct: number | null
          guest_email: string | null
          guest_name: string
          guest_phone: string | null
          host_amount: number
          host_id: string | null
          id: string
          is_personal_use: boolean
          net_accommodation: number | null
          notes: string | null
          owner_cap_per_night: number | null
          pipeline_stage: Database["public"]["Enums"]["pipeline_stage"]
          price_per_night: number
          room_amount: number | null
          source: string
          status: Database["public"]["Enums"]["booking_status"]
          total_nights: number
          total_price: number
        }
        Insert: {
          adults?: number
          balance_due?: number | null
          channel?: string
          channel_commission?: number
          check_in: string
          check_out: string
          children?: number
          created_at?: string
          deposit_paid?: number
          extras?: Json
          fds_amount?: number | null
          fds_min_per_night?: number | null
          fds_share_pct?: number | null
          guest_email?: string | null
          guest_name: string
          guest_phone?: string | null
          host_amount?: number
          host_id?: string | null
          id?: string
          is_personal_use?: boolean
          net_accommodation?: number | null
          notes?: string | null
          owner_cap_per_night?: number | null
          pipeline_stage?: Database["public"]["Enums"]["pipeline_stage"]
          price_per_night?: number
          room_amount?: number | null
          source?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_nights?: number
          total_price?: number
        }
        Update: {
          adults?: number
          balance_due?: number | null
          channel?: string
          channel_commission?: number
          check_in?: string
          check_out?: string
          children?: number
          created_at?: string
          deposit_paid?: number
          extras?: Json
          fds_amount?: number | null
          fds_min_per_night?: number | null
          fds_share_pct?: number | null
          guest_email?: string | null
          guest_name?: string
          guest_phone?: string | null
          host_amount?: number
          host_id?: string | null
          id?: string
          is_personal_use?: boolean
          net_accommodation?: number | null
          notes?: string | null
          owner_cap_per_night?: number | null
          pipeline_stage?: Database["public"]["Enums"]["pipeline_stage"]
          price_per_night?: number
          room_amount?: number | null
          source?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_nights?: number
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "bookings_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "hosts"
            referencedColumns: ["id"]
          },
        ]
      }
      data_backups: {
        Row: {
          created_at: string
          id: string
          label: string
          row_count: number
          rows: Json
          table_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          row_count: number
          rows: Json
          table_name: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          row_count?: number
          rows?: Json
          table_name?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          booking_id: string
          created_at: string
          file_type: string | null
          file_url: string
          id: string
          name: string
          uploaded_by: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          file_type?: string | null
          file_url: string
          id?: string
          name: string
          uploaded_by?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          file_type?: string | null
          file_url?: string
          id?: string
          name?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          amount_eur: number | null
          category: string
          created_at: string
          currency: string
          date: string
          id: string
          note: string | null
          paid_by: string | null
          period_month: string | null
        }
        Insert: {
          amount: number
          amount_eur?: number | null
          category: string
          created_at?: string
          currency?: string
          date?: string
          id?: string
          note?: string | null
          paid_by?: string | null
          period_month?: string | null
        }
        Update: {
          amount?: number
          amount_eur?: number | null
          category?: string
          created_at?: string
          currency?: string
          date?: string
          id?: string
          note?: string | null
          paid_by?: string | null
          period_month?: string | null
        }
        Relationships: []
      }
      guests: {
        Row: {
          created_at: string
          email: string | null
          id: string
          last_stay: string | null
          name: string
          nationality: string | null
          notes: string | null
          phone: string | null
          total_stays: number
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          last_stay?: string | null
          name: string
          nationality?: string | null
          notes?: string | null
          phone?: string | null
          total_stays?: number
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          last_stay?: string | null
          name?: string
          nationality?: string | null
          notes?: string | null
          phone?: string | null
          total_stays?: number
        }
        Relationships: []
      }
      hosts: {
        Row: {
          apartment_number: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          total_owed: number
        }
        Insert: {
          apartment_number?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          total_owed?: number
        }
        Update: {
          apartment_number?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          total_owed?: number
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          adults: number
          check_in: string | null
          check_out: string | null
          children: number
          consent_marketing: boolean
          consent_privacy: boolean
          created_at: string
          extras: Json
          guest_email: string | null
          guest_name: string
          guest_phone: string | null
          id: string
          landing_page: string | null
          last_contact_at: string | null
          lost_reason: string | null
          message: string | null
          next_follow_up_at: string | null
          referrer: string | null
          source_url: string | null
          status: Database["public"]["Enums"]["inquiry_status"]
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          adults?: number
          check_in?: string | null
          check_out?: string | null
          children?: number
          consent_marketing?: boolean
          consent_privacy?: boolean
          created_at?: string
          extras?: Json
          guest_email?: string | null
          guest_name: string
          guest_phone?: string | null
          id?: string
          landing_page?: string | null
          last_contact_at?: string | null
          lost_reason?: string | null
          message?: string | null
          next_follow_up_at?: string | null
          referrer?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          adults?: number
          check_in?: string | null
          check_out?: string | null
          children?: number
          consent_marketing?: boolean
          consent_privacy?: boolean
          created_at?: string
          extras?: Json
          guest_email?: string | null
          guest_name?: string
          guest_phone?: string | null
          id?: string
          landing_page?: string | null
          last_contact_at?: string | null
          lost_reason?: string | null
          message?: string | null
          next_follow_up_at?: string | null
          referrer?: string | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          booking_ical_url: string | null
          fds_min_per_night: number | null
          fds_share_pct: number
          ical_token: string
          id: number
          last_sync_attempt_at: string | null
          last_sync_error: string | null
          last_sync_success_at: string | null
          meta_pixel_id: string | null
          owner_cap_per_night: number | null
          owner_name: string | null
          updated_at: string
        }
        Insert: {
          booking_ical_url?: string | null
          fds_min_per_night?: number | null
          fds_share_pct?: number
          ical_token?: string
          id?: number
          last_sync_attempt_at?: string | null
          last_sync_error?: string | null
          last_sync_success_at?: string | null
          meta_pixel_id?: string | null
          owner_cap_per_night?: number | null
          owner_name?: string | null
          updated_at?: string
        }
        Update: {
          booking_ical_url?: string | null
          fds_min_per_night?: number | null
          fds_share_pct?: number
          ical_token?: string
          id?: number
          last_sync_attempt_at?: string | null
          last_sync_error?: string | null
          last_sync_success_at?: string | null
          meta_pixel_id?: string | null
          owner_cap_per_night?: number | null
          owner_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_occupied_ranges: {
        Args: never
        Returns: {
          check_in: string
          check_out: string
        }[]
      }
      get_public_settings: {
        Args: never
        Returns: {
          meta_pixel_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      ical_export_ranges: {
        Args: { _token: string }
        Returns: {
          end_date: string
          start_date: string
          uid: string
        }[]
      }
    }
    Enums: {
      app_role: "admin"
      booking_status:
        | "pending"
        | "confirmed"
        | "cancelled"
        | "personal"
        | "host_collab"
        | "option"
      inquiry_status: "new" | "contacted" | "converted" | "lost"
      pipeline_stage:
        | "lead"
        | "quoted"
        | "follow_up"
        | "confirmed"
        | "pre_stay"
        | "staying"
        | "post_stay"
        | "loyal"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin"],
      booking_status: [
        "pending",
        "confirmed",
        "cancelled",
        "personal",
        "host_collab",
        "option",
      ],
      inquiry_status: ["new", "contacted", "converted", "lost"],
      pipeline_stage: [
        "lead",
        "quoted",
        "follow_up",
        "confirmed",
        "pre_stay",
        "staying",
        "post_stay",
        "loyal",
      ],
    },
  },
} as const
