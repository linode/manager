import * as React from 'react';
import { matchPath, useHistory, useLocation } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import {
  LandingHeader,
  LandingHeaderProps,
} from 'src/components/LandingHeader';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabLinkList } from 'src/components/Tabs/TabLinkList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { switchAccountSessionContext } from 'src/context/switchAccountSessionContext';
import { useIsParentTokenExpired } from 'src/features/Account/SwitchAccounts/useIsParentTokenExpired';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useFlags } from 'src/hooks/useFlags';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useAccount } from 'src/queries/account/account';
import { useProfile } from 'src/queries/profile';
import { sendSwitchAccountEvent } from 'src/utilities/analytics';

import AccountLogins from './AccountLogins';
import { SwitchAccountButton } from './SwitchAccountButton';
import { SwitchAccountDrawer } from './SwitchAccountDrawer';

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
const GlobalSettings = React.lazy(() => import('./GlobalSettings'));
const MaintenanceLanding = React.lazy(
  () => import('./Maintenance/MaintenanceLanding')
);

const AccountLanding = () => {
  const history = useHistory();
  const location = useLocation();
  const { data: account } = useAccount();
  const { data: profile } = useProfile();

  const flags = useFlags();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);
  const sessionContext = React.useContext(switchAccountSessionContext);

  const isAkamaiAccount = account?.billing_source === 'akamai';
  const isProxyUser = profile?.user_type === 'proxy';
  const isChildUser = profile?.user_type === 'child';
  const isParentUser = profile?.user_type === 'parent';

  const isReadOnly =
    useRestrictedGlobalGrantCheck({
      globalGrantType: 'account_access',
      permittedGrantLevel: 'read_write',
    }) || isChildUser;

  const isChildAccountAccessRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'child_account_access',
  });

  const { isParentTokenExpired } = useIsParentTokenExpired({ isProxyUser });

  const tabs = [
    {
      routeName: '/account/billing',
      title: 'Billing Info',
    },
    {
      routeName: '/account/users',
      title: 'Users & Grants',
    },
    {
      routeName: '/account/login-history',
      title: 'Login History',
    },
    {
      routeName: '/account/service-transfers',
      title: 'Service Transfers',
    },
    {
      routeName: '/account/maintenance',
      title: 'Maintenance',
    },
    {
      routeName: '/account/settings',
      title: 'Settings',
    },
  ];

  const overrideWhitelist = [
    '/account/billing/make-payment',
    '/account/billing/add-payment-method',
    '/account/billing/edit',
  ];

  const handleAccountSwitch = () => {
    if (isParentTokenExpired) {
      return sessionContext.updateState({
        isOpen: true,
      });
    }

    setIsDrawerOpen(true);
  };

  const getDefaultTabIndex = () => {
    const tabChoice = tabs.findIndex((tab) =>
      Boolean(matchPath(tab.routeName, { path: location.pathname }))
    );

    if (tabChoice < 0) {
      // Prevent redirect from overriding the URL change for `/account/billing/make-payment`, `/account/billing/add-payment-method`,
      // and `/account/billing/edit`
      if (!overrideWhitelist.includes(location.pathname)) {
        history.push('/account/billing');
      }

      // Redirect to the landing page if the path does not exist
      return 0;
    } else {
      return tabChoice;
    }
  };

  const handleTabChange = (index: number) => {
    history.push(tabs[index].routeName);
  };

  let idx = 0;

  const isBillingTabSelected = location.pathname.match(/billing/);
  const canSwitchBetweenParentOrProxyAccount =
    flags.parentChildAccountAccess &&
    ((!isChildAccountAccessRestricted && isParentUser) || isProxyUser);

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
      'https://www.linode.com/docs/guides/how-linode-billing-works/';
    landingHeaderProps.createButtonText = 'Make a Payment';
    if (!isAkamaiAccount) {
      landingHeaderProps.onButtonClick = () =>
        history.replace('/account/billing/make-payment');
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

      <Tabs index={getDefaultTabIndex()} onChange={handleTabChange}>
        <TabLinkList tabs={tabs} />

        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={idx}>
              <Billing />
            </SafeTabPanel>
            <SafeTabPanel index={++idx}>
              <Users />
            </SafeTabPanel>
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

export default AccountLanding;
