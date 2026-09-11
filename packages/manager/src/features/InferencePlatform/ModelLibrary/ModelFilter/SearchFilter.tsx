import { SearchField } from '@akamai/cds-components/react/SearchField';
import { Box, Typography } from '@linode/ui';
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
    <Box sx={{ flex: '1 1 30%', minWidth: 0 }}>
      <Typography
        sx={(theme) => ({
          display: 'block',
          fontSize: 14,
          fontFamily: theme.font.semibold,
          mb: 1.4,
          textTransform: 'none',
        })}
        variant="caption"
      >
        Search
      </Typography>

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
