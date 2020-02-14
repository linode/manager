import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import DefaultLoader from 'src/components/DefaultLoader';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';

const LongviewLanding = DefaultLoader({
  loader: () => import('./LongviewLanding')
});

const LongviewDetail = DefaultLoader({
  loader: () => import('./LongviewDetail')
});

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
