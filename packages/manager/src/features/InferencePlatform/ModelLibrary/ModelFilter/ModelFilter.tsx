import { Box, Stack } from '@linode/ui';
import React from 'react';

import { ActiveFilters } from './ActiveFilters';
import { InputModesFilter } from './InputModesFilter';
import { LanguagesFilter } from './LanguagesFilter';
import { MaxContextFilter } from './MaxContextFilter';
import { OutputModesFilter } from './OutputModesFilter';
import { ParametersFilter } from './ParametersFilter';
import { ProviderFilter } from './ProviderFilter';
import { SearchFilter } from './SearchFilter';
import { UseCaseFilter } from './UseCaseFilter';

import type { ModelFilterState } from '../modelLibrary.types';

interface ModelFilterProps {
  filterState: ModelFilterState;
  inputModes: string[];
  languages: string[];
  onFilterChange: (next: Partial<ModelFilterState>) => void;
  outputModes: string[];
  providers: string[];
  useCaseTags: string[];
}

export const ModelFilter = ({
  filterState,
  inputModes,
  languages,
  onFilterChange,
  outputModes,
  providers,
  useCaseTags,
}: ModelFilterProps) => {
  const filterBGLight = '#FFFFFF';
  const filterBGDark = '#3e3d43';

  return (
    <Box
      sx={(theme) => ({
        bgcolor: theme.palette.mode === 'light' ? filterBGLight : filterBGDark,
        borderRadius: 1,
        p: 2,
      })}
    >
      {/* Top row: Search / Parameters / Provider */}
      <Stack
        alignItems="flex-end"
        direction="row"
        flexWrap="wrap"
        gap={4}
        sx={{ mb: 2, px: 1.5 }}
      >
        {/* Search */}
        <SearchFilter
          onFilterChange={onFilterChange}
          searchQuery={filterState.searchQuery}
        />

        {/* Parameters range slider */}
        <ParametersFilter
          maxParametersB={filterState.maxParametersB}
          minParametersB={filterState.minParametersB}
          onFilterChange={onFilterChange}
        />

        {/* Context length range slider */}
        <MaxContextFilter
          maxContextLengthK={filterState.maxContextLengthK}
          minContextLengthK={filterState.minContextLengthK}
          onFilterChange={onFilterChange}
        />

        {/* Provider dropdown */}
        <ProviderFilter
          onFilterChange={onFilterChange}
          providerLabel={filterState.providerLabel}
          providers={providers}
        />
      </Stack>

      {/* Filter controls row: Serverless chip + Languages dropdown */}
      <Stack
        alignItems="center"
        direction="row"
        flexWrap="wrap"
        gap={2}
        sx={{ px: 1.5 }}
      >
        {/* Use-case tags multi-select */}
        <UseCaseFilter
          onFilterChange={onFilterChange}
          selectedUseCaseTags={filterState.useCaseTags}
          useCaseTags={useCaseTags}
        />

        {/* Input modes multi-select */}
        <InputModesFilter
          inputModes={inputModes}
          onFilterChange={onFilterChange}
          selectedInputModes={filterState.inputModes}
        />

        {/* Output modes multi-select */}
        <OutputModesFilter
          onFilterChange={onFilterChange}
          outputModes={outputModes}
          selectedOutputModes={filterState.outputModes}
        />

        {/* Languages multi-select */}
        <LanguagesFilter
          languages={languages}
          onFilterChange={onFilterChange}
          selectedLanguages={filterState.languages}
        />
      </Stack>

      <ActiveFilters
        inputModes={filterState.inputModes}
        isServerless={filterState.isServerless}
        languages={filterState.languages}
        maxContextLengthK={filterState.maxContextLengthK}
        maxParametersB={filterState.maxParametersB}
        minContextLengthK={filterState.minContextLengthK}
        minParametersB={filterState.minParametersB}
        onFilterChange={onFilterChange}
        outputModes={filterState.outputModes}
        providerLabel={filterState.providerLabel}
        searchQuery={filterState.searchQuery}
        useCaseTags={filterState.useCaseTags}
      />
    </Box>
  );
};
