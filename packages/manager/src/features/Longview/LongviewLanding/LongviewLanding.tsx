import {
  getActiveLongviewPlan,
  getLongviewSubscriptions,
} from '@linode/api-v4/lib/longview';
import { styled } from '@mui/material/styles';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import withLongviewClients from 'src/containers/longview.container';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useTabs } from 'src/hooks/useTabs';
import { useAccountSettings } from '@linode/queries';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { SubscriptionDialog } from './SubscriptionDialog';

import type {
  ActiveLongviewPlan,
  LongviewSubscription,
} from '@linode/api-v4/lib/longview/types';
import type { Props as LongviewProps } from 'src/containers/longview.container';
import type { LongviewState } from 'src/routes/longview';

const LongviewClients = React.lazy(() => import('./LongviewClients'));
const LongviewPlans = React.lazy(() => import('./LongviewPlans'));

export const LongviewLanding = (props: LongviewProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LongviewState;
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

  const { handleTabChange, tabIndex, tabs } = useTabs([
    {
      title: 'Clients',
      to: '/longview/clients',
    },
    {
      title: 'Plan Details',
      to: '/longview/plan-details',
    },
  ]);

  const isLongviewCreationRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_longview',
  });

  const handleAddClient = () => {
    setNewClientLoading(true);
    createLongviewClient()
      .then((_) => {
        setNewClientLoading(false);
        if (location.pathname !== '/longview/clients') {
          navigate({
            to: '/longview/clients',
          });
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
    if (isManaged) {
      navigate({
        state: (prev) => ({ ...prev, ...locationState }),
        to: '/support/tickets',
      });
      return;
    }
    navigate({
      to: '/longview/plan-details',
    });
  };

  return (
    <>
      <LandingHeader
        buttonDataAttrs={{
          tooltipText: getRestrictedResourceText({
            action: 'create',
            isSingular: false,
            resourceType: 'Longview Clients',
          }),
        }}
        createButtonText="Add Client"
        disabledCreateButton={isLongviewCreationRestricted}
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-longview"
        entity="Client"
        loading={newClientLoading}
        onButtonClick={handleAddClient}
        removeCrumbX={1}
        title="Longview"
      />
      <StyledTabs index={tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={tabs} />
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
          </TabPanels>
        </React.Suspense>
      </StyledTabs>
      <SubscriptionDialog
        clientLimit={
          Object.keys(activeSubscriptionRequestHook.data).length === 0
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

const StyledTabs = styled(Tabs, {
  label: 'StyledTabs',
})(() => ({
  marginTop: 0,
}));

export default withLongviewClients()(LongviewLanding);
