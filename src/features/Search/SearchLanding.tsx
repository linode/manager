import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import {compose} from 'ramda';

import { parseQueryParams } from 'src/utilities/queryParams';

import {
  StyleRulesCallback,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {}

interface Query {
  query: string;
}

interface State {
  query: Query;
}

type CombinedProps = Props
  & RouteComponentProps<{}>
  & WithStyles<ClassNames>;

class SearchLanding extends React.Component<CombinedProps, State> {
  constructor(props: CombinedProps) {
    super(props);

    /*
    * Will look like: { query: 'hello world' }
    */
    const query = parseQueryParams(props.location.search.replace('?', '')) as Query;

    this.state = {
      query,
    }
  }

  render() {
    console.log(this.state.query);
    return (
      <div>Hello World</div>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default compose(
  withRouter,
  styled,
)(SearchLanding);
