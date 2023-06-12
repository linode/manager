import * as React from 'react';
import LandingHeader from 'src/components/LandingHeader';
import NavTabs, { NavTab } from 'src/components/NavTabs/NavTabs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { RouteComponentProps, withRouter } from 'react-router-dom';

const SSHKeys = React.lazy(() =>
  import('./SSHKeys/SSHKeys').then((module) => ({
    default: module.SSHKeys,
  }))
);
const Settings = React.lazy(() =>
  import('./Settings/Settings').then((module) => ({
    default: module.ProfileSettings,
  }))
);
const Referrals = React.lazy(() =>
  import('./Referrals/Referrals').then((module) => ({
    default: module.Referrals,
  }))
);
const OAuthClients = React.lazy(() => import('./OAuthClients/OAuthClients'));
const LishSettings = React.lazy(() =>
  import('./LishSettings/LishSettings').then((module) => ({
    default: module.LishSettings,
  }))
);
const DisplaySettings = React.lazy(() =>
  import('./DisplaySettings/DisplaySettings').then((module) => ({
    default: module.DisplaySettings,
  }))
);
const AuthenticationSettings = React.lazy(() =>
  import('./AuthenticationSettings/AuthenticationSettings').then((module) => ({
    default: module.AuthenticationSettings,
  }))
);
const APITokens = React.lazy(() =>
  import('./APITokens/APITokens').then((module) => ({
    default: module.APITokens,
  }))
);

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
