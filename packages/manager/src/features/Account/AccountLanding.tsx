import * as React from 'react';
import { matchPath, RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import Breadcrumb from 'src/components/Breadcrumb';
import SafeTabPanel from 'src/components/SafeTabPanel';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import TabLinkList from 'src/components/TabLinkList';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import SuspenseLoader from 'src/components/SuspenseLoader';
import useFlags from 'src/hooks/useFlags';

import withProfile, {
  Props as ProfileActionsProps
} from 'src/containers/profile.container';

import TaxBanner from 'src/components/TaxBanner';

type Props = RouteComponentProps<{}> & ProfileActionsProps & StateProps;

const GlobalSettings = React.lazy(() => import('./GlobalSettings'));
const Users_PreCMR = React.lazy(() => import('src/features/Users'));
const Users_CMR = React.lazy(() =>
  import('src/features/Users/UsersLanding_CMR')
);
const Billing = React.lazy(() => import('src/features/Billing'));

const AccountLanding: React.FC<Props> = props => {
  const { location } = props;
  const flags = useFlags();

  const Users = flags.cmr ? Users_CMR : Users_PreCMR;

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
      <Breadcrumb
        pathname={location.pathname}
        labelTitle="Account"
        removeCrumbX={1}
        data-qa-profile-header
      />

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
