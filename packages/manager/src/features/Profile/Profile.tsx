import { createLazyRoute } from '@tanstack/react-router';
import * as React from 'react';
import { useRouteMatch } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { NavTabs } from 'src/components/NavTabs/NavTabs';

import type { NavTab } from 'src/components/NavTabs/NavTabs';

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

export const Profile = () => {
  const { url } = useRouteMatch();

  const tabs: NavTab[] = [
    {
      component: DisplaySettings,
      routeName: `${url}/display`,
      title: 'Display',
    },
    {
      component: AuthenticationSettings,
      routeName: `${url}/auth`,
      title: 'Login & Authentication',
    },
    {
      component: SSHKeys,
      routeName: `${url}/keys`,
      title: 'SSH Keys',
    },
    {
      component: LishSettings,
      routeName: `${url}/lish`,
      title: 'LISH Console Settings',
    },
    {
      component: APITokens,
      routeName: `${url}/tokens`,
      title: 'API Tokens',
    },
    {
      component: OAuthClients,
      routeName: `${url}/clients`,
      title: 'OAuth Apps',
    },
    {
      component: Referrals,
      routeName: `${url}/referrals`,
      title: 'Referrals',
    },
    {
      render: <Settings />,
      routeName: `${url}/settings`,
      title: 'My Settings',
    },
  ];

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="My Profile" />
      <LandingHeader removeCrumbX={1} title="My Profile" />
      <NavTabs tabs={tabs} />
    </React.Fragment>
  );
};

export const ProfileLazyRoute = createLazyRoute('/profile')({
  component: Profile,
});
