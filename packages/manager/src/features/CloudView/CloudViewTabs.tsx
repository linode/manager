import { styled } from '@mui/material/styles';
import * as React from 'react';
import { RouteComponentProps, matchPath } from 'react-router-dom';

import { LandingHeader } from 'src/components/LandingHeader';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabLinkList } from 'src/components/Tabs/TabLinkList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';

import { Namespaces } from './Namespaces/Namespaces';
type Props = RouteComponentProps<{}>;

export const CloudViewTabs = React.memo((props: Props) => {
  const tabs = [
    {
      routeName: `${props.match.url}/namespaces`,
      title: 'Namespaces',
    },
  ];

  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: props.location.pathname }));
  };

  const navToURL = (index: number) => {
    props.history.push(tabs[index].routeName);
  };

  return (
    <>
      <LandingHeader
        breadcrumbProps={{ pathname: '/Cloud View' }}
        docsLabel="Getting Started"
        docsLink="https://www.linode.com/docs/"
      />
      <StyledTabs
        index={Math.max(
          tabs.findIndex((tab) => matches(tab.routeName)),
          0
        )}
        onChange={navToURL}
      >
        <TabLinkList tabs={tabs} />

        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={0}>
              <Namespaces />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </StyledTabs>
    </>
  );
});

const StyledTabs = styled(Tabs, {
  label: 'StyledTabs',
})(() => ({
  marginTop: 0,
}));
