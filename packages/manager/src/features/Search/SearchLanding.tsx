import { CircleProgress, Stack, Typography } from '@linode/ui';
import { getQueryParamFromQueryString } from '@linode/utilities';
import { createLazyRoute } from '@tanstack/react-router';
import React from 'react';
import { useLocation } from 'react-router-dom';

import { ResultGroup } from './ResultGroup';
import { StyledError, StyledGrid, StyledStack } from './SearchLanding.styles';
import { useLegacySearch } from './withStoreSearch';

import type { ResultRowDataOption } from './types';

const displayMap = {
  buckets: 'Buckets',
  databases: 'Databases',
  domains: 'Domains',
  firewalls: 'Firewalls',
  images: 'Images',
  kubernetesClusters: 'Kubernetes',
  linodes: 'Linodes',
  nodebalancers: 'NodeBalancers',
  volumes: 'Volumes',
};

const SearchLanding = () => {
  const location = useLocation();
  const query = getQueryParamFromQueryString(location.search, 'query');

  const {
    combinedResults,
    isLoading,
    searchResultsByEntity,
  } = useLegacySearch({ query });

  return (
    <Stack spacing={2}>
      {combinedResults.length > 0 && !isLoading && (
        <Typography variant="h1">
          Search Results {query && `for "${query}"`}
        </Typography>
      )}
      {isLoading && <CircleProgress />}
      {!isLoading && combinedResults.length === 0 && (
        <StyledGrid data-qa-empty-state>
          <StyledStack>
            <StyledError />
            <Typography style={{ marginBottom: 16 }}>
              You searched for ...
            </Typography>
            <Typography>{query}</Typography>
            <Typography className="nothing" style={{ marginTop: 56 }}>
              Sorry, no results for this one.
            </Typography>
          </StyledStack>
        </StyledGrid>
      )}
      {Object.keys(searchResultsByEntity).map(
        (entityType: keyof typeof displayMap, idx: number) => (
          <ResultGroup
            entity={displayMap[entityType]}
            groupSize={100}
            key={idx}
            results={searchResultsByEntity[entityType] as ResultRowDataOption[]}
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
