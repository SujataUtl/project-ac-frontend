export const SETTING_KEYS = [
  'company_name', 'tagline',
  'hero_headline', 'hero_subtext', 'hero_primary_cta', 'hero_secondary_cta',
  'about_short', 'about_intro', 'vision', 'mission', 'team_expertise',
  'cta_headline', 'cta_text',
  'contact_heading', 'contact_email', 'contact_phone', 'contact_whatsapp', 'contact_address', 'linkedin_url',
  'seo_title', 'seo_description',
  // Inner-page content (hero text, 3D hero image, feature videos)
  'about_eyebrow', 'about_hero_image',
  'services_eyebrow', 'services_title', 'services_lead', 'services_hero_image', 'services_video_url', 'services_video_title', 'services_video_text',
  'portfolio_eyebrow', 'portfolio_title', 'portfolio_lead', 'portfolio_hero_image', 'portfolio_video_url', 'portfolio_video_title', 'portfolio_video_text',
  'technology_eyebrow', 'technology_title', 'technology_lead', 'technology_hero_image', 'technology_video_url', 'technology_video_title', 'technology_video_text',
  'industries_eyebrow', 'industries_title', 'industries_lead', 'industries_hero_image',
  'process_eyebrow', 'process_title', 'process_lead', 'process_hero_image',
  'contact_eyebrow', 'contact_hero_image', 'contact_side_title', 'contact_side_text', 'contact_form_title',
  'contact_promises', 'contact_budgets', 'contact_success_title', 'contact_success_text',
  // SEO, social sharing & structured data
  'site_url', 'seo_keywords', 'seo_og_image', 'legal_name', 'twitter_handle',
  'geo_region', 'geo_placename', 'geo_position',
  'facebook_url', 'instagram_url', 'x_url', 'youtube_url', 'google_maps_url',
  // Analytics & tracking (IDs only — never secrets)
  'ga4_id', 'gtm_id', 'hotjar_id',
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];
export type Settings = Record<SettingKey, string>;

/**
 * Defaults for page-content settings. Used when a key has never been saved
 * (e.g. the database was created before these settings existed).
 */
export const SETTING_DEFAULTS: Partial<Settings> = {
  about_eyebrow: 'About us', about_hero_image: '',
  services_eyebrow: 'Services', services_title: 'What we build',
  services_lead: 'Complete software development services — from mobile and web to IoT, AI and the cloud infrastructure that runs it all.',
  services_hero_image: '', services_video_url: '', services_video_title: 'See how we deliver', services_video_text: 'A quick look at how our team takes products from idea to launch.',
  portfolio_eyebrow: 'Our work', portfolio_title: 'Portfolio',
  portfolio_lead: 'A selection of products and platforms our team has engineered — the problem, our solution and the technology behind it.',
  portfolio_hero_image: '', portfolio_video_url: '', portfolio_video_title: 'Our work in action', portfolio_video_text: 'Walk through some of the products we have built.',
  technology_eyebrow: 'Technology stack', technology_title: 'Tools we deliver with',
  technology_lead: 'Proven, modern technologies our team uses to build reliable mobile, web and IoT products.',
  technology_hero_image: '', technology_video_url: '', technology_video_title: 'Inside our engineering', technology_video_text: 'How our stack fits together to ship reliable software.',
  industries_eyebrow: 'Industries', industries_title: 'Industries we serve',
  industries_lead: 'We apply mobile, web and IoT engineering to the specific problems of each sector.', industries_hero_image: '',
  process_eyebrow: 'Our process', process_title: 'How we work with you',
  process_lead: 'A clear, collaborative process from the first conversation to long-term support.', process_hero_image: '',
  contact_eyebrow: 'Contact us', contact_hero_image: '',
  contact_side_title: "Let's start a conversation",
  contact_side_text: "Share a few details about your idea. We'll reply with next steps, questions and a rough approach.",
  contact_form_title: 'Tell us about your project',
  contact_promises: 'A prompt, personal reply\nYour details stay confidential',
  contact_budgets: 'Under $5,000\n$5,000 – $15,000\n$15,000 – $50,000\n$50,000+\nNot sure yet',
  contact_success_title: 'Thank you — message received!',
  contact_success_text: "We've got your enquiry and will get back to you shortly.",
  site_url: '', seo_og_image: '', legal_name: '', twitter_handle: '',
  seo_keywords: 'mobile app development, web application development, IoT development services, custom software development, SaaS development, full-stack development',
  geo_region: '', geo_placename: '', geo_position: '',
  facebook_url: '', instagram_url: '', x_url: '', youtube_url: '', google_maps_url: '',
  ga4_id: '', gtm_id: '', hotjar_id: '',
};

/** Split a multi-line setting into trimmed, non-empty lines. */
export const lines = (v: string | null | undefined) => (v ?? '').split('\n').map((s) => s.trim()).filter(Boolean);

export interface Service {
  id: number; slug: string; title: string; icon: string | null;
  short_description: string | null; description: string | null; features: string[]; video_url: string | null;
  seo_title: string | null; seo_description: string | null;
  sort_order: number; is_published: boolean;
}

export interface Project {
  id: number; slug: string; title: string; category: string | null; client_type: string | null;
  summary: string | null; problem: string | null; solution: string | null; results: string | null;
  technologies: string[]; image_url: string | null; video_url: string | null;
  sort_order: number; is_featured: boolean; is_published: boolean;
}

export interface TechItem { id: number; category: string; name: string; sort_order: number; is_published: boolean; }
export interface Industry { id: number; title: string; icon: string | null; description: string | null; sort_order: number; is_published: boolean; }
export interface ProcessStep { id: number; title: string; description: string | null; sort_order: number; is_published: boolean; }
export interface Highlight { id: number; group_name: string; icon: string | null; title: string; description: string | null; sort_order: number; is_published: boolean; }

export interface SiteContent {
  settings: Settings;
  services: Service[];
  projects: Project[];
  techStack: TechItem[];
  industries: Industry[];
  processSteps: ProcessStep[];
  highlights: Highlight[];
}

export interface Enquiry {
  id: number; name: string; company: string | null; email: string; phone: string | null;
  project_type: string | null; budget: string | null; message: string;
  status: 'new' | 'in_progress' | 'closed'; created_at: string;
}

export interface EnquiryInput {
  name: string; company: string; email: string; phone: string;
  project_type: string; budget: string; message: string; website: string;
}

export interface AdminUser { id: number; name: string; email: string; }
