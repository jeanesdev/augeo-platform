/**
 * Event-related type definitions for the donor PWA.
 */

// ============================================
// Enums
// ============================================

export type EventStatus = 'draft' | 'active' | 'closed';

export type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled' | 'waitlisted';

// ============================================
// Event Types
// ============================================

export interface Event {
  id: string;
  npo_id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  event_datetime: string;
  timezone: string;
  venue_name: string | null;
  venue_address: string | null;
  venue_city: string | null;
  venue_state: string | null;
  venue_zip: string | null;
  attire: string | null;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  primary_contact_phone: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  background_color: string | null;
  accent_color: string | null;
  status: EventStatus;
  created_at: string;
  updated_at: string;
  npo_name?: string;
}

export interface EventDetail extends Event {
  media?: EventMedia[];
  links?: EventLink[];
  food_options?: FoodOption[];
  sponsors?: Array<{
    id: string;
    name: string;
    logo_size: string;
    logo_url?: string;
  }>;
}

// ============================================
// Event Media Types
// ============================================

export interface EventMedia {
  id: string;
  event_id: string;
  media_type: string;
  file_url: string;
  file_name: string;
  file_type: string;
  mime_type: string;
  file_size: number;
  display_order: number;
  status: string;
  created_at: string;
}

// ============================================
// Event Link Types
// ============================================

export interface EventLink {
  id: string;
  event_id: string;
  link_type: 'video' | 'website' | 'social_media';
  url: string;
  label: string | null;
  platform: string | null;
  display_order: number;
  created_at: string;
}

// ============================================
// Food Option Types
// ============================================

export interface FoodOption {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// Registration Types
// ============================================

export interface EventRegistration {
  id: string;
  user_id: string;
  event_id: string;
  status: RegistrationStatus;
  ticket_type: string | null;
  number_of_guests: number;
  created_at: string;
  updated_at: string;
  event?: Event;
}

export interface EventRegistrationListResponse {
  registrations: EventRegistration[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ============================================
// Guest Types
// ============================================

export interface RegistrationGuest {
  id: string;
  registration_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// Meal Selection Types
// ============================================

export interface MealSelection {
  id: string;
  registration_id: string;
  food_option_id: string;
  guest_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
