import Grid from '@mui/material/Unstable_Grid2';
import { equals } from 'ramda';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { debounce } from 'throttle-debounce';

import { CircleProgress } from 'src/components/CircleProgress';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { useAPISearch } from 'src/features/Search/useAPISearch';
import { useIsLargeAccount } from 'src/hooks/useIsLargeAccount';
import { useAllDomainsQuery } from 'src/queries/domains';
import { useAllImagesQuery } from 'src/queries/images';
import { useAllKubernetesClustersQuery } from 'src/queries/kubernetes';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import { useAllNodeBalancersQuery } from 'src/queries/nodebalancers';
import {
  useObjectStorageBuckets,
  useObjectStorageClusters,
} from 'src/queries/objectStorage';
import { useRegionsQuery } from 'src/queries/regions';
import { useSpecificTypes } from 'src/queries/types';
import { useAllVolumesQuery } from 'src/queries/volumes';
import { formatLinode } from 'src/store/selectors/getSearchEntities';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { extendTypesQueryResult } from 'src/utilities/extendType';
import { isNilOrEmpty } from 'src/utilities/isNilOrEmpty';
import { isNotNullOrUndefined } from 'src/utilities/nullOrUndefined';
import { getQueryParamFromQueryString } from 'src/utilities/queryParams';

import { getImageLabelForLinode } from '../Images/utils';
import { ResultGroup } from './ResultGroup';
import {
  StyledError,
  StyledGrid,
  StyledH1Header,
  StyledRootGrid,
  StyledStack,
} from './SearchLanding.styles';
import './searchLanding.css';
import { emptyResults } from './utils';
import withStoreSearch, { SearchProps } from './withStoreSearch';

const displayMap = {
  buckets: 'Buckets',
  domains: 'Domains',
  images: 'Images',
  kubernetesClusters: 'Kubernetes',
  linodes: 'Linodes',
  nodebalancers: 'NodeBalancers',
  volumes: 'Volumes',
};

export type CombinedProps = SearchProps & RouteComponentProps<{}>;

const splitWord = (word: any) => {
  word = word.split('');
  for (let i = 0; i < word.length; i += 2) {
    word[i] = <span key={i}>{word[i]}</span>;
  }
  return word;
};

export const SearchLanding = (props: CombinedProps) => {
  const { entities, search, searchResultsByEntity } = props;

  const isLargeAccount = useIsLargeAccount();

  const {
    data: objectStorageClusters,
    error: objectStorageClustersError,
    isLoading: areClustersLoading,
  } = useObjectStorageClusters(!isLargeAccount);

  const {
    data: objectStorageBuckets,
    error: bucketsError,
    isLoading: areBucketsLoading,
  } = useObjectStorageBuckets(objectStorageClusters, !isLargeAccount);

  const {
    data: domains,
    error: domainsError,
    isLoading: areDomainsLoading,
  } = useAllDomainsQuery(!isLargeAccount);

  const {
    data: kubernetesClusters,
    error: kubernetesClustersError,
    isLoading: areKubernetesClustersLoading,
  } = useAllKubernetesClustersQuery(!isLargeAccount);

  const {
    data: nodebalancers,
    error: nodebalancersError,
    isLoading: areNodeBalancersLoading,
  } = useAllNodeBalancersQuery(!isLargeAccount);

  const {
    data: volumes,
    error: volumesError,
    isLoading: areVolumesLoading,
  } = useAllVolumesQuery({}, {}, !isLargeAccount);

  const {
    data: _privateImages,
    error: imagesError,
    isLoading: areImagesLoading,
  } = useAllImagesQuery({}, { is_public: false }, !isLargeAccount); // We want to display private images (i.e., not Debian, Ubuntu, etc. distros)

  const { data: publicImages } = useAllImagesQuery(
    {},
    { is_public: true },
    !isLargeAccount
  );

  const {
    data: linodes,
    error: linodesError,
    isLoading: areLinodesLoading,
  } = useAllLinodesQuery({}, {}, !isLargeAccount);

  const { data: regions } = useRegionsQuery();

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
        nodebalancers ?? []
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
    // searchableLinodes,
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
      [objectStorageClustersError, 'Object Storage'],
      [
        objectStorageBuckets &&
          objectStorageBuckets.errors.length > 0 &&
          !objectStorageClustersError,
        `Object Storage in ${objectStorageBuckets?.errors
          .map((e) => e.cluster.region)
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

  const loading =
    areLinodesLoading ||
    areBucketsLoading ||
    areClustersLoading ||
    areDomainsLoading ||
    areVolumesLoading ||
    areKubernetesClustersLoading ||
    areImagesLoading ||
    areNodeBalancersLoading;

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
          <Notice error text={errorMessage} />
        </Grid>
      )}
      {apiError && (
        <Grid>
          <Notice error text={apiError} />
        </Grid>
      )}
      {queryError && (
        <Grid>
          <Notice error text="Invalid query" />
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
            <Typography className="resultq">
              {query && splitWord(query)}
            </Typography>
            <Typography className="nothing" style={{ marginTop: 56 }}>
              Sorry, no results for this one
            </Typography>
          </StyledStack>
        </StyledGrid>
      )}
      {!loading && (
        <Grid sx={{ padding: 0 }}>
          {Object.keys(finalResults).map((entityType, idx: number) => (
            <ResultGroup
              entity={displayMap[entityType]}
              groupSize={100}
              key={idx}
              results={finalResults[entityType]}
            />
          ))}
        </Grid>
      )}
    </StyledRootGrid>
  );
};

const enhanced = compose<CombinedProps, {}>(withStoreSearch())(SearchLanding);

export default enhanced;
