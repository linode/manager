import { equals, pathOr } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { parseQueryParams } from 'src/utilities/queryParams';

import { emptyResults, SearchResults } from './utils';

type ClassNames = 'root'
| 'title';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  title: {
    fontSize: 25,
  },
});

interface State {
  query: string;
  results: SearchResults;
}

type CombinedProps = RouteComponentProps<{}> & WithStyles<ClassNames>;

class SearchLanding extends React.Component<CombinedProps, State> {
  getQuery = () => {
    const queryFromParams = parseQueryParams(this.props.location.search)['?query'];
    const query = queryFromParams ? decodeURIComponent(queryFromParams) : '';
    return query;
  }

  getInitialResults = () => {
    return pathOr(
      emptyResults,
      ['history', 'location', 'state', 'attachmentErrors'],
      this.props
    )
  }

  state: State = {
    query: this.getQuery(),
    results: this.getInitialResults(),
  };

  componentDidMount() {
    const { results } = this.state;
    if (equals(results, emptyResults)) {
      this.search();
    }
  }

  search = () => {
    // const { query } = this.state;
    return null;
  }


  render() {
    const { classes } = this.props;
    const { query } = this.state;
    return (
      <Grid container >
        <Grid item>
          <Typography variant="title" className={classes.title}>
            Search Results for "{query}"
          </Typography>
        </Grid>
      </Grid>
    );
  }
}

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, {}>(
  styled,
  withRouter
)(SearchLanding);

export default enhanced;
