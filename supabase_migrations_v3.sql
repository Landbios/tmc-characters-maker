-- Add text color, frame style, and battlefront fields
alter table characters 
add column if not exists text_color text default '#2D2D2D',
add column if not exists frame_style text default 'ornate',
add column if not exists battlefront_name text,
add column if not exists battlefront_desc text;
