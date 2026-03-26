-- ================================================================
-- PETOO — Initial Database Schema
-- Supabase / PostgreSQL
-- ================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- for geolocation queries

-- ─── PROFILES (extends auth.users) ──────────────────────────────────────────
CREATE TABLE public.profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                 TEXT NOT NULL,
  full_name             TEXT,
  avatar_url            TEXT,
  phone                 TEXT,
  address               TEXT,
  city                  TEXT,
  country               TEXT NOT NULL DEFAULT 'FR',
  loyalty_points        INTEGER NOT NULL DEFAULT 0,
  subscription_tier     TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free','premium','pro')),
  subscription_status   TEXT CHECK (subscription_status IN ('active','cancelled','past_due')),
  stripe_customer_id    TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  is_admin              BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PETS ────────────────────────────────────────────────────────────────────
CREATE TABLE public.pets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  species         TEXT NOT NULL CHECK (species IN ('dog','cat','rabbit')),
  breed           TEXT,
  gender          TEXT NOT NULL DEFAULT 'male' CHECK (gender IN ('male','female')),
  birth_date      DATE,
  weight_kg       DECIMAL(5,2),
  color           TEXT,
  microchip_id    TEXT,
  insurance_number TEXT,
  avatar_url      TEXT,
  bio             TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PET MEDIA (photos/videos timeline) ──────────────────────────────────────
CREATE TABLE public.pet_media (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id      UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  uploader_id UUID NOT NULL REFERENCES public.profiles(id),
  url         TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'photo' CHECK (type IN ('photo','video')),
  caption     TEXT,
  taken_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── WEIGHT LOGS ─────────────────────────────────────────────────────────────
CREATE TABLE public.weight_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id       UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  weight_kg    DECIMAL(5,2) NOT NULL,
  recorded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes        TEXT
);

-- ─── HEALTH RECORDS ──────────────────────────────────────────────────────────
CREATE TABLE public.health_records (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id         UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  type           TEXT NOT NULL CHECK (type IN ('vaccine','deworming','checkup','surgery','medication','other')),
  title          TEXT NOT NULL,
  description    TEXT,
  date           DATE NOT NULL,
  next_due_date  DATE,
  vet_name       TEXT,
  clinic_name    TEXT,
  cost           DECIMAL(10,2),
  document_url   TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── REMINDERS ───────────────────────────────────────────────────────────────
CREATE TABLE public.reminders (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id                  UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id                 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type                    TEXT NOT NULL CHECK (type IN ('vaccine','deworming','grooming','medication','vet','other')),
  title                   TEXT NOT NULL,
  description             TEXT,
  due_date                TIMESTAMPTZ NOT NULL,
  repeat_interval_days    INTEGER,
  is_completed            BOOLEAN NOT NULL DEFAULT FALSE,
  notified                BOOLEAN NOT NULL DEFAULT FALSE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── FAMILY ACCOUNTS ─────────────────────────────────────────────────────────
CREATE TABLE public.family_members (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  member_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin','member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(owner_id, member_id)
);

-- ─── SERVICE PROVIDERS ───────────────────────────────────────────────────────
CREATE TABLE public.service_providers (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  business_name       TEXT NOT NULL,
  service_type        TEXT NOT NULL CHECK (service_type IN ('grooming','vet','petsitting','dogwalking')),
  groomer_type        TEXT CHECK (groomer_type IN ('salon','mobile')),
  description         TEXT,
  address             TEXT NOT NULL,
  city                TEXT NOT NULL,
  latitude            DECIMAL(10,7),
  longitude           DECIMAL(10,7),
  travel_radius_km    INTEGER,
  has_grooming_van    BOOLEAN NOT NULL DEFAULT FALSE,
  phone               TEXT,
  website             TEXT,
  is_verified         BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured         BOOLEAN NOT NULL DEFAULT FALSE,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  rating_avg          DECIMAL(3,2) NOT NULL DEFAULT 0,
  rating_count        INTEGER NOT NULL DEFAULT 0,
  portfolio_photos    TEXT[] NOT NULL DEFAULT '{}',
  species_accepted    TEXT[] NOT NULL DEFAULT '{"dog","cat","rabbit"}',
  stripe_account_id   TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PROVIDER SERVICES ───────────────────────────────────────────────────────
CREATE TABLE public.provider_services (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id      UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  description      TEXT,
  price            DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  species          TEXT[] NOT NULL DEFAULT '{"dog","cat","rabbit"}',
  is_active        BOOLEAN NOT NULL DEFAULT TRUE
);

-- ─── AVAILABILITY ─────────────────────────────────────────────────────────────
CREATE TABLE public.availability (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id  UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  day_of_week  INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time   TIME NOT NULL,
  end_time     TIME NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(provider_id, day_of_week)
);

-- ─── BOOKINGS ────────────────────────────────────────────────────────────────
CREATE TABLE public.bookings (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id                UUID NOT NULL REFERENCES public.profiles(id),
  provider_id              UUID NOT NULL REFERENCES public.service_providers(id),
  pet_id                   UUID NOT NULL REFERENCES public.pets(id),
  service_id               UUID NOT NULL REFERENCES public.provider_services(id),
  status                   TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','in_progress','completed','cancelled')),
  payment_status           TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','deposit_paid','paid','refunded')),
  scheduled_at             TIMESTAMPTZ NOT NULL,
  duration_minutes         INTEGER NOT NULL,
  price_total              DECIMAL(10,2) NOT NULL,
  deposit_amount           DECIMAL(10,2) NOT NULL DEFAULT 0,
  travel_fee               DECIMAL(10,2) NOT NULL DEFAULT 0,
  platform_fee             DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes                    TEXT,
  groomer_notes            TEXT,
  is_recurring             BOOLEAN NOT NULL DEFAULT FALSE,
  recurring_interval_weeks INTEGER,
  stripe_payment_intent_id TEXT,
  invoice_url              TEXT,
  loyalty_points_earned    INTEGER NOT NULL DEFAULT 0,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── GROOMING SESSION FILES ───────────────────────────────────────────────────
CREATE TABLE public.grooming_session_files (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id          UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE UNIQUE,
  before_photos       TEXT[] NOT NULL DEFAULT '{}',
  after_photos        TEXT[] NOT NULL DEFAULT '{}',
  products_used       JSONB NOT NULL DEFAULT '[]',
  services_performed  TEXT[] NOT NULL DEFAULT '{}',
  duration_minutes    INTEGER,
  groomer_notes       TEXT,
  coat_condition      TEXT,
  pet_behavior        TEXT,
  parasites_detected  BOOLEAN NOT NULL DEFAULT FALSE,
  coat_damage         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── REVIEWS ─────────────────────────────────────────────────────────────────
CREATE TABLE public.reviews (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id    UUID NOT NULL REFERENCES public.bookings(id) UNIQUE,
  reviewer_id   UUID NOT NULL REFERENCES public.profiles(id),
  provider_id   UUID NOT NULL REFERENCES public.service_providers(id),
  rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  response      TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── MESSAGES ────────────────────────────────────────────────────────────────
CREATE TABLE public.messages (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id   UUID REFERENCES public.bookings(id),
  sender_id    UUID NOT NULL REFERENCES public.profiles(id),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id),
  content      TEXT NOT NULL,
  is_read      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── LOYALTY TRANSACTIONS ────────────────────────────────────────────────────
CREATE TABLE public.loyalty_transactions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points      INTEGER NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('earned','redeemed','expired','bonus')),
  description TEXT NOT NULL,
  booking_id  UUID REFERENCES public.bookings(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
CREATE TABLE public.notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  data       JSONB,
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────
CREATE INDEX idx_pets_owner ON public.pets(owner_id);
CREATE INDEX idx_pets_species ON public.pets(species);
CREATE INDEX idx_reminders_due ON public.reminders(due_date) WHERE NOT is_completed;
CREATE INDEX idx_reminders_user ON public.reminders(user_id);
CREATE INDEX idx_bookings_client ON public.bookings(client_id);
CREATE INDEX idx_bookings_provider ON public.bookings(provider_id);
CREATE INDEX idx_bookings_scheduled ON public.bookings(scheduled_at);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_providers_city ON public.service_providers(city);
CREATE INDEX idx_providers_service_type ON public.service_providers(service_type);
CREATE INDEX idx_providers_location ON public.service_providers(latitude, longitude);
CREATE INDEX idx_messages_recipient ON public.messages(recipient_id, is_read);
CREATE INDEX idx_loyalty_user ON public.loyalty_transactions(user_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);

-- ─── FUNCTIONS ───────────────────────────────────────────────────────────────

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_pets_updated_at BEFORE UPDATE ON public.pets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_providers_updated_at BEFORE UPDATE ON public.service_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update provider rating after review insert
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.service_providers
  SET
    rating_avg = (
      SELECT AVG(rating) FROM public.reviews WHERE provider_id = NEW.provider_id
    ),
    rating_count = (
      SELECT COUNT(*) FROM public.reviews WHERE provider_id = NEW.provider_id
    )
  WHERE id = NEW.provider_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_rating
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_provider_rating();

-- Add loyalty points after booking completed
CREATE OR REPLACE FUNCTION award_loyalty_points()
RETURNS TRIGGER AS $$
DECLARE
  points_to_award INTEGER;
  multiplier DECIMAL;
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    SELECT CASE subscription_tier
      WHEN 'premium' THEN 2.0
      WHEN 'pro'     THEN 1.5
      ELSE 1.0
    END INTO multiplier
    FROM public.profiles WHERE id = NEW.client_id;

    points_to_award := FLOOR(NEW.price_total * multiplier);

    INSERT INTO public.loyalty_transactions (user_id, points, type, description, booking_id)
    VALUES (NEW.client_id, points_to_award, 'earned', 'Points gagnés - réservation #' || substr(NEW.id::text, 1, 8), NEW.id);

    UPDATE public.profiles
    SET loyalty_points = loyalty_points + points_to_award
    WHERE id = NEW.client_id;

    UPDATE public.bookings
    SET loyalty_points_earned = points_to_award
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_award_loyalty
  AFTER UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION award_loyalty_points();

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grooming_session_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin full access profiles" ON public.profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Pets — owner + family members
CREATE POLICY "Owner reads own pets" ON public.pets FOR SELECT USING (
  owner_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.family_members WHERE owner_id = public.pets.owner_id AND member_id = auth.uid())
);
CREATE POLICY "Owner manages pets" ON public.pets FOR ALL USING (owner_id = auth.uid());

-- Health records
CREATE POLICY "Pet owners read health records" ON public.health_records FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.pets WHERE id = pet_id AND owner_id = auth.uid())
);
CREATE POLICY "Pet owners manage health records" ON public.health_records FOR ALL USING (
  EXISTS (SELECT 1 FROM public.pets WHERE id = pet_id AND owner_id = auth.uid())
);

-- Reminders
CREATE POLICY "Users manage own reminders" ON public.reminders FOR ALL USING (user_id = auth.uid());

-- Weight logs
CREATE POLICY "Pet owners manage weight logs" ON public.weight_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.pets WHERE id = pet_id AND owner_id = auth.uid())
);

-- Pet media
CREATE POLICY "Pet owners manage media" ON public.pet_media FOR ALL USING (
  EXISTS (SELECT 1 FROM public.pets WHERE id = pet_id AND owner_id = auth.uid())
);

-- Service providers — public read, own write
CREATE POLICY "Anyone can read active providers" ON public.service_providers FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Provider manages own profile" ON public.service_providers FOR ALL USING (user_id = auth.uid());

-- Provider services — public read
CREATE POLICY "Anyone reads provider services" ON public.provider_services FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Provider manages own services" ON public.provider_services FOR ALL USING (
  EXISTS (SELECT 1 FROM public.service_providers WHERE id = provider_id AND user_id = auth.uid())
);

-- Availability — public read
CREATE POLICY "Anyone reads availability" ON public.availability FOR SELECT USING (TRUE);
CREATE POLICY "Provider manages availability" ON public.availability FOR ALL USING (
  EXISTS (SELECT 1 FROM public.service_providers WHERE id = provider_id AND user_id = auth.uid())
);

-- Bookings — client or provider
CREATE POLICY "Client reads own bookings" ON public.bookings FOR SELECT USING (
  client_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.service_providers WHERE id = provider_id AND user_id = auth.uid())
);
CREATE POLICY "Client creates bookings" ON public.bookings FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "Client or provider updates booking" ON public.bookings FOR UPDATE USING (
  client_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.service_providers WHERE id = provider_id AND user_id = auth.uid())
);

-- Grooming session files
CREATE POLICY "Client or provider reads session" ON public.grooming_session_files FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = booking_id AND (
      b.client_id = auth.uid() OR
      EXISTS (SELECT 1 FROM public.service_providers WHERE id = b.provider_id AND user_id = auth.uid())
    )
  )
);
CREATE POLICY "Provider manages session file" ON public.grooming_session_files FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.service_providers sp ON sp.id = b.provider_id
    WHERE b.id = booking_id AND sp.user_id = auth.uid()
  )
);

-- Reviews — public read
CREATE POLICY "Anyone reads reviews" ON public.reviews FOR SELECT USING (TRUE);
CREATE POLICY "Client posts review" ON public.reviews FOR INSERT WITH CHECK (reviewer_id = auth.uid());
CREATE POLICY "Provider can respond" ON public.reviews FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.service_providers WHERE id = provider_id AND user_id = auth.uid())
);

-- Messages
CREATE POLICY "Users read own messages" ON public.messages FOR SELECT USING (
  sender_id = auth.uid() OR recipient_id = auth.uid()
);
CREATE POLICY "Users send messages" ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Users update own messages" ON public.messages FOR UPDATE USING (recipient_id = auth.uid());

-- Loyalty
CREATE POLICY "Users read own loyalty" ON public.loyalty_transactions FOR SELECT USING (user_id = auth.uid());

-- Notifications
CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL USING (user_id = auth.uid());

-- ─── STORAGE BUCKETS ─────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', TRUE),
  ('pet-photos', 'pet-photos', TRUE),
  ('portfolio', 'portfolio', TRUE),
  ('session-files', 'session-files', FALSE),
  ('documents', 'documents', FALSE)
ON CONFLICT DO NOTHING;

CREATE POLICY "Public read avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Auth upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Public read pet photos" ON storage.objects FOR SELECT USING (bucket_id = 'pet-photos');
CREATE POLICY "Auth upload pet photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pet-photos' AND auth.role() = 'authenticated');
CREATE POLICY "Public read portfolio" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio');
CREATE POLICY "Auth upload portfolio" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'portfolio' AND auth.role() = 'authenticated');
