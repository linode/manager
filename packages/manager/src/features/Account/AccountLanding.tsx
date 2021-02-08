import * as React from 'react';
import { matchPath, RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import LandingHeader from 'src/components/LandingHeader';
import SafeTabPanel from 'src/components/SafeTabPanel';
import SuspenseLoader from 'src/components/SuspenseLoader';
import TabLinkList from 'src/components/TabLinkList';
import TaxBanner from 'src/components/TaxBanner';
import withProfile, {
  Props as ProfileActionsProps
} from 'src/containers/profile.container';

type Props = RouteComponentProps<{}> & ProfileActionsProps & StateProps;

const Billing = React.lazy(() => import('src/features/Billing'));
const EntityTransfers = React.lazy(() =>
  import('src/features/EntityTransfers')
);
const Users = React.lazy(() => import('src/features/Users'));
const GlobalSettings = React.lazy(() => import('./GlobalSettings'));

const AccountLanding: React.FC<Props> = props => {
  const { location } = props;

  const tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    {
      title: 'Billing Info',
      routeName: `${props.match.url}/billing`
    },
    {
      title: 'Users & Grants',
      routeName: `${props.match.url}/users`
    },
    {
      title: 'Transfers',
      routeName: `${props.match.url}/entity-transfers`
    },
    {
      title: 'Settings',
      routeName: `${props.match.url}/settings`
    }
  ];

  const matches = (p: string) => {
    return Boolean(matchPath(p, { path: location.pathname }));
  };

  const navToURL = (index: number) => {
    props.history.push(tabs[index].routeName);
  };

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Account Settings" />
      <TaxBanner location={location} marginBottom={24} />
      <LandingHeader title="Account" removeCrumbX={1} data-qa-profile-header />

      <Tabs
        index={Math.max(
          tabs.findIndex(tab => matches(tab.routeName)),
          0
        )}
        onChange={navToURL}
      >
        <TabLinkList tabs={tabs} />

        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={0}>
              <Billing />
            </SafeTabPanel>
            <SafeTabPanel index={1}>
              <Users isRestrictedUser={props.isRestrictedUser} />
            </SafeTabPanel>
            <SafeTabPanel index={2}>
              <EntityTransfers />
            </SafeTabPanel>
            <SafeTabPanel index={3}>
              <GlobalSettings />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </React.Fragment>
  );
};

interface StateProps {
  isRestrictedUser: boolean;
}

export default compose<Props, {}>(
  withProfile<StateProps, {}>((ownProps, { profileData: data }) => ({
    isRestrictedUser: data?.restricted ?? false
  }))
)(AccountLanding);
