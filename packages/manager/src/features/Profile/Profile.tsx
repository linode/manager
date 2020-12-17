import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import LandingHeader from 'src/components/LandingHeader';
import NavTabs, { NavTab } from 'src/components/NavTabs/NavTabs';
import useFlags from 'src/hooks/useFlags';
import Props from './OAuthClients';

const SSHKeys = React.lazy(() => import('./SSHKeys'));
const SSHKeys_CMR = React.lazy(() => import('./SSHKeys/SSHKeys_CMR'));
const Settings = React.lazy(() => import('./Settings'));
const Referrals = React.lazy(() => import('./Referrals'));
const OAuthClients = React.lazy(() => import('./OAuthClients'));
const OAuthClients_CMR = React.lazy(() =>
  import('./OAuthClients/OAuthClients_CMR')
);
const LishSettings = React.lazy(() => import('./LishSettings'));
const DisplaySettings = React.lazy(() => import('./DisplaySettings'));
const AuthenticationSettings = React.lazy(() =>
  import('./AuthenticationSettings')
);
const APITokens = React.lazy(() => import('./APITokens'));

interface Props {
  toggleTheme: () => void;
}

type CombinedProps = Props & RouteComponentProps<{}>;

const Profile: React.FC<CombinedProps> = props => {
  const flags = useFlags();
  const {
    match: { url },
    toggleTheme
  } = props;

  const tabs: NavTab[] = [
    {
      title: 'Display',
      routeName: `${url}/display`,
      component: DisplaySettings
    },
    {
      title: 'Password & Authentication',
      routeName: `${url}/auth`,
      component: AuthenticationSettings
    },
    {
      title: 'SSH Keys',
      routeName: `${url}/keys`,
      component: flags.cmr ? SSHKeys_CMR : SSHKeys
    },
    {
      title: 'LISH Console Settings',
      routeName: `${url}/lish`,
      component: LishSettings
    },
    {
      title: 'API Tokens',
      routeName: `${url}/tokens`,
      component: APITokens
    },
    {
      title: 'OAuth Apps',
      routeName: `${url}/clients`,
      component: flags.cmr ? OAuthClients_CMR : OAuthClients
    },
    {
      title: 'Referrals',
      routeName: `${url}/referrals`,
      component: Referrals
    },
    {
      title: 'My Settings',
      routeName: `${url}/settings`,
      render: <Settings toggleTheme={toggleTheme} />
    }
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
