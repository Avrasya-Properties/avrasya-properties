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
      activities: {
        Row: {
          created_at: string
          id: string
          kind: string
          metadata: Json
          ref_id: string | null
          ref_kind: string | null
          text: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          metadata?: Json
          ref_id?: string | null
          ref_kind?: string | null
          text: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          metadata?: Json
          ref_id?: string | null
          ref_kind?: string | null
          text?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      amenities: {
        Row: {
          category: string
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      audit_events: {
        Row: {
          action: string
          actor_id: string | null
          actor_role: string | null
          created_at: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          target_id: string | null
          target_table: string
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          target_id?: string | null
          target_table: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          target_id?: string | null
          target_table?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["property_availability"]
          offer_id: string | null
          old_status:
            | Database["public"]["Enums"]["property_availability"]
            | null
          physical_unit_id: string | null
          reason: string | null
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: Database["public"]["Enums"]["property_availability"]
          offer_id?: string | null
          old_status?:
            | Database["public"]["Enums"]["property_availability"]
            | null
          physical_unit_id?: string | null
          reason?: string | null
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["property_availability"]
          offer_id?: string | null
          old_status?:
            | Database["public"]["Enums"]["property_availability"]
            | null
          physical_unit_id?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "availability_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_history_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "marketing_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_history_physical_unit_id_fkey"
            columns: ["physical_unit_id"]
            isOneToOne: false
            referencedRelation: "physical_units"
            referencedColumns: ["id"]
          },
        ]
      }
      buildings: {
        Row: {
          building_code: string | null
          created_at: string
          id: string
          metadata: Json
          name: string
          project_id: string
          total_floors: number | null
          updated_at: string
        }
        Insert: {
          building_code?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          project_id: string
          total_floors?: number | null
          updated_at?: string
        }
        Update: {
          building_code?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          project_id?: string
          total_floors?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "buildings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_requirements: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          cbi_required: boolean
          contact_id: string
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          districts: string[]
          id: string
          layouts: string[]
          notes: string | null
          property_types: string[]
          side: string | null
          timeline: string | null
          updated_at: string
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          cbi_required?: boolean
          contact_id: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          districts?: string[]
          id?: string
          layouts?: string[]
          notes?: string | null
          property_types?: string[]
          side?: string | null
          timeline?: string | null
          updated_at?: string
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          cbi_required?: boolean
          contact_id?: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          districts?: string[]
          id?: string
          layouts?: string[]
          notes?: string | null
          property_types?: string[]
          side?: string | null
          timeline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "buyer_requirements_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_documents: {
        Row: {
          created_at: string
          disclaimer: string | null
          edition: string | null
          file_size: number | null
          id: string
          is_published: boolean
          page_count: number | null
          storage_path: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          disclaimer?: string | null
          edition?: string | null
          file_size?: number | null
          id?: string
          is_published?: boolean
          page_count?: number | null
          storage_path: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          disclaimer?: string | null
          edition?: string | null
          file_size?: number | null
          id?: string
          is_published?: boolean
          page_count?: number | null
          storage_path?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      commission_allocations: {
        Row: {
          agent_id: string
          calculated_amount: number
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          deal_id: string
          id: string
          notes: string | null
          percentage: number
          role_in_deal: string
          status: string
        }
        Insert: {
          agent_id: string
          calculated_amount: number
          created_at?: string
          currency: Database["public"]["Enums"]["currency_code"]
          deal_id: string
          id?: string
          notes?: string | null
          percentage: number
          role_in_deal: string
          status?: string
        }
        Update: {
          agent_id?: string
          calculated_amount?: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          deal_id?: string
          id?: string
          notes?: string | null
          percentage?: number
          role_in_deal?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_allocations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_allocations_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_merges: {
        Row: {
          created_at: string
          id: string
          merge_reason: string
          merged_by: string
          snapshot: Json
          source_contact_id: string
          target_contact_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          merge_reason: string
          merged_by: string
          snapshot: Json
          source_contact_id: string
          target_contact_id: string
        }
        Update: {
          created_at?: string
          id?: string
          merge_reason?: string
          merged_by?: string
          snapshot?: Json
          source_contact_id?: string
          target_contact_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_merges_merged_by_fkey"
            columns: ["merged_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_merges_target_contact_id_fkey"
            columns: ["target_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_shortlists: {
        Row: {
          contact_id: string
          created_at: string
          id: string
          notes: string | null
          offer_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          id?: string
          notes?: string | null
          offer_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          offer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_shortlists_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_shortlists_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "marketing_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          assigned_agent_id: string | null
          company_name: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          kind: Database["public"]["Enums"]["contact_kind"]
          language: string
          name: string
          notes: string
          phone: string | null
          roles: string[]
          secondary_phone: string | null
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          assigned_agent_id?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["contact_kind"]
          language?: string
          name: string
          notes?: string
          phone?: string | null
          roles?: string[]
          secondary_phone?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          assigned_agent_id?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["contact_kind"]
          language?: string
          name?: string
          notes?: string
          phone?: string | null
          roles?: string[]
          secondary_phone?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_pages: {
        Row: {
          created_at: string
          id: string
          meta_description: string | null
          published_status: Database["public"]["Enums"]["publication_status"]
          published_version: number
          slug: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          meta_description?: string | null
          published_status?: Database["public"]["Enums"]["publication_status"]
          published_version?: number
          slug: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          meta_description?: string | null
          published_status?: Database["public"]["Enums"]["publication_status"]
          published_version?: number
          slug?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_pages_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_sections: {
        Row: {
          content_json: Json
          id: string
          page_id: string
          section_key: string
          sort_order: number
          title: string | null
          updated_at: string
        }
        Insert: {
          content_json?: Json
          id?: string
          page_id: string
          section_key: string
          sort_order?: number
          title?: string | null
          updated_at?: string
        }
        Update: {
          content_json?: Json
          id?: string
          page_id?: string
          section_key?: string
          sort_order?: number
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_sections_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "content_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_selected_units: {
        Row: {
          agreed_price: number | null
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          deal_id: string
          id: string
          notes: string | null
          offer_id: string | null
          physical_unit_id: string | null
        }
        Insert: {
          agreed_price?: number | null
          created_at?: string
          currency: Database["public"]["Enums"]["currency_code"]
          deal_id: string
          id?: string
          notes?: string | null
          offer_id?: string | null
          physical_unit_id?: string | null
        }
        Update: {
          agreed_price?: number | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          deal_id?: string
          id?: string
          notes?: string | null
          offer_id?: string | null
          physical_unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_selected_units_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_selected_units_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "marketing_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deal_selected_units_physical_unit_id_fkey"
            columns: ["physical_unit_id"]
            isOneToOne: false
            referencedRelation: "physical_units"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          actual_close_date: string | null
          assigned_agent_id: string
          contact_id: string
          created_at: string
          created_by: string | null
          currency: Database["public"]["Enums"]["currency_code"]
          expected_close_date: string | null
          id: string
          lead_id: string | null
          loss_reason: string | null
          notes: string | null
          stage: Database["public"]["Enums"]["deal_stage"]
          title: string
          total_amount: number | null
          updated_at: string
          version: number
        }
        Insert: {
          actual_close_date?: string | null
          assigned_agent_id: string
          contact_id: string
          created_at?: string
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"]
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          loss_reason?: string | null
          notes?: string | null
          stage?: Database["public"]["Enums"]["deal_stage"]
          title: string
          total_amount?: number | null
          updated_at?: string
          version?: number
        }
        Update: {
          actual_close_date?: string | null
          assigned_agent_id?: string
          contact_id?: string
          created_at?: string
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"]
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          loss_reason?: string | null
          notes?: string | null
          stage?: Database["public"]["Enums"]["deal_stage"]
          title?: string
          total_amount?: number | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "deals_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      developers: {
        Row: {
          contact_info: Json
          created_at: string
          id: string
          metadata: Json
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          contact_info?: Json
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          contact_info?: Json
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      document_checklists: {
        Row: {
          created_at: string
          deal_id: string
          document_type: string
          id: string
          notes: string | null
          status: string
          storage_path: string | null
          title: string
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          deal_id: string
          document_type: string
          id?: string
          notes?: string | null
          status?: string
          storage_path?: string | null
          title: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          deal_id?: string
          document_type?: string
          id?: string
          notes?: string | null
          status?: string
          storage_path?: string | null
          title?: string
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_checklists_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_checklists_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enquiries: {
        Row: {
          budget: string | null
          campaign_params: Json
          contact_id: string | null
          created_at: string
          email: string
          id: string
          idempotency_key: string | null
          ip_hash: string | null
          lead_id: string | null
          message: string
          name: string
          notes: string | null
          offer_id: string | null
          phone: string
          property_slug: string | null
          raw_budget_text: string | null
          ref_number: string
          source: string
          status: string
          topic: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          budget?: string | null
          campaign_params?: Json
          contact_id?: string | null
          created_at?: string
          email: string
          id?: string
          idempotency_key?: string | null
          ip_hash?: string | null
          lead_id?: string | null
          message: string
          name: string
          notes?: string | null
          offer_id?: string | null
          phone: string
          property_slug?: string | null
          raw_budget_text?: string | null
          ref_number: string
          source: string
          status?: string
          topic: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          budget?: string | null
          campaign_params?: Json
          contact_id?: string | null
          created_at?: string
          email?: string
          id?: string
          idempotency_key?: string | null
          ip_hash?: string | null
          lead_id?: string | null
          message?: string
          name?: string
          notes?: string | null
          offer_id?: string | null
          phone?: string
          property_slug?: string | null
          raw_budget_text?: string | null
          ref_number?: string
          source?: string
          status?: string
          topic?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enquiries_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enquiries_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "marketing_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_enquiries_lead"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      extraction_candidates: {
        Row: {
          candidate_type: string
          confidence: number | null
          created_at: string
          extraction_method: string
          id: string
          normalized_payload: Json
          raw_payload: Json
          review_notes: string | null
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          source_file_id: string | null
        }
        Insert: {
          candidate_type: string
          confidence?: number | null
          created_at?: string
          extraction_method: string
          id?: string
          normalized_payload: Json
          raw_payload: Json
          review_notes?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_file_id?: string | null
        }
        Update: {
          candidate_type?: string
          confidence?: number | null
          created_at?: string
          extraction_method?: string
          id?: string
          normalized_payload?: Json
          raw_payload?: Json
          review_notes?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_file_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "extraction_candidates_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extraction_candidates_source_file_id_fkey"
            columns: ["source_file_id"]
            isOneToOne: false
            referencedRelation: "source_files"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          category: string
          id: string
          is_published: boolean
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string
          id?: string
          is_published?: boolean
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string
          id?: string
          is_published?: boolean
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      import_runs: {
        Row: {
          completed_at: string | null
          failed_sources: number
          id: string
          imported_sources: number
          initiated_by: string | null
          log_messages: Json
          run_type: Database["public"]["Enums"]["import_run_type"]
          started_at: string
          status: Database["public"]["Enums"]["import_run_status"]
          total_sources: number
        }
        Insert: {
          completed_at?: string | null
          failed_sources?: number
          id?: string
          imported_sources?: number
          initiated_by?: string | null
          log_messages?: Json
          run_type?: Database["public"]["Enums"]["import_run_type"]
          started_at?: string
          status?: Database["public"]["Enums"]["import_run_status"]
          total_sources?: number
        }
        Update: {
          completed_at?: string | null
          failed_sources?: number
          id?: string
          imported_sources?: number
          initiated_by?: string | null
          log_messages?: Json
          run_type?: Database["public"]["Enums"]["import_run_type"]
          started_at?: string
          status?: Database["public"]["Enums"]["import_run_status"]
          total_sources?: number
        }
        Relationships: [
          {
            foreignKeyName: "import_runs_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      instalment_schedules: {
        Row: {
          amount: number
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          due_date: string | null
          due_month_offset: number | null
          id: string
          installment_no: number
          notes: string | null
          pricing_option_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency: Database["public"]["Enums"]["currency_code"]
          due_date?: string | null
          due_month_offset?: number | null
          id?: string
          installment_no: number
          notes?: string | null
          pricing_option_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          due_date?: string | null
          due_month_offset?: number | null
          id?: string
          installment_no?: number
          notes?: string | null
          pricing_option_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "instalment_schedules_pricing_option_id_fkey"
            columns: ["pricing_option_id"]
            isOneToOne: false
            referencedRelation: "pricing_options"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_agent_id: string | null
          budget_max: number | null
          budget_min: number | null
          contact_id: string
          created_at: string
          created_by: string | null
          currency: Database["public"]["Enums"]["currency_code"]
          deal_id: string | null
          districts: string
          enquiry_id: string | null
          id: string
          layout: string
          loss_reason: string | null
          next_follow_up: string | null
          shortlist: string[]
          source: string
          stage: Database["public"]["Enums"]["lead_stage"]
          updated_at: string
        }
        Insert: {
          assigned_agent_id?: string | null
          budget_max?: number | null
          budget_min?: number | null
          contact_id: string
          created_at?: string
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"]
          deal_id?: string | null
          districts?: string
          enquiry_id?: string | null
          id?: string
          layout?: string
          loss_reason?: string | null
          next_follow_up?: string | null
          shortlist?: string[]
          source?: string
          stage?: Database["public"]["Enums"]["lead_stage"]
          updated_at?: string
        }
        Update: {
          assigned_agent_id?: string | null
          budget_max?: number | null
          budget_min?: number | null
          contact_id?: string
          created_at?: string
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"]
          deal_id?: string | null
          districts?: string
          enquiry_id?: string | null
          id?: string
          layout?: string
          loss_reason?: string | null
          next_follow_up?: string | null
          shortlist?: string[]
          source?: string
          stage?: Database["public"]["Enums"]["lead_stage"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_enquiry_id_fkey"
            columns: ["enquiry_id"]
            isOneToOne: false
            referencedRelation: "enquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      leases: {
        Row: {
          agent_id: string
          created_at: string
          created_by: string | null
          deposit_amount: number
          deposit_currency: Database["public"]["Enums"]["currency_code"]
          end_date: string
          id: string
          landlord_contact_id: string
          offer_id: string | null
          payment_due_day: number
          payment_frequency: string
          physical_unit_id: string
          rent_amount: number
          rent_currency: Database["public"]["Enums"]["currency_code"]
          start_date: string
          status: Database["public"]["Enums"]["lease_status"]
          tenant_contact_id: string
          terms: string | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          created_by?: string | null
          deposit_amount?: number
          deposit_currency: Database["public"]["Enums"]["currency_code"]
          end_date: string
          id?: string
          landlord_contact_id: string
          offer_id?: string | null
          payment_due_day?: number
          payment_frequency?: string
          physical_unit_id: string
          rent_amount: number
          rent_currency: Database["public"]["Enums"]["currency_code"]
          start_date: string
          status?: Database["public"]["Enums"]["lease_status"]
          tenant_contact_id: string
          terms?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          created_by?: string | null
          deposit_amount?: number
          deposit_currency?: Database["public"]["Enums"]["currency_code"]
          end_date?: string
          id?: string
          landlord_contact_id?: string
          offer_id?: string | null
          payment_due_day?: number
          payment_frequency?: string
          physical_unit_id?: string
          rent_amount?: number
          rent_currency?: Database["public"]["Enums"]["currency_code"]
          start_date?: string
          status?: Database["public"]["Enums"]["lease_status"]
          tenant_contact_id?: string
          terms?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leases_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_landlord_contact_id_fkey"
            columns: ["landlord_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "marketing_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_physical_unit_id_fkey"
            columns: ["physical_unit_id"]
            isOneToOne: false
            referencedRelation: "physical_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_tenant_contact_id_fkey"
            columns: ["tenant_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_tickets: {
        Row: {
          actual_cost: number | null
          created_at: string
          created_by: string | null
          currency: Database["public"]["Enums"]["currency_code"] | null
          description: string
          estimated_cost: number | null
          id: string
          lease_id: string | null
          physical_unit_id: string
          priority: Database["public"]["Enums"]["maintenance_priority"]
          requester_contact_id: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["maintenance_status"]
          title: string
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          actual_cost?: number | null
          created_at?: string
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"] | null
          description: string
          estimated_cost?: number | null
          id?: string
          lease_id?: string | null
          physical_unit_id: string
          priority?: Database["public"]["Enums"]["maintenance_priority"]
          requester_contact_id?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"]
          title: string
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          actual_cost?: number | null
          created_at?: string
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"] | null
          description?: string
          estimated_cost?: number | null
          id?: string
          lease_id?: string | null
          physical_unit_id?: string
          priority?: Database["public"]["Enums"]["maintenance_priority"]
          requester_contact_id?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"]
          title?: string
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tickets_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tickets_physical_unit_id_fkey"
            columns: ["physical_unit_id"]
            isOneToOne: false
            referencedRelation: "physical_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tickets_requester_contact_id_fkey"
            columns: ["requester_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tickets_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_offers: {
        Row: {
          amount: number | null
          area_m2: number | null
          assigned_agent_id: string | null
          availability: Database["public"]["Enums"]["property_availability"]
          bathrooms: number | null
          cbi_eligible: boolean
          cbi_verified: boolean
          city: string
          claims_requiring_confirmation: string[]
          cover_image_path: string | null
          created_at: string
          created_by: string | null
          currency: Database["public"]["Enums"]["currency_code"] | null
          description: string | null
          district: string
          expenses_amount: number | null
          gross_m2: number | null
          id: string
          layout_label: string | null
          marketing_title: string
          mode: string
          net_m2: number | null
          physical_unit_id: string | null
          price_basis: Database["public"]["Enums"]["price_basis_type"]
          price_type: Database["public"]["Enums"]["price_type"]
          project_id: string | null
          publication: Database["public"]["Enums"]["publication_status"]
          published_at: string | null
          published_snapshot: Json | null
          record_type: Database["public"]["Enums"]["property_record_type"]
          ref: string
          side: string | null
          slug: string
          source_note: string | null
          tapu_status: string | null
          title_provenance: string | null
          updated_at: string
          updated_by: string | null
          version: number
        }
        Insert: {
          amount?: number | null
          area_m2?: number | null
          assigned_agent_id?: string | null
          availability?: Database["public"]["Enums"]["property_availability"]
          bathrooms?: number | null
          cbi_eligible?: boolean
          cbi_verified?: boolean
          city?: string
          claims_requiring_confirmation?: string[]
          cover_image_path?: string | null
          created_at?: string
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"] | null
          description?: string | null
          district: string
          expenses_amount?: number | null
          gross_m2?: number | null
          id?: string
          layout_label?: string | null
          marketing_title: string
          mode?: string
          net_m2?: number | null
          physical_unit_id?: string | null
          price_basis?: Database["public"]["Enums"]["price_basis_type"]
          price_type?: Database["public"]["Enums"]["price_type"]
          project_id?: string | null
          publication?: Database["public"]["Enums"]["publication_status"]
          published_at?: string | null
          published_snapshot?: Json | null
          record_type?: Database["public"]["Enums"]["property_record_type"]
          ref: string
          side?: string | null
          slug: string
          source_note?: string | null
          tapu_status?: string | null
          title_provenance?: string | null
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Update: {
          amount?: number | null
          area_m2?: number | null
          assigned_agent_id?: string | null
          availability?: Database["public"]["Enums"]["property_availability"]
          bathrooms?: number | null
          cbi_eligible?: boolean
          cbi_verified?: boolean
          city?: string
          claims_requiring_confirmation?: string[]
          cover_image_path?: string | null
          created_at?: string
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"] | null
          description?: string | null
          district?: string
          expenses_amount?: number | null
          gross_m2?: number | null
          id?: string
          layout_label?: string | null
          marketing_title?: string
          mode?: string
          net_m2?: number | null
          physical_unit_id?: string | null
          price_basis?: Database["public"]["Enums"]["price_basis_type"]
          price_type?: Database["public"]["Enums"]["price_type"]
          project_id?: string | null
          publication?: Database["public"]["Enums"]["publication_status"]
          published_at?: string | null
          published_snapshot?: Json | null
          record_type?: Database["public"]["Enums"]["property_record_type"]
          ref?: string
          side?: string | null
          slug?: string
          source_note?: string | null
          tapu_status?: string | null
          title_provenance?: string | null
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "marketing_offers_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_offers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_offers_physical_unit_id_fkey"
            columns: ["physical_unit_id"]
            isOneToOne: false
            referencedRelation: "physical_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_offers_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_offers_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          is_private: boolean
          target_id: string
          target_type: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          is_private?: boolean
          target_id: string
          target_type: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          is_private?: boolean
          target_id?: string
          target_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          read_at: string | null
          recipient_id: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          read_at?: string | null
          recipient_id: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          read_at?: string | null
          recipient_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_amenities: {
        Row: {
          amenity_id: string
          offer_id: string
        }
        Insert: {
          amenity_id: string
          offer_id: string
        }
        Update: {
          amenity_id?: string
          offer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_amenities_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_amenities_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "marketing_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_revisions: {
        Row: {
          created_at: string
          created_by: string | null
          currency: Database["public"]["Enums"]["currency_code"]
          deal_id: string
          id: string
          offer_amount: number
          payment_terms: Json
          revision_number: number
          status: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency: Database["public"]["Enums"]["currency_code"]
          deal_id: string
          id?: string
          offer_amount: number
          payment_terms?: Json
          revision_number: number
          status?: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"]
          deal_id?: string
          id?: string
          offer_amount?: number
          payment_terms?: Json
          revision_number?: number
          status?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offer_revisions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_revisions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      package_memberships: {
        Row: {
          created_at: string
          id: string
          member_offer_id: string | null
          member_unit_id: string | null
          package_offer_id: string
          share_description: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          member_offer_id?: string | null
          member_unit_id?: string | null
          package_offer_id: string
          share_description?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          member_offer_id?: string | null
          member_unit_id?: string | null
          package_offer_id?: string
          share_description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "package_memberships_member_offer_id_fkey"
            columns: ["member_offer_id"]
            isOneToOne: false
            referencedRelation: "marketing_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_memberships_member_unit_id_fkey"
            columns: ["member_unit_id"]
            isOneToOne: false
            referencedRelation: "physical_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_memberships_package_offer_id_fkey"
            columns: ["package_offer_id"]
            isOneToOne: false
            referencedRelation: "marketing_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_milestones: {
        Row: {
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          deal_id: string
          due_date: string
          expected_amount: number
          id: string
          milestone_name: string
          notes: string | null
          status: string
        }
        Insert: {
          created_at?: string
          currency: Database["public"]["Enums"]["currency_code"]
          deal_id: string
          due_date: string
          expected_amount: number
          id?: string
          milestone_name: string
          notes?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          deal_id?: string
          due_date?: string
          expected_amount?: number
          id?: string
          milestone_name?: string
          notes?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_milestones_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      physical_units: {
        Row: {
          bathrooms: number | null
          bedrooms: number | null
          building_id: string | null
          created_at: string
          floor: number | null
          gross_m2: number | null
          id: string
          layout_label: string | null
          metadata: Json
          net_m2: number | null
          orientation: string | null
          project_id: string | null
          status: Database["public"]["Enums"]["property_availability"]
          tapu_status: string | null
          unit_number: string | null
          unspecified_m2: number | null
          updated_at: string
        }
        Insert: {
          bathrooms?: number | null
          bedrooms?: number | null
          building_id?: string | null
          created_at?: string
          floor?: number | null
          gross_m2?: number | null
          id?: string
          layout_label?: string | null
          metadata?: Json
          net_m2?: number | null
          orientation?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["property_availability"]
          tapu_status?: string | null
          unit_number?: string | null
          unspecified_m2?: number | null
          updated_at?: string
        }
        Update: {
          bathrooms?: number | null
          bedrooms?: number | null
          building_id?: string | null
          created_at?: string
          floor?: number | null
          gross_m2?: number | null
          id?: string
          layout_label?: string | null
          metadata?: Json
          net_m2?: number | null
          orientation?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["property_availability"]
          tapu_status?: string | null
          unit_number?: string | null
          unspecified_m2?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "physical_units_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "physical_units_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      price_history: {
        Row: {
          basis: Database["public"]["Enums"]["price_basis_type"] | null
          changed_by: string | null
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"] | null
          id: string
          new_amount: number | null
          offer_id: string
          old_amount: number | null
          reason: string | null
        }
        Insert: {
          basis?: Database["public"]["Enums"]["price_basis_type"] | null
          changed_by?: string | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"] | null
          id?: string
          new_amount?: number | null
          offer_id: string
          old_amount?: number | null
          reason?: string | null
        }
        Update: {
          basis?: Database["public"]["Enums"]["price_basis_type"] | null
          changed_by?: string | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"] | null
          id?: string
          new_amount?: number | null
          offer_id?: string
          old_amount?: number | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "price_history_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "marketing_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_options: {
        Row: {
          amount: number | null
          basis: Database["public"]["Enums"]["price_basis_type"]
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          delivery_payment_amount: number | null
          delivery_payment_percent: number | null
          down_payment_amount: number | null
          down_payment_percent: number | null
          id: string
          installment_amount: number | null
          installment_count: number | null
          is_default: boolean
          metadata: Json
          offer_id: string
          option_name: string
        }
        Insert: {
          amount?: number | null
          basis: Database["public"]["Enums"]["price_basis_type"]
          created_at?: string
          currency: Database["public"]["Enums"]["currency_code"]
          delivery_payment_amount?: number | null
          delivery_payment_percent?: number | null
          down_payment_amount?: number | null
          down_payment_percent?: number | null
          id?: string
          installment_amount?: number | null
          installment_count?: number | null
          is_default?: boolean
          metadata?: Json
          offer_id: string
          option_name: string
        }
        Update: {
          amount?: number | null
          basis?: Database["public"]["Enums"]["price_basis_type"]
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          delivery_payment_amount?: number | null
          delivery_payment_percent?: number | null
          down_payment_amount?: number | null
          down_payment_percent?: number | null
          id?: string
          installment_amount?: number | null
          installment_count?: number | null
          is_default?: boolean
          metadata?: Json
          offer_id?: string
          option_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_options_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "marketing_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          cbi_claim_source: string | null
          cbi_claim_verified: boolean
          city: string
          created_at: string
          delivery_date: string | null
          delivery_month_year: string | null
          delivery_relative: string | null
          delivery_source: string | null
          description: string | null
          developer_id: string | null
          district: string | null
          id: string
          metadata: Json
          name: string
          side: string | null
          slug: string
          tapu_status: string | null
          updated_at: string
        }
        Insert: {
          cbi_claim_source?: string | null
          cbi_claim_verified?: boolean
          city?: string
          created_at?: string
          delivery_date?: string | null
          delivery_month_year?: string | null
          delivery_relative?: string | null
          delivery_source?: string | null
          description?: string | null
          developer_id?: string | null
          district?: string | null
          id?: string
          metadata?: Json
          name: string
          side?: string | null
          slug: string
          tapu_status?: string | null
          updated_at?: string
        }
        Update: {
          cbi_claim_source?: string | null
          cbi_claim_verified?: boolean
          city?: string
          created_at?: string
          delivery_date?: string | null
          delivery_month_year?: string | null
          delivery_relative?: string | null
          delivery_source?: string | null
          description?: string | null
          developer_id?: string | null
          district?: string | null
          id?: string
          metadata?: Json
          name?: string
          side?: string | null
          slug?: string
          tapu_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_developer_id_fkey"
            columns: ["developer_id"]
            isOneToOne: false
            referencedRelation: "developers"
            referencedColumns: ["id"]
          },
        ]
      }
      property_slug_redirects: {
        Row: {
          created_at: string
          id: string
          new_slug: string
          old_slug: string
          target_offer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          new_slug: string
          old_slug: string
          target_offer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          new_slug?: string
          old_slug?: string
          target_offer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_slug_redirects_target_offer_id_fkey"
            columns: ["target_offer_id"]
            isOneToOne: false
            referencedRelation: "marketing_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      publication_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["publication_status"]
          offer_id: string
          old_status: Database["public"]["Enums"]["publication_status"] | null
          reason: string | null
          snapshot: Json | null
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: Database["public"]["Enums"]["publication_status"]
          offer_id: string
          old_status?: Database["public"]["Enums"]["publication_status"] | null
          reason?: string | null
          snapshot?: Json | null
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["publication_status"]
          offer_id?: string
          old_status?: Database["public"]["Enums"]["publication_status"] | null
          reason?: string | null
          snapshot?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "publication_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publication_history_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "marketing_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limit_entries: {
        Row: {
          count: number
          created_at: string
          id: string
          rate_key: string
          window_start: string
        }
        Insert: {
          count?: number
          created_at?: string
          id?: string
          rate_key: string
          window_start: string
        }
        Update: {
          count?: number
          created_at?: string
          id?: string
          rate_key?: string
          window_start?: string
        }
        Relationships: []
      }
      recorded_payments: {
        Row: {
          amount: number
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          deal_id: string
          id: string
          is_reversal: boolean
          milestone_id: string | null
          notes: string | null
          payment_date: string
          payment_method: string
          payment_reference: string
          proof_storage_path: string | null
          recorded_by: string
          reversal_for_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency: Database["public"]["Enums"]["currency_code"]
          deal_id: string
          id?: string
          is_reversal?: boolean
          milestone_id?: string | null
          notes?: string | null
          payment_date?: string
          payment_method: string
          payment_reference: string
          proof_storage_path?: string | null
          recorded_by: string
          reversal_for_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          deal_id?: string
          id?: string
          is_reversal?: boolean
          milestone_id?: string | null
          notes?: string | null
          payment_date?: string
          payment_method?: string
          payment_reference?: string
          proof_storage_path?: string | null
          recorded_by?: string
          reversal_for_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recorded_payments_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recorded_payments_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "payment_milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recorded_payments_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recorded_payments_reversal_for_id_fkey"
            columns: ["reversal_for_id"]
            isOneToOne: false
            referencedRelation: "recorded_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      rent_charges: {
        Row: {
          charge_amount: number
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          due_date: string
          id: string
          lease_id: string
          period_end: string
          period_start: string
          status: string
        }
        Insert: {
          charge_amount: number
          created_at?: string
          currency: Database["public"]["Enums"]["currency_code"]
          due_date: string
          id?: string
          lease_id: string
          period_end: string
          period_start: string
          status?: string
        }
        Update: {
          charge_amount?: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          due_date?: string
          id?: string
          lease_id?: string
          period_end?: string
          period_start?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "rent_charges_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
      }
      rent_payment_allocations: {
        Row: {
          allocated_amount: number
          allocated_at: string
          allocated_by: string
          charge_id: string
          currency: Database["public"]["Enums"]["currency_code"]
          id: string
          recorded_payment_id: string
        }
        Insert: {
          allocated_amount: number
          allocated_at?: string
          allocated_by: string
          charge_id: string
          currency: Database["public"]["Enums"]["currency_code"]
          id?: string
          recorded_payment_id: string
        }
        Update: {
          allocated_amount?: number
          allocated_at?: string
          allocated_by?: string
          charge_id?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          id?: string
          recorded_payment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rent_payment_allocations_allocated_by_fkey"
            columns: ["allocated_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rent_payment_allocations_charge_id_fkey"
            columns: ["charge_id"]
            isOneToOne: false
            referencedRelation: "rent_charges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rent_payment_allocations_recorded_payment_id_fkey"
            columns: ["recorded_payment_id"]
            isOneToOne: false
            referencedRelation: "recorded_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_deposits: {
        Row: {
          amount: number
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          id: string
          lease_id: string
          notes: string | null
          received_date: string
          return_date: string | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency: Database["public"]["Enums"]["currency_code"]
          id?: string
          lease_id: string
          notes?: string | null
          received_date: string
          return_date?: string | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          id?: string
          lease_id?: string
          notes?: string | null
          received_date?: string
          return_date?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_deposits_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          cancellation_reason: string | null
          contact_id: string
          created_at: string
          deal_id: string | null
          deposit_amount: number | null
          deposit_currency: Database["public"]["Enums"]["currency_code"] | null
          expires_at: string
          id: string
          offer_id: string | null
          physical_unit_id: string | null
          reserved_by: string
          reserved_from: string
          status: string
          updated_at: string
        }
        Insert: {
          cancellation_reason?: string | null
          contact_id: string
          created_at?: string
          deal_id?: string | null
          deposit_amount?: number | null
          deposit_currency?: Database["public"]["Enums"]["currency_code"] | null
          expires_at: string
          id?: string
          offer_id?: string | null
          physical_unit_id?: string | null
          reserved_by: string
          reserved_from?: string
          status?: string
          updated_at?: string
        }
        Update: {
          cancellation_reason?: string | null
          contact_id?: string
          created_at?: string
          deal_id?: string | null
          deposit_amount?: number | null
          deposit_currency?: Database["public"]["Enums"]["currency_code"] | null
          expires_at?: string
          id?: string
          offer_id?: string | null
          physical_unit_id?: string | null
          reserved_by?: string
          reserved_from?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "marketing_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_physical_unit_id_fkey"
            columns: ["physical_unit_id"]
            isOneToOne: false
            referencedRelation: "physical_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_reserved_by_fkey"
            columns: ["reserved_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string | null
          description: string
          id: string
          is_published: boolean
          process_steps: Json
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          description: string
          id?: string
          is_published?: boolean
          process_steps?: Json
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          description?: string
          id?: string
          is_published?: boolean
          process_steps?: Json
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          address: string
          advisory_hours: string
          announcement_active: boolean
          announcement_text: string
          cbi_threshold_usd: number
          company_name: string
          email: string
          enable_frankfurter_sync: boolean
          exchange_rate_eur: number
          exchange_rate_gbp: number
          exchange_rate_try: number
          eyebrow_text: string
          hero_headline: string
          hero_subtitle: string
          id: string
          license_no: string
          phone: string
          preloader_opacity: number
          registered_entity: string
          singleton_key: string
          tagline: string
          tax_office: string
          updated_at: string
          updated_by: string | null
          whatsapp: string
        }
        Insert: {
          address?: string
          advisory_hours?: string
          announcement_active?: boolean
          announcement_text?: string
          cbi_threshold_usd?: number
          company_name?: string
          email?: string
          enable_frankfurter_sync?: boolean
          exchange_rate_eur?: number
          exchange_rate_gbp?: number
          exchange_rate_try?: number
          eyebrow_text?: string
          hero_headline?: string
          hero_subtitle?: string
          id?: string
          license_no?: string
          phone?: string
          preloader_opacity?: number
          registered_entity?: string
          singleton_key?: string
          tagline?: string
          tax_office?: string
          updated_at?: string
          updated_by?: string | null
          whatsapp?: string
        }
        Update: {
          address?: string
          advisory_hours?: string
          announcement_active?: boolean
          announcement_text?: string
          cbi_threshold_usd?: number
          company_name?: string
          email?: string
          enable_frankfurter_sync?: boolean
          exchange_rate_eur?: number
          exchange_rate_gbp?: number
          exchange_rate_try?: number
          eyebrow_text?: string
          hero_headline?: string
          hero_subtitle?: string
          id?: string
          license_no?: string
          phone?: string
          preloader_opacity?: number
          registered_entity?: string
          singleton_key?: string
          tagline?: string
          tax_office?: string
          updated_at?: string
          updated_by?: string | null
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      source_files: {
        Row: {
          asset_path: string
          bytes: number
          created_at: string
          drive_id: string
          drive_url: string | null
          error_message: string | null
          filename: string
          folder_name: string
          id: string
          import_status: string
          metadata: Json
          mime_type: string
          sha256: string
          updated_at: string
        }
        Insert: {
          asset_path: string
          bytes: number
          created_at?: string
          drive_id: string
          drive_url?: string | null
          error_message?: string | null
          filename: string
          folder_name: string
          id?: string
          import_status?: string
          metadata?: Json
          mime_type: string
          sha256: string
          updated_at?: string
        }
        Update: {
          asset_path?: string
          bytes?: number
          created_at?: string
          drive_id?: string
          drive_url?: string | null
          error_message?: string | null
          filename?: string
          folder_name?: string
          id?: string
          import_status?: string
          metadata?: Json
          mime_type?: string
          sha256?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff_profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          last_login_at: string | null
          name: string
          role: Database["public"]["Enums"]["staff_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          is_active?: boolean
          last_login_at?: string | null
          name: string
          role?: Database["public"]["Enums"]["staff_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          name?: string
          role?: Database["public"]["Enums"]["staff_role"]
          updated_at?: string
        }
        Relationships: []
      }
      storage_files: {
        Row: {
          bucket: string
          created_at: string
          file_size: number
          id: string
          is_public: boolean
          mime_type: string
          original_filename: string
          path: string
          related_entity_id: string | null
          related_entity_type: string | null
          sha256: string | null
          uploaded_by: string | null
        }
        Insert: {
          bucket: string
          created_at?: string
          file_size: number
          id?: string
          is_public?: boolean
          mime_type: string
          original_filename: string
          path: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          sha256?: string | null
          uploaded_by?: string | null
        }
        Update: {
          bucket?: string
          created_at?: string
          file_size?: number
          id?: string
          is_public?: boolean
          mime_type?: string
          original_filename?: string
          path?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          sha256?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "storage_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_id: string
          created_at: string
          created_by: string | null
          description: string | null
          done_at: string | null
          due_date: string
          id: string
          is_done: boolean
          link_id: string | null
          link_kind: string | null
          priority: Database["public"]["Enums"]["task_priority"]
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          done_at?: string | null
          due_date: string
          id?: string
          is_done?: boolean
          link_id?: string | null
          link_kind?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          done_at?: string | null
          due_date?: string
          id?: string
          is_done?: boolean
          link_id?: string | null
          link_kind?: string | null
          priority?: Database["public"]["Enums"]["task_priority"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          company_name: string
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          notes: string | null
          phone: string | null
          specialty: string
        }
        Insert: {
          company_name: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          phone?: string | null
          specialty: string
        }
        Update: {
          company_name?: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          phone?: string | null
          specialty?: string
        }
        Relationships: []
      }
      viewings: {
        Row: {
          agent_id: string
          contact_id: string
          created_at: string
          created_by: string | null
          end_time: string
          id: string
          notes: string
          offer_id: string | null
          outcome: string | null
          physical_unit_id: string | null
          start_time: string
          status: Database["public"]["Enums"]["viewing_status"]
          updated_at: string
        }
        Insert: {
          agent_id: string
          contact_id: string
          created_at?: string
          created_by?: string | null
          end_time: string
          id?: string
          notes?: string
          offer_id?: string | null
          outcome?: string | null
          physical_unit_id?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["viewing_status"]
          updated_at?: string
        }
        Update: {
          agent_id?: string
          contact_id?: string
          created_at?: string
          created_by?: string | null
          end_time?: string
          id?: string
          notes?: string
          offer_id?: string | null
          outcome?: string | null
          physical_unit_id?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["viewing_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "viewings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewings_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewings_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "marketing_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewings_physical_unit_id_fkey"
            columns: ["physical_unit_id"]
            isOneToOne: false
            referencedRelation: "physical_units"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_deal_win: {
        Args: { p_deal_id: string; p_user_id: string }
        Returns: undefined
      }
      convert_enquiry_to_lead: {
        Args: { p_enquiry_id: string; p_user_id: string }
        Returns: string
      }
      create_reservation_atomic: {
        Args: {
          p_contact_id: string
          p_currency: Database["public"]["Enums"]["currency_code"]
          p_deal_id: string
          p_deposit: number
          p_duration_hours?: number
          p_offer_id: string
          p_unit_id: string
          p_user_id: string
        }
        Returns: string
      }
      generate_rent_charges_for_month: {
        Args: { p_month: number; p_year: number }
        Returns: number
      }
      get_current_staff_role: {
        Args: never
        Returns: Database["public"]["Enums"]["staff_role"]
      }
      is_active_staff: { Args: never; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_agent: { Args: never; Returns: boolean }
      is_manager: { Args: never; Returns: boolean }
      publish_offer_atomic: {
        Args: { p_offer_id: string; p_user_id: string }
        Returns: Json
      }
      release_expired_reservations: { Args: never; Returns: number }
      reserve_package_atomic: {
        Args: {
          p_contact_id: string
          p_deal_id: string
          p_duration_hours?: number
          p_package_offer_id: string
          p_user_id: string
        }
        Returns: string
      }
      unpublish_offer: {
        Args: { p_offer_id: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      contact_kind: "person" | "company"
      currency_code: "USD" | "TRY" | "EUR" | "GBP"
      deal_stage:
        | "Opportunity"
        | "Offer Prepared"
        | "Offer Accepted"
        | "Reserved"
        | "Due Diligence"
        | "Contract"
        | "Won"
        | "Lost"
      import_run_status: "running" | "completed" | "failed"
      import_run_type: "dry_run" | "full_import" | "sync"
      lead_stage:
        | "New"
        | "Contacted"
        | "Qualified"
        | "Viewing"
        | "Negotiation"
        | "Converted"
        | "Lost"
        | "On Hold"
      lease_status: "draft" | "active" | "terminated" | "expired"
      maintenance_priority: "Low" | "Normal" | "High" | "Urgent"
      maintenance_status:
        | "reported"
        | "assigned"
        | "in_progress"
        | "completed"
        | "cancelled"
      price_basis_type:
        | "cash"
        | "installment_schedule"
        | "package"
        | "fixed"
        | "from"
        | "on_request"
        | "conflicting_starting_prices"
        | "scope_unconfirmed"
        | "special_offer"
        | "advertised"
      price_type: "fixed" | "from" | "on-request"
      property_availability:
        | "Available"
        | "Under Offer"
        | "Reserved"
        | "Sold"
        | "Rented"
        | "Off Market"
        | "Unknown"
      property_record_type:
        | "unit_offer"
        | "unit_type"
        | "package"
        | "project"
        | "ambiguous_offer"
      publication_status: "Draft" | "In Review" | "Published" | "Archived"
      staff_role: "admin" | "manager" | "agent" | "viewer"
      task_priority: "Low" | "Normal" | "High"
      viewing_status:
        | "Scheduled"
        | "Confirmed"
        | "Completed"
        | "Cancelled"
        | "No-show"
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
      contact_kind: ["person", "company"],
      currency_code: ["USD", "TRY", "EUR", "GBP"],
      deal_stage: [
        "Opportunity",
        "Offer Prepared",
        "Offer Accepted",
        "Reserved",
        "Due Diligence",
        "Contract",
        "Won",
        "Lost",
      ],
      import_run_status: ["running", "completed", "failed"],
      import_run_type: ["dry_run", "full_import", "sync"],
      lead_stage: [
        "New",
        "Contacted",
        "Qualified",
        "Viewing",
        "Negotiation",
        "Converted",
        "Lost",
        "On Hold",
      ],
      lease_status: ["draft", "active", "terminated", "expired"],
      maintenance_priority: ["Low", "Normal", "High", "Urgent"],
      maintenance_status: [
        "reported",
        "assigned",
        "in_progress",
        "completed",
        "cancelled",
      ],
      price_basis_type: [
        "cash",
        "installment_schedule",
        "package",
        "fixed",
        "from",
        "on_request",
        "conflicting_starting_prices",
        "scope_unconfirmed",
        "special_offer",
        "advertised",
      ],
      price_type: ["fixed", "from", "on-request"],
      property_availability: [
        "Available",
        "Under Offer",
        "Reserved",
        "Sold",
        "Rented",
        "Off Market",
        "Unknown",
      ],
      property_record_type: [
        "unit_offer",
        "unit_type",
        "package",
        "project",
        "ambiguous_offer",
      ],
      publication_status: ["Draft", "In Review", "Published", "Archived"],
      staff_role: ["admin", "manager", "agent", "viewer"],
      task_priority: ["Low", "Normal", "High"],
      viewing_status: [
        "Scheduled",
        "Confirmed",
        "Completed",
        "Cancelled",
        "No-show",
      ],
    },
  },
} as const
