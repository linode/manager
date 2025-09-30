import { useAccount, useProfile } from '@linode/queries';
import { NotFound } from '@linode/ui';
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
import { useIsParentTokenExpired } from 'src/features/Account/SwitchAccounts/useIsParentTokenExpired';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useFlags } from 'src/hooks/useFlags';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useTabs } from 'src/hooks/useTabs';
import { store } from 'src/new-store';
import { sendSwitchAccountEvent } from 'src/utilities/analytics/customEventAnalytics';

import { PlatformMaintenanceBanner } from '../../components/PlatformMaintenanceBanner/PlatformMaintenanceBanner';
import { usePermissions } from '../IAM/hooks/usePermissions';
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
  const { iamRbacPrimaryNavChanges, limitsEvolution } = useFlags();

  const { data: permissions } = usePermissions('account', [
    'make_billing_payment',
  ]);

  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);

  const isAkamaiAccount = account?.billing_source === 'akamai';
  const isProxyUser = profile?.user_type === 'proxy';
  const isChildUser = profile?.user_type === 'child';
  const isParentUser = profile?.user_type === 'parent';

  const showQuotasTab = limitsEvolution?.enabled ?? false;

  const isReadOnly = !permissions.make_billing_payment || isChildUser;

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
        to: iamRbacPrimaryNavChanges ? '/quotas' : '/account/billing',
      });
    }
  }, [match.routeId, showQuotasTab, navigate, iamRbacPrimaryNavChanges]);

  // This is the default route for the account route, so we need to redirect to the billing tab but keep /account as legacy
  if (location.pathname === '/account') {
    if (iamRbacPrimaryNavChanges) {
      return <NotFound />;
    }
    navigate({
      to: '/account/billing',
    });
  }

  const handleAccountSwitch = () => {
    if (isParentTokenExpired) {
      return store.setState((state) => ({
        ...state,
        isParentSessionExpiredModalOpen: true,
      }));
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
          to: iamRbacPrimaryNavChanges ? '/billing' : '/account/billing',
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
      <PlatformMaintenanceBanner />
      <MaintenanceBannerV2 />
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
