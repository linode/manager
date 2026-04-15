import { NewFeatureChip, useTheme } from '@linode/ui';
import { Outlet, useLoaderData, useParams } from '@tanstack/react-router';
import React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
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

export const UserDetailsLanding = () => {
  const flags = useFlags();
  const theme = useTheme();
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
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: (
                <>
                  {IAM_LABEL}
                  {showNewBadge ? (
                    <NewFeatureChip
                      component="span"
                      sx={{ position: 'relative', top: -1 }}
                    />
                  ) : null}
                </>
              ),
              position: 1,
            },
          ],
          labelOptions: {
            noCap: true,
            suffixComponent: isDelegateUserForChildAccount ? (
              <DelegateUserChip hideBelowSm={true} />
            ) : null,
          },
          pathname: location.pathname,
          sx: {
            flexWrap: 'nowrap',
            [theme.breakpoints.down(380)]: {
              flexWrap: 'wrap',
            },
            '& > div:nth-of-type(3) h1': {
              display: '-webkit-box',
              '-webkit-line-clamp': '1',
              '-webkit-box-orient': 'vertical',
              overflow: 'hidden',
            },
          },
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
