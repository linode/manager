import {
  getActiveLongviewPlan,
  getLongviewSubscriptions
} from '@linode/api-v4/lib/longview';
import {
  LongviewSubscription,
  ActiveLongviewPlan
} from '@linode/api-v4/lib/longview/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { isEmpty, pathOr } from 'ramda';
import * as React from 'react';
import { matchPath, RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import Breadcrumb from 'src/components/Breadcrumb';
import Box from 'src/components/core/Box';
import SafeTabPanel from 'src/components/SafeTabPanel';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import TabLinkList from 'src/components/TabLinkList';
import DocumentationButton from 'src/components/DocumentationButton';
import SuspenseLoader from 'src/components/SuspenseLoader';
import withSettings, {
  Props as SettingsProps
} from 'src/containers/accountSettings.container';
import withLongviewClients, {
  Props as LongviewProps
} from 'src/containers/longview.container';
import withProfile from 'src/containers/profile.container';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import useFlags from 'src/hooks/useFlags';
import LandingHeader from 'src/components/LandingHeader';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import SubscriptionDialog from './SubscriptionDialog';

const LongviewClients = React.lazy(() => import('./LongviewClients'));
const LongviewPlans = React.lazy(() => import('./LongviewPlans'));

type CombinedProps = LongviewProps &
  RouteComponentProps<{}> &
  WithSnackbarProps &
  // We need this to know if the account is managed
  SettingsProps &
  GrantsProps;

export const LongviewLanding: React.FunctionComponent<CombinedProps> = props => {
  const activeSubscriptionRequestHook = useAPIRequest<ActiveLongviewPlan>(
    () => getActiveLongviewPlan().then(response => response),
    {}
  );
  const subscriptionsRequestHook = useAPIRequest<LongviewSubscription[]>(
    () => getLongviewSubscriptions().then(response => response.data),
    []
  );
  const flags = useFlags();

  const { accountSettings, createLongviewClient } = props;

  const [newClientLoading, setNewClientLoading] = React.useState<boolean>(
    false
  );
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = React.useState<
    boolean
  >(false);

  const isManaged = pathOr(false, ['managed'], accountSettings);

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

  const navToURL = (index: number) => {
    props.history.push(tabs[index].routeName);
  };

  const handleAddClient = () => {
    setNewClientLoading(true);
    createLongviewClient()
      .then(_ => {
        setNewClientLoading(false);
        if (props.history.location.pathname !== '/longview/clients') {
          props.history.push('/longview/clients');
        }
      })
      .catch(errorResponse => {
        if (errorResponse[0].reason.match(/subscription/)) {
          // The user has reached their subscription limit.
          setSubscriptionDialogOpen(true);
        } else {
          // Any network or other errors handled with a toast
          props.enqueueSnackbar(
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
      history: { push }
    } = props;

    if (isManaged) {
      push({
        pathname: '/support/tickets',
        state: {
          open: true,
          title: 'Request for additional Longview clients'
        }
      });
      return;
    }
    props.history.push('/longview/plan-details');
  };

  return (
    <>
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        {flags.cmr ? (
          // @todo: remove inline style when we switch over to CMR
          <div style={{ width: '100%' }}>
            <LandingHeader
              title="Longview"
              entity="Client"
              createButtonText={
                newClientLoading ? 'Loading...' : 'Create a Client'
              }
              docsLink="https://www.linode.com/docs/platform/longview/longview/"
              onAddNew={handleAddClient}
              removeCrumbX={1}
            />
          </div>
        ) : (
          <>
            <Breadcrumb
              pathname={props.location.pathname}
              labelTitle="Longview"
              removeCrumbX={1}
            />
            <DocumentationButton
              href={'https://www.linode.com/docs/platform/longview/longview/'}
            />
          </>
        )}
      </Box>
      <Tabs
        index={Math.max(
          tabs.findIndex(tab => matches(tab.routeName)),
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
      <SubscriptionDialog
        isOpen={subscriptionDialogOpen}
        isManaged={isManaged}
        onClose={() => setSubscriptionDialogOpen(false)}
        onSubmit={handleSubmit}
        clientLimit={
          isEmpty(activeSubscriptionRequestHook.data)
            ? 10
            : (activeSubscriptionRequestHook.data as LongviewSubscription)
                .clients_included
        }
      />
    </>
  );
};

interface GrantsProps {
  userCanCreateClient: boolean;
}

export default compose<CombinedProps, {} & RouteComponentProps>(
  withLongviewClients(),
  withProfile<GrantsProps, {}>((ownProps, { profileData }) => {
    const isRestrictedUser = (profileData || {}).restricted;
    const hasAddLongviewGrant = pathOr<boolean>(
      false,
      ['grants', 'global', 'add_longview'],
      profileData
    );
    return {
      userCanCreateClient:
        !isRestrictedUser || (hasAddLongviewGrant && isRestrictedUser)
    };
  }),
  withSettings(),
  withSnackbar
)(LongviewLanding);
