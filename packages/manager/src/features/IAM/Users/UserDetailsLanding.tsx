import { Breadcrumb, BreadcrumbItem } from '@akamai/cds-components/react';
import { NewFeatureChip } from '@linode/ui';
import {
  Outlet,
  useLoaderData,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import React from 'react';

import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import {
  useIsIAMDelegationEnabled,
  useIsIAMEnabled,
} from 'src/features/IAM/hooks/useIsIAMEnabled';
import { useFlags } from 'src/hooks/useFlags';
import { useTabs } from 'src/hooks/useTabs';

import { useDelegationRole } from '../hooks/useDelegationRole';
import {
  IAM_LABEL,
  USER_DETAILS_LINK,
  USER_ENTITIES_LINK,
  USER_ROLES_LINK,
} from '../Shared/constants';
import { DelegateUserChip } from '../Shared/DelegateUserChip';
import { DocsLink } from '../Shared/DocsLink/DocsLink';
import { LandingHeader } from '../Shared/LandingHeader/LandingHeader';

export const UserDetailsLanding = () => {
  const flags = useFlags();
  const navigate = useNavigate();
  const { isIAMEnabled } = useIsIAMEnabled();
  const showNewBadge = flags.iamNewBadge && isIAMEnabled;
  const { username } = useParams({ from: '/iam/users/$username' });
  const { isIAMDelegationEnabled } = useIsIAMDelegationEnabled();
  const { isParentUserType } = useDelegationRole();
  const { isDelegateUserForChildAccount } = useLoaderData({
    from: '/iam/users/$username',
  });

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
      hide: !isIAMDelegationEnabled || !isParentUserType,
    },
  ]);

  const docsLinks = [USER_DETAILS_LINK, USER_ROLES_LINK, USER_ENTITIES_LINK];
  const docsLink = docsLinks[tabIndex] ?? USER_DETAILS_LINK;

  return (
    <>
      <LandingHeader spacingBottom={4}>
        <Breadcrumb
          style={{
            flexWrap: 'nowrap',
          }}
        >
          <BreadcrumbItem
            onCdsBreadcrumbClick={() => navigate({ to: '/iam/users' })}
          >
            {IAM_LABEL}
            {showNewBadge ? <NewFeatureChip /> : null}
          </BreadcrumbItem>
          <BreadcrumbItem
            onCdsBreadcrumbClick={() => navigate({ to: '/iam/users' })}
          >
            Users
          </BreadcrumbItem>
          <BreadcrumbItem>
            {username}
            {isDelegateUserForChildAccount ? (
              <DelegateUserChip hideBelowSm={true} />
            ) : null}
          </BreadcrumbItem>
        </Breadcrumb>
        <DocsLink href={docsLink} />
      </LandingHeader>
      <Tabs index={tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={tabs} />
        <TabPanels>
          <Outlet />
        </TabPanels>
      </Tabs>
    </>
  );
};
