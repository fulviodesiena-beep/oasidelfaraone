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
          room_id: string
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
          room_id?: string
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
          room_id?: string
          source?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_blocks_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          adults: number
          arrival_time: string | null
          balance_due: number | null
          channel: string
          channel_commission: number
          check_in: string
          check_out: string
          children: number
          confirmed_at: string | null
          contact_id: string | null
          created_at: string
          delegate_email: string | null
          delegate_phone: string | null
          departure_time: string | null
          deposit_paid: number
          extras: Json
          fds_amount: number | null
          fds_min_per_night: number | null
          fds_share_pct: number | null
          final_cleaning: boolean
          guest_email: string | null
          guest_name: string
          guest_phone: string | null
          host_amount: number
          host_id: string | null
          id: string
          initial_cleaning: boolean
          is_personal_use: boolean
          net_accommodation: number | null
          notes: string | null
          option_expires_at: string | null
          ota_closed_at: string | null
          owner_cap_per_night: number | null
          payment_verified_at: string | null
          pipeline_stage: Database["public"]["Enums"]["pipeline_stage"]
          price_per_night: number
          room_amount: number | null
          room_id: string
          source: string
          status: Database["public"]["Enums"]["booking_status"]
          total_nights: number
          total_price: number
        }
        Insert: {
          adults?: number
          arrival_time?: string | null
          balance_due?: number | null
          channel?: string
          channel_commission?: number
          check_in: string
          check_out: string
          children?: number
          confirmed_at?: string | null
          contact_id?: string | null
          created_at?: string
          delegate_email?: string | null
          delegate_phone?: string | null
          departure_time?: string | null
          deposit_paid?: number
          extras?: Json
          fds_amount?: number | null
          fds_min_per_night?: number | null
          fds_share_pct?: number | null
          final_cleaning?: boolean
          guest_email?: string | null
          guest_name: string
          guest_phone?: string | null
          host_amount?: number
          host_id?: string | null
          id?: string
          initial_cleaning?: boolean
          is_personal_use?: boolean
          net_accommodation?: number | null
          notes?: string | null
          option_expires_at?: string | null
          ota_closed_at?: string | null
          owner_cap_per_night?: number | null
          payment_verified_at?: string | null
          pipeline_stage?: Database["public"]["Enums"]["pipeline_stage"]
          price_per_night?: number
          room_amount?: number | null
          room_id?: string
          source?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_nights?: number
          total_price?: number
        }
        Update: {
          adults?: number
          arrival_time?: string | null
          balance_due?: number | null
          channel?: string
          channel_commission?: number
          check_in?: string
          check_out?: string
          children?: number
          confirmed_at?: string | null
          contact_id?: string | null
          created_at?: string
          delegate_email?: string | null
          delegate_phone?: string | null
          departure_time?: string | null
          deposit_paid?: number
          extras?: Json
          fds_amount?: number | null
          fds_min_per_night?: number | null
          fds_share_pct?: number | null
          final_cleaning?: boolean
          guest_email?: string | null
          guest_name?: string
          guest_phone?: string | null
          host_amount?: number
          host_id?: string | null
          id?: string
          initial_cleaning?: boolean
          is_personal_use?: boolean
          net_accommodation?: number | null
          notes?: string | null
          option_expires_at?: string | null
          ota_closed_at?: string | null
          owner_cap_per_night?: number | null
          payment_verified_at?: string | null
          pipeline_stage?: Database["public"]["Enums"]["pipeline_stage"]
          price_per_night?: number
          room_amount?: number | null
          room_id?: string
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
          {
            foreignKeyName: "bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          brevo_synced_at: string | null
          city: string | null
          consent_marketing: boolean
          consent_marketing_at: string | null
          consent_marketing_source: string | null
          consent_occasions: boolean
          consent_occasions_at: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          language: string | null
          last_name: string | null
          nationality: string | null
          newsletter_confirmed_at: string | null
          newsletter_ip: string | null
          newsletter_requested_at: string | null
          newsletter_status: string
          notes: string | null
          phone: string | null
          source: string
          status: string
          tags: string[]
          unsubscribed_at: string | null
          updated_at: string
        }
        Insert: {
          brevo_synced_at?: string | null
          city?: string | null
          consent_marketing?: boolean
          consent_marketing_at?: string | null
          consent_marketing_source?: string | null
          consent_occasions?: boolean
          consent_occasions_at?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          language?: string | null
          last_name?: string | null
          nationality?: string | null
          newsletter_confirmed_at?: string | null
          newsletter_ip?: string | null
          newsletter_requested_at?: string | null
          newsletter_status?: string
          notes?: string | null
          phone?: string | null
          source?: string
          status?: string
          tags?: string[]
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          brevo_synced_at?: string | null
          city?: string | null
          consent_marketing?: boolean
          consent_marketing_at?: string | null
          consent_marketing_source?: string | null
          consent_occasions?: boolean
          consent_occasions_at?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          language?: string | null
          last_name?: string | null
          nationality?: string | null
          newsletter_confirmed_at?: string | null
          newsletter_ip?: string | null
          newsletter_requested_at?: string | null
          newsletter_status?: string
          notes?: string | null
          phone?: string | null
          source?: string
          status?: string
          tags?: string[]
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Relationships: []
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
          fingerprint: string | null
          id: string
          kind: string | null
          name: string
          uploaded_by: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          file_type?: string | null
          file_url: string
          fingerprint?: string | null
          id?: string
          kind?: string | null
          name: string
          uploaded_by?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          file_type?: string | null
          file_url?: string
          fingerprint?: string | null
          id?: string
          kind?: string | null
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
      email_log: {
        Row: {
          automation: string
          body: string | null
          booking_id: string | null
          channel: string
          clicked_at: string | null
          contact_id: string | null
          created_at: string
          dedup_key: string | null
          id: string
          inquiry_id: string | null
          language: string
          provider_message_id: string | null
          reason: string | null
          recipient: string | null
          sent_at: string | null
          status: string
          step: string
          subject: string | null
        }
        Insert: {
          automation: string
          body?: string | null
          booking_id?: string | null
          channel: string
          clicked_at?: string | null
          contact_id?: string | null
          created_at?: string
          dedup_key?: string | null
          id?: string
          inquiry_id?: string | null
          language?: string
          provider_message_id?: string | null
          reason?: string | null
          recipient?: string | null
          sent_at?: string | null
          status?: string
          step?: string
          subject?: string | null
        }
        Update: {
          automation?: string
          body?: string | null
          booking_id?: string | null
          channel?: string
          clicked_at?: string | null
          contact_id?: string | null
          created_at?: string
          dedup_key?: string | null
          id?: string
          inquiry_id?: string | null
          language?: string
          provider_message_id?: string | null
          reason?: string | null
          recipient?: string | null
          sent_at?: string | null
          status?: string
          step?: string
          subject?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amortize_months: number
          amount: number
          amount_eur: number | null
          category: string
          created_at: string
          currency: string
          date: string
          fx_date: string | null
          fx_rate: number | null
          id: string
          note: string | null
          paid_by: string | null
          period_month: string | null
        }
        Insert: {
          amortize_months?: number
          amount: number
          amount_eur?: number | null
          category: string
          created_at?: string
          currency?: string
          date?: string
          fx_date?: string | null
          fx_rate?: number | null
          id?: string
          note?: string | null
          paid_by?: string | null
          period_month?: string | null
        }
        Update: {
          amortize_months?: number
          amount?: number
          amount_eur?: number | null
          category?: string
          created_at?: string
          currency?: string
          date?: string
          fx_date?: string | null
          fx_rate?: number | null
          id?: string
          note?: string | null
          paid_by?: string | null
          period_month?: string | null
        }
        Relationships: []
      }
      guests: {
        Row: {
          contact_id: string | null
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
          contact_id?: string | null
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
          contact_id?: string | null
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
          consent_occasions: boolean
          consent_privacy: boolean
          contact_id: string | null
          created_at: string
          extras: Json
          guest_email: string | null
          guest_name: string
          guest_phone: string | null
          id: string
          landing_page: string | null
          language: string | null
          last_contact_at: string | null
          lost_reason: string | null
          message: string | null
          next_follow_up_at: string | null
          referrer: string | null
          room_id: string | null
          source_url: string | null
          special_dates: string | null
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
          consent_occasions?: boolean
          consent_privacy?: boolean
          contact_id?: string | null
          created_at?: string
          extras?: Json
          guest_email?: string | null
          guest_name: string
          guest_phone?: string | null
          id?: string
          landing_page?: string | null
          language?: string | null
          last_contact_at?: string | null
          lost_reason?: string | null
          message?: string | null
          next_follow_up_at?: string | null
          referrer?: string | null
          room_id?: string | null
          source_url?: string | null
          special_dates?: string | null
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
          consent_occasions?: boolean
          consent_privacy?: boolean
          contact_id?: string | null
          created_at?: string
          extras?: Json
          guest_email?: string | null
          guest_name?: string
          guest_phone?: string | null
          id?: string
          landing_page?: string | null
          language?: string | null
          last_contact_at?: string | null
          lost_reason?: string | null
          message?: string | null
          next_follow_up_at?: string | null
          referrer?: string | null
          room_id?: string | null
          source_url?: string | null
          special_dates?: string | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_issues: {
        Row: {
          approved_at: string | null
          blocks: Json
          brevo_campaign_id: number | null
          created_at: string
          id: string
          number: number
          preheader: string
          scheduled_at: string | null
          stats: Json | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          blocks?: Json
          brevo_campaign_id?: number | null
          created_at?: string
          id?: string
          number: number
          preheader?: string
          scheduled_at?: string | null
          stats?: Json | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          blocks?: Json
          brevo_campaign_id?: number | null
          created_at?: string
          id?: string
          number?: number
          preheader?: string
          scheduled_at?: string | null
          stats?: Json | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      occasions: {
        Row: {
          contact_id: string | null
          created_at: string
          day: number
          id: string
          kind: string
          month: number
          note: string | null
          source: string
          traveler_id: string | null
          year: number | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          day: number
          id?: string
          kind: string
          month: number
          note?: string | null
          source?: string
          traveler_id?: string | null
          year?: number | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          day?: number
          id?: string
          kind?: string
          month?: number
          note?: string | null
          source?: string
          traveler_id?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "occasions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occasions_traveler_id_fkey"
            columns: ["traveler_id"]
            isOneToOne: false
            referencedRelation: "travelers"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          active: boolean
          amenities: string[]
          booking_ical_url: string | null
          created_at: string
          holder_name: string | null
          holder_passport: string | null
          ical_token: string
          id: string
          max_guests: number
          name: string
          ritual: string | null
          size_sqm: number | null
          slug: string
          sort_order: number
          story: string | null
          symbol: string | null
          unit_number: string | null
          zone: string | null
        }
        Insert: {
          active?: boolean
          amenities?: string[]
          booking_ical_url?: string | null
          created_at?: string
          holder_name?: string | null
          holder_passport?: string | null
          ical_token?: string
          id?: string
          max_guests?: number
          name: string
          ritual?: string | null
          size_sqm?: number | null
          slug: string
          sort_order?: number
          story?: string | null
          symbol?: string | null
          unit_number?: string | null
          zone?: string | null
        }
        Update: {
          active?: boolean
          amenities?: string[]
          booking_ical_url?: string | null
          created_at?: string
          holder_name?: string | null
          holder_passport?: string | null
          ical_token?: string
          id?: string
          max_guests?: number
          name?: string
          ritual?: string | null
          size_sqm?: number | null
          slug?: string
          sort_order?: number
          story?: string | null
          symbol?: string | null
          unit_number?: string | null
          zone?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          automations: Json
          booking_ical_url: string | null
          brevo_list_id: number | null
          domina_email: string
          facebook_url: string | null
          fds_min_per_night: number | null
          fds_share_pct: number
          holder_name: string
          holder_passport: string
          holder_phone: string
          ical_token: string
          id: number
          instagram_url: string | null
          last_sync_attempt_at: string | null
          last_sync_error: string | null
          last_sync_success_at: string | null
          meta_pixel_id: string | null
          newsletter_guide_url: string | null
          owner_cap_per_night: number | null
          owner_name: string | null
          review_url: string | null
          template_overrides: Json
          unit_number: string
          updated_at: string
        }
        Insert: {
          automations?: Json
          booking_ical_url?: string | null
          brevo_list_id?: number | null
          domina_email?: string
          facebook_url?: string | null
          fds_min_per_night?: number | null
          fds_share_pct?: number
          holder_name?: string
          holder_passport?: string
          holder_phone?: string
          ical_token?: string
          id?: number
          instagram_url?: string | null
          last_sync_attempt_at?: string | null
          last_sync_error?: string | null
          last_sync_success_at?: string | null
          meta_pixel_id?: string | null
          newsletter_guide_url?: string | null
          owner_cap_per_night?: number | null
          owner_name?: string | null
          review_url?: string | null
          template_overrides?: Json
          unit_number?: string
          updated_at?: string
        }
        Update: {
          automations?: Json
          booking_ical_url?: string | null
          brevo_list_id?: number | null
          domina_email?: string
          facebook_url?: string | null
          fds_min_per_night?: number | null
          fds_share_pct?: number
          holder_name?: string
          holder_passport?: string
          holder_phone?: string
          ical_token?: string
          id?: number
          instagram_url?: string | null
          last_sync_attempt_at?: string | null
          last_sync_error?: string | null
          last_sync_success_at?: string | null
          meta_pixel_id?: string | null
          newsletter_guide_url?: string | null
          owner_cap_per_night?: number | null
          owner_name?: string | null
          review_url?: string | null
          template_overrides?: Json
          unit_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      travelers: {
        Row: {
          birth_date: string | null
          booking_id: string
          contact_id: string | null
          created_at: string
          document_number: string | null
          document_type: string
          first_name: string
          id: string
          last_name: string
          nationality: string | null
          position: number
        }
        Insert: {
          birth_date?: string | null
          booking_id: string
          contact_id?: string | null
          created_at?: string
          document_number?: string | null
          document_type?: string
          first_name: string
          id?: string
          last_name: string
          nationality?: string | null
          position?: number
        }
        Update: {
          birth_date?: string | null
          booking_id?: string
          contact_id?: string | null
          created_at?: string
          document_number?: string | null
          document_type?: string
          first_name?: string
          id?: string
          last_name?: string
          nationality?: string | null
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "travelers_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "travelers_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
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
      get_room_occupied_ranges: {
        Args: { _room: string }
        Returns: {
          check_in: string
          check_out: string
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
      normalize_phone: { Args: { _p: string }; Returns: string }
      release_expired_options: { Args: never; Returns: number }
      upsert_contact: {
        Args: {
          _email: string
          _marketing?: boolean
          _name: string
          _occasions?: boolean
          _phone: string
          _source: string
          _status: string
        }
        Returns: string
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
