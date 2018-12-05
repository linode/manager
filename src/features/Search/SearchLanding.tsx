import { equals, pathOr } from 'ramda';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';

import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Placeholder from 'src/components/Placeholder';
import { withTypes } from 'src/context/types';
import reloadableWithRouter from 'src/features/linodes/LinodesDetail/reloadableWithRouter';
import { getAllEntities } from 'src/utilities/getAll';
import { parseQueryParams } from 'src/utilities/queryParams';

import ResultGroup from './ResultGroup';
import { emptyResults, searchAll, SearchResults } from './utils';

type ClassNames = 'root'
| 'headline';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  headline: {
    marginBottom: 10,
  },
});

interface State {
  query: string;
  results: SearchResults;
  linodes: Linode.Linode[];
  volumes: Linode.Volume[];
  nodebalancers: Linode.NodeBalancer[];
  domains: Linode.Domain[];
  images: Linode.Image[];
  loading: boolean;
  error: boolean;
}

interface TypesContextProps {
  typesData?: Linode.LinodeType[];
}

type CombinedProps = TypesContextProps & RouteComponentProps<{}> & WithStyles<ClassNames>;

export class SearchLanding extends React.Component<CombinedProps, State> {
  mounted: boolean = false;
  getQuery = () => {
    let queryFromParams;
    try {
      queryFromParams = parseQueryParams(this.props.location.search)['?query'];
    }
    catch {
      queryFromParams = ''
    }
    const query = queryFromParams ? decodeURIComponent(queryFromParams) : '';
    return query;
  }

  getInitialResults = () => {
    return pathOr(
      emptyResults,
      ['history', 'location', 'state', 'searchResults'],
      this.props
    )
  }

  state: State = {
    query: this.getQuery(),
    results: this.getInitialResults(),
    error: false,
    loading: false,
    linodes: [],
    volumes: [],
    nodebalancers: [],
    domains: [],
    images: [],
  };

  componentDidMount() {
    this.mounted = true;
    const { results } = this.state;
    if (equals(results, emptyResults)) {
      this.updateData();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  updateData = () => {
    this.setState({ loading: true });
    getAllEntities(this.setEntitiesToState)
      .catch((error) => {
        this.setState({ error: true });
      });
  }

  setEntitiesToState = (
    linodes: Linode.Linode[],
    nodebalancers: Linode.NodeBalancer[],
    volumes: Linode.Volume[],
    domains: Linode.Domain[],
    images: Linode.Image[]
  ) => {
    if (!this.mounted) { return; }
    this.setState({
      linodes,
      nodebalancers,
      volumes,
      domains,
      images,
    }, this.search)
  }

  search = () => {
    const { linodes, volumes, domains, nodebalancers, images, query } = this.state;
    const { typesData } = this.props;

    const queryLower = query.toLowerCase();
    const searchResults: SearchResults = searchAll(
      linodes, volumes, nodebalancers, domains, images, queryLower, typesData,
    );
    this.setState({ results: searchResults, loading: false });
  }


  render() {
    const { classes } = this.props;
    const { query, error, loading, results } = this.state;

    const resultsEmpty = equals(results, emptyResults);
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
          {Object.keys(results).map((entityType, idx: number) =>
            <ResultGroup
              key={idx}
              entity={entityType}
              results={results[entityType]}
              loading={loading}
              groupSize={5}
            />
          )}
        </Grid>
      </Grid>
    );
  }
}

const styled = withStyles(styles);

const typesContext = withTypes(({
  data: typesData,
}) => ({
  typesData,
}));

const reloaded = reloadableWithRouter(
  (routePropsOld, routePropsNew) => {
    // reload if we're on the search landing
    // and we enter a new term to search for
    return routePropsOld.location.search !== routePropsNew.location.search;
  },
);

const enhanced = compose<CombinedProps, {}>(
  styled,
  typesContext,
  reloaded,
)(SearchLanding);

export default enhanced;
