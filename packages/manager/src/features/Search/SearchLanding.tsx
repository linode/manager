import { equals } from 'ramda';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import H1Header from 'src/components/H1Header';
import Notice from 'src/components/Notice';
import { REFRESH_INTERVAL } from 'src/constants';
import reloadableWithRouter from 'src/features/linodes/LinodesDetail/reloadableWithRouter';
import useAPISearch from 'src/features/Search/useAPISearch';
import useAccountManagement from 'src/hooks/useAccountManagement';
import useFlags from 'src/hooks/useFlags';
import { useReduxLoad } from 'src/hooks/useReduxLoad';
import { ErrorObject } from 'src/store/selectors/entitiesErrors';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getQueryParam } from 'src/utilities/queryParams';
import { debounce } from 'throttle-debounce';
import ResultGroup from './ResultGroup';
import { emptyResults } from './utils';
import withStoreSearch, { SearchProps } from './withStoreSearch';

import Error from 'src/assets/icons/error.svg';
import './searchLanding.css';
import { useObjectStorage } from 'src/hooks/useObjectStorageBuckets';

const useStyles = makeStyles((theme: Theme) => ({
  headline: {
    marginBottom: 10
  },
  emptyResultWrapper: {
    padding: `${theme.spacing(10)}px ${theme.spacing(4)}px`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyResult: {
    padding: `${theme.spacing(10)}px ${theme.spacing(4)}px`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(4)
    }
  },
  errorIcon: {
    width: 60,
    height: 60,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(4)
  },
  cmrSpacing: {
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing()
    }
  }
}));

const displayMap = {
  linodes: 'Linodes',
  domains: 'Domains',
  volumes: 'Volumes',
  nodebalancers: 'NodeBalancers',
  images: 'Images',
  kubernetesClusters: 'Kubernetes',
  buckets: 'Buckets'
};

export type CombinedProps = SearchProps & RouteComponentProps<{}>;

const getErrorMessage = (errors: ErrorObject): string => {
  const errorString: string[] = [];
  if (errors.linodes) {
    errorString.push('Linodes');
  }
  if (errors.domains) {
    errorString.push('Domains');
  }
  if (errors.volumes) {
    errorString.push('Volumes');
  }
  if (errors.nodebalancers) {
    errorString.push('NodeBalancers');
  }
  if (errors.images) {
    errorString.push('Images');
  }
  if (errors.kubernetes) {
    errorString.push('Kubernetes');
  }
  if (errors.objectStorageClusters || errors.objectStorageBuckets) {
    errorString.push('Buckets');
  }
  const joined = errorString.join(', ');
  return `Could not retrieve search results for: ${joined}`;
};

const splitWord = (word: any) => {
  word = word.split('');
  for (let i = 0; i < word.length; i += 2) {
    word[i] = <span key={i}>{word[i]}</span>;
  }
  return word;
};

export const SearchLanding: React.FC<CombinedProps> = props => {
  const { entities, errors, search, searchResultsByEntity } = props;

  const classes = useStyles();
  const flags = useFlags();
  const { _isLargeAccount } = useAccountManagement();

  const [apiResults, setAPIResults] = React.useState<any>({});
  const [apiError, setAPIError] = React.useState<string | null>(null);
  const [apiSearchLoading, setAPILoading] = React.useState<boolean>(false);

  let query = '';
  let queryError = false;
  try {
    query = getQueryParam(props.location.search, 'query');
  } catch {
    queryError = true;
  }

  const { _loading: reduxLoading } = useReduxLoad(
    ['linodes', 'volumes', 'nodeBalancers', 'images', 'domains', 'kubernetes'],
    REFRESH_INTERVAL,
    !_isLargeAccount
  );
  const { loading: objectStorageLoading } = useObjectStorage(!_isLargeAccount);

  const { searchAPI } = useAPISearch();

  const _searchAPI = React.useRef(
    debounce(500, false, (_searchText: string) => {
      setAPILoading(true);
      searchAPI(_searchText)
        .then(searchResults => {
          setAPIResults(searchResults.searchResultsByEntity);
          setAPILoading(false);
          setAPIError(null);
        })
        .catch(error => {
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
      search(query);
    }
  }, [query, entities, search, _isLargeAccount, _searchAPI]);

  const finalResults = _isLargeAccount ? apiResults : searchResultsByEntity;

  const resultsEmpty = equals(finalResults, emptyResults);

  const loading = reduxLoading || objectStorageLoading;

  return (
    <Grid container direction="column">
      <Grid item>
        {!resultsEmpty && !loading && !objectStorageLoading && (
          <H1Header
            title={`Search Results ${query && `for "${query}"`}`}
            className={`${classes.headline} ${flags.cmr && classes.cmrSpacing}`}
          />
        )}
      </Grid>
      {errors.hasErrors && (
        <Grid item>
          <Notice error text={getErrorMessage(errors)} />
        </Grid>
      )}
      {apiError && (
        <Grid item>
          <Notice error text={apiError} />
        </Grid>
      )}
      {queryError && (
        <Grid item>
          <Notice error text="Invalid query" />
        </Grid>
      )}
      {(loading || apiSearchLoading) && (
        <Grid item data-qa-search-loading data-testid="loading">
          <CircleProgress />
        </Grid>
      )}
      {resultsEmpty && !loading && (
        <Grid item data-qa-empty-state className={classes.emptyResultWrapper}>
          <div className={classes.emptyResult}>
            <Error className={classes.errorIcon} />
            <Typography style={{ marginBottom: 16 }}>
              You searched for ...
            </Typography>
            <Typography className="resultq">
              {query && splitWord(query)}
            </Typography>
            <Typography style={{ marginTop: 56 }} className="nothing">
              Sorry, no results for this one
            </Typography>
          </div>
        </Grid>
      )}
      {!loading && (
        <Grid item>
          {Object.keys(finalResults).map((entityType, idx: number) => (
            <ResultGroup
              key={idx}
              entity={displayMap[entityType]}
              results={finalResults[entityType]}
              groupSize={100}
            />
          ))}
        </Grid>
      )}
    </Grid>
  );
};

const reloaded = reloadableWithRouter((routePropsOld, routePropsNew) => {
  // reload if we're on the search landing
  // and we enter a new term to search for
  return routePropsOld.location.search !== routePropsNew.location.search;
});

const enhanced = compose<CombinedProps, {}>(
  reloaded,
  withStoreSearch()
)(SearchLanding);

export default enhanced;
