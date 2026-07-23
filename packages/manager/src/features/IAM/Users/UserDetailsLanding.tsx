import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  Tab,
  Tabs,
} from '@akamai/cds-components/react';
import {
  Outlet,
  useLoaderData,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import React from 'react';

import { useFlags } from 'src/hooks/useFlags';

import { useDelegationRole } from '../hooks/useDelegationRole';
import { useIsIAMEnabled } from '../hooks/useIsIAMEnabled';
import { useTabs } from '../hooks/useTabs';
import { IAM_USERS_PENDO_IDS } from '../LoginSettings/constants';
import {
  IAM_LABEL,
  USER_DETAILS_LINK,
  USER_ENTITIES_LINK,
  USER_ROLES_LINK,
} from '../Shared/constants';
import { DelegateUserChip } from '../Shared/DelegateUserChip';
import { DocsLink } from '../Shared/DocsLink/DocsLink';
import { LandingHeader } from '../Shared/LandingHeader/LandingHeader';
import { SuspenseLoader } from '../Shared/SuspenseLoader/SuspenseLoader';
import { TruncatedUsername } from '../Shared/TruncatedUsername/TruncatedUsername';

import type { TabsElement } from '@akamai/cds-components/react';

const USERNAME_TRUNCATE_MAX_WINDOW_WIDTH = 1280;

export const UserDetailsLanding = () => {
  const flags = useFlags();
  const navigate = useNavigate();
  const { isIAMEnabled } = useIsIAMEnabled();
  const showNewBadge = flags.iamNewBadge && isIAMEnabled;
  const { username } = useParams({ from: '/iam/users/$username' });
  const { isParentUserType } = useDelegationRole();
  const tabsRef = React.useRef<TabsElement>(null);
  const { isDelegateUserForChildAccount } = useLoaderData({
    from: '/iam/users/$username',
  });

  const { tabs, tabIndex, handleTabChange } = useTabs(
    [
      {
        to: `/iam/users/$username/details`,
        title: 'User Details',
        hide: isDelegateUserForChildAccount,
        pendoId: IAM_USERS_PENDO_IDS.userDetailsTab,
      },
      {
        to: `/iam/users/$username/roles`,
        title: 'Assigned Roles',
        pendoId: IAM_USERS_PENDO_IDS.assignedRolesTab,
      },
      {
        to: `/iam/users/$username/entities`,
        title: 'Entity Access',
        pendoId: IAM_USERS_PENDO_IDS.entityAccessTab,
      },
      {
        to: `/iam/users/$username/delegations`,
        title: 'Account Delegations',
        hide: !isParentUserType,
        pendoId: IAM_USERS_PENDO_IDS.accountDelegationsTab,
      },
    ],
    tabsRef
  );

  const docsLinks = [USER_DETAILS_LINK, USER_ROLES_LINK, USER_ENTITIES_LINK];
  const docsLink = docsLinks[tabIndex] ?? USER_DETAILS_LINK;

  return (
    <>
      <LandingHeader>
        <Breadcrumb
          style={{
            flexWrap: 'nowrap',
          }}
        >
          <BreadcrumbItem
            onCdsBreadcrumbClick={() => navigate({ to: '/iam/users' })}
          >
            {IAM_LABEL}
            {showNewBadge ? <Badge type="new" /> : null}
          </BreadcrumbItem>
          <BreadcrumbItem
            onCdsBreadcrumbClick={() => navigate({ to: '/iam/users' })}
          >
            Users
          </BreadcrumbItem>
          <BreadcrumbItem>
            <TruncatedUsername
              maxWindowWidth={USERNAME_TRUNCATE_MAX_WINDOW_WIDTH}
              username={username}
            />
            {isDelegateUserForChildAccount ? (
              <DelegateUserChip hideBelowSm={true} />
            ) : null}
          </BreadcrumbItem>
        </Breadcrumb>
        <DocsLink href={docsLink} pendoId={IAM_USERS_PENDO_IDS.docs} />
      </LandingHeader>
      <Tabs
        border={false}
        onTabsChange={(e) => handleTabChange(e.detail.index)}
        ref={tabsRef}
        tabMaxWidth={250}
      >
        {tabs.map((tab, i) => (
          <Tab
            active={i === tabIndex || undefined}
            data-pendo-id={tab.pendoId}
            key={String(tab.to)}
            label={tab.title}
          >
            <span slot="tab-header">{tab.title}</span>
          </Tab>
        ))}
      </Tabs>
      <React.Suspense fallback={<SuspenseLoader />}>
        <Outlet />
      </React.Suspense>
    </>
  );
};
