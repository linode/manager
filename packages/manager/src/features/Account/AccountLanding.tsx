import * as React from 'react';
import {
  matchPath,
  Redirect,
  Route,
  RouteComponentProps,
  Switch
} from 'react-router-dom';
import { compose } from 'recompose';
import Breadcrumb from 'src/components/Breadcrumb';
import AppBar from 'src/components/core/AppBar';
import Tabs from 'src/components/core/Tabs';
import TabList from 'src/components/core/TabList';
import TabPanels from 'src/components/core/TabPanels';
import TabPanel from 'src/components/core/TabPanel';
import Tab from 'src/components/core/Tab';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import TabLink from 'src/components/TabLink';

import DefaultLoader from 'src/components/DefaultLoader';
import withProfile, {
  Props as ProfileActionsProps
} from 'src/containers/profile.container';

import TaxBanner from 'src/components/TaxBanner';

type Props = RouteComponentProps<{}> & ProfileActionsProps & StateProps;

const GlobalSettings = DefaultLoader({
  loader: () => import('./GlobalSettings')
});

const Users = DefaultLoader({
  loader: () => import('src/features/Users')
});

const Billing = DefaultLoader({
  loader: () => import('src/features/Billing')
});

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
    const {
      match: { url },
      location
    } = this.props;

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
        <Tabs
        // value={this.tabs.findIndex(tab => matches(tab.routeName))}
        // onChange={this.handleTabChange}
        // indicatorColor="primary"
        // textColor="primary"
        // variant="scrollable"
        // scrollButtons="on"
        >
          <TabList>
            {this.tabs.map(tab => (
              <Tab
                key={tab.title}
                data-qa-tab={tab.title}
                component={React.forwardRef((props, ref) => (
                  <TabLink
                    to={tab.routeName}
                    title={tab.title}
                    {...props}
                    ref={ref}
                  />
                ))}
              />
            ))}
          </TabList>

          <TabPanels>
            <TabPanel>
              <Users isRestrictedUser={this.props.isRestrictedUser} />
            </TabPanel>
            <TabPanel>
              <GlobalSettings />
            </TabPanel>
            <TabPanel>
              <Billing />
            </TabPanel>
          </TabPanels>
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
