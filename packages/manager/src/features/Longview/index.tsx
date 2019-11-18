import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import DefaultLoader from 'src/components/DefaultLoader';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Placeholder from 'src/components/Placeholder';
import useFlags from 'src/hooks/useFlags';

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

  const flags = useFlags();

  // if (!flags.longview) {
  //   return (
  //     <React.Fragment>
  //       <DocumentTitleSegment segment="Longview" />
  //       <Placeholder
  //         title="Longview"
  //         copy="Longview performance metrics are coming soon to Cloud Manager! Until then, you can access Longview in Classic Manager."
  //         buttonProps={[
  //           {
  //             onClick: () =>
  //               window.open(
  //                 'https://manager.linode.com/longview',
  //                 '_blank',
  //                 'noopener'
  //               ),
  //             children: 'Navigate to Classic Manager'
  //           }
  //         ]}
  //       />
  //     </React.Fragment>
  //   );
  // }

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
