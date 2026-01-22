import { useAccount, useProfile } from '@linode/queries';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { MaintenanceBannerV2 } from 'src/components/MaintenanceBanner/MaintenanceBannerV2';
import { switchAccountSessionContext } from 'src/context/switchAccountSessionContext';
import { ADMINISTRATOR, PARENT_USER } from 'src/features/Account/constants';
import { useIsParentTokenExpired } from 'src/features/Account/SwitchAccounts/useIsParentTokenExpired';
import { useIsIAMDelegationEnabled } from 'src/features/IAM/hooks/useIsIAMEnabled';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { sendSwitchAccountEvent } from 'src/utilities/analytics/customEventAnalytics';

import { PlatformMaintenanceBanner } from '../../../components/PlatformMaintenanceBanner/PlatformMaintenanceBanner';
import { SwitchAccountButton } from '../../Account/SwitchAccountButton';
import { SwitchAccountDrawer } from '../../Account/SwitchAccountDrawer';
import { usePermissions } from '../../IAM/hooks/usePermissions';
import { BillingDetail } from '../BillingDetail';

import type { LandingHeaderProps } from 'src/components/LandingHeader';

export const BillingLanding = () => {
  const navigate = useNavigate();

  const { data: account } = useAccount();
  const { data: profile } = useProfile();

  const { data: permissions } = usePermissions('account', [
    'make_billing_payment',
  ]);

  const [isDrawerOpen, setIsDrawerOpen] = React.useState<boolean>(false);
  const sessionContext = React.useContext(switchAccountSessionContext);

  const isAkamaiAccount = account?.billing_source === 'akamai';
  const isProxyUser = profile?.user_type === 'proxy';
  const isChildUser = profile?.user_type === 'child';
  const isParentUser = profile?.user_type === 'parent';

  const contactPerson = isChildUser ? PARENT_USER : ADMINISTRATOR;
  const isChildAccountAccessRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'child_account_access',
  });

  const { isIAMDelegationEnabled } = useIsIAMDelegationEnabled();

  const { isParentTokenExpired } = useIsParentTokenExpired({ isProxyUser });

  const isReadOnly = !permissions.make_billing_payment || isChildUser;

  const canSwitchBetweenParentOrProxyAccount = isIAMDelegationEnabled
    ? isParentUser
    : (!isChildAccountAccessRestricted && isParentUser) || isProxyUser;

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
      disabled: isReadOnly || isAkamaiAccount,
      tooltipText: isAkamaiAccount
        ? 'This feature is not available for Akamai accounts.'
        : `You don't have permissions to make a payment. Please contact your ${contactPerson} to request the necessary permissions.`,
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
      navigate({
        to: '/billing',
        search: { action: 'make-payment' },
      }),
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
