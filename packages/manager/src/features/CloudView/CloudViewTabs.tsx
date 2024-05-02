import { styled } from '@mui/material/styles';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { LandingHeader } from 'src/components/LandingHeader';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabLinkList } from 'src/components/Tabs/TabLinkList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';

import { DashBoardLanding } from './Dashboard/DashboardLanding';
import { Namespaces } from './Namespaces/Namespaces';
type Props = RouteComponentProps<{}>;

export const CloudViewTabs = React.memo((props: Props) => {
  const tabs = [
    {
      routeName: `${props.match.url}/dashboards`,
      title: 'Dashboards',
    },
    // {
    //   routeName: `${props.match.url}/namespaces`,
    //   title: 'Namespaces',
    // },
  ];

  const matches = (p: string) => {
    return !Boolean(props.location.pathname.indexOf(p));
  };

  const navToURL = (index: number) => {
    props.history.push(tabs[index].routeName);
  };

  return (
    <>
      <LandingHeader
        breadcrumbProps={{ pathname: '/Akamai Cloud Pulse' }}
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
              <DashBoardLanding />
            </SafeTabPanel>
            {/* <SafeTabPanel index={1}>
              <Namespaces />
            </SafeTabPanel> */}
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
