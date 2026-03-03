-- Add layout and new blaze columns
alter table characters 
add column if not exists layout jsonb default '[
  {"id": "stats", "type": "stats", "isCore": true},
  {"id": "blaze", "type": "blaze", "isCore": true},
  {"id": "clan", "type": "clan", "isCore": true}
]'::jsonb,
add column if not exists blaze_image_url text,
add column if not exists element_user text,
add column if not exists element_blaze text,
add column if not exists element_advanced text,
add column if not exists blaze_type text;
