import * as React from 'react';
import { matchPath, RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import Breadcrumb from 'src/components/Breadcrumb';
import TabPanel from 'src/components/core/ReachTabPanel';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import TabLinkList from 'src/components/TabLinkList';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import SuspenseLoader from 'src/components/SuspenseLoader';

import withProfile, {
  Props as ProfileActionsProps
} from 'src/containers/profile.container';

import TaxBanner from 'src/components/TaxBanner';

type Props = RouteComponentProps<{}> & ProfileActionsProps & StateProps;

const GlobalSettings = React.lazy(() => import('./GlobalSettings'));
const Users = React.lazy(() => import('src/features/Users'));
const Billing = React.lazy(() => import('src/features/Billing'));

class AccountLanding extends React.Component<Props> {
  handleTabChange = (
    event: React.ChangeEvent<HTMLDivElement>,
    value: number
  ) => {
    const { history } = this.props;
    const routeName = this.tabs[value].routeName;
    history.push(`${routeName}`);
  };

  tabs = [
    /* NB: These must correspond to the routes inside the Switch */
    {
      title: 'Billing Info',
      routeName: `${this.props.match.url}/billing`
    },
    {
      title: 'Users',
      routeName: `${this.props.match.url}/users`
    },
    {
      title: 'Settings',
      routeName: `${this.props.match.url}/settings`
    }
  ];

  render() {
    const { location } = this.props;

    const matches = (p: string) => {
      return Boolean(matchPath(p, { path: this.props.location.pathname }));
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
        <Tabs defaultIndex={this.tabs.findIndex(tab => matches(tab.routeName))}>
          <TabLinkList tabs={this.tabs} />

          <React.Suspense fallback={<SuspenseLoader />}>
            <TabPanels>
              <TabPanel>
                <Billing />
              </TabPanel>
              <TabPanel>
                <Users isRestrictedUser={this.props.isRestrictedUser} />
              </TabPanel>
              <TabPanel>
                <GlobalSettings />
              </TabPanel>
            </TabPanels>
          </React.Suspense>
        </Tabs>
      </React.Fragment>
    );
  }
}

interface StateProps {
  isRestrictedUser: boolean;
}

export default compose<Props, {}>(
  withProfile<StateProps, {}>((ownProps, { profileData: data }) => ({
    isRestrictedUser: data?.restricted ?? false
  }))
)(AccountLanding);
