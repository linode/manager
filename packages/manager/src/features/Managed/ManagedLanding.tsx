import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { useTabs } from 'src/hooks/useTabs';

import ManagedDashboardCard from './ManagedDashboardCard';
import SupportWidget from './SupportWidget';

const Contacts = React.lazy(() => import('./Contacts/Contacts'));
const Monitors = React.lazy(() => import('./Monitors/MonitorTable'));
const SSHAccess = React.lazy(() => import('./SSHAccess/SSHAccess'));
const CredentialList = React.lazy(() => import('./Credentials/CredentialList'));

export const ManagedLanding = () => {
  const { handleTabChange, tabIndex, tabs } = useTabs([
    {
      title: 'Summary',
      to: `/managed/summary`,
    },
    {
      title: 'Monitors',
      to: `/managed/monitors`,
    },
    {
      title: 'SSH Access',
      to: `/managed/ssh-access`,
    },
    {
      title: 'Credentials',
      to: `/managed/credentials`,
    },
    {
      title: 'Contacts',
      to: `/managed/contacts`,
    },
  ]);

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Managed" />
      <ProductInformationBanner bannerLocation="Managed" />
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: 'Managed',
              position: 1,
            },
          ],
          pathname: '/managed',
        }}
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-the-linode-managed-service"
        entity="Managed"
        extraActions={<SupportWidget />}
        removeCrumbX={1}
        title="Managed"
      />
      <Tabs index={tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={tabs} />
        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={0}>
              <ManagedDashboardCard />
            </SafeTabPanel>
            <SafeTabPanel index={1}>
              <Monitors />
            </SafeTabPanel>
            <SafeTabPanel index={2}>
              <SSHAccess />
            </SafeTabPanel>
            <SafeTabPanel index={3}>
              <CredentialList />
            </SafeTabPanel>
            <SafeTabPanel index={4}>
              <Contacts />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </React.Fragment>
  );
};

export default ManagedLanding;
