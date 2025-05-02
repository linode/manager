import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useTabs } from 'src/hooks/useTabs';

import { StackScriptLandingTable } from './StackScriptLandingTable';

export const StackScriptsLanding = () => {
  const navigate = useNavigate();

  const isStackScriptCreationRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_stackscripts',
  });

  const { handleTabChange, tabIndex, tabs } = useTabs([
    {
      title: 'Account StackScripts',
      to: `/stackscripts/account`,
    },
    {
      title: 'Community StackScripts',
      to: `/stackscripts/community`,
    },
  ]);

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="StackScripts" />
      <LandingHeader
        buttonDataAttrs={{
          tooltipText: getRestrictedResourceText({
            action: 'create',
            isSingular: false,
            resourceType: 'StackScripts',
          }),
        }}
        className="landing-header-mb-4"
        disabledCreateButton={isStackScriptCreationRestricted}
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/stackscripts"
        entity="StackScript"
        onButtonClick={() => {
          navigate({ to: '/stackscripts/create' });
        }}
        removeCrumbX={1}
        title="StackScripts"
      />
      <Tabs index={tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={tabs} />
        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={0}>
              <StackScriptLandingTable type="account" />
            </SafeTabPanel>
            <SafeTabPanel index={1}>
              <StackScriptLandingTable type="community" />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </React.Fragment>
  );
};
