import { NewFeatureChip } from '@linode/ui';
import { TabPanels } from '@reach/tabs';
import { Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useFlags } from 'src/hooks/useFlags';
import { useTabs } from 'src/hooks/useTabs';

import { useIsIAMEnabled } from '../../hooks/useIsIAMEnabled';
import { IAM_LABEL } from '../../Shared/constants';
import { SuspenseLoader } from '../../Shared/SuspenseLoader/SuspenseLoader';

export const DefaultsLanding = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const flags = useFlags();
  const { isIAMEnabled } = useIsIAMEnabled();
  const showLimitedAvailabilityBadges =
    flags.iamLimitedAvailabilityBadges && isIAMEnabled;

  const { tabs, tabIndex, handleTabChange } = useTabs([
    {
      to: `/iam/roles/defaults/roles`,
      title: 'Default Roles',
    },
    {
      to: `/iam/roles/defaults/entity-access`,
      title: 'Default Entity Access',
    },
  ]);

  if (location.pathname === '/iam/roles/defaults') {
    navigate({ to: '/iam/roles/defaults/roles', replace: true });
  }

  return (
    <>
      <LandingHeader
        breadcrumbProps={{
          pathname: '/iam/roles/defaults',
          crumbOverrides: [
            {
              label: (
                <>
                  {IAM_LABEL}
                  {showLimitedAvailabilityBadges ? (
                    <NewFeatureChip sx={{ position: 'relative', top: -1 }} />
                  ) : null}
                </>
              ),
              linkTo: '/iam',
              position: 1,
            },
          ],
        }}
        spacingBottom={4}
        title="Default Roles for Delegate Users"
      />
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
