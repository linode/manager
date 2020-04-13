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
import reloadableWithRouter from 'src/features/linodes/LinodesDetail/reloadableWithRouter';
import { useReduxLoad } from 'src/hooks/useReduxLoad';
import { ErrorObject } from 'src/store/selectors/entitiesErrors';
import { getQueryParam } from 'src/utilities/queryParams';
import ResultGroup from './ResultGroup';
import { emptyResults } from './utils';
import withStoreSearch, { SearchProps } from './withStoreSearch';

import Error from 'src/assets/icons/error.svg';
import './searchLanding.css';

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
  }
}));

const displayMap = {
  linodes: 'Linodes',
  domains: 'Domains',
  volumes: 'Volumes',
  nodebalancers: 'NodeBalancers',
  images: 'Images',
  kubernetesClusters: 'Kubernetes'
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
  const { entities, errors, searchResultsByEntity } = props;

  const classes = useStyles();

  let query = '';
  let queryError = false;
  try {
    query = getQueryParam(props.location.search, 'query');
  } catch {
    queryError = true;
  }

  const { _loading } = useReduxLoad([
    'linodes',
    'volumes',
    'nodeBalancers',
    'images',
    'domains',
    'kubernetes'
  ]);

  React.useEffect(() => {
    props.search(query);
  }, [query, entities]);

  const resultsEmpty = equals(searchResultsByEntity, emptyResults);

  return (
    <Grid container direction="column">
      <Grid item>
        {!resultsEmpty && !_loading && (
          <H1Header
            title={`Search Results ${query && `for "${query}"`}`}
            className={classes.headline}
          />
        )}
      </Grid>
      {errors.hasErrors && (
        <Grid item>
          <Notice error text={getErrorMessage(errors)} />
        </Grid>
      )}
      {queryError && (
        <Grid item>
          <Notice error text="Invalid query" />
        </Grid>
      )}
      {_loading && (
        <Grid item data-qa-search-loading data-testid="loading">
          <CircleProgress />
        </Grid>
      )}
      {resultsEmpty && !_loading && (
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
              sorry, no results for this one
            </Typography>
          </div>
        </Grid>
      )}
      {!_loading && (
        <Grid item>
          {Object.keys(searchResultsByEntity).map((entityType, idx: number) => (
            <ResultGroup
              key={idx}
              entity={displayMap[entityType]}
              results={searchResultsByEntity[entityType]}
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
