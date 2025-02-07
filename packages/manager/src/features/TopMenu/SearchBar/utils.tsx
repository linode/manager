import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import * as React from 'react';

import type { ExtendedSearchableItem, SearchResultItem } from './SearchBar';

export const createFinalOptions = (
  results: SearchResultItem[],
  searchText: string = '',
  loading: boolean = false,
  error: boolean = false
): SearchResultItem[] => {
  const redirectOption: ExtendedSearchableItem = {
    data: {
      searchText,
    },
    icon: <ManageSearchIcon />,
    label: `View search results page for "${searchText}"`,
    value: 'redirect',
  };

  const loadingResults: ExtendedSearchableItem = {
    label: 'Loading results...',
    value: 'info',
  };

  const searchError: ExtendedSearchableItem = {
    label: 'Error retrieving search results',
    value: 'error',
  };

  // Results aren't final as we're loading data
  if (loading) {
    return [redirectOption, loadingResults];
  }

  if (error) {
    return [searchError];
  }

  // NO RESULTS:
  if (!results || results.length === 0) {
    return [];
  }

  // LESS THAN 20 RESULTS:
  if (results.length <= 20) {
    return [redirectOption, ...results];
  }

  // MORE THAN 20 RESULTS:
  const lastOption: ExtendedSearchableItem = {
    data: {
      searchText,
    },
    icon: <ManageSearchIcon />,
    label: `View all ${results.length} results for "${searchText}"`,
    value: 'redirect',
  };

  const first20Results = results.slice(0, 20);

  return [redirectOption, ...first20Results, lastOption];
};
