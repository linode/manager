import {
  getActiveLongviewPlan,
  getLongviewSubscriptions,
} from '@linode/api-v4/lib/longview';
import {
  ActiveLongviewPlan,
  LongviewSubscription,
} from '@linode/api-v4/lib/longview/types';
import { useSnackbar } from 'notistack';
import { isEmpty } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, matchPath } from 'react-router-dom';
import { compose } from 'recompose';

import { LandingHeader } from 'src/components/LandingHeader';
import { TabPanels } from 'src/components/ReachTabPanels';
import { Tabs } from 'src/components/ReachTabs';
import { SafeTabPanel } from 'src/components/SafeTabPanel/SafeTabPanel';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { TabLinkList } from 'src/components/TabLinkList/TabLinkList';
import withLongviewClients, {
  Props as LongviewProps,
} from 'src/containers/longview.container';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import { useAccountSettings } from 'src/queries/accountSettings';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { SubscriptionDialog } from './SubscriptionDialog';

const LongviewClients = React.lazy(() => import('./LongviewClients'));
const LongviewPlans = React.lazy(() => import('./LongviewPlans'));
const CloudviewLanding =React.lazy(() => import('./CloudView/CloudViewLanding'))

type CombinedProps = LongviewProps & RouteComponentProps<{}>;

export const LongviewLanding = (props: CombinedProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const activeSubscriptionRequestHook = useAPIRequest<ActiveLongviewPlan>(
    () => getActiveLongviewPlan().then((response) => response),
    {}
  );
  const subscriptionsRequestHook = useAPIRequest<LongviewSubscription[]>(
    () => getLongviewSubscriptions().then((response) => response.data),
    []
  );

  const { createLongviewClient } = props;

  const { data: accountSettings } = useAccountSettings();

  const isManaged = Boolean(accountSettings?.managed);

  const [newClientLoading, setNewClientLoading] = React.useState<boolean>(
    false
  );
  const [
    subscriptionDialogOpen,
    setSubscriptionDialogOpen,
  ] = React.useState<boolean>(false);

  const tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    {
      routeName: `${props.match.url}/clients`,
      title: 'Clients',
    },
    {
      routeName: `${props.match.url}/plan-details`,
      title: 'Plan Details',
    },
    {
      routeName: `${props.match.url}/cloudview`,
      title: 'Cloudview',
    }
  ];

  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: props.location.pathname }));
  };

  const navToURL = (index: number) => {
    props.history.push(tabs[index].routeName);
  };

  const handleAddClient = () => {
    setNewClientLoading(true);
    createLongviewClient()
      .then((_) => {
        setNewClientLoading(false);
        if (props.history.location.pathname !== '/longview/clients') {
          props.history.push('/longview/clients');
        }
      })
      .catch((errorResponse) => {
        if (errorResponse[0].reason.match(/subscription/)) {
          // The user has reached their subscription limit.
          setSubscriptionDialogOpen(true);
        } else {
          // Any network or other errors handled with a toast
          enqueueSnackbar(
            getAPIErrorOrDefault(
              errorResponse,
              'Error creating Longview client.'
            )[0].reason,
            { variant: 'error' }
          );
          setNewClientLoading(false);
        }
      });
  };

  const handleSubmit = () => {
    const {
      history: { push },
    } = props;

    if (isManaged) {
      push({
        pathname: '/support/tickets',
        state: {
          open: true,
          title: 'Request for additional Longview clients',
        },
      });
      return;
    }
    props.history.push('/longview/plan-details');
  };

  return (
    <>
      <LandingHeader
        createButtonText="Add Client"
        docsLink="https://www.linode.com/docs/platform/longview/longview/"
        entity="Client"
        loading={newClientLoading}
        onButtonClick={handleAddClient}
        removeCrumbX={1}
        title="Longview"
      />
      <Tabs
        index={Math.max(
          tabs.findIndex((tab) => matches(tab.routeName)),
          0
        )}
        onChange={navToURL}
        style={{ marginTop: 0 }}
      >
        <TabLinkList tabs={tabs} />

        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={0}>
              <LongviewClients
                activeSubscription={activeSubscriptionRequestHook.data}
                handleAddClient={handleAddClient}
                newClientLoading={newClientLoading}
                {...props}
              />
            </SafeTabPanel>

            <SafeTabPanel index={1}>
              <LongviewPlans
                subscriptionRequestHook={subscriptionsRequestHook}
              />
            </SafeTabPanel>
            <SafeTabPanel index={2}>
              <CloudviewLanding
                {...props}
              />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
      <SubscriptionDialog
        clientLimit={
          isEmpty(activeSubscriptionRequestHook.data)
            ? 10
            : (activeSubscriptionRequestHook.data as LongviewSubscription)
                .clients_included
        }
        isManaged={isManaged}
        isOpen={subscriptionDialogOpen}
        onClose={() => setSubscriptionDialogOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default compose<CombinedProps, {} & RouteComponentProps>(
  withLongviewClients()
)(LongviewLanding);
