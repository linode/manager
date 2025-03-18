import {
  useAllFirewallsQuery,
  useAllLinodesQuery,
  useAllNodeBalancersQuery,
  useAllVolumesQuery,
  useRegionsQuery,
} from '@linode/queries';
import { CircleProgress, Notice, Typography } from '@linode/ui';
import {
  getQueryParamFromQueryString,
  isNotNullOrUndefined,
} from '@linode/utilities';
import Grid from '@mui/material/Grid2';
import { createLazyRoute } from '@tanstack/react-router';
import { equals } from 'ramda';
import * as React from 'react';
import { debounce } from 'throttle-debounce';

import { useAPISearch } from 'src/features/Search/useAPISearch';
import { useIsLargeAccount } from 'src/hooks/useIsLargeAccount';
import { useAllDatabasesQuery } from 'src/queries/databases/databases';
import { useAllDomainsQuery } from 'src/queries/domains';
import { useAllImagesQuery } from 'src/queries/images';
import { useAllKubernetesClustersQuery } from 'src/queries/kubernetes';
import { useObjectStorageBuckets } from 'src/queries/object-storage/queries';
import { isBucketError } from 'src/queries/object-storage/requests';
import { useSpecificTypes } from 'src/queries/types';
import { formatLinode } from 'src/store/selectors/getSearchEntities';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { extendTypesQueryResult } from 'src/utilities/extendType';
import { isNilOrEmpty } from 'src/utilities/isNilOrEmpty';

import { useIsDatabasesEnabled } from '../Databases/utilities';
import { getImageLabelForLinode } from '../Images/utils';
import { ResultGroup } from './ResultGroup';
import './searchLanding.css';
import {
  StyledError,
  StyledGrid,
  StyledH1Header,
  StyledRootGrid,
  StyledStack,
} from './SearchLanding.styles';
import { emptyResults } from './utils';
import withStoreSearch from './withStoreSearch';

import type { SearchProps } from './withStoreSearch';
import type { RouteComponentProps } from 'react-router-dom';

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

export interface SearchLandingProps
  extends SearchProps,
    RouteComponentProps<{}> {}

export const SearchLanding = (props: SearchLandingProps) => {
  const { entities, search, searchResultsByEntity } = props;
  const { data: regions } = useRegionsQuery();

  const isLargeAccount = useIsLargeAccount();
  const { isDatabasesEnabled } = useIsDatabasesEnabled();

  // We only want to fetch all entities if we know they
  // are not a large account. We do this rather than `!isLargeAccount`
  // because we don't want to fetch all entities if isLargeAccount is loading (undefined).
  const shouldFetchAllEntities = isLargeAccount === false;

  const shouldMakeDBRequests =
    shouldFetchAllEntities && Boolean(isDatabasesEnabled);

  /*
   @TODO OBJ Multicluster:'region' will become required, and the
   'cluster' field will be deprecated once the feature is fully rolled out in production.
   As part of the process of cleaning up after the 'objMultiCluster' feature flag, we will
   remove 'cluster' and retain 'regions'.
  */
  const {
    data: objectStorageBuckets,
    error: bucketsError,
    isLoading: areBucketsLoading,
  } = useObjectStorageBuckets(shouldFetchAllEntities);

  /*
  @TODO DBaaS: Change the passed argument to 'shouldFetchAllEntities' and
  remove 'isDatabasesEnabled' once DBaaS V2 is fully rolled out.
  */
  const {
    data: databases,
    error: databasesError,
    isLoading: areDatabasesLoading,
  } = useAllDatabasesQuery(shouldMakeDBRequests);

  const {
    data: domains,
    error: domainsError,
    isLoading: areDomainsLoading,
  } = useAllDomainsQuery(shouldFetchAllEntities);

  const {
    data: firewalls,
    error: firewallsError,
    isLoading: areFirewallsLoading,
  } = useAllFirewallsQuery(shouldFetchAllEntities);

  const {
    data: kubernetesClusters,
    error: kubernetesClustersError,
    isLoading: areKubernetesClustersLoading,
  } = useAllKubernetesClustersQuery(shouldFetchAllEntities);

  const {
    data: nodebalancers,
    error: nodebalancersError,
    isLoading: areNodeBalancersLoading,
  } = useAllNodeBalancersQuery(shouldFetchAllEntities);

  const {
    data: volumes,
    error: volumesError,
    isLoading: areVolumesLoading,
  } = useAllVolumesQuery({}, {}, shouldFetchAllEntities);

  const {
    data: _privateImages,
    error: imagesError,
    isLoading: areImagesLoading,
  } = useAllImagesQuery({}, { is_public: false }, shouldFetchAllEntities); // We want to display private images (i.e., not Debian, Ubuntu, etc. distros)

  const { data: publicImages } = useAllImagesQuery(
    {},
    { is_public: true },
    shouldFetchAllEntities
  );

  const {
    data: linodes,
    error: linodesError,
    isLoading: areLinodesLoading,
  } = useAllLinodesQuery({}, {}, shouldFetchAllEntities);

  const typesQuery = useSpecificTypes(
    (linodes ?? []).map((linode) => linode.type).filter(isNotNullOrUndefined)
  );
  const types = extendTypesQueryResult(typesQuery);

  const searchableLinodes = (linodes ?? []).map((linode) => {
    const imageLabel = getImageLabelForLinode(linode, publicImages ?? []);
    return formatLinode(linode, types, imageLabel);
  });

  const [apiResults, setAPIResults] = React.useState<any>({});
  const [apiError, setAPIError] = React.useState<null | string>(null);
  const [apiSearchLoading, setAPILoading] = React.useState<boolean>(false);

  let query = '';
  let queryError = false;
  try {
    query = getQueryParamFromQueryString(props.location.search, 'query');
  } catch {
    queryError = true;
  }

  const { searchAPI } = useAPISearch(!isNilOrEmpty(query));

  const _searchAPI = React.useRef(
    debounce(500, false, (_searchText: string) => {
      setAPILoading(true);
      searchAPI(_searchText)
        .then((searchResults) => {
          setAPIResults(searchResults.searchResultsByEntity);
          setAPILoading(false);
          setAPIError(null);
        })
        .catch((error) => {
          setAPIError(
            getAPIErrorOrDefault(error, 'Error loading search results')[0]
              .reason
          );
          setAPILoading(false);
        });
    })
  ).current;

  React.useEffect(() => {
    if (isLargeAccount) {
      _searchAPI(query);
    } else {
      search(
        query,
        objectStorageBuckets?.buckets ?? [],
        domains ?? [],
        volumes ?? [],
        kubernetesClusters ?? [],
        _privateImages ?? [],
        regions ?? [],
        searchableLinodes ?? [],
        nodebalancers ?? [],
        firewalls ?? [],
        databases ?? []
      );
    }
  }, [
    query,
    entities,
    search,
    isLargeAccount,
    _searchAPI,
    objectStorageBuckets,
    domains,
    volumes,
    kubernetesClusters,
    _privateImages,
    regions,
    nodebalancers,
    linodes,
    firewalls,
    databases,
  ]);

  const getErrorMessage = () => {
    const errorConditions: [unknown, string][] = [
      [linodesError, 'Linodes'],
      [bucketsError, 'Buckets'],
      [domainsError, 'Domains'],
      [volumesError, 'Volumes'],
      [imagesError, 'Images'],
      [nodebalancersError, 'NodeBalancers'],
      [kubernetesClustersError, 'Kubernetes'],
      [firewallsError, 'Firewalls'],
      [databasesError, 'Databases'],
      [
        objectStorageBuckets && objectStorageBuckets.errors.length > 0,
        `Object Storage in ${objectStorageBuckets?.errors
          .map((e) => (isBucketError(e) ? e.cluster.region : e.endpoint.region))
          .join(', ')}`,
      ],
    ];

    const matchingConditions = errorConditions.filter(
      (condition) => condition[0]
    );

    if (matchingConditions.length > 0) {
      return `Could not retrieve search results for: ${matchingConditions
        .map((condition) => condition[1])
        .join(', ')}`;
    } else {
      return false;
    }
  };

  const finalResults = isLargeAccount ? apiResults : searchResultsByEntity;

  const resultsEmpty = equals(finalResults, emptyResults);

  const loading = isLargeAccount
    ? apiSearchLoading
    : areLinodesLoading ||
      areBucketsLoading ||
      areDomainsLoading ||
      areVolumesLoading ||
      areKubernetesClustersLoading ||
      areImagesLoading ||
      areNodeBalancersLoading ||
      areFirewallsLoading ||
      areDatabasesLoading;

  const errorMessage = getErrorMessage();

  return (
    <StyledRootGrid container direction="column" spacing={2}>
      <Grid>
        {!resultsEmpty && !loading && (
          <StyledH1Header
            title={`Search Results ${query && `for "${query}"`}`}
          />
        )}
      </Grid>
      {errorMessage && (
        <Grid>
          <Notice text={errorMessage} variant="error" />
        </Grid>
      )}
      {apiError && (
        <Grid>
          <Notice text={apiError} variant="error" />
        </Grid>
      )}
      {queryError && (
        <Grid>
          <Notice text="Invalid query" variant="error" />
        </Grid>
      )}
      {(loading || apiSearchLoading) && (
        <Grid data-qa-search-loading data-testid="loading">
          <CircleProgress />
        </Grid>
      )}
      {resultsEmpty && !loading && (
        <StyledGrid data-qa-empty-state>
          <StyledStack>
            <StyledError />
            <Typography style={{ marginBottom: 16 }}>
              You searched for ...
            </Typography>
            <Typography className="resultq">{query}</Typography>
            <Typography className="nothing" style={{ marginTop: 56 }}>
              Sorry, no results for this one.
            </Typography>
          </StyledStack>
        </StyledGrid>
      )}
      {!loading && (
        <Grid sx={{ padding: 0 }}>
          {Object.keys(finalResults).map(
            (entityType: keyof typeof displayMap, idx: number) => (
              <ResultGroup
                entity={displayMap[entityType]}
                groupSize={100}
                key={idx}
                results={finalResults[entityType]}
              />
            )
          )}
        </Grid>
      )}
    </StyledRootGrid>
  );
};

const EnhancedSearchLanding = withStoreSearch()(SearchLanding);

export const searchLandingLazyRoute = createLazyRoute('/search')({
  component: React.lazy(() =>
    import('./SearchLanding').then(() => ({
      default: (props: any) => <EnhancedSearchLanding {...props} />,
    }))
  ),
});

export default EnhancedSearchLanding;
