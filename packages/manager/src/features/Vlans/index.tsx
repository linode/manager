import * as React from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import SuspenseLoader from 'src/components/SuspenseLoader';

const VlanLanding = React.lazy(() => import('./VlanLanding/VlanLanding'));
const VlanDetail = React.lazy(() => import('./VlanDetail/VlanDetail'));

type Props = RouteComponentProps<{}>;

type CombinedProps = Props;

const VLan: React.FC<CombinedProps> = props => {
  const {
    match: { path }
  } = props;

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <React.Fragment>
        <DocumentTitleSegment segment="VLANs" />
        <Switch>
          <Route component={VlanLanding} path={path} exact />
          <Route component={VlanDetail} path={`${path}/detail`} />
          <Redirect to={path} />
        </Switch>
      </React.Fragment>
    </React.Suspense>
  );
};

export default VLan;
