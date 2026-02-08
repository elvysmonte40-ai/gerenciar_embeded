-- Add department_id to job_titles
ALTER TABLE job_titles 
ADD COLUMN department_id UUID REFERENCES departments(id);

-- Backfill department_id from sectors
UPDATE job_titles jt
SET department_id = s.department_id
FROM sectors s
WHERE jt.sector_id = s.id;

-- Add index for performance
CREATE INDEX idx_job_titles_department_id ON job_titles(department_id);

-- Notify pgrst to reload schema cache
NOTIFY pgrst, 'reload config';
