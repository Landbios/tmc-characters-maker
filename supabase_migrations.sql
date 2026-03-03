-- Add new columns for customization
alter table characters 
add column if not exists font_heading text default 'var(--font-cormorant)',
add column if not exists font_body text default 'var(--font-inter)',
add column if not exists background_color text default '#FFF5F5',
add column if not exists background_image_url text,
add column if not exists background_overlay_opacity float default 0.5,
add column if not exists show_stats boolean default true,
add column if not exists show_elements boolean default true,
add column if not exists show_ability boolean default true,
add column if not exists show_clan boolean default true;
