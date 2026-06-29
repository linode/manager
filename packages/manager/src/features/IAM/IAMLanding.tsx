import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  Tab,
  Tabs,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { useFlags } from 'src/hooks/useFlags';

import { useDelegationRole } from './hooks/useDelegationRole';
import { useIsIAMEnabled } from './hooks/useIsIAMEnabled';
import { useIsIAMFederationEnabled } from './hooks/useIsIAMFederationEnabled';
import { useTabs } from './hooks/useTabs';
import { IAM_LANDING_PENDO_IDS } from './LoginSettings/constants';
import { IAM_DOCS_LINK, ROLES_LEARN_MORE_LINK } from './Shared/constants';
import { DocsLink } from './Shared/DocsLink/DocsLink';
import { LandingHeader } from './Shared/LandingHeader/LandingHeader';
import { SuspenseLoader } from './Shared/SuspenseLoader/SuspenseLoader';

import type { TabsElement } from '@akamai/cds-components/react';

export const IdentityAccessLanding = React.memo(() => {
  const flags = useFlags();
  const { isIAMEnabled } = useIsIAMEnabled();
  const showNewBadge = flags.iamNewBadge && isIAMEnabled;
  const location = useLocation();
  const navigate = useNavigate();
  const { isParentUserType } = useDelegationRole();
  const { isIAMFederationEnabled } = useIsIAMFederationEnabled();
  const tabsRef = React.useRef<TabsElement>(null);

  const { tabs, tabIndex, handleTabChange } = useTabs(
    [
      {
        to: `/iam/users`,
        title: 'Users',
        pendoId: IAM_LANDING_PENDO_IDS.usersTab,
      },
      {
        to: `/iam/roles`,
        title: 'Roles',
        pendoId: IAM_LANDING_PENDO_IDS.rolesTab,
      },
      {
        hide: !isParentUserType,
        to: `/iam/delegations`,
        title: 'Account Delegations',
        pendoId: IAM_LANDING_PENDO_IDS.accountDelegationsTab,
      },
      {
        hide: !isIAMFederationEnabled,
        to: `/iam/settings`,
        title: 'Settings',
        pendoId: IAM_LANDING_PENDO_IDS.settingsTab,
      },
    ],
    tabsRef
  );

  if (location.pathname === '/iam') {
    navigate({ to: '/iam/users', replace: true });
  }

  return (
    <>
      <LandingHeader spacingBottom={Spacing.S4} spacingTop={0}>
        <Breadcrumb>
          <BreadcrumbItem>
            Identity and Access
            {showNewBadge ? <Badge type="new">New</Badge> : null}
          </BreadcrumbItem>
        </Breadcrumb>
        <DocsLink
          href={tabIndex === 0 ? IAM_DOCS_LINK : ROLES_LEARN_MORE_LINK}
          pendoId={IAM_LANDING_PENDO_IDS.docsLink}
        />
      </LandingHeader>
      <div style={{ overflowX: 'auto' }}>
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
      </div>
      <React.Suspense fallback={<SuspenseLoader />}>
        <Outlet />
      </React.Suspense>
    </>
  );
});
