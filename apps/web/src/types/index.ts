// ─── User & Auth ────────────────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string;
  loyalty_points: number;
  subscription_tier: "free" | "premium" | "pro";
  subscription_status: "active" | "cancelled" | "past_due" | null;
  stripe_customer_id: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Pets ────────────────────────────────────────────────────────────────────
export type PetSpecies = "dog" | "cat" | "rabbit";
export type PetGender = "male" | "female";

export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  species: PetSpecies;
  breed: string | null;
  gender: PetGender;
  birth_date: string | null;
  weight_kg: number | null;
  color: string | null;
  microchip_id: string | null;
  insurance_number: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // joined
  health_records?: HealthRecord[];
  weight_logs?: WeightLog[];
  reminders?: Reminder[];
  media?: PetMedia[];
}

export interface PetMedia {
  id: string;
  pet_id: string;
  url: string;
  type: "photo" | "video";
  caption: string | null;
  taken_at: string;
  created_at: string;
}

export interface WeightLog {
  id: string;
  pet_id: string;
  weight_kg: number;
  recorded_at: string;
  notes: string | null;
}

export interface HealthRecord {
  id: string;
  pet_id: string;
  type: "vaccine" | "deworming" | "checkup" | "surgery" | "medication" | "other";
  title: string;
  description: string | null;
  date: string;
  next_due_date: string | null;
  vet_name: string | null;
  clinic_name: string | null;
  cost: number | null;
  document_url: string | null;
  created_at: string;
}

// ─── Reminders ───────────────────────────────────────────────────────────────
export interface Reminder {
  id: string;
  pet_id: string;
  user_id: string;
  type: "vaccine" | "deworming" | "grooming" | "medication" | "vet" | "other";
  title: string;
  description: string | null;
  due_date: string;
  repeat_interval_days: number | null;
  is_completed: boolean;
  notified: boolean;
  created_at: string;
}

// ─── Groomers & Services ─────────────────────────────────────────────────────
export type ServiceType = "grooming" | "vet" | "petsitting" | "dogwalking";
export type GroomerType = "salon" | "mobile";

export interface ServiceProvider {
  id: string;
  user_id: string;
  business_name: string;
  service_type: ServiceType;
  groomer_type: GroomerType | null;
  description: string | null;
  address: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  travel_radius_km: number | null;
  has_grooming_van: boolean;
  phone: string | null;
  website: string | null;
  is_verified: boolean;
  is_featured: boolean;
  is_active: boolean;
  rating_avg: number;
  rating_count: number;
  portfolio_photos: string[];
  species_accepted: PetSpecies[];
  stripe_account_id: string | null;
  created_at: string;
  updated_at: string;
  // joined
  services?: ProviderService[];
  availability?: Availability[];
  reviews?: Review[];
}

export interface ProviderService {
  id: string;
  provider_id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  species: PetSpecies[];
  is_active: boolean;
}

export interface Availability {
  id: string;
  provider_id: string;
  day_of_week: number; // 0=Sun, 6=Sat
  start_time: string;  // "09:00"
  end_time: string;    // "18:00"
  is_active: boolean;
}

// ─── Bookings ─────────────────────────────────────────────────────────────────
export type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "deposit_paid" | "paid" | "refunded";

export interface Booking {
  id: string;
  client_id: string;
  provider_id: string;
  pet_id: string;
  service_id: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  scheduled_at: string;
  duration_minutes: number;
  price_total: number;
  deposit_amount: number;
  travel_fee: number;
  platform_fee: number;
  notes: string | null;
  groomer_notes: string | null;
  is_recurring: boolean;
  recurring_interval_weeks: number | null;
  stripe_payment_intent_id: string | null;
  invoice_url: string | null;
  created_at: string;
  updated_at: string;
  // joined
  provider?: ServiceProvider;
  pet?: Pet;
  service?: ProviderService;
  session_file?: GroomingSessionFile;
}

export interface GroomingSessionFile {
  id: string;
  booking_id: string;
  before_photos: string[];
  after_photos: string[];
  products_used: { name: string; type: string }[];
  services_performed: string[];
  duration_minutes: number;
  groomer_notes: string | null;
  coat_condition: string | null;
  pet_behavior: string | null;
  parasites_detected: boolean;
  coat_damage: boolean;
  created_at: string;
}

// ─── Reviews ──────────────────────────────────────────────────────────────────
export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  provider_id: string;
  rating: number;
  comment: string | null;
  response: string | null;
  created_at: string;
  // joined
  reviewer?: UserProfile;
}

// ─── Messages ─────────────────────────────────────────────────────────────────
export interface Message {
  id: string;
  booking_id: string | null;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

// ─── Loyalty ──────────────────────────────────────────────────────────────────
export interface LoyaltyTransaction {
  id: string;
  user_id: string;
  points: number;
  type: "earned" | "redeemed" | "expired" | "bonus";
  description: string;
  booking_id: string | null;
  created_at: string;
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
export interface PricingPlan {
  id: string;
  name: string;
  tier: "free" | "premium" | "pro";
  price_monthly: number;
  price_yearly: number;
  stripe_price_monthly: string;
  stripe_price_yearly: string;
  features: string[];
  max_pets: number;
  is_popular: boolean;
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export interface AdminStats {
  total_users: number;
  active_subscriptions: number;
  total_bookings: number;
  total_revenue: number;
  monthly_revenue: number;
  new_users_today: number;
  bookings_today: number;
  active_providers: number;
}
