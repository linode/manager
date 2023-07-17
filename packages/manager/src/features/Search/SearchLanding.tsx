import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { equals } from 'ramda';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { debounce } from 'throttle-debounce';

import Error from 'src/assets/icons/error.svg';
import { CircleProgress } from 'src/components/CircleProgress';
import { H1Header } from 'src/components/H1Header/H1Header';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import useAPISearch from 'src/features/Search/useAPISearch';
import useAccountManagement from 'src/hooks/useAccountManagement';
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
import { ErrorObject } from 'src/store/selectors/entitiesErrors';
import { formatLinode } from 'src/store/selectors/getSearchEntities';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { extendTypesQueryResult } from 'src/utilities/extendType';
import { isNilOrEmpty } from 'src/utilities/isNilOrEmpty';
import { isNotNullOrUndefined } from 'src/utilities/nullOrUndefined';
import { getQueryParamFromQueryString } from 'src/utilities/queryParams';

import { getImageLabelForLinode } from '../Images/utils';
import ResultGroup from './ResultGroup';
import './searchLanding.css';
import { emptyResults } from './utils';
import withStoreSearch, { SearchProps } from './withStoreSearch';

const useStyles = makeStyles((theme: Theme) => ({
  emptyResult: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: `${theme.spacing(10)} ${theme.spacing(4)}`,
    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(4),
    },
  },
  emptyResultWrapper: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: `${theme.spacing(10)} ${theme.spacing(4)}`,
  },
  errorIcon: {
    color: theme.palette.text.primary,
    height: 60,
    marginBottom: theme.spacing(4),
    width: 60,
  },
  headline: {
    marginBottom: theme.spacing(),
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(),
    },
  },
  root: {
    '&.MuiGrid-container': {
      width: 'calc(100% + 16px)',
    },
    padding: 0,
  },
}));

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

export const SearchLanding: React.FC<CombinedProps> = (props) => {
  const { entities, errors, search, searchResultsByEntity } = props;

  const classes = useStyles();
  const { _isLargeAccount } = useAccountManagement();

  const {
    data: objectStorageClusters,
    error: objectStorageClustersError,
    isLoading: areClustersLoading,
  } = useObjectStorageClusters(!_isLargeAccount);

  const {
    data: objectStorageBuckets,
    isLoading: areBucketsLoading,
  } = useObjectStorageBuckets(objectStorageClusters, !_isLargeAccount);

  const {
    data: domains,
    error: domainsError,
    isLoading: areDomainsLoading,
  } = useAllDomainsQuery(!_isLargeAccount);

  const {
    data: kubernetesClusters,
    error: kubernetesClustersError,
    isLoading: areKubernetesClustersLoading,
  } = useAllKubernetesClustersQuery(!_isLargeAccount);

  const {
    data: nodebalancers,
    error: nodebalancersError,
    isLoading: areNodeBalancersLoading,
  } = useAllNodeBalancersQuery(!_isLargeAccount);

  const {
    data: volumes,
    error: volumesError,
    isLoading: areVolumesLoading,
  } = useAllVolumesQuery({}, {}, !_isLargeAccount);

  const {
    data: _privateImages,
    error: imagesError,
    isLoading: areImagesLoading,
  } = useAllImagesQuery({}, { is_public: false }, !_isLargeAccount); // We want to display private images (i.e., not Debian, Ubuntu, etc. distros)

  const { data: publicImages } = useAllImagesQuery(
    {},
    { is_public: true },
    !_isLargeAccount
  );

  const {
    data: linodes,
    error: linodesError,
    isLoading: areLinodesLoading,
  } = useAllLinodesQuery({}, {}, !_isLargeAccount);

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
    if (_isLargeAccount) {
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
    _isLargeAccount,
    _searchAPI,
    objectStorageBuckets,
    domains,
    volumes,
    kubernetesClusters,
    _privateImages,
    regions,
    nodebalancers,
    searchableLinodes,
  ]);

  const getErrorMessage = (errors: ErrorObject): string => {
    const errorString: string[] = [];
    if (linodesError) {
      errorString.push('Linodes');
    }
    if (domainsError) {
      errorString.push('Domains');
    }
    if (volumesError) {
      errorString.push('Volumes');
    }
    if (imagesError) {
      errorString.push('Images');
    }
    if (nodebalancersError) {
      errorString.push('NodeBalancers');
    }
    if (kubernetesClustersError) {
      errorString.push('Kubernetes');
    }
    if (objectStorageClustersError) {
      errorString.push('Object Storage');
    }
    if (objectStorageBuckets?.errors && !objectStorageClustersError) {
      const regionsWithErrors = objectStorageBuckets.errors
        .map((e) => e.cluster.region)
        .join(', ');
      errorString.push(`Object Storage in ${regionsWithErrors}`);
    }

    const joined = errorString.join(', ');
    return `Could not retrieve search results for: ${joined}`;
  };

  const finalResults = _isLargeAccount ? apiResults : searchResultsByEntity;

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

  return (
    <Grid className={classes.root} container direction="column" spacing={2}>
      <Grid>
        {!resultsEmpty && !loading && (
          <H1Header
            className={classes.headline}
            title={`Search Results ${query && `for "${query}"`}`}
          />
        )}
      </Grid>
      {errors.hasErrors && (
        <Grid>
          <Notice error text={getErrorMessage(errors)} />
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
        <Grid className={classes.emptyResultWrapper} data-qa-empty-state>
          <div className={classes.emptyResult}>
            <Error className={classes.errorIcon} />
            <Typography style={{ marginBottom: 16 }}>
              You searched for ...
            </Typography>
            <Typography className="resultq">
              {query && splitWord(query)}
            </Typography>
            <Typography className="nothing" style={{ marginTop: 56 }}>
              Sorry, no results for this one
            </Typography>
          </div>
        </Grid>
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
    </Grid>
  );
};

const enhanced = compose<CombinedProps, {}>(withStoreSearch())(SearchLanding);

export default enhanced;
