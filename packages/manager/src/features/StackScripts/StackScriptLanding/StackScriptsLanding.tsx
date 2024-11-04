import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { NavTabs } from 'src/components/NavTabs/NavTabs';

import { StackScriptLandingTable } from './StackScriptLandingTable';

import type { NavTab } from 'src/components/NavTabs/NavTabs';

export const StackScriptsLanding = () => {
  const history = useHistory();

  const tabs: NavTab[] = [
    {
      render: <StackScriptLandingTable type="account" />,
      routeName: `/stackscripts/account`,
      title: 'Account StackScripts',
    },
    {
      render: <StackScriptLandingTable type="community" />,
      routeName: `/stackscripts/community`,
      title: 'Community StackScripts',
    },
  ];

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="StackScripts" />
      <LandingHeader
        onButtonClick={() => {
          history.push('/stackscripts/create');
        }}
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/stackscripts"
        entity="StackScript"
        removeCrumbX={1}
        title="StackScripts"
      />
      <NavTabs tabs={tabs} />
    </React.Fragment>
  );
};

export default StackScriptsLanding;

export const stackScriptsLandingLazyRoute = createLazyRoute('/stackscripts')({
  component: StackScriptsLanding,
});
