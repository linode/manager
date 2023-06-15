import * as React from 'react';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import LandingHeader from 'src/components/LandingHeader';
import { NavTab, NavTabs } from 'src/components/NavTabs/NavTabs';
import ManagedDashboardCard from './ManagedDashboardCard';
import SupportWidget from './SupportWidget';

const Contacts = React.lazy(() => import('./Contacts/Contacts'));
const Monitors = React.lazy(() => import('./Monitors'));
const SSHAccess = React.lazy(() => import('./SSHAccess'));
const CredentialList = React.lazy(() => import('./Credentials/CredentialList'));

const tabs: NavTab[] = [
  {
    title: 'Summary',
    routeName: `/managed/summary`,
    component: ManagedDashboardCard,
  },
  {
    title: 'Monitors',
    routeName: `/managed/monitors`,
    render: <Monitors />,
  },
  {
    title: 'SSH Access',
    routeName: `/managed/ssh-access`,
    component: SSHAccess,
  },
  {
    title: 'Credentials',
    routeName: `/managed/credentials`,
    render: <CredentialList />,
  },
  {
    title: 'Contacts',
    routeName: `/managed/contacts`,
    render: <Contacts />,
  },
];

export const ManagedLanding = () => {
  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Managed" />
      <LandingHeader
        title="Managed"
        entity="Managed"
        docsLink="https://www.linode.com/docs/platform/linode-managed/"
        extraActions={<SupportWidget />}
        removeCrumbX={1}
      />
      <NavTabs tabs={tabs} />
    </React.Fragment>
  );
};

export default ManagedLanding;
