import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { makeStyles, Theme } from 'src/components/core/styles';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import H1Header from 'src/components/H1Header';
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

const useStyles = makeStyles((theme: Theme) => ({
  cmrSpacing: {
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing()
    }
  }
}));

type Props = RouteComponentProps<{}>;

const Profile: React.FC<Props> = props => {
  const classes = useStyles();
  const flags = useFlags();
  const {
    match: { url }
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
      title: 'LISH Settings',
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
      title: 'Settings',
      routeName: `${url}/settings`,
      component: Settings
    }
  ];

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="My Profile " />
      <H1Header
        title="My Profile"
        className={flags.cmr ? classes.cmrSpacing : ''}
        data-qa-profile-header
      />
      <NavTabs tabs={tabs} />
    </React.Fragment>
  );
};

export default withRouter(Profile);
