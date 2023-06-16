import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import LandingHeader, {
  LandingHeaderProps,
} from 'src/components/LandingHeader';
import SuspenseLoader from 'src/components/SuspenseLoader';
import { useAccount } from 'src/queries/account';
import { useGrants } from 'src/queries/profile';
import AccountLogins from './AccountLogins';
import Tabs from '@mui/material/Tabs';
import { SafeTabPanel } from 'src/components/SafeTabPanel/SafeTabPanel';
import Tab from '@mui/material/Tab';

const Billing = React.lazy(() => import('src/features/Billing'));
const EntityTransfersLanding = React.lazy(
  () => import('src/features/EntityTransfers/EntityTransfersLanding')
);
const Users = React.lazy(() => import('src/features/Users'));
const GlobalSettings = React.lazy(() => import('./GlobalSettings'));
const MaintenanceLanding = React.lazy(
  () => import('./Maintenance/MaintenanceLanding')
);

const AccountLanding = () => {
  const history = useHistory();
  const location = useLocation();
  const { data: account } = useAccount();
  const { data: grants } = useGrants();

  const accountAccessGrant = grants?.global?.account_access;
  const readOnlyAccountAccess = accountAccessGrant === 'read_only';
  const isAkamaiAccount = account?.billing_source === 'akamai';

  const tabs = [
    {
      title: 'Billing Info',
      routeName: '/account/billing',
    },
    {
      title: 'Users & Grants',
      routeName: '/account/users',
    },
    {
      title: 'Login History',
      routeName: '/account/login-history',
    },
    {
      title: 'Service Transfers',
      routeName: '/account/service-transfers',
    },
    {
      title: 'Maintenance',
      routeName: '/account/maintenance',
    },
    {
      title: 'Settings',
      routeName: '/account/settings',
    },
  ];

  const getTabIndex = () => {
    const index = tabs.findIndex((tab) =>
      location.pathname.endsWith(tab.routeName)
    );
    return index === -1 ? 0 : index;
  };

  const isBillingTabSelected = location.pathname.match(/billing/);

  const landingHeaderProps: LandingHeaderProps = {
    title: 'Account',
    breadcrumbProps: {
      pathname: '/account',
    },
  };

  if (isBillingTabSelected) {
    landingHeaderProps.docsLabel = 'How Linode Billing Works';
    landingHeaderProps.docsLink =
      'https://www.linode.com/docs/guides/how-linode-billing-works/';
    landingHeaderProps.createButtonText = 'Make a Payment';
    if (!isAkamaiAccount) {
      landingHeaderProps.onButtonClick = () =>
        history.replace('/account/billing/make-payment');
    }
    landingHeaderProps.disabledCreateButton = readOnlyAccountAccess;
  }

  const index = getTabIndex();

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Account Settings" />
      <LandingHeader {...landingHeaderProps} data-qa-profile-header />
      <Tabs
        value={index}
        onChange={(_, i) => history.push(tabs[i].routeName)}
        data-qa-tabs
      >
        {tabs.map((tab) => (
          <Tab key={tab.title} label={tab.title} />
        ))}
      </Tabs>
      <React.Suspense fallback={<SuspenseLoader />}>
        <SafeTabPanel value={index} index={0}>
          <Billing />
        </SafeTabPanel>
        <SafeTabPanel value={index} index={1}>
          <Users />
        </SafeTabPanel>
        <SafeTabPanel value={index} index={2}>
          <AccountLogins />
        </SafeTabPanel>
        <SafeTabPanel value={index} index={3}>
          <EntityTransfersLanding />
        </SafeTabPanel>
        <SafeTabPanel value={index} index={4}>
          <MaintenanceLanding />
        </SafeTabPanel>
        <SafeTabPanel value={index} index={5}>
          <GlobalSettings />
        </SafeTabPanel>
      </React.Suspense>
    </React.Fragment>
  );
};

export default AccountLanding;
