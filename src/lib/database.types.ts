export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            care_categories: {
                Row: {
                    id: string
                    key: string
                    label: string
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    key: string
                    label: string
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    key?: string
                    label?: string
                    is_active?: boolean
                    created_at?: string
                }
            }
            care_sessions: {
                Row: {
                    id: string
                    store_id: string
                    store_sku_id: string | null
                    care_category_id: string
                    session_token: string | null
                    receipt_id: string | null
                    token_expires_at: string
                    planted_at: string
                    window_days: number
                    zip: string | null
                    in_ground: boolean | null
                    sun_exposure: 'full_sun' | 'part_sun' | 'shade' | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    store_id: string
                    store_sku_id?: string | null
                    care_category_id: string
                    session_token?: string | null
                    receipt_id?: string | null
                    token_expires_at?: string
                    planted_at?: string
                    window_days?: number
                    zip?: string | null
                    in_ground?: boolean | null
                    sun_exposure?: 'full_sun' | 'part_sun' | 'shade' | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    store_id?: string
                    store_sku_id?: string | null
                    care_category_id?: string
                    session_token?: string | null
                    receipt_id?: string | null
                    token_expires_at?: string
                    planted_at?: string
                    window_days?: number
                    zip?: string | null
                    in_ground?: boolean | null
                    sun_exposure?: 'full_sun' | 'part_sun' | 'shade' | null
                    created_at?: string
                    updated_at?: string
                }
            }
            care_events: {
                Row: {
                    id: string
                    session_id: string
                    event_type: string
                    event_at: string
                    metadata: Json
                }
                Insert: {
                    id?: string
                    session_id: string
                    event_type: string
                    event_at?: string
                    metadata?: Json
                }
                Update: {
                    id?: string
                    session_id?: string
                    event_type?: string
                    event_at?: string
                    metadata?: Json
                }
            }
            stores: {
                Row: {
                    id: string
                    name: string
                    timezone: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    timezone?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    timezone?: string
                    created_at?: string
                }
            }
            store_skus: {
                Row: {
                    id: string
                    store_id: string
                    sku: string
                    display_name: string | null
                    care_category_id: string
                    default_variant: Json | null
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    store_id: string
                    sku: string
                    display_name?: string | null
                    care_category_id: string
                    default_variant?: Json | null
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    store_id?: string
                    sku?: string
                    display_name?: string | null
                    care_category_id?: string
                    default_variant?: Json | null
                    is_active?: boolean
                    created_at?: string
                }
            }
            user_stats: {
                Row: {
                    device_id: string
                    xp: number
                    level: number
                    streak_days: number
                    last_active_date: string | null
                    badges: Json
                }
                Insert: {
                    device_id: string
                    xp?: number
                    level?: number
                    streak_days?: number
                    last_active_date?: string | null
                    badges?: Json
                }
                Update: {
                    device_id?: string
                    xp?: number
                    level?: number
                    streak_days?: number
                    last_active_date?: string | null
                    badges?: Json
                }
            }
            user_insights: {
                Row: {
                    id: string
                    receipt_id: string
                    created_at: string
                    intent: string | null
                    plant_name: string | null
                    sentiment: string | null
                    verified_issue: boolean | null
                }
                Insert: {
                    id?: string
                    receipt_id: string
                    created_at?: string
                    intent?: string | null
                    plant_name?: string | null
                    sentiment?: string | null
                    verified_issue?: boolean | null
                }
                Update: {
                    id?: string
                    receipt_id?: string
                    created_at?: string
                    intent?: string | null
                    plant_name?: string | null
                    sentiment?: string | null
                    verified_issue?: boolean | null
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
