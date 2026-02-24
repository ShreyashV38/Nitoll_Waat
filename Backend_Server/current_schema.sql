--
-- PostgreSQL database dump
--

\restrict Hneq0h59sQ1C3oi0esdEwJNPPpqvTgOw2DLoPEhYYPSvsK5p5hfcgbiiDalfS31

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: alert_severity; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.alert_severity AS ENUM (
    'MEDIUM',
    'HIGH',
    'INFO',
    'SUCCESS'
);


--
-- Name: bin_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.bin_status AS ENUM (
    'NORMAL',
    'WARNING',
    'CRITICAL',
    'OFFLINE',
    'BLOCKED_VIEW',
    'BLOCKED',
    'FULL'
);


--
-- Name: lid_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.lid_status AS ENUM (
    'CLOSED',
    'OPEN',
    'JAMMED'
);


--
-- Name: route_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.route_status AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


--
-- Name: stop_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.stop_status AS ENUM (
    'PENDING',
    'COLLECTED',
    'SKIPPED'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'ADMIN',
    'DRIVER'
);


--
-- Name: vehicle_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.vehicle_status AS ENUM (
    'ACTIVE',
    'MAINTENANCE',
    'DECOMMISSIONED'
);


--
-- Name: vehicle_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.vehicle_type AS ENUM (
    'OPEN_TRUCK',
    'COMPACTOR',
    'TIPPER',
    'MINI_TRUCK'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alerts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alerts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    bin_id uuid,
    message text NOT NULL,
    severity public.alert_severity DEFAULT 'MEDIUM'::public.alert_severity NOT NULL,
    is_resolved boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    resolved_at timestamp with time zone
);


--
-- Name: areas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.areas (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    area_name character varying(100) NOT NULL,
    taluka character varying(100) NOT NULL,
    district character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: bin_readings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bin_readings (
    id bigint NOT NULL,
    bin_id uuid NOT NULL,
    fill_percent integer NOT NULL,
    lid_status public.lid_status,
    lid_angle integer,
    recorded_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    weight numeric DEFAULT 0.00,
    status character varying(20) DEFAULT 'NORMAL'::character varying
);


--
-- Name: bin_readings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bin_readings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bin_readings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bin_readings_id_seq OWNED BY public.bin_readings.id;


--
-- Name: bins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bins (
    id uuid NOT NULL,
    area_id uuid NOT NULL,
    latitude numeric(10,8) NOT NULL,
    longitude numeric(11,8) NOT NULL,
    current_fill_percent integer DEFAULT 0,
    lid_status public.lid_status DEFAULT 'CLOSED'::public.lid_status,
    lid_angle integer DEFAULT 0,
    status public.bin_status DEFAULT 'NORMAL'::public.bin_status NOT NULL,
    last_updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean DEFAULT true,
    ward_id uuid,
    current_weight numeric(10,2) DEFAULT 0.00,
    CONSTRAINT bins_current_fill_percent_check CHECK (((current_fill_percent >= 0) AND (current_fill_percent <= 100)))
);


--
-- Name: dumping_zones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dumping_zones (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    area_id uuid,
    name character varying(100) NOT NULL,
    latitude numeric(10,8) NOT NULL,
    longitude numeric(11,8) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: otps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.otps (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    code character varying(6) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: otps_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.otps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: otps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.otps_id_seq OWNED BY public.otps.id;


--
-- Name: route_stops; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.route_stops (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    route_id uuid NOT NULL,
    bin_id uuid NOT NULL,
    sequence_order integer NOT NULL,
    status public.stop_status DEFAULT 'PENDING'::public.stop_status NOT NULL,
    collected_at timestamp with time zone
);


--
-- Name: routes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.routes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    area_id uuid NOT NULL,
    driver_id uuid,
    vehicle_id uuid,
    route_date date DEFAULT CURRENT_DATE NOT NULL,
    status public.route_status DEFAULT 'PENDING'::public.route_status NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    ward_id uuid,
    completed_at timestamp with time zone
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    area_id uuid NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    name character varying(100) NOT NULL,
    mobile character varying(20) NOT NULL,
    role public.user_role DEFAULT 'DRIVER'::public.user_role NOT NULL,
    supervisor_id uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    assigned_ward_id uuid
);


--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vehicles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    area_id uuid NOT NULL,
    license_plate character varying(20) NOT NULL,
    type public.vehicle_type DEFAULT 'OPEN_TRUCK'::public.vehicle_type NOT NULL,
    status public.vehicle_status DEFAULT 'ACTIVE'::public.vehicle_status NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    driver_id uuid
);


--
-- Name: wards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wards (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    area_id uuid,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: bin_readings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bin_readings ALTER COLUMN id SET DEFAULT nextval('public.bin_readings_id_seq'::regclass);


--
-- Name: otps id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otps ALTER COLUMN id SET DEFAULT nextval('public.otps_id_seq'::regclass);


--
-- Name: alerts alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_pkey PRIMARY KEY (id);


--
-- Name: areas areas_area_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas
    ADD CONSTRAINT areas_area_name_key UNIQUE (area_name);


--
-- Name: areas areas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.areas
    ADD CONSTRAINT areas_pkey PRIMARY KEY (id);


--
-- Name: bin_readings bin_readings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bin_readings
    ADD CONSTRAINT bin_readings_pkey PRIMARY KEY (id);


--
-- Name: bins bins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bins
    ADD CONSTRAINT bins_pkey PRIMARY KEY (id);


--
-- Name: dumping_zones dumping_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dumping_zones
    ADD CONSTRAINT dumping_zones_pkey PRIMARY KEY (id);


--
-- Name: otps otps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otps
    ADD CONSTRAINT otps_pkey PRIMARY KEY (id);


--
-- Name: route_stops route_stops_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.route_stops
    ADD CONSTRAINT route_stops_pkey PRIMARY KEY (id);


--
-- Name: route_stops route_stops_route_id_bin_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.route_stops
    ADD CONSTRAINT route_stops_route_id_bin_id_key UNIQUE (route_id, bin_id);


--
-- Name: route_stops route_stops_route_id_sequence_order_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.route_stops
    ADD CONSTRAINT route_stops_route_id_sequence_order_key UNIQUE (route_id, sequence_order);


--
-- Name: routes routes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.routes
    ADD CONSTRAINT routes_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_mobile_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_mobile_key UNIQUE (mobile);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vehicles vehicles_license_plate_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_license_plate_key UNIQUE (license_plate);


--
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);


--
-- Name: wards wards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wards
    ADD CONSTRAINT wards_pkey PRIMARY KEY (id);


--
-- Name: idx_bins_area; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bins_area ON public.bins USING btree (area_id);


--
-- Name: idx_readings_bin_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_readings_bin_time ON public.bin_readings USING btree (bin_id, recorded_at DESC);


--
-- Name: idx_routes_driver_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_routes_driver_date ON public.routes USING btree (driver_id, route_date);


--
-- Name: alerts alerts_bin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_bin_id_fkey FOREIGN KEY (bin_id) REFERENCES public.bins(id) ON DELETE CASCADE;


--
-- Name: bin_readings bin_readings_bin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bin_readings
    ADD CONSTRAINT bin_readings_bin_id_fkey FOREIGN KEY (bin_id) REFERENCES public.bins(id) ON DELETE CASCADE;


--
-- Name: bins bins_area_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bins
    ADD CONSTRAINT bins_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.areas(id) ON DELETE CASCADE;


--
-- Name: bins bins_ward_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bins
    ADD CONSTRAINT bins_ward_id_fkey FOREIGN KEY (ward_id) REFERENCES public.wards(id);


--
-- Name: dumping_zones dumping_zones_area_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dumping_zones
    ADD CONSTRAINT dumping_zones_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.areas(id) ON DELETE CASCADE;


--
-- Name: route_stops route_stops_bin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.route_stops
    ADD CONSTRAINT route_stops_bin_id_fkey FOREIGN KEY (bin_id) REFERENCES public.bins(id) ON DELETE CASCADE;


--
-- Name: route_stops route_stops_route_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.route_stops
    ADD CONSTRAINT route_stops_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.routes(id) ON DELETE CASCADE;


--
-- Name: routes routes_area_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.routes
    ADD CONSTRAINT routes_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.areas(id) ON DELETE CASCADE;


--
-- Name: routes routes_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.routes
    ADD CONSTRAINT routes_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: routes routes_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.routes
    ADD CONSTRAINT routes_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE SET NULL;


--
-- Name: users users_area_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.areas(id) ON DELETE CASCADE;


--
-- Name: users users_assigned_ward_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_assigned_ward_id_fkey FOREIGN KEY (assigned_ward_id) REFERENCES public.wards(id);


--
-- Name: users users_supervisor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_supervisor_id_fkey FOREIGN KEY (supervisor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: vehicles vehicles_area_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.areas(id) ON DELETE CASCADE;


--
-- Name: vehicles vehicles_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.users(id);


--
-- Name: wards wards_area_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wards
    ADD CONSTRAINT wards_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.areas(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict Hneq0h59sQ1C3oi0esdEwJNPPpqvTgOw2DLoPEhYYPSvsK5p5hfcgbiiDalfS31

