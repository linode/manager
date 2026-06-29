import { Box, TextField } from '@linode/ui';
import SearchIcon from '@mui/icons-material/Search';
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
      <TextField
        fullWidth
        InputProps={{
          startAdornment: (
            <SearchIcon
              sx={{ color: 'text.secondary', fontSize: 18, mr: 0.5 }}
            />
          ),
        }}
        label="Search"
        onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
        placeholder="Models, providers, use cases"
        value={searchQuery}
      />
    </Box>
  );
};
