import { describe, it } from 'vitest';

import { filterProducts } from './utils';

import type { Product } from '../shared';

describe('filterProducts', () => {
  const products: Product[] = [
    {
      id: 'titan-edge',
      name: 'TITAN-Edge',
      shortDescription: 'Edge compute for media and entertainment',
      partner: {
        name: 'Ateme',
        logoDarkMode: '',
        logoLightMode: '',
        url: '',
      },
      type: { name: 'Virtual Machines' },
      categories: ['Media & Entertainment, Gaming', 'Compute'],
    },
    {
      id: 'apimetrics',
      name: 'APImetrics',
      shortDescription: 'API monitoring and analytics',
      partner: {
        name: 'Capella',
        logoDarkMode: '',
        logoLightMode: '',
        url: '',
      },
      type: { name: 'SaaS & APIs' },
      categories: ['Development Tools'],
    },
    {
      id: 'spinkube',
      name: 'SpinKube',
      shortDescription: 'Kubernetes operator for Spin apps',
      partner: {
        name: 'Fermyon Technologies, Inc.',
        logoDarkMode: '',
        logoLightMode: '',
        url: '',
      },
      type: { name: 'SaaS & APIs' },
      categories: ['Kubernetes'],
    },
  ];

  it('returns all products if no filters are provided', () => {
    expect(filterProducts(products, {})).toHaveLength(3);
  });

  it('filters by type', () => {
    const filtered = filterProducts(products, {
      selectedType: 'Virtual Machines',
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('TITAN-Edge');
  });

  it('filters by search query (name)', () => {
    const filtered = filterProducts(products, { searchQuery: 'spin' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('SpinKube');
  });

  it('filters by search query (partner)', () => {
    const filtered = filterProducts(products, { searchQuery: 'ateme' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('TITAN-Edge');
  });

  it('filters by search query (type)', () => {
    const filtered = filterProducts(products, { searchQuery: 'saas' });
    expect(filtered).toHaveLength(2);
    expect(filtered.map((p) => p.name)).toContain('APImetrics');
    expect(filtered.map((p) => p.name)).toContain('SpinKube');
  });

  it('filters by both type and search query', () => {
    const filtered = filterProducts(products, {
      selectedType: 'SaaS & APIs',
      searchQuery: 'spin',
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('SpinKube');
  });

  it('returns empty array if no products match', () => {
    const filtered = filterProducts(products, { searchQuery: 'randomtext' });
    expect(filtered).toHaveLength(0);
  });

  it('filters by category', () => {
    const filtered = filterProducts(products, {
      selectedCategory: 'Kubernetes',
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('SpinKube');
  });

  it('filters by category and search query: category first, then search', () => {
    const filtered = filterProducts(products, {
      selectedCategory: 'Kubernetes',
      searchQuery: 'spin',
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('SpinKube');
  });

  it('filters by category and search query: returns empty when search does not match category products', () => {
    const filtered = filterProducts(products, {
      selectedCategory: 'Kubernetes',
      searchQuery: 'titan', // TITAN-Edge is not in Kubernetes category
    });
    expect(filtered).toHaveLength(0);
  });

  it('filters by category and type: category first, then type', () => {
    const filtered = filterProducts(products, {
      selectedCategory: 'Development Tools',
      selectedType: 'SaaS & APIs',
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('APImetrics');
  });

  it('filters by category and type: returns empty when type does not match category products', () => {
    const filtered = filterProducts(products, {
      selectedCategory: 'Development Tools',
      selectedType: 'Virtual Machines', // No VM products in Development Tools
    });
    expect(filtered).toHaveLength(0);
  });

  it('filters by all three filters: category, type, and search', () => {
    const filtered = filterProducts(products, {
      selectedCategory: 'Kubernetes',
      selectedType: 'SaaS & APIs',
      searchQuery: 'kube',
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('SpinKube');
  });

  it('filters by all three filters: returns empty when all filters applied but no match', () => {
    const filtered = filterProducts(products, {
      selectedCategory: 'Kubernetes',
      selectedType: 'SaaS & APIs',
      searchQuery: 'titan', // TITAN-Edge is not in Kubernetes
    });
    expect(filtered).toHaveLength(0);
  });
});
