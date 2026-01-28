-- Add new columns safely
ALTER TABLE care_sessions 
ADD COLUMN IF NOT EXISTS store_name TEXT,
ADD COLUMN IF NOT EXISTS store_zip TEXT,
ADD COLUMN IF NOT EXISTS purchase_price NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS starter_size TEXT;
