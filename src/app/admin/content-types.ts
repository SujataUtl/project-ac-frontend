import { SettingKey } from '../core/models';

export type FieldType = 'text' | 'textarea' | 'number' | 'checkbox' | 'list' | 'image' | 'video' | 'select' | 'slug' | 'icon';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  hint?: string;
  options?: { value: string; label: string }[];
  full?: boolean;
}

export interface ContentType {
  key: string;          // API resource name
  label: string;        // plural, for menus
  singular: string;
  columns: { key: string; label: string }[];
  fields: FieldDef[];
  defaults: Record<string, unknown>;
}

const order: FieldDef = { key: 'sort_order', label: 'Display order', type: 'number', hint: 'Lower numbers appear first' };
const published: FieldDef = { key: 'is_published', label: 'Published (visible on the website)', type: 'checkbox' };

export const CONTENT_TYPES: ContentType[] = [
  {
    key: 'services', label: 'Services', singular: 'Service',
    columns: [{ key: 'title', label: 'Title' }, { key: 'slug', label: 'URL slug' }],
    defaults: { features: [], sort_order: 0, is_published: true },
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'slug', label: 'URL slug', type: 'slug', required: true, hint: 'Used in the page address: /services/your-slug' },
      { key: 'icon', label: 'Icon', type: 'icon', full: true },
      order,
      { key: 'short_description', label: 'Short description', type: 'textarea', full: true, hint: 'Shown on cards (1–2 sentences)' },
      { key: 'description', label: 'Full description', type: 'textarea', full: true },
      { key: 'features', label: 'Features / sub-services', type: 'list', full: true, hint: 'One per line' },
      { key: 'video_url', label: 'Video', type: 'video', full: true, hint: 'Upload an MP4/WEBM (max 100 MB) or paste a YouTube / Vimeo link. Shown on the detail page.' },
      { key: 'seo_title', label: 'SEO title', type: 'text' },
      { key: 'seo_description', label: 'SEO description', type: 'text' },
      published,
    ],
  },
  {
    key: 'projects', label: 'Portfolio', singular: 'Project',
    columns: [{ key: 'title', label: 'Title' }, { key: 'category', label: 'Category' }, { key: 'is_featured', label: 'Featured' }],
    defaults: { technologies: [], client_type: '', sort_order: 0, is_featured: false, is_published: true },
    fields: [
      { key: 'title', label: 'Project name', type: 'text', required: true },
      { key: 'slug', label: 'URL slug', type: 'slug', required: true, hint: '/portfolio/your-slug' },
      { key: 'category', label: 'Category', type: 'text', hint: 'e.g. Web Application / IoT' },
      { key: 'client_type', label: 'Label', type: 'select', hint: 'Distinguish company projects from prior team experience',
        options: [{ value: '', label: '— none —' }, { value: 'App Circuit Labs project', label: 'App Circuit Labs project' }, { value: 'Team experience', label: 'Team experience' }, { value: 'Personal project', label: 'Personal project' }] },
      { key: 'summary', label: 'Summary', type: 'textarea', full: true, hint: 'Shown on the project card' },
      { key: 'problem', label: 'Problem', type: 'textarea' },
      { key: 'solution', label: 'Solution', type: 'textarea' },
      { key: 'results', label: 'Results', type: 'textarea', full: true, hint: 'Only include verified, measurable results' },
      { key: 'technologies', label: 'Technologies', type: 'list', hint: 'One per line' },
      { key: 'image_url', label: 'Screenshot', type: 'image', hint: 'Also used as the video poster' },
      { key: 'video_url', label: 'Video', type: 'video', full: true, hint: 'Upload an MP4/WEBM (max 100 MB) or paste a YouTube / Vimeo link. Shown on the detail page.' },
      order,
      { key: 'is_featured', label: 'Featured on the homepage', type: 'checkbox' },
      published,
    ],
  },
  {
    key: 'tech-stack', label: 'Technology Stack', singular: 'Technology',
    columns: [{ key: 'category', label: 'Category' }, { key: 'name', label: 'Technology' }],
    defaults: { sort_order: 0, is_published: true },
    fields: [
      { key: 'name', label: 'Technology name', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'text', required: true, hint: 'e.g. Frontend, Backend, Mobile, Database & Cloud, IoT' },
      order,
      published,
    ],
  },
  {
    key: 'industries', label: 'Industries', singular: 'Industry',
    columns: [{ key: 'title', label: 'Industry' }],
    defaults: { sort_order: 0, is_published: true },
    fields: [
      { key: 'title', label: 'Industry', type: 'text', required: true },
      { key: 'icon', label: 'Icon', type: 'icon', full: true },
      { key: 'description', label: 'Description', type: 'textarea', full: true },
      order,
      published,
    ],
  },
  {
    key: 'process-steps', label: 'Process Steps', singular: 'Process step',
    columns: [{ key: 'title', label: 'Step' }],
    defaults: { sort_order: 0, is_published: true },
    fields: [
      { key: 'title', label: 'Step title', type: 'text', required: true },
      order,
      { key: 'description', label: 'Description', type: 'textarea', full: true },
      published,
    ],
  },
  {
    key: 'highlights', label: 'Why Us, Values & FAQ', singular: 'Highlight',
    columns: [{ key: 'group_name', label: 'Section' }, { key: 'title', label: 'Title' }],
    defaults: { group_name: 'why_choose_us', sort_order: 0, is_published: true },
    fields: [
      { key: 'group_name', label: 'Section', type: 'select', required: true,
        options: [{ value: 'why_choose_us', label: 'Why choose us (homepage)' }, { value: 'core_values', label: 'Core values (about page)' },
          { value: 'faq', label: 'FAQ (homepage + Google FAQ data)' }] },
      { key: 'title', label: 'Title (for FAQ: the question)', type: 'text', required: true },
      { key: 'icon', label: 'Icon (not used for FAQ)', type: 'icon', full: true },
      { key: 'description', label: 'Description (for FAQ: the answer)', type: 'textarea', full: true },
      order,
      published,
    ],
  },
];

export const contentType = (key: string) => CONTENT_TYPES.find((c) => c.key === key);

export interface SettingField { key: SettingKey; label: string; type: 'text' | 'textarea' | 'list' | 'image' | 'video'; hint?: string; }

const HERO_IMAGE_HINT = 'Optional. Shown in an interactive 3D frame on the right of the page header. Leave empty to use the built-in 3D illustration.';
const VIDEO_HINT = 'Optional. Upload an MP4/WEBM (max 100 MB) or paste a YouTube / Vimeo link. The video section is hidden when empty.';
const pageGroup = (title: string, p: 'services' | 'portfolio' | 'technology' | 'industries' | 'process', video: boolean): { title: string; fields: SettingField[] } => ({
  title,
  fields: [
    { key: `${p}_eyebrow`, label: 'Small label above the title', type: 'text' },
    { key: `${p}_title`, label: 'Page title', type: 'text' },
    { key: `${p}_lead`, label: 'Intro text', type: 'textarea' },
    { key: `${p}_hero_image`, label: 'Header 3D image', type: 'image', hint: HERO_IMAGE_HINT },
    ...(video ? ([
      { key: `${p}_video_url`, label: 'Video', type: 'video', hint: VIDEO_HINT },
      { key: `${p}_video_title`, label: 'Video section heading', type: 'text' },
      { key: `${p}_video_text`, label: 'Video section text', type: 'textarea' },
    ] as SettingField[]) : []),
  ] as SettingField[],
});

export const SETTINGS_GROUPS: { title: string; fields: SettingField[] }[] = [
  { title: 'Company', fields: [
    { key: 'company_name', label: 'Company name', type: 'text' },
    { key: 'tagline', label: 'Tagline', type: 'text', hint: 'Shown above the hero headline and in the footer' },
  ] },
  { title: 'Homepage hero', fields: [
    { key: 'hero_headline', label: 'Headline', type: 'text' },
    { key: 'hero_subtext', label: 'Sub-text', type: 'textarea' },
    { key: 'hero_primary_cta', label: 'Primary button text', type: 'text' },
    { key: 'hero_secondary_cta', label: 'Secondary button text', type: 'text' },
  ] },
  { title: 'About', fields: [
    { key: 'about_short', label: 'Short introduction (homepage)', type: 'textarea' },
    { key: 'about_intro', label: 'Company introduction (About page)', type: 'textarea', hint: 'Blank lines create new paragraphs' },
    { key: 'vision', label: 'Vision', type: 'textarea' },
    { key: 'mission', label: 'Mission', type: 'textarea' },
    { key: 'team_expertise', label: 'Team expertise', type: 'textarea' },
  ] },
  { title: 'Call to action', fields: [
    { key: 'cta_headline', label: 'CTA headline', type: 'text' },
    { key: 'cta_text', label: 'CTA text', type: 'textarea' },
  ] },
  pageGroup('Services page', 'services', true),
  pageGroup('Our Work (portfolio) page', 'portfolio', true),
  pageGroup('Technology page', 'technology', true),
  pageGroup('Industries page', 'industries', false),
  pageGroup('Process page', 'process', false),
  { title: 'About page header', fields: [
    { key: 'about_eyebrow', label: 'Small label above the title', type: 'text' },
    { key: 'about_hero_image', label: 'Header 3D image', type: 'image', hint: HERO_IMAGE_HINT },
  ] },
  { title: 'Contact page', fields: [
    { key: 'contact_eyebrow', label: 'Small label above the title', type: 'text' },
    { key: 'contact_heading', label: 'Contact page heading', type: 'text', hint: 'The intro text below it is the “CTA text” above' },
    { key: 'contact_hero_image', label: 'Header 3D image', type: 'image', hint: HERO_IMAGE_HINT },
    { key: 'contact_side_title', label: 'Side panel heading', type: 'text' },
    { key: 'contact_form_title', label: 'Form heading', type: 'text' },
    { key: 'contact_side_text', label: 'Side panel text', type: 'textarea' },
    { key: 'contact_promises', label: 'Reassurance points', type: 'list', hint: 'One per line' },
    { key: 'contact_budgets', label: 'Budget options (dropdown)', type: 'list', hint: 'One per line' },
    { key: 'contact_success_title', label: 'Success message heading', type: 'text' },
    { key: 'contact_success_text', label: 'Success message text', type: 'textarea' },
  ] },
  { title: 'Contact details', fields: [
    { key: 'contact_email', label: 'Business email', type: 'text' },
    { key: 'contact_phone', label: 'Phone number', type: 'text' },
    { key: 'contact_whatsapp', label: 'WhatsApp number', type: 'text', hint: 'Include country code, e.g. +91 98765 43210' },
    { key: 'contact_address', label: 'Business location', type: 'textarea' },
    { key: 'linkedin_url', label: 'LinkedIn company page URL', type: 'text' },
  ] },
  { title: 'SEO & social sharing', fields: [
    { key: 'site_url', label: 'Website address', type: 'text', hint: 'Your live domain, e.g. https://www.appcircuitlabs.com — used for canonical links, the sitemap and share links' },
    { key: 'legal_name', label: 'Legal company name', type: 'text', hint: 'e.g. App Circuit Labs Pvt Ltd (used in Google business data)' },
    { key: 'seo_title', label: 'Homepage title', type: 'text', hint: 'Shown in Google results and browser tabs. Aim for 50–60 characters.' },
    { key: 'twitter_handle', label: 'X (Twitter) handle', type: 'text', hint: 'Without @, e.g. appcircuitlabs' },
    { key: 'seo_description', label: 'Homepage meta description', type: 'textarea', hint: 'Shown under the title in Google. Aim for 140–160 characters. Other pages use their intro text.' },
    { key: 'seo_keywords', label: 'Target keywords', type: 'textarea', hint: 'Comma-separated, most important first. Also use these words naturally in page text — that matters far more.' },
    { key: 'seo_og_image', label: 'Share image', type: 'image', hint: 'Shown when a link is shared on LinkedIn, WhatsApp, Facebook, X. Use 1200 × 630 px.' },
  ] },
  { title: 'Location (local SEO)', fields: [
    { key: 'geo_placename', label: 'City', type: 'text', hint: 'e.g. Kolkata, West Bengal' },
    { key: 'geo_region', label: 'Region code', type: 'text', hint: 'Country-state code, e.g. IN-WB or US-UT' },
    { key: 'geo_position', label: 'Map coordinates', type: 'text', hint: 'latitude;longitude — right-click your office in Google Maps to copy them, e.g. 22.5726;88.3639' },
  ] },
  { title: 'Social profiles', fields: [
    { key: 'facebook_url', label: 'Facebook page URL', type: 'text' },
    { key: 'instagram_url', label: 'Instagram URL', type: 'text' },
    { key: 'x_url', label: 'X (Twitter) URL', type: 'text' },
    { key: 'youtube_url', label: 'YouTube channel URL', type: 'text' },
    { key: 'google_maps_url', label: 'Google Business Profile / Maps link', type: 'text', hint: 'All profile links (plus LinkedIn above) tell Google these accounts belong to your company' },
  ] },
  { title: 'Analytics & tracking', fields: [
    { key: 'ga4_id', label: 'Google Analytics 4 Measurement ID', type: 'text', hint: 'Format G-XXXXXXXXXX. Leave empty if you set up GA4 inside Tag Manager instead.' },
    { key: 'gtm_id', label: 'Google Tag Manager container ID', type: 'text', hint: 'Format GTM-XXXXXXX. Optional.' },
    { key: 'hotjar_id', label: 'Hotjar Site ID', type: 'text', hint: 'Numbers only, e.g. 1234567. Optional (heatmaps & recordings).' },
  ] },
];
