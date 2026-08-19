import { SearchField } from '@akamai/cds-components/react/SearchField';
import { Box } from '@linode/ui';
import React from 'react';

import type { ModelFilterState } from '../modelLibrary.types';

interface SearchFilterProps {
  onFilterChange: (next: Partial<ModelFilterState>) => void;
  searchQuery: string;
}

export const SearchFilter = ({
  onFilterChange,
  searchQuery,
}: SearchFilterProps) => {
  return (
    <Box sx={{ flex: '1 1 220px', minWidth: 180, maxWidth: 240 }}>
      <SearchField
        aria-label="Search"
        onChange={(e: CustomEvent<{ value: string }>) =>
          onFilterChange({ searchQuery: e.detail.value })
        }
        placeholder="Models, providers, use cases"
        style={{ width: '100%' }}
        value={searchQuery}
      />
    </Box>
  );
};
