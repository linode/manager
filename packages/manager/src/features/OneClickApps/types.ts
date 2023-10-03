export interface OCA {
  alt_description: string;
  alt_name: string;
  categories: AppCategory[];
  colors: Colors;
  description: string;
  href?: string;
  logo_url: string;
  name: string;
  related_guides?: Doc[];
  summary: string;
  tips?: string[];
  website?: string;
}

export interface Doc {
  href: string;
  title: string;
}

export interface Colors {
  end: string;
  start: string;
}

export type AppCategory =
  | 'App Creators'
  | 'Control Panels'
  | 'Databases'
  | 'Development'
  | 'Games'
  | 'Media and Entertainment'
  | 'Monitoring'
  | 'Productivity'
  | 'Security'
  | 'Stacks'
  | 'Website';
