export type Category =
  | 'AI'
  | 'CDN Affiliated'
  | 'Compute'
  | 'Data Analytics'
  | 'Database Management'
  | 'Data Sources'
  | 'Development Tools'
  | 'Enterprise'
  | 'Kubernetes'
  | 'Media & Entertainment, Gaming'
  | 'Networking'
  | 'Other Software and APIs'
  | 'Storage';

export type Type =
  | 'Agentic Systems'
  | 'Data Service'
  | 'Kubernetes'
  | 'SaaS & APIs'
  | 'Virtual Machines';

export interface Product {
  categories: Category[];
  id: number;
  infoBanner?: string;
  name: string;
  partner: {
    email?: string;
    logoDarkMode: string;
    logoLightMode: string;
    name: string;
    url: string;
  };
  productTags?: string[];
  shortDescription: string;
  tileTag?: string;
  type: {
    name: Type;
  };
}

/**
 * Filters the given list of products by type and/or search query.
 *
 * - If no filters are provided, returns all products.
 * - If a type is provided, only products matching that type are included.
 * - If a search query is provided, only products whose name, short description,
 *   partner name, or type name include the query (case-insensitive) are included.
 *
 * @param products The list of products to filter.
 * @param filters An object containing optional searchQuery and selectedType.
 */
export const filterProducts = (
  products: Product[],
  filters: { searchQuery?: string; selectedType?: string }
): Product[] => {
  let result = products;
  if (filters.selectedType) {
    result = result.filter((p) => p.type.name === filters.selectedType);
  }
  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.partner.name.toLowerCase().includes(q) ||
        p.type.name.toLowerCase().includes(q)
    );
  }
  return result;
};

export const PRODUCTS: Product[] = [
  {
    id: 100001,
    name: 'Akamai Cloud Computing',
    shortDescription:
      'Akamai provides cloud computing, security, and content delivery services...',
    tileTag: 'Partner Spotlight',
    productTags: ['Cloud Infrastructure', 'CDN', 'Security'],
    infoBanner: 'Special Offer: Get started with $100 credit',
    partner: {
      name: 'Akamai',
      logoLightMode: 'akamai-logo-color.svg',
      logoDarkMode: 'akamai-logo.svg',
      url: 'https://www.akamai.com',
      email: '',
    },
    type: {
      name: 'SaaS & APIs',
    },
    categories: ['CDN Affiliated', 'Networking'],
  },
  {
    id: 100002,
    name: 'Product 2',
    shortDescription:
      'Akamai provides cloud computing, security, and content delivery services...',
    tileTag: 'Partner Spotlight',
    productTags: ['Cloud Infrastructure', 'CDN', 'Security'],
    infoBanner: 'Special Offer: Get started with $100 credit',
    partner: {
      name: 'Oracle',
      logoLightMode: 'akamai-logo-color.svg',
      logoDarkMode: 'akamai-logo.svg',
      url: 'https://www.akamai.com',
      email: '',
    },
    type: {
      name: 'Agentic Systems',
    },
    categories: ['CDN Affiliated'],
  },
  {
    id: 100003,
    name: 'Product 3',
    shortDescription:
      'Akamai provides cloud computing, security, and content delivery services...',
    productTags: ['Cloud Infrastructure', 'CDN', 'Security'],
    infoBanner: 'Special Offer: Get started with $100 credit',
    partner: {
      name: 'Akamai',
      logoLightMode: 'akamai-logo-color.svg',
      logoDarkMode: 'akamai-logo.svg',
      url: 'https://www.akamai.com',
      email: '',
    },
    type: {
      name: 'Data Service',
    },
    categories: ['CDN Affiliated', 'Networking'],
  },
  {
    id: 100004,
    name: 'Product 4',
    shortDescription:
      'Akamai provides cloud computing, security, and content delivery services...',
    productTags: ['Cloud Infrastructure', 'CDN', 'Security'],
    infoBanner: 'Special Offer: Get started with $100 credit',
    partner: {
      name: 'Akamai',
      logoLightMode: 'akamai-logo-color.svg',
      logoDarkMode: 'akamai-logo.svg',
      url: 'https://www.akamai.com',
      email: '',
    },
    type: {
      name: 'Data Service',
    },
    categories: ['CDN Affiliated'],
  },
  {
    id: 100005,
    name: 'Product 5',
    shortDescription:
      'Akamai provides cloud computing, security, and content delivery services...',
    productTags: ['Cloud Infrastructure', 'CDN', 'Security'],
    infoBanner: 'Special Offer: Get started with $100 credit',
    partner: {
      name: 'Akamai',
      logoLightMode: 'akamai-logo-color.svg',
      logoDarkMode: 'akamai-logo.svg',
      url: 'https://www.akamai.com',
      email: '',
    },
    type: {
      name: 'Data Service',
    },
    categories: ['CDN Affiliated'],
  },
  {
    id: 100006,
    name: 'Product 6',
    shortDescription:
      'Akamai provides cloud computing, security, and content delivery services...',
    productTags: ['Cloud Infrastructure', 'CDN', 'Security'],
    infoBanner: 'Special Offer: Get started with $100 credit',
    partner: {
      name: 'Akamai',
      logoLightMode: 'akamai-logo-color.svg',
      logoDarkMode: 'akamai-logo.svg',
      url: 'https://www.akamai.com',
      email: '',
    },
    type: {
      name: 'Data Service',
    },
    categories: ['CDN Affiliated'],
  },
  {
    id: 100007,
    name: 'Product 7',
    shortDescription:
      'Akamai provides cloud computing, security, and content delivery services...',
    productTags: ['Cloud Infrastructure', 'CDN', 'Security'],
    infoBanner: 'Special Offer: Get started with $100 credit',
    partner: {
      name: 'Akamai',
      logoLightMode: 'akamai-logo-color.svg',
      logoDarkMode: 'akamai-logo.svg',
      url: 'https://www.akamai.com',
      email: '',
    },
    type: {
      name: 'Data Service',
    },
    categories: ['CDN Affiliated'],
  },
];
