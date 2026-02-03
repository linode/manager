import type { Product } from './shared';

export const PRODUCTS: Product[] = [
  {
    id: 'akamai-cloud-computing',
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
    id: 'product-2',
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
    id: 'product-3',
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
    id: 'product-4',
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
    id: 'product-5',
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
    id: 'product-6',
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
    id: 'product-7',
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

export const getProductById = (productId: string): Product | undefined => {
  return PRODUCTS.find((product) => product.id === productId);
};
