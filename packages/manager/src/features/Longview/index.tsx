import * as React from 'react';
import {
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';
import DefaultLoader from 'src/components/DefaultLoader';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';

const LongviewLanding = DefaultLoader({
  loader: () => import('./LongviewLanding')
});

type Props = RouteComponentProps<{}>;

class Longview extends React.Component<Props> {
  render() {
    const {
      match: { path }
    } = this.props;

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Longview" />
        <Switch>
          <Route component={LongviewLanding} path={path} exact />
        </Switch>
      </React.Fragment>
    );
  }
}

export default withRouter(Longview);
