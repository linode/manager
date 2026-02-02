import type { Product } from '../shared';

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
