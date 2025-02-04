import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { switchAccountSessionContext } from 'src/context/switchAccountSessionContext';
import { useIsParentTokenExpired } from 'src/features/Account/SwitchAccounts/useIsParentTokenExpired';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useFlags } from 'src/hooks/useFlags';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useTabs } from 'src/hooks/useTabs';
import { useAccount } from 'src/queries/account/account';
import { useProfile } from 'src/queries/profile/profile';
import { sendSwitchAccountEvent } from 'src/utilities/analytics/customEventAnalytics';

import AccountLogins from './AccountLogins';
import { SwitchAccountButton } from './SwitchAccountButton';
import { SwitchAccountDrawer } from './SwitchAccountDrawer';

import type { LandingHeaderProps } from 'src/components/LandingHeader';

const Billing = React.lazy(() =>
  import('src/features/Billing/BillingDetail').then((module) => ({
    default: module.BillingDetail,
  }))
);
const EntityTransfersLanding = React.lazy(() =>
  import(
    'src/features/EntityTransfers/EntityTransfersLanding/EntityTransfersLanding'
  ).then((module) => ({
    default: module.EntityTransfersLanding,
  }))
);
const Users = React.lazy(() =>
  import('../Users/UsersLanding').then((module) => ({
    default: module.UsersLanding,
  }))
);
const Quotas = React.lazy(() =>
  import('./Quotas').then((module) => ({ default: module.Quotas }))
);
const GlobalSettings = React.lazy(() => import('./GlobalSettings'));
const MaintenanceLanding = React.lazy(
  () => import('./Maintenance/MaintenanceLanding')
);

export const AccountLanding = () => {
  const { data: account } = useAccount();
  const { data: profile } = useProfile();
  const { limitsEvolution } = useFlags();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);
  const sessionContext = React.useContext(switchAccountSessionContext);

  const isAkamaiAccount = account?.billing_source === 'akamai';
  const isProxyUser = profile?.user_type === 'proxy';
  const isChildUser = profile?.user_type === 'child';
  const isParentUser = profile?.user_type === 'parent';

  const showQuotasTab = limitsEvolution?.enabled ?? false;

  const isReadOnly =
    useRestrictedGlobalGrantCheck({
      globalGrantType: 'account_access',
      permittedGrantLevel: 'read_write',
    }) || isChildUser;

  const isChildAccountAccessRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'child_account_access',
  });

  const { isParentTokenExpired } = useIsParentTokenExpired({ isProxyUser });

  const { handleTabChange, tabIndex, tabs } = useTabs([
    {
      title: 'Billing Info',
      to: '/account/billing',
    },
    {
      title: 'Users & Grants',
      to: '/account/users',
    },
    {
      hide: !showQuotasTab,
      title: 'Quotas',
      to: '/account/quotas',
    },

    {
      title: 'Login History',
      to: '/account/login-history',
    },
    {
      title: 'Service Transfers',
      to: '/account/service-transfers',
    },
    {
      title: 'Maintenance',
      to: '/account/maintenance',
    },
    {
      title: 'Settings',
      to: '/account/settings',
    },
  ]);
  const handleAccountSwitch = () => {
    if (isParentTokenExpired) {
      return sessionContext.updateState({
        isOpen: true,
      });
    }

    setIsDrawerOpen(true);
  };

  // const overrideWhitelist = [
  //   '/account/billing/make-payment',
  //   '/account/billing/add-payment-method',
  //   '/account/billing/edit',
  // ];

  // const getDefaultTabIndex = () => {
  //   const tabChoice = tabs.findIndex((tab) =>
  //     Boolean(matchPath(tab.routeName, { path: location.pathname }))
  //   );

  //   if (tabChoice < 0) {
  //     // Prevent redirect from overriding the URL change for `/account/billing/make-payment`, `/account/billing/add-payment-method`,
  //     // and `/account/billing/edit`
  //     if (!overrideWhitelist.includes(location.pathname)) {
  //       history.push('/account/billing');
  //     }

  //     // Redirect to the landing page if the path does not exist
  //     return 0;
  //   } else {
  //     return tabChoice;
  //   }
  // };

  let idx = 0;

  const isBillingTabSelected = location.pathname.match(/billing/);
  const canSwitchBetweenParentOrProxyAccount =
    (!isChildAccountAccessRestricted && isParentUser) || isProxyUser;

  const landingHeaderProps: LandingHeaderProps = {
    breadcrumbProps: {
      pathname: '/account',
    },
    buttonDataAttrs: {
      disabled: isReadOnly,
      tooltipText: getRestrictedResourceText({
        isChildUser,
        resourceType: 'Account',
      }),
    },
    title: 'Account',
  };

  if (isBillingTabSelected) {
    landingHeaderProps.docsLabel = 'How Linode Billing Works';
    landingHeaderProps.docsLink =
      'https://techdocs.akamai.com/cloud-computing/docs/understanding-how-billing-works';
    landingHeaderProps.createButtonText = 'Make a Payment';
    if (!isAkamaiAccount) {
      landingHeaderProps.onButtonClick = () =>
        navigate({ to: '/account/billing/make-payment' });
    }
    landingHeaderProps.extraActions = canSwitchBetweenParentOrProxyAccount ? (
      <SwitchAccountButton
        onClick={() => {
          sendSwitchAccountEvent('Account Landing');
          handleAccountSwitch();
        }}
        data-testid="switch-account-button"
      />
    ) : undefined;
  }

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Account Settings" />
      <LandingHeader {...landingHeaderProps} />

      <Tabs index={tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={tabs} />

        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={idx}>
              <Billing />
            </SafeTabPanel>
            <SafeTabPanel index={++idx}>
              <Users />
            </SafeTabPanel>
            {showQuotasTab && (
              <SafeTabPanel index={++idx}>
                <Quotas />
              </SafeTabPanel>
            )}
            <SafeTabPanel index={++idx}>
              <AccountLogins />
            </SafeTabPanel>
            <SafeTabPanel index={++idx}>
              <EntityTransfersLanding />
            </SafeTabPanel>
            <SafeTabPanel index={++idx}>
              <MaintenanceLanding />
            </SafeTabPanel>
            <SafeTabPanel index={++idx}>
              <GlobalSettings />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
      <SwitchAccountDrawer
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        userType={profile?.user_type}
      />
    </React.Fragment>
  );
};
