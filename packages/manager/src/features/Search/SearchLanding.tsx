import { CircleProgress, Notice, Stack, Typography } from '@linode/ui';
import { getQueryParamFromQueryString } from '@linode/utilities';
import { createLazyRoute } from '@tanstack/react-router';
import React from 'react';
import { useLocation } from 'react-router-dom';

import { ResultGroup } from './ResultGroup';
import { useSearch } from './useSearch';
import { getErrorsFromErrorMap, searchableEntityDisplayNameMap } from './utils';

import type { SearchResultsByEntity } from './search.interfaces';

const SearchLanding = () => {
  const location = useLocation();
  const query = getQueryParamFromQueryString(location.search, 'query');

  const {
    combinedResults,
    entityErrors,
    isLoading,
    searchResultsByEntity,
  } = useSearch({
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

export const searchLandingLazyRoute = createLazyRoute('/search')({
  component: SearchLanding,
});

export default SearchLanding;
