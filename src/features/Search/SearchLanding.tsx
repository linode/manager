import { equals } from 'ramda';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import reloadableWithRouter from 'src/features/linodes/LinodesDetail/reloadableWithRouter';
import { ErrorObject } from 'src/store/selectors/entitiesErrors';
import { getQueryParam } from 'src/utilities/queryParams';
import ResultGroup from './ResultGroup';
import { emptyResults } from './utils';
import withStoreSearch, { SearchProps } from './withStoreSearch';

import Error from 'src/assets/icons/error.svg';
import './searchLanding.css';

type ClassNames =
  | 'root'
  | 'headline'
  | 'emptyResultWrapper'
  | 'emptyResult'
  | 'errorIcon';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  headline: {
    marginBottom: 10
  },
  emptyResultWrapper: {
    padding: `${theme.spacing.unit * 10}px ${theme.spacing.unit * 4}px`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyResult: {
    padding: `${theme.spacing.unit * 10}px ${theme.spacing.unit * 4}px`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing.unit * 4
    }
  },
  errorIcon: {
    width: 60,
    height: 60,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing.unit * 4
  }
});

const displayMap = {
  linodes: 'Linodes',
  domains: 'Domains',
  volumes: 'Volumes',
  nodebalancers: 'NodeBalancers',
  images: 'Images'
};

interface State {
  query: string;
}

type CombinedProps = SearchProps &
  RouteComponentProps<{}> &
  WithStyles<ClassNames>;

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

export class SearchLanding extends React.Component<CombinedProps, State> {
  mounted: boolean = false;

  state: State = {
    query: getQueryParam(this.props.location.search, 'query')
  };

  componentDidMount() {
    const { query } = this.state;
    this.mounted = true;
    this.props.search(query);
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidUpdate(prevProps: CombinedProps) {
    const { query } = this.state;
    if (!equals(prevProps.entities, this.props.entities)) {
      this.props.search(query);
    }
  }

  render() {
    const {
      classes,
      entitiesLoading,
      errors,
      searchResultsByEntity
    } = this.props;
    const { query } = this.state;

    const resultsEmpty = equals(searchResultsByEntity, emptyResults);

    return (
      <Grid container direction="column">
        <Grid item>
          {!resultsEmpty && !entitiesLoading && (
            <Typography variant="h1" className={classes.headline}>
              Search Results {query && `for "${query}"`}
            </Typography>
          )}
        </Grid>
        {errors.hasErrors && (
          <Grid item>
            <Notice error text={getErrorMessage(errors)} />
          </Grid>
        )}
        {entitiesLoading && (
          <Grid item data-qa-search-loading>
            <CircleProgress />
          </Grid>
        )}
        {resultsEmpty && !entitiesLoading && (
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
        {!entitiesLoading && (
          <Grid item>
            {Object.keys(searchResultsByEntity).map(
              (entityType, idx: number) => (
                <ResultGroup
                  key={idx}
                  entity={displayMap[entityType]}
                  results={searchResultsByEntity[entityType]}
                  groupSize={100}
                />
              )
            )}
          </Grid>
        )}
      </Grid>
    );
  }
}

const styled = withStyles(styles);

const reloaded = reloadableWithRouter((routePropsOld, routePropsNew) => {
  // reload if we're on the search landing
  // and we enter a new term to search for
  return routePropsOld.location.search !== routePropsNew.location.search;
});

const enhanced = compose<CombinedProps, {}>(
  styled,
  reloaded,
  withStoreSearch()
)(SearchLanding);

export default enhanced;
