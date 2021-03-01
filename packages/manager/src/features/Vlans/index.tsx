import * as React from 'react';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import SuspenseLoader from 'src/components/SuspenseLoader';

const VlanLanding = React.lazy(() => import('./VlanLanding'));

type Props = RouteComponentProps<Record<string, never>>;

type CombinedProps = Props;

const VLan: React.FC<CombinedProps> = (props) => {
  const {
    match: { path },
  } = props;

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <React.Fragment>
        <DocumentTitleSegment segment="VLANs" />
        <Switch>
          <Route component={VlanLanding} path={path} exact />
          <Route render={() => null} path={`${path}/:id`} exact strict />
          <Redirect to={path} />
        </Switch>
      </React.Fragment>
    </React.Suspense>
  );
};

export default VLan;
