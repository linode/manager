import { decode } from 'he';

import { oneClickApps } from 'src/features/OneClickApps/oneClickApps';
import { useFlags } from 'src/hooks/useFlags';
import { useMarketplaceAppsQuery } from 'src/queries/stackscripts';

import type { StackScript } from '@linode/api-v4';
import type { AppCategory, OCA } from 'src/features/OneClickApps/types';

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
export const getAppSections = (apps: MarketplaceApp[]) => {
  // To check if an app is 'new', we check our own 'oneClickApps' list for the 'isNew' value
  const newApps = apps.filter((app) => app.details.isNew);

  // Items are ordered by popularity already, take the first 10
  const popularApps = apps.slice(0, 10);

  // In the all apps section, show everything in alphabetical order
  const allApps = [...apps].sort((a, b) =>
    a.stackscript.label
      .toLowerCase()
      .localeCompare(b.stackscript.label.toLowerCase())
  );

  return [
    {
      apps: newApps,
      title: 'New apps',
    },
    {
      apps: popularApps,
      title: 'Popular apps',
    },
    {
      apps: allApps,
      title: 'All apps',
    },
  ];
};

interface FilteredAppsOptions {
  apps: MarketplaceApp[];
  category: AppCategory | undefined;
  query: string;
}

/**
 * Performs the client side filtering Marketplace Apps on the Linode Create flow
 *
 * Currently, we only allow users to search OR filter by category in the UI.
 * We don't allow both at the same time. If we want to change that, this function
 * will need to be modified.
 *
 * @returns Stackscripts that have been filtered based on the options passed
 */
export const getFilteredApps = (options: FilteredAppsOptions) => {
  const { apps, category, query } = options;

  return apps.filter((app) => {
    if (query && category) {
      return (
        getDoesMarketplaceAppMatchQuery(query, app) &&
        getDoesMarketplaceAppMatchCategory(category, app)
      );
    }

    if (query) {
      return getDoesMarketplaceAppMatchQuery(query, app);
    }

    if (category) {
      return getDoesMarketplaceAppMatchCategory(category, app);
    }

    return true;
  });
};

/**
 * Compares a StackScript's details to a given text search query
 *
 * @param query the current search query
 * @param stackscript the StackScript to compare aginst
 * @returns true if the StackScript matches the given query
 */
const getDoesMarketplaceAppMatchQuery = (
  query: string,
  app: MarketplaceApp
) => {
  const queryWords = query
    .replace(/[,.-]/g, '')
    .trim()
    .toLocaleLowerCase()
    .split(' ');

  const searchableAppFields = [
    String(app.stackscript.id),
    app.stackscript.label,
    app.details.alt_name,
    app.details.alt_description,
    ...app.details.categories,
  ];

  return searchableAppFields.some((field) =>
    queryWords.some((queryWord) => field.toLowerCase().includes(queryWord))
  );
};

/**
 * Checks if the given StackScript has a category
 *
 * @param category The category to check for
 * @param app The Marketplace app to compare against
 * @returns true if the given app has the given category
 */
const getDoesMarketplaceAppMatchCategory = (
  category: AppCategory,
  app: MarketplaceApp
) => {
  return app.details.categories.includes(category);
};

export interface MarketplaceApp {
  details: OCA;
  stackscript: StackScript;
}

export const useMarketplaceApps = () => {
  const query = useMarketplaceAppsQuery(true);
  const flags = useFlags();

  const stackscripts = query.data ?? [];

  const apps: MarketplaceApp[] = [];

  for (const stackscript of stackscripts) {
    const override = flags.marketplaceAppOverrides?.find(
      (override) => override.stackscriptId === stackscript.id
    );

    const baseAppDetails = oneClickApps[stackscript.id];

    if (override === undefined && baseAppDetails) {
      // If the StackScript has no overrides, just add it to the apps array.
      apps.push({ details: baseAppDetails, stackscript });
    }

    if (override?.details === null) {
      // If the feature flag explicitly specifies `null`, it means we don't want it to show,
      // so we skip it.
      continue;
    }

    if (override?.details) {
      const details = { ...baseAppDetails, ...override.details };

      apps.push({ details, stackscript });
    }
  }

  return { apps, ...query };
};

export const getMarketplaceAppLabel = (label: string) =>
  decode(
    label
      .replace(' Null One-Click', '')
      .replace(' One-Click', '')
      .replace(' Cluster', '')
  ).trim();
