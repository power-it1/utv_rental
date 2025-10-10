-- Adventure Rentals Database Schema
-- This file contains all the SQL needed to set up your Supabase database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE vehicle_type AS ENUM ('motorcycle', 'utv', 'guided_tour');
CREATE TYPE rental_status AS ENUM ('pending', 'confirmed', 'active', 'completed', 'cancelled');

-- User roles
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  phone TEXT,
  role user_role DEFAULT 'user' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Vehicles table
CREATE TABLE vehicles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type vehicle_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_per_day DECIMAL(10,2) NOT NULL CHECK (price_per_day > 0),
  images TEXT[] DEFAULT '{}',
  available BOOLEAN DEFAULT true NOT NULL,
  specifications JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Rentals table
CREATE TABLE rentals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price > 0),
  status rental_status DEFAULT 'pending' NOT NULL,
  notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_date_range CHECK (end_date > start_date),
  CONSTRAINT future_start_date CHECK (start_date >= CURRENT_DATE)
);

-- GPS Tracking table
CREATE TABLE gps_tracking (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  rental_id UUID REFERENCES rentals(id) ON DELETE CASCADE NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  speed DECIMAL(5, 2),
  heading INTEGER,
  altitude DECIMAL(8, 2),
  accuracy DECIMAL(5, 2),
  battery_level INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_latitude CHECK (latitude >= -90 AND latitude <= 90),
  CONSTRAINT valid_longitude CHECK (longitude >= -180 AND longitude <= 180),
  CONSTRAINT valid_heading CHECK (heading >= 0 AND heading < 360),
  CONSTRAINT valid_battery CHECK (battery_level >= 0 AND battery_level <= 100)
);

-- Activity logs table
CREATE TABLE activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_vehicles_type ON vehicles(type);
CREATE INDEX idx_vehicles_available ON vehicles(available);
CREATE INDEX idx_rentals_user_id ON rentals(user_id);
CREATE INDEX idx_rentals_vehicle_id ON rentals(vehicle_id);
CREATE INDEX idx_rentals_status ON rentals(status);
CREATE INDEX idx_rentals_dates ON rentals(start_date, end_date);
CREATE INDEX idx_gps_tracking_rental_id ON gps_tracking(rental_id);
CREATE INDEX idx_gps_tracking_timestamp ON gps_tracking(timestamp DESC);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON profiles FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete profiles" ON profiles FOR DELETE USING (is_admin());

-- Vehicles policies
CREATE POLICY "Anyone can view available vehicles" ON vehicles FOR SELECT USING (available = true);
CREATE POLICY "Authenticated users can view all vehicles" ON vehicles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can insert vehicles" ON vehicles FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update vehicles" ON vehicles FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete vehicles" ON vehicles FOR DELETE USING (is_admin());

-- Rentals policies
CREATE POLICY "Users can view own rentals" ON rentals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own rentals" ON rentals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rentals" ON rentals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all rentals" ON rentals FOR SELECT USING (is_admin());
CREATE POLICY "Admins can update all rentals" ON rentals FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete rentals" ON rentals FOR DELETE USING (is_admin());

-- GPS Tracking policies
CREATE POLICY "Users can view GPS for own rentals" ON gps_tracking FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM rentals r 
    WHERE r.id = gps_tracking.rental_id AND r.user_id = auth.uid()
  )
);
CREATE POLICY "Admins can view all GPS data" ON gps_tracking FOR SELECT USING (is_admin());
CREATE POLICY "Admins can insert GPS data" ON gps_tracking FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "System can insert GPS data" ON gps_tracking FOR INSERT WITH CHECK (true);

-- Activity logs policies
CREATE POLICY "Admins can view all logs" ON activity_logs FOR SELECT USING (is_admin());
CREATE POLICY "System can insert logs" ON activity_logs FOR INSERT WITH CHECK (true);

-- Functions

-- Function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_timestamp_profiles BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_timestamp_vehicles BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_timestamp_rentals BEFORE UPDATE ON rentals FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- Sample data (optional - for testing)
INSERT INTO vehicles (type, name, description, price_per_day, specifications) VALUES
('motorcycle', 'Yamaha MT-07', 'Lightweight and agile naked bike perfect for city riding and weekend adventures', 85.00, '{"engine": "689cc", "power": "75hp", "weight": "184kg", "fuel_capacity": "14L"}'),
('motorcycle', 'Harley Davidson Street Glide', 'Classic American cruiser with touring capabilities and comfort features', 150.00, '{"engine": "1868cc", "power": "90hp", "weight": "372kg", "fuel_capacity": "22.7L"}'),
('utv', 'Polaris RZR XP 1000', 'High-performance side-by-side perfect for off-road adventures and trail riding', 200.00, '{"engine": "999cc", "power": "110hp", "seating": "2", "4wd": true}'),
('utv', 'Can-Am Maverick X3', 'Premium sport UTV with exceptional suspension and handling for extreme terrain', 250.00, '{"engine": "900cc", "power": "120hp", "seating": "2", "suspension": "Fox Racing Shox"}'),
('guided_tour', 'Scenic Mountain Tour', 'Full-day guided motorcycle tour through scenic mountain roads with lunch included', 300.00, '{"duration": "8 hours", "includes": "Guide, fuel, lunch", "difficulty": "Intermediate", "max_group": "6"}'),
('guided_tour', 'Desert UTV Adventure', 'Half-day guided UTV tour exploring desert trails and canyons', 180.00, '{"duration": "4 hours", "includes": "Guide, safety gear", "difficulty": "Beginner", "max_group": "4"});

-- Views for easier querying

-- Available vehicles view
CREATE VIEW available_vehicles AS
SELECT 
  v.*,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM rentals r 
      WHERE r.vehicle_id = v.id 
      AND r.status IN ('confirmed', 'active')
      AND r.start_date <= CURRENT_DATE + INTERVAL '30 days'
      AND r.end_date >= CURRENT_DATE
    ) THEN false
    ELSE v.available
  END as currently_available
FROM vehicles v
WHERE v.available = true;