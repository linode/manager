import { useAccountUser } from '@linode/queries';
import { Chip, styled } from '@linode/ui';
import { Outlet, useParams } from '@tanstack/react-router';
import React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useIsIAMDelegationEnabled } from 'src/features/IAM/hooks/useIsIAMEnabled';
import { useTabs } from 'src/hooks/useTabs';

import { useDelegationRole } from '../hooks/useDelegationRole';
import { usePermissions } from '../hooks/usePermissions';
import {
  IAM_LABEL,
  USER_DETAILS_LINK,
  USER_ENTITIES_LINK,
  USER_ROLES_LINK,
} from '../Shared/constants';

export const UserDetailsLanding = () => {
  const { username } = useParams({ from: '/iam/users/$username' });
  const { isIAMDelegationEnabled } = useIsIAMDelegationEnabled();
  const { isParentAccount, isChildAccount } = useDelegationRole();

  const { data: permissions } = usePermissions('account', ['is_account_admin']);

  const { data: user } = useAccountUser(
    username ?? '',
    permissions?.is_account_admin && isIAMDelegationEnabled && isChildAccount
  );
  const isDelegateUser = user?.user_type === 'delegate';

  // Determine if the current account is a child account with isIAMDelegationEnabled enabled
  // If so, we need to hide 'View User Details' and 'Account Delegations' tabs for delegate users
  const isDelegateUserForChildAccount =
    isIAMDelegationEnabled && isChildAccount && isDelegateUser;

  const { tabs, tabIndex, handleTabChange } = useTabs([
    {
      to: `/iam/users/$username/details`,
      title: 'User Details',
      hide: isDelegateUserForChildAccount,
    },
    {
      to: `/iam/users/$username/roles`,
      title: 'Assigned Roles',
    },
    {
      to: `/iam/users/$username/entities`,
      title: 'Entity Access',
    },
    {
      to: `/iam/users/$username/delegations`,
      title: 'Account Delegations',
      hide: !isIAMDelegationEnabled || !isParentAccount,
    },
  ]);

  const docsLinks = [USER_DETAILS_LINK, USER_ROLES_LINK, USER_ENTITIES_LINK];
  const docsLink = docsLinks[tabIndex] ?? USER_DETAILS_LINK;

  return (
    <>
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: IAM_LABEL,
              position: 1,
            },
          ],
          labelOptions: {
            noCap: true,
            suffixComponent: isDelegateUserForChildAccount ? (
              <StyledChip label="delegate user" />
            ) : null,
          },
          pathname: location.pathname,
        }}
        docsLink={docsLink}
        removeCrumbX={4}
        spacingBottom={4}
        title={username}
      />
      <Tabs index={tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={tabs} />
        <TabPanels>
          <Outlet />
        </TabPanels>
      </Tabs>
    </>
  );
};

const StyledChip = styled(Chip, {
  label: 'StyledChip',
})(({ theme }) => ({
  textTransform: theme.tokens.font.Textcase.Uppercase,
  marginLeft: theme.spacingFunction(4),
  color: theme.tokens.component.Badge.Informative.Subtle.Text,
  backgroundColor: theme.tokens.component.Badge.Informative.Subtle.Background,
  font: theme.font.extrabold,
  fontSize: theme.tokens.font.FontSize.Xxxs,
}));
