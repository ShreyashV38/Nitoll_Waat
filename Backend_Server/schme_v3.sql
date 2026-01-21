-- ==================================================
-- NITOLL WAAT - DEFINITIVE HACKATHON SCHEMA (V3)
-- Target Database: NEW DATABASE (e.g., nitoll_waat_v2)
-- Structure: Robust, Efficient, Three-Hub Architecture with Unified Auth
-- ==================================================

-- PART 0: SAFETY PROTOCOL (Ensure clean slate just in case)
-- We add IF EXISTS to avoid errors on a brand new DB
DROP TABLE IF EXISTS route_stops CASCADE;
DROP TABLE IF EXISTS routes CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS bin_readings CASCADE;
DROP TABLE IF EXISTS bins CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS areas CASCADE;

-- Drop old ENUMs to ensure a clean re-definition
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS vehicle_status CASCADE;
DROP TYPE IF EXISTS vehicle_type CASCADE;
DROP TYPE IF EXISTS bin_status CASCADE;
DROP TYPE IF EXISTS lid_status CASCADE;
DROP TYPE IF EXISTS alert_severity CASCADE;
DROP TYPE IF EXISTS route_status CASCADE;
DROP TYPE IF EXISTS stop_status CASCADE;

-- Enable UUID extension required for IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ==================================================
-- PART 1: ENUM DEFINITIONS (Data Integrity Layer)
-- ==================================================
CREATE TYPE user_role AS ENUM ('ADMIN', 'DRIVER');
CREATE TYPE vehicle_status AS ENUM ('ACTIVE', 'MAINTENANCE', 'DECOMMISSIONED');
CREATE TYPE vehicle_type AS ENUM ('OPEN_TRUCK', 'COMPACTOR');
CREATE TYPE bin_status AS ENUM ('NORMAL', 'WARNING', 'CRITICAL', 'OFFLINE');
CREATE TYPE lid_status AS ENUM ('CLOSED', 'OPEN', 'JAMMED');
CREATE TYPE alert_severity AS ENUM ('MEDIUM', 'HIGH');
CREATE TYPE route_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE stop_status AS ENUM ('PENDING', 'COLLECTED', 'SKIPPED');


-- ==================================================
-- HUB 1: THE AREA & SECURITY HUB
-- ==================================================

-- 1. Areas Table (The geographical root)
CREATE TABLE areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    area_name VARCHAR(100) NOT NULL UNIQUE,
    taluka VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table (Unified Auth & Hierarchy)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    area_id UUID NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    mobile VARCHAR(20) NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'DRIVER',
    -- SELF-REFERENCING KEY: Admins have NULL, Drivers have an Admin ID.
    supervisor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Vehicles Table
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    area_id UUID NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    type vehicle_type NOT NULL DEFAULT 'OPEN_TRUCK',
    status vehicle_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- ==================================================
-- HUB 2: THE BIN PERFORMANCE HUB
-- ==================================================

-- 4. Bins Table ("Live State" - Hot Data)
CREATE TABLE bins (
    id UUID PRIMARY KEY, -- IMPORTANT: Use actual Hardware UUID here
    area_id UUID NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    current_fill_percent INT CHECK (current_fill_percent BETWEEN 0 AND 100) DEFAULT 0,
    lid_status lid_status DEFAULT 'CLOSED',
    lid_angle INT DEFAULT 0,
    status bin_status NOT NULL DEFAULT 'NORMAL',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);
CREATE INDEX idx_bins_area ON bins(area_id);


-- 5. Bin Readings Table ("History Log" - Cold Data)
CREATE TABLE bin_readings (
    id BIGSERIAL PRIMARY KEY,
    bin_id UUID NOT NULL REFERENCES bins(id) ON DELETE CASCADE,
    fill_percent INT NOT NULL,
    lid_status lid_status,
    lid_angle INT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_readings_bin_time ON bin_readings(bin_id, recorded_at DESC);


-- 6. Alerts Table (Active Issues)
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bin_id UUID NOT NULL REFERENCES bins(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    severity alert_severity NOT NULL DEFAULT 'MEDIUM',
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);


-- ==================================================
-- HUB 3: THE ROUTE HUB (Logistics & Navigation)
-- ==================================================

-- 7. Routes Table (The Trip Manifest Header)
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    area_id UUID NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    route_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status route_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_routes_driver_date ON routes(driver_id, route_date);


-- 8. Route Stops Table (The Path Sequence Details)
CREATE TABLE route_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    bin_id UUID NOT NULL REFERENCES bins(id) ON DELETE CASCADE,
    sequence_order INT NOT NULL,
    status stop_status NOT NULL DEFAULT 'PENDING',
    collected_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(route_id, bin_id),
    UNIQUE(route_id, sequence_order)
);

-- ==================================================
-- SCHEMA GENERATION COMPLETE
-- ==================================================