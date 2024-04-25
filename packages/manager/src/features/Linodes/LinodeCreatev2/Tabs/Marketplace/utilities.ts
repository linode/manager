import { oneClickApps } from 'src/features/OneClickApps/oneClickApps';

/**
 * Get all categories from our marketplace apps list so
 * we can generate a dynamic list of category options.
 */
const categories = oneClickApps.reduce((acc, app) => {
  return [...acc, ...app.categories];
}, []);

export const uniqueCategories = Array.from(new Set(categories));

/**
 * A list of unique categories to be shown in a Select/Autocomplete
 */
export const categoryOptions = uniqueCategories.map((category) => ({
  label: category,
}));
