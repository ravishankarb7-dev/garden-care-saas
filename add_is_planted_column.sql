-- Add is_planted column to care_sessions
ALTER TABLE care_sessions 
ADD COLUMN is_planted BOOLEAN DEFAULT true;

-- Update existing records to be true (safe assumption for migration)
UPDATE care_sessions SET is_planted = true WHERE is_planted IS NULL;
