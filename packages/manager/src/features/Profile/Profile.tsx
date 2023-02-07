import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import LandingHeader from 'src/components/LandingHeader';
import NavTabs, { NavTab } from 'src/components/NavTabs/NavTabs';

const SSHKeys = React.lazy(() => import('./SSHKeys'));
const Settings = React.lazy(() => import('./Settings'));
const Referrals = React.lazy(() => import('./Referrals'));
const OAuthClients = React.lazy(() => import('./OAuthClients'));
const LishSettings = React.lazy(() => import('./LishSettings'));
const DisplaySettings = React.lazy(() => import('./DisplaySettings'));
const AuthenticationSettings = React.lazy(
  () => import('./AuthenticationSettings')
);
const APITokens = React.lazy(() => import('./APITokens/APITokens'));

const Profile = (props: RouteComponentProps) => {
  const {
    match: { url },
  } = props;

  const tabs: NavTab[] = [
    {
      title: 'Display',
      routeName: `${url}/display`,
      component: DisplaySettings,
    },
    {
      title: 'Login & Authentication',
      routeName: `${url}/auth`,
      component: AuthenticationSettings,
    },
    {
      title: 'SSH Keys',
      routeName: `${url}/keys`,
      component: SSHKeys,
    },
    {
      title: 'LISH Console Settings',
      routeName: `${url}/lish`,
      component: LishSettings,
    },
    {
      title: 'API Tokens',
      routeName: `${url}/tokens`,
      component: APITokens,
    },
    {
      title: 'OAuth Apps',
      routeName: `${url}/clients`,
      component: OAuthClients,
    },
    {
      title: 'Referrals',
      routeName: `${url}/referrals`,
      component: Referrals,
    },
    {
      title: 'My Settings',
      routeName: `${url}/settings`,
      render: <Settings />,
    },
  ];

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="My Profile " />
      <LandingHeader
        title="My Profile"
        removeCrumbX={1}
        data-qa-profile-header
      />
      <NavTabs tabs={tabs} />
    </React.Fragment>
  );
};

export default withRouter(Profile);
