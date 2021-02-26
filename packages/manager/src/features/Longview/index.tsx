import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import SuspenseLoader from 'src/components/SuspenseLoader';

const LongviewLanding = React.lazy(() => import('./LongviewLanding'));
const LongviewDetail = React.lazy(() => import('./LongviewDetail'));

type Props = RouteComponentProps<{}>;

const Longview: React.FC<Props> = props => {
  const {
    match: { path },
  } = props;

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Longview" />
      <React.Suspense fallback={<SuspenseLoader />}>
        <Switch>
          <Route component={LongviewDetail} path={`${path}/clients/:id`} />
          <Route component={LongviewLanding} />
        </Switch>
      </React.Suspense>
    </React.Fragment>
  );
};

export default Longview;
