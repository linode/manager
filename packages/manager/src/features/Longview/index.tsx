import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';

const LongviewLanding = React.lazy(() => import('./LongviewLanding'));
const LongviewDetail = React.lazy(() => import('./LongviewDetail'));

type Props = RouteComponentProps<{}>;

const Longview: React.FC<Props> = props => {
  const {
    match: { path }
  } = props;

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Longview" />
      <Switch>
        <Route component={LongviewDetail} path={`${path}/clients/:id`} />
        <Route component={LongviewLanding} />
      </Switch>
    </React.Fragment>
  );
};

export default Longview;
