export type Rank = 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface NobleArt {
  id: string;
  name: string;
  cost: string;
  description: string;
}

export type SectionType = 'identity' | 'stats' | 'blaze' | 'battlefront' | 'combat_data' | 'noble_arts' | 'custom_text' | 'custom_image' | 'separator';

export interface Section {
  id: string;
  type: SectionType;
  title?: string;
  content?: string;
  imageUrl?: string;
  isCore?: boolean;
}

export type Character = {
  id: string;
  user_id?: string;
  name: string;
  subtitle: string;
  image_url: string;
  age: string;
  height: string;
  nationality: string;
  
  // New Blaze Fields
  blaze_image_url: string;
  element_user: string;
  element_blaze: string;
  element_advanced: string;
  blaze_type: string;

  // Battlefront (formerly Clan)
  battlefront_name: string;
  battlefront_desc: string;
  
  // Combat Stats
  offensive_power: Rank;
  defensive_power: Rank;
  mana_amount: Rank;
  mana_control: Rank;
  physical_ability: Rank;
  luck: Rank;

  // Noble Arts
  noble_arts: NobleArt[];

  // Deprecated/Mapped fields (kept for backward compatibility)
  clan_name: string;
  clan_desc: string; 
  
  quote: string;
  theme_color: string;
  created_at?: string;

  // Customization
  font_heading: string;
  font_body: string;
  text_color: string;
  quote_font?: string;
  quote_color?: string;
  quote_size?: string;
  quote_italic?: boolean;
  background_color: string;
  background_image_url: string;
  background_overlay_opacity: number;
  frame_style: 'simple' | 'ornate' | 'tech' | 'none';
  image_fit?: 'cover' | 'contain';
  
  // Layout
  layout: Section[];

  // Info box card style
  card_bg_color?: string;     // hex — background of all info cards
  card_bg_opacity?: number;   // 0–1 — opacity of card background

  // Blaze image options
  blaze_show_border?: boolean;  // show/hide the border around blaze image
  blaze_image_size?: 'sm' | 'md' | 'lg' | 'full'; // portrait size
};

export const DEFAULT_LAYOUT: Section[] = [
  { id: 'stats', type: 'stats', isCore: true },
  { id: 'blaze', type: 'blaze', isCore: true },
  { id: 'battlefront', type: 'battlefront', isCore: true },
  { id: 'combat_data', type: 'combat_data', isCore: true },
  { id: 'noble_arts', type: 'noble_arts', isCore: true },
];

export const DEFAULT_CHARACTER: Character = {
  id: 'demo',
  name: 'Nombre del Cadete',
  subtitle: 'Título o Clasificación',
  image_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop',
  age: '18 Años',
  height: '1.70 m',
  nationality: 'Nacionalidad',
  
  blaze_image_url: 'https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?q=80&w=1000&auto=format&fit=crop',
  element_user: 'Elemento Base',
  element_blaze: 'Elemento Principal',
  element_advanced: 'Elemento Derivado',
  blaze_type: 'Tipo de Arma/Forma',

  battlefront_name: 'Escuadrón',
  battlefront_desc: 'Descripción del escuadrón o división asignada.',
  
  offensive_power: 'C',
  defensive_power: 'C',
  mana_amount: 'C',
  mana_control: 'C',
  physical_ability: 'C',
  luck: 'C',

  noble_arts: [],

  clan_name: 'Escuadrón',
  clan_desc: 'Descripción',
  
  quote: '"Una frase inspiradora o lema personal del personaje."',
  theme_color: '#E8C4C4',

  // Defaults
  font_heading: 'var(--font-cormorant)',
  font_body: 'var(--font-inter)',
  text_color: '#2D2D2D',
  quote_font: 'var(--font-cormorant)',
  quote_color: '',
  quote_size: 'text-2xl md:text-3xl',
  quote_italic: true,
  background_color: '#FFF5F5',
  background_image_url: '',
  background_overlay_opacity: 0.5,
  frame_style: 'ornate',
  image_fit: 'cover',
  
  layout: DEFAULT_LAYOUT,

  card_bg_color: '#ffffff',
  card_bg_opacity: 0.4,
  blaze_show_border: true,
  blaze_image_size: 'md',
};
