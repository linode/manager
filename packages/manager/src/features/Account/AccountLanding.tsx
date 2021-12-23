import * as React from 'react';
import { matchPath, RouteComponentProps, useHistory } from 'react-router-dom';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import LandingHeader, {
  LandingHeaderProps,
} from 'src/components/LandingHeader';
import SafeTabPanel from 'src/components/SafeTabPanel';
import SuspenseLoader from 'src/components/SuspenseLoader';
import TabLinkList, { Tab } from 'src/components/TabLinkList';
import TaxBanner from 'src/components/TaxBanner';
import useFlags from 'src/hooks/useFlags';
import { useProfile } from 'src/queries/profile';

type Props = RouteComponentProps<{}>;

const Billing = React.lazy(() => import('src/features/Billing'));
const EntityTransfersLanding = React.lazy(
  () => import('src/features/EntityTransfers/EntityTransfersLanding')
);
const Users = React.lazy(() => import('src/features/Users'));
const GlobalSettings = React.lazy(() => import('./GlobalSettings'));
const MaintenanceLanding = React.lazy(
  () => import('./Maintenance/MaintenanceLanding')
);

const AccountLanding: React.FC<Props> = (props) => {
  const { location } = props;
  const flags = useFlags();
  const history = useHistory();
  const { data: profile } = useProfile();

  const tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    {
      title: 'Billing Info',
      routeName: `${props.match.url}/billing`,
    },
    {
      title: 'Users & Grants',
      routeName: `${props.match.url}/users`,
    },
    flags.entityTransfers
      ? {
          title: 'Service Transfers',
          routeName: `${props.match.url}/service-transfers`,
          hide: !flags.entityTransfers,
        }
      : null,
    {
      title: 'Maintenance',
      routeName: `${props.match.url}/maintenance`,
    },
    {
      title: 'Settings',
      routeName: `${props.match.url}/settings`,
    },
  ].filter(Boolean) as Tab[];

  const getDefaultTabIndex = () => {
    const tabChoice = tabs.findIndex((tab) =>
      Boolean(matchPath(tab.routeName, { path: location.pathname }))
    );

    // Redirect to the landing page if the path does not exist
    if (tabChoice < 0) {
      history.push(`${props.match.url}/billing`);
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
    landingHeaderProps.onAddNew = () =>
      history.replace('/account/billing/make-payment');
  }

  return (
    <>
      <DocumentTitleSegment segment="Account Settings" />
      <TaxBanner location={location} marginBottom={24} />
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
            {flags.entityTransfers ? (
              <SafeTabPanel index={++idx}>
                <EntityTransfersLanding />
              </SafeTabPanel>
            ) : null}
            <SafeTabPanel index={++idx}>
              <MaintenanceLanding />
            </SafeTabPanel>
            <SafeTabPanel index={++idx}>
              <GlobalSettings />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </>
  );
};

export default AccountLanding;
