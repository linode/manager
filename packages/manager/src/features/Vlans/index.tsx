import * as React from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import SuspenseLoader from 'src/components/SuspenseLoader';
import CreateVLANDialog from './CreateVLANDialog';

const VlanLanding = React.lazy(() => import('./VlanLanding/VlanLanding'));
//const VlanDetail = React.lazy(() => import('./VlanLanding/VlanDetail'));

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
          <Route component={VlanLanding} exact path={path} />
          <Redirect to={path} />
        </Switch>
      </React.Fragment>
      <CreateVLANDialog />
    </React.Suspense>
  );
};

export default VLan;
