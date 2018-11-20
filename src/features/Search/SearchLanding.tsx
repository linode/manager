import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import { parseQueryParams } from 'src/utilities/queryParams';


type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {}

interface State {
  query: string;
}

type CombinedProps = Props & RouteComponentProps<{}> & WithStyles<ClassNames>;

class SearchLanding extends React.Component<CombinedProps, State> {
  getQuery = () => {
    const queryFromParams = parseQueryParams(this.props.location.search)['?query'];
    const query = queryFromParams ? decodeURIComponent(queryFromParams) : '';
    return query;
  }

  state: State = {
    query: this.getQuery()
  };


  render() {
    const { query } = this.state;
    return (
      <div>You searched for {query}</div>
    );
  }
}

const styled = withStyles(styles);

const enhanced = compose(
  styled,
  withRouter
)(SearchLanding);

export default enhanced;
