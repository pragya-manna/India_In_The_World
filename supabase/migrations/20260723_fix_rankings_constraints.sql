ALTER TABLE rankings ALTER COLUMN rank DROP NOT NULL;

ALTER TABLE rankings 
ADD CONSTRAINT rankings_indicator_country_year_unique 
UNIQUE (indicator_id, country_id, year);