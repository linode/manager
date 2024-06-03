import { oneClickApps } from 'src/features/OneClickApps/oneClickAppsv2';

import type { StackScript } from '@linode/api-v4';

/**
 * Get all categories from our marketplace apps list so
 * we can generate a dynamic list of category options.
 */
const categories = Object.values(oneClickApps).reduce((acc, app) => {
  return [...acc, ...app.categories];
}, []);

export const uniqueCategories = Array.from(new Set(categories));

/**
 * A list of unique categories to be shown in a Select/Autocomplete
 */
export const categoryOptions = uniqueCategories.map((category) => ({
  label: category,
}));

/**
 * Returns an array of Marketplace app sections given an array
 * of Marketplace app StackScripts
 */
export const getAppSections = (stackscripts: StackScript[]) => {
  // To check if an app is 'new', we check our own 'oneClickApps' list for the 'isNew' value
  const newApps = stackscripts.filter(
    (stackscript) => oneClickApps[stackscript.id]?.isNew
  );

  // Items are ordered by popularity already, take the first 10
  const popularApps = stackscripts.slice(0, 10);

  // In the all apps section, show everything in alphabetical order
  const allApps = [...stackscripts].sort((a, b) =>
    a.label.toLowerCase().localeCompare(b.label.toLowerCase())
  );

  return [
    {
      stackscripts: newApps,
      title: 'New apps',
    },
    {
      stackscripts: popularApps,
      title: 'Popular apps',
    },
    {
      stackscripts: allApps,
      title: 'All apps',
    },
  ];
};
