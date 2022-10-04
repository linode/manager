import * as React from 'react';
import { matchPath, useHistory, useLocation } from 'react-router-dom';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import Typography from 'src/components/core/Typography';
import DismissibleBanner from 'src/components/DismissibleBanner';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import LandingHeader, {
  LandingHeaderProps,
} from 'src/components/LandingHeader';
import SafeTabPanel from 'src/components/SafeTabPanel';
import SuspenseLoader from 'src/components/SuspenseLoader';
import TabLinkList from 'src/components/TabLinkList';
import { akamaiBillingInvoiceText } from 'src/features/Billing/billingUtils';
import { useAccount } from 'src/queries/account';
import { getGrantData, useProfile } from 'src/queries/profile';

const Billing = React.lazy(() => import('src/features/Billing'));
const EntityTransfersLanding = React.lazy(
  () => import('src/features/EntityTransfers/EntityTransfersLanding')
);
const Users = React.lazy(() => import('src/features/Users'));
const GlobalSettings = React.lazy(() => import('./GlobalSettings'));
const MaintenanceLanding = React.lazy(
  () => import('./Maintenance/MaintenanceLanding')
);

const AccountLanding: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { data: profile } = useProfile();
  const { data: account } = useAccount();

  const grantData = getGrantData();
  const accountAccessGrant = grantData?.global?.account_access;
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

  const overrideWhitelist = [
    '/account/billing/make-payment',
    '/account/billing/add-payment-method',
    '/account/billing/edit',
  ];

  const getDefaultTabIndex = () => {
    const tabChoice = tabs.findIndex((tab) =>
      Boolean(matchPath(tab.routeName, { path: location.pathname }))
    );

    if (tabChoice < 0) {
      // Prevent redirect from overriding the URL change for `/account/billing/make-payment`, `/account/billing/add-payment-method`,
      // and `/account/billing/edit`
      if (!overrideWhitelist.includes(location.pathname)) {
        history.push('/account/billing');
      }

      // Redirect to the landing page if the path does not exist
      return 0;
    } else {
      return tabChoice;
    }
  };

  const handleTabChange = (index: number) => {
    history.push(tabs[index].routeName);
  };

  let idx = 0;

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
      landingHeaderProps.onAddNew = () =>
        history.replace('/account/billing/make-payment');
    }
    landingHeaderProps.disabledCreateButton = readOnlyAccountAccess;
  }

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Account Settings" />
      {isAkamaiAccount ? (
        <DismissibleBanner
          preferenceKey="akamai-account-billing"
          productInformationIndicator
        >
          <Typography>{akamaiBillingInvoiceText}</Typography>
        </DismissibleBanner>
      ) : null}
      <LandingHeader {...landingHeaderProps} data-qa-profile-header />

      <Tabs index={getDefaultTabIndex()} onChange={handleTabChange}>
        <TabLinkList tabs={tabs} />

        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={idx}>
              <Billing />
            </SafeTabPanel>
            <SafeTabPanel index={++idx}>
              <Users isRestrictedUser={profile?.restricted || false} />
            </SafeTabPanel>
            <SafeTabPanel index={++idx}>
              <EntityTransfersLanding />
            </SafeTabPanel>
            <SafeTabPanel index={++idx}>
              <MaintenanceLanding />
            </SafeTabPanel>
            <SafeTabPanel index={++idx}>
              <GlobalSettings />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </React.Fragment>
  );
};

export default AccountLanding;
