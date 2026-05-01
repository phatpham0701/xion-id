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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          block_id: string | null
          created_at: string
          event_type: string
          id: number
          profile_id: string
          referrer: string | null
        }
        Insert: {
          block_id?: string | null
          created_at?: string
          event_type: string
          id?: number
          profile_id: string
          referrer?: string | null
        }
        Update: {
          block_id?: string | null
          created_at?: string
          event_type?: string
          id?: number
          profile_id?: string
          referrer?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blocks: {
        Row: {
          config: Json
          created_at: string
          id: string
          is_visible: boolean
          position: number
          profile_id: string
          type: Database["public"]["Enums"]["block_type"]
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          is_visible?: boolean
          position?: number
          profile_id: string
          type: Database["public"]["Enums"]["block_type"]
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          is_visible?: boolean
          position?: number
          profile_id?: string
          type?: Database["public"]["Enums"]["block_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          is_published: boolean
          settings: Json
          theme: Json
          updated_at: string
          user_id: string
          username: string | null
          wallet_connected_at: string | null
          xion_address: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_published?: boolean
          settings?: Json
          theme?: Json
          updated_at?: string
          user_id: string
          username?: string | null
          wallet_connected_at?: string | null
          xion_address?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_published?: boolean
          settings?: Json
          theme?: Json
          updated_at?: string
          user_id?: string
          username?: string | null
          wallet_connected_at?: string | null
          xion_address?: string | null
        }
        Relationships: []
      }
      tips: {
        Row: {
          amount_uxion: number
          block_height: number | null
          block_id: string | null
          created_at: string
          id: string
          message: string | null
          profile_id: string
          recipient_address: string
          sender_address: string
          tx_hash: string
        }
        Insert: {
          amount_uxion: number
          block_height?: number | null
          block_id?: string | null
          created_at?: string
          id?: string
          message?: string | null
          profile_id: string
          recipient_address: string
          sender_address: string
          tx_hash: string
        }
        Update: {
          amount_uxion?: number
          block_height?: number | null
          block_id?: string | null
          created_at?: string
          id?: string
          message?: string | null
          profile_id?: string
          recipient_address?: string
          sender_address?: string
          tx_hash?: string
        }
        Relationships: []
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
      wallet_badges: {
        Row: {
          id: string
          kind: Database["public"]["Enums"]["badge_kind"]
          metadata: Json
          profile_id: string
          tier: number
          verified_at: string
          xion_address: string
        }
        Insert: {
          id?: string
          kind: Database["public"]["Enums"]["badge_kind"]
          metadata?: Json
          profile_id: string
          tier?: number
          verified_at?: string
          xion_address: string
        }
        Update: {
          id?: string
          kind?: Database["public"]["Enums"]["badge_kind"]
          metadata?: Json
          profile_id?: string
          tier?: number
          verified_at?: string
          xion_address?: string
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
      badge_kind:
        | "og_2024"
        | "og_2025"
        | "nft_collector"
        | "nft_minter"
        | "tipper"
        | "dapp_explorer"
        | "campaign_participant"
        | "contest_winner"
        | "whale"
        | "early_adopter"
      block_type:
        | "link"
        | "heading"
        | "text"
        | "avatar"
        | "social"
        | "wallet"
        | "nft"
        | "token_balance"
        | "image"
        | "video_embed"
        | "music_embed"
        | "tip_jar"
        | "contact_form"
        | "calendar"
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
      badge_kind: [
        "og_2024",
        "og_2025",
        "nft_collector",
        "nft_minter",
        "tipper",
        "dapp_explorer",
        "campaign_participant",
        "contest_winner",
        "whale",
        "early_adopter",
      ],
      block_type: [
        "link",
        "heading",
        "text",
        "avatar",
        "social",
        "wallet",
        "nft",
        "token_balance",
        "image",
        "video_embed",
        "music_embed",
        "tip_jar",
        "contact_form",
        "calendar",
      ],
    },
  },
} as const
