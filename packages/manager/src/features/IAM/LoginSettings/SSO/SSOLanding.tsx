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

import { useIsIAMEnabled } from 'src/features/IAM/hooks/useIsIAMEnabled';
import { useFlags } from 'src/hooks/useFlags';

import { useTabs } from '../../hooks/useTabs';
import { IAM_LABEL, SSO_DOCS_LINK } from '../../Shared/constants';
import { DocsLink } from '../../Shared/DocsLink/DocsLink';
import { LandingHeader } from '../../Shared/LandingHeader/LandingHeader';
import { SuspenseLoader } from '../../Shared/SuspenseLoader/SuspenseLoader';
import { IAM_SSO_ENFORCE_PENDO_IDS, IAM_SSO_IDP_PENDO_IDS } from '../constants';

import type { TabsElement } from '@akamai/cds-components/react';

export const SSOLanding = () => {
  const flags = useFlags();
  const { isIAMEnabled } = useIsIAMEnabled();

  const location = useLocation();
  const navigate = useNavigate();
  const showNewBadge = flags.iamNewBadge && isIAMEnabled;
  const tabsRef = React.useRef<TabsElement>(null);

  const { tabs, tabIndex, handleTabChange } = useTabs(
    [
      {
        to: '/iam/settings/sso/idp-configurations',
        title: 'IDP Configuration',
        pendoId: IAM_SSO_IDP_PENDO_IDS.idpTab,
      },
      {
        to: '/iam/settings/sso/enforcement-settings',
        title: 'SSO Enforcement',
        pendoId: IAM_SSO_ENFORCE_PENDO_IDS.enforceTab,
      },
    ],
    tabsRef
  );

  if (location.pathname === '/iam/settings/sso') {
    navigate({
      to: '/iam/settings/sso/idp-configurations',
      replace: true,
    });
  }

  return (
    <>
      <LandingHeader spacingBottom={Spacing.S4}>
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
            onCdsBreadcrumbClick={() => navigate({ to: '/iam/settings' })}
          >
            Settings
          </BreadcrumbItem>
          <BreadcrumbItem>Manage SSO Enforcement</BreadcrumbItem>
        </Breadcrumb>
        <DocsLink href={SSO_DOCS_LINK} />
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
};
