import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  Tab,
  Tabs,
} from '@akamai/cds-components/react';
import { Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { useFlags } from 'src/hooks/useFlags';

import { useIsIAMEnabled } from '../../hooks/useIsIAMEnabled';
import { useTabs } from '../../hooks/useTabs';
import { IAM_LABEL } from '../../Shared/constants';
import { LandingHeader } from '../../Shared/LandingHeader/LandingHeader';
import { SuspenseLoader } from '../../Shared/SuspenseLoader/SuspenseLoader';

import type { TabsElement } from '@akamai/cds-components/react';

export const DefaultsLanding = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const flags = useFlags();
  const { isIAMEnabled } = useIsIAMEnabled();
  const tabsRef = React.useRef<TabsElement>(null);
  const showNewBadge = flags.iamNewBadge && isIAMEnabled;

  const { tabs, tabIndex, handleTabChange } = useTabs(
    [
      {
        to: `/iam/roles/defaults/roles`,
        title: 'Default Roles',
      },
      {
        to: `/iam/roles/defaults/entity-access`,
        title: 'Default Entity Access',
      },
    ],
    tabsRef
  );

  if (location.pathname === '/iam/roles/defaults') {
    navigate({ to: '/iam/roles/defaults/roles', replace: true });
  }

  return (
    <>
      <LandingHeader>
        <Breadcrumb>
          <BreadcrumbItem onCdsBreadcrumbClick={() => navigate({ to: '/iam' })}>
            {IAM_LABEL}
            {showNewBadge ? <Badge type="new" /> : null}
          </BreadcrumbItem>
          <BreadcrumbItem
            onCdsBreadcrumbClick={() => navigate({ to: '/iam/roles' })}
          >
            Roles
          </BreadcrumbItem>
          <BreadcrumbItem>Default Roles for Delegate Users</BreadcrumbItem>
        </Breadcrumb>
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
};
