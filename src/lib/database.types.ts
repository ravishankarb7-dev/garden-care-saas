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
                    session_token: string
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
                    session_token?: string
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
                    session_token?: string
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
