import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
} from '@akamai/cds-components/react';
import { Spacing } from '@akamai/cds-tokens';
import { Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useIsIAMEnabled } from 'src/features/IAM/hooks/useIsIAMEnabled';
import { useFlags } from 'src/hooks/useFlags';
import { useTabs } from 'src/hooks/useTabs';

import { IAM_LABEL, SSO_DOCS_LINK } from '../../Shared/constants';
import { DocsLink } from '../../Shared/DocsLink/DocsLink';
import { LandingHeader } from '../../Shared/LandingHeader/LandingHeader';
import { SuspenseLoader } from '../../Shared/SuspenseLoader/SuspenseLoader';

export const SSOLanding = () => {
  const flags = useFlags();
  const { isIAMEnabled } = useIsIAMEnabled();

  const location = useLocation();
  const navigate = useNavigate();
  const showNewBadge = flags.iamNewBadge && isIAMEnabled;

  const { tabs, tabIndex, handleTabChange } = useTabs([
    {
      to: '/iam/login-settings/sso/idp-configurations',
      title: 'IDP Configuration',
    },
    {
      to: '/iam/login-settings/sso/enforcement-settings',
      title: 'SSO Enforcement',
    },
  ]);

  if (location.pathname === '/iam/login-settings/sso') {
    navigate({
      to: '/iam/login-settings/sso/idp-configurations',
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
            onCdsBreadcrumbClick={() => navigate({ to: '/iam/login-settings' })}
          >
            Settings
          </BreadcrumbItem>
          <BreadcrumbItem>Manage SSO Enforcement</BreadcrumbItem>
        </Breadcrumb>
        <DocsLink href={SSO_DOCS_LINK} />
      </LandingHeader>
      <Tabs index={tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={tabs} />
        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <Outlet />
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </>
  );
};
