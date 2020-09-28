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
        <DocumentTitleSegment segment="VLans" />
        <Switch>
          {/* <Route path={`${path}/:id`} component={VlanDetail} /> */}
          <Route path={`${path}/detail`} component={VlanDetail} />
          <Route component={VlanLanding} exact path={path} />
          <Redirect to={path} />
        </Switch>
      </React.Fragment>
    </React.Suspense>
  );
};

export default VLan;
