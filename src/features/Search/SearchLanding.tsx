import { equals } from 'ramda';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';

import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Placeholder from 'src/components/Placeholder';
import reloadableWithRouter from 'src/features/linodes/LinodesDetail/reloadableWithRouter';
import { getQueryParam } from 'src/utilities/queryParams';

import ResultGroup from './ResultGroup';
import { emptyResults } from './utils';
import withStoreSearch, { SearchProps } from './withStoreSearch';

type ClassNames = 'root'
| 'headline';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  headline: {
    marginBottom: 10,
  },
});

const displayMap = {
  linodes: "Linodes",
  domains: "Domains",
  volumes: "Volumes",
  nodebalancers: "NodeBalancers",
  images: "Images",
}

interface State {
  query: string;
  loading: boolean;
  error: boolean;
}

type CombinedProps =
  & SearchProps
  & RouteComponentProps<{}>
  & WithStyles<ClassNames>;

export class SearchLanding extends React.Component<CombinedProps, State> {
  mounted: boolean = false;

  state: State = {
    query: getQueryParam(this.props.location.search, 'query'),
    error: false,
    loading: false,
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
    const { classes, searchResults } = this.props;
    const { query, error, loading } = this.state;

    const resultsEmpty = equals(searchResults, emptyResults);
    return (
      <Grid container direction="column">
        <Grid item>
          <Typography variant="h1" className={classes.headline}>
            Search Results { query && `for "${query}"` }
          </Typography>
        </Grid>
        {error &&
          <Grid item data-qa-error-state>
            <ErrorState errorText={"There was an error retrieving your search results."} />
          </Grid>
        }
        {
          !loading && resultsEmpty &&
          <Grid item data-qa-empty-state>
            <Placeholder
              title="No results"
              copy="Your search didn't return any results."
            />
          </Grid>
        }
        <Grid item>
          {Object.keys(searchResults).map((entityType, idx: number) =>
            <ResultGroup
              key={idx}
              entity={displayMap[entityType]}
              results={searchResults[entityType]}
              loading={loading}
              groupSize={100}
            />
          )}
        </Grid>
      </Grid>
    );
  }
}

const styled = withStyles(styles);

const reloaded = reloadableWithRouter(
  (routePropsOld, routePropsNew) => {
    // reload if we're on the search landing
    // and we enter a new term to search for
    return routePropsOld.location.search !== routePropsNew.location.search;
  },
);

const enhanced = compose<CombinedProps, {}>(
  styled,
  reloaded,
  withStoreSearch(),
)(SearchLanding);

export default enhanced;
