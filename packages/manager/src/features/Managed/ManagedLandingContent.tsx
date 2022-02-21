import * as React from 'react';
import LandingHeader from 'src/components/LandingHeader';
import NavTabs from 'src/components/NavTabs';
import { NavTab } from 'src/components/NavTabs/NavTabs';
import ManagedDashboardCard from './ManagedDashboardCard';
import SupportWidget from './SupportWidget';

const Contacts = React.lazy(() => import('./Contacts/Contacts'));
const Monitors = React.lazy(() => import('./Monitors'));
const SSHAccess = React.lazy(() => import('./SSHAccess'));
const CredentialList = React.lazy(() => import('./Credentials/CredentialList'));

export const ManagedLandingContent = () => {
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

  return (
    <>
      <LandingHeader
        title="Managed"
        entity="Managed"
        docsLink="https://www.linode.com/docs/platform/linode-managed/"
        extraActions={<SupportWidget />}
        removeCrumbX={1}
      />
      <NavTabs tabs={tabs} />
    </>
  );
};

export default ManagedLandingContent;
