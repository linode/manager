import { CircleProgress, Notice, Stack, Typography } from '@linode/ui';
import { useSearch } from '@tanstack/react-router';
import React from 'react';

import { ResultGroup } from './ResultGroup';
import { useSearch as useCMSearch } from './useSearch';
import { getErrorsFromErrorMap, searchableEntityDisplayNameMap } from './utils';

import type { SearchResultsByEntity } from './search.interfaces';

export const SearchLanding = () => {
  const { query } = useSearch({
    from: '/search',
  });

  const { combinedResults, entityErrors, isLoading, searchResultsByEntity } =
    useCMSearch({
      query,
    });

  const errors = getErrorsFromErrorMap(entityErrors);

  return (
    <Stack mt={2} spacing={2}>
      <Stack
        alignItems="center"
        direction="row"
        height="32px"
        justifyContent="space-between"
        spacing={1}
      >
        <Typography variant="h1">
          Search Results {query && `for "${query}"`}
        </Typography>
        {isLoading && <CircleProgress size="sm" />}
      </Stack>
      {errors.length > 0 && (
        <Notice variant="error">
          {errors.map((error) => (
            <Typography key={error}>{error}</Typography>
          ))}
        </Notice>
      )}
      {!isLoading && combinedResults.length === 0 && (
        <Stack alignItems="center" justifyContent="center" spacing={2}>
          <Typography>You searched for ...</Typography>
          <Typography variant="h2">{query}</Typography>
          <Typography>Sorry, no results for this one.</Typography>
        </Stack>
      )}
      {Object.keys(searchResultsByEntity).map(
        (entityType: keyof SearchResultsByEntity, idx: number) => (
          <ResultGroup
            entity={searchableEntityDisplayNameMap[entityType]}
            groupSize={100}
            key={idx}
            results={searchResultsByEntity[entityType]}
          />
        )
      )}
    </Stack>
  );
};
