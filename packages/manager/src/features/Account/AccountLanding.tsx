import { useAccount, useProfile } from '@linode/queries';
import {
  Outlet,
  useLocation,
  useMatch,
  useNavigate,
} from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { MaintenanceBannerV2 } from 'src/components/MaintenanceBanner/MaintenanceBannerV2';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { switchAccountSessionContext } from 'src/context/switchAccountSessionContext';
import { useIsParentTokenExpired } from 'src/features/Account/SwitchAccounts/useIsParentTokenExpired';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useFlags } from 'src/hooks/useFlags';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useTabs } from 'src/hooks/useTabs';
import { sendSwitchAccountEvent } from 'src/utilities/analytics/customEventAnalytics';

import { PlatformMaintenanceBanner } from '../../components/PlatformMaintenanceBanner/PlatformMaintenanceBanner';
import { SwitchAccountButton } from './SwitchAccountButton';
import { SwitchAccountDrawer } from './SwitchAccountDrawer';

import type { LandingHeaderProps } from 'src/components/LandingHeader';

export const AccountLanding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const match = useMatch({
    strict: false,
  });
  const { data: account } = useAccount();
  const { data: profile } = useProfile();
  const { limitsEvolution } = useFlags();

  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);
  const sessionContext = React.useContext(switchAccountSessionContext);

  // This is the default route for the account route, so we need to redirect to the billing tab but keep /account as legacy
  if (location.pathname === '/account') {
    navigate({
      to: '/account/billing',
    });
  }

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

  const { tabs, handleTabChange, tabIndex, getTabIndex } = useTabs([
    {
      to: '/account/billing',
      title: 'Billing Info',
    },
    {
      to: '/account/users',
      title: 'Users & Grants',
    },
    {
      to: '/account/quotas',
      title: 'Quotas',
      hide: !showQuotasTab,
    },

    {
      to: '/account/login-history',
      title: 'Login History',
    },
    {
      to: '/account/service-transfers',
      title: 'Service Transfers',
    },
    {
      to: '/account/maintenance',
      title: 'Maintenance',
    },
    {
      to: '/account/settings',
      title: 'Settings',
    },
  ]);

  React.useEffect(() => {
    if (match.routeId === '/account/quotas' && !showQuotasTab) {
      navigate({
        to: '/account/billing',
      });
    }
  }, [match.routeId, showQuotasTab, navigate]);

  const handleAccountSwitch = () => {
    if (isParentTokenExpired) {
      return sessionContext.updateState({
        isOpen: true,
      });
    }

    setIsDrawerOpen(true);
  };

  const isBillingTabSelected = getTabIndex('/account/billing') === tabIndex;
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
        navigate({
          to: '/account/billing',
          search: { action: 'make-payment' },
        });
    }
    landingHeaderProps.extraActions = canSwitchBetweenParentOrProxyAccount ? (
      <SwitchAccountButton
        data-testid="switch-account-button"
        onClick={() => {
          sendSwitchAccountEvent('Account Landing');
          handleAccountSwitch();
        }}
      />
    ) : undefined;
  }

  return (
    <React.Fragment>
      <PlatformMaintenanceBanner pathname={location.pathname} />
      <MaintenanceBannerV2 pathname={location.pathname} />
      <DocumentTitleSegment segment="Account Settings" />
      <LandingHeader {...landingHeaderProps} spacingBottom={4} />
      <Tabs index={tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={tabs} />
        <TabPanels>
          <React.Suspense fallback={<SuspenseLoader />}>
            <Outlet />
          </React.Suspense>
        </TabPanels>
      </Tabs>
      <SwitchAccountDrawer
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        userType={profile?.user_type}
      />
    </React.Fragment>
  );
};
