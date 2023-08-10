import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { NavTab, NavTabs } from 'src/components/NavTabs/NavTabs';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';

import ManagedDashboardCard from './ManagedDashboardCard';
import SupportWidget from './SupportWidget';

const Contacts = React.lazy(() => import('./Contacts/Contacts'));
const Monitors = React.lazy(() => import('./Monitors'));
const SSHAccess = React.lazy(() => import('./SSHAccess'));
const CredentialList = React.lazy(() => import('./Credentials/CredentialList'));

const tabs: NavTab[] = [
  {
    component: ManagedDashboardCard,
    routeName: `/managed/summary`,
    title: 'Summary',
  },
  {
    render: <Monitors />,
    routeName: `/managed/monitors`,
    title: 'Monitors',
  },
  {
    component: SSHAccess,
    routeName: `/managed/ssh-access`,
    title: 'SSH Access',
  },
  {
    render: <CredentialList />,
    routeName: `/managed/credentials`,
    title: 'Credentials',
  },
  {
    render: <Contacts />,
    routeName: `/managed/contacts`,
    title: 'Contacts',
  },
];

export const ManagedLanding = () => {
  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Managed" />
      <ProductInformationBanner bannerLocation="Managed" important warning />
      <LandingHeader
        docsLink="https://www.linode.com/docs/platform/linode-managed/"
        entity="Managed"
        extraActions={<SupportWidget />}
        removeCrumbX={1}
        title="Managed"
      />
      <NavTabs tabs={tabs} />
    </React.Fragment>
  );
};

export default ManagedLanding;
