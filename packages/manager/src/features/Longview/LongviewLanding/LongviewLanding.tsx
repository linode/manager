import {
  getActiveLongviewPlan,
  getLongviewSubscriptions
} from '@linode/api-v4/lib/longview';
import {
  LongviewSubscription,
  ActiveLongviewPlan
} from '@linode/api-v4/lib/longview/types';
import * as React from 'react';
import { matchPath, RouteComponentProps } from 'react-router-dom';
import Breadcrumb from 'src/components/Breadcrumb';
import Box from 'src/components/core/Box';
import SafeTabPanel from 'src/components/SafeTabPanel';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import TabLinkList from 'src/components/TabLinkList';
import DocumentationButton from 'src/components/DocumentationButton';
import SuspenseLoader from 'src/components/SuspenseLoader';
import { useAPIRequest } from 'src/hooks/useAPIRequest';

const LongviewClients = React.lazy(() => import('./LongviewClients'));
const LongviewPlans = React.lazy(() => import('./LongviewPlans'));

type CombinedProps = RouteComponentProps<{}>;

export const LongviewLanding: React.FunctionComponent<CombinedProps> = props => {
  const activeSubscriptionRequestHook = useAPIRequest<ActiveLongviewPlan>(
    () => getActiveLongviewPlan().then(response => response),
    {}
  );
  const subscriptionsRequestHook = useAPIRequest<LongviewSubscription[]>(
    () => getLongviewSubscriptions().then(response => response.data),
    []
  );

  const tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    {
      title: 'Clients',
      routeName: `${props.match.url}/clients`
    },
    {
      title: 'Plan Details',
      routeName: `${props.match.url}/plan-details`
    }
  ];

  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: props.location.pathname }));
  };

  return (
    <React.Fragment>
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Breadcrumb
          pathname={props.location.pathname}
          labelTitle="Longview"
          removeCrumbX={1}
        />
        <DocumentationButton
          href={'https://www.linode.com/docs/platform/longview/longview/'}
        />
      </Box>
      <Tabs defaultIndex={tabs.findIndex(tab => matches(tab.routeName))}>
        <TabLinkList tabs={tabs} />

        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={0}>
              <LongviewClients
                activeSubscription={activeSubscriptionRequestHook.data}
                {...props}
              />
            </SafeTabPanel>

            <SafeTabPanel index={1}>
              <LongviewPlans
                subscriptionRequestHook={subscriptionsRequestHook}
              />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </React.Fragment>
  );
};

export default LongviewLanding;
