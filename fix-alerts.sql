-- Fix missing 'type' column in alerts table
ALTER TABLE public.alerts 
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('outbreak', 'warning', 'info', 'prevention')) DEFAULT 'warning';

-- Then insert the sample data
INSERT INTO public.alerts (title, description, severity, status, type, affected_areas) VALUES
('Water Contamination Alert', 'High bacteria levels detected in village wells. Boil water before drinking.', 'high', 'active', 'warning', ARRAY['North Village', 'South Village']),
('Cholera Outbreak', 'Multiple cholera cases reported. Maintain hygiene and drink boiled water only.', 'critical', 'active', 'outbreak', ARRAY['East Village']),
('Vaccination Drive', 'Free typhoid vaccination camp this weekend at health center.', 'low', 'active', 'info', ARRAY['All Villages']);
