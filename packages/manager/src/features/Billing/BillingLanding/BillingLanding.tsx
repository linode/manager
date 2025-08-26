import { useAccount, useProfile } from '@linode/queries';
import { Navigate, useLocation, useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { MaintenanceBannerV2 } from 'src/components/MaintenanceBanner/MaintenanceBannerV2';
import { switchAccountSessionContext } from 'src/context/switchAccountSessionContext';
import { useIsParentTokenExpired } from 'src/features/Account/SwitchAccounts/useIsParentTokenExpired';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useFlags } from 'src/hooks/useFlags';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { sendSwitchAccountEvent } from 'src/utilities/analytics/customEventAnalytics';

import { PlatformMaintenanceBanner } from '../../../components/PlatformMaintenanceBanner/PlatformMaintenanceBanner';
import { SwitchAccountButton } from '../../Account/SwitchAccountButton';
import { SwitchAccountDrawer } from '../../Account/SwitchAccountDrawer';
import { usePermissions } from '../../IAM/hooks/usePermissions';
import { BillingDetail } from '../BillingDetail';

import type { LandingHeaderProps } from 'src/components/LandingHeader';

export const BillingLanding = () => {
  const flags = useFlags();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: account } = useAccount();
  const { data: profile } = useProfile();

  const { data: permissions } = usePermissions('account', [
    'make_billing_payment',
  ]);

  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);
  const sessionContext = React.useContext(switchAccountSessionContext);

  const isIAMRbacPrimaryNavChangesEnabled = flags?.iamRbacPrimaryNavChanges;
  const isAkamaiAccount = account?.billing_source === 'akamai';
  const isProxyUser = profile?.user_type === 'proxy';
  const isChildUser = profile?.user_type === 'child';
  const isParentUser = profile?.user_type === 'parent';

  const isChildAccountAccessRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'child_account_access',
  });

  const { isParentTokenExpired } = useIsParentTokenExpired({ isProxyUser });

  const isReadOnly = !permissions.make_billing_payment || isChildUser;

  if (
    !isIAMRbacPrimaryNavChangesEnabled &&
    location.pathname !== '/account/billing'
  ) {
    return <Navigate replace to="/account/billing" />;
  }

  const canSwitchBetweenParentOrProxyAccount =
    (!isChildAccountAccessRestricted && isParentUser) || isProxyUser;

  const handleAccountSwitch = () => {
    if (isParentTokenExpired) {
      return sessionContext.updateState({
        isOpen: true,
      });
    }

    setIsDrawerOpen(true);
  };

  const landingHeaderProps: LandingHeaderProps = {
    breadcrumbProps: {
      pathname: '/billing',
    },
    buttonDataAttrs: {
      disabled: isReadOnly,
      tooltipText: getRestrictedResourceText({
        isChildUser,
        resourceType: 'Account',
      }),
    },
    createButtonText: 'Make a Payment',
    docsLabel: 'How Linode Billing Works',
    docsLink:
      'https://techdocs.akamai.com/cloud-computing/docs/understanding-how-billing-works',
    extraActions: canSwitchBetweenParentOrProxyAccount ? (
      <SwitchAccountButton
        data-testid="switch-account-button"
        onClick={() => {
          sendSwitchAccountEvent('Account Landing');
          handleAccountSwitch();
        }}
      />
    ) : undefined,
    onButtonClick: () =>
      !isAkamaiAccount
        ? navigate({
            to: '/billing',
            search: { action: 'make-payment' },
          })
        : {},
    title: 'Billing',
  };

  return (
    <>
      <PlatformMaintenanceBanner />
      <MaintenanceBannerV2 />
      <DocumentTitleSegment segment="Billing" />
      <LandingHeader {...landingHeaderProps} spacingBottom={4} />
      <BillingDetail />
      <SwitchAccountDrawer
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        userType={profile?.user_type}
      />
    </>
  );
};
