import type { Product } from './shared';

export const PRODUCTS: Product[] = [
  {
    id: 'apimetrics',
    name: 'APImetrics',
    shortDescription:
      'Continuous synthetic tests monitor the performance & conformance of workflows across APIs, browsers, & MCP servers.',
    partner: {
      name: 'APIContext',
      logoLightMode: 'APIContext-light.svg',
      logoDarkMode: 'APIContext-dark.svg',
      url: 'https://apicontext.com/',
      email: 'akamai@apicontext.com',
    },
    type: {
      name: 'SaaS & APIs',
    },
    categories: ['AI', 'Other Software and APIs'],
  },
];

export const getProductById = (productId: string): Product | undefined => {
  return PRODUCTS.find((product) => product.id === productId);
};
