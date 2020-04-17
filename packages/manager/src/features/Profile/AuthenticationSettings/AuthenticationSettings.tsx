import { Profile } from 'linode-js-sdk/lib/profile';
import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose';
import GitHubIcon from 'src/assets/icons/providers/git-hub-logo.svg';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Notice from 'src/components/Notice';
import TabbedPanel from 'src/components/TabbedPanel';
import { LOGIN_ROOT } from 'src/constants';
import { AccountsAndPasswords, SecurityControls } from 'src/documentation';
import { updateProfile as _updateProfile } from 'src/store/profile/profile.requests';
import { MapState } from 'src/store/types';
import ResetPassword from './ResetPassword';
import SecuritySettings from './SecuritySettings';
import ThirdParty from './ThirdParty';
import ThirdPartyDialog from './ThirdPartyDialog';
import TrustedDevices from './TrustedDevices';
import TwoFactor from './TwoFactor';

const useStyles = makeStyles((theme: Theme) => ({
  inner: {
    paddingTop: 0
  },
  copy: {
    lineHeight: 1.43,
    marginBottom: theme.spacing(3)
  },
  providers: {
    marginBottom: theme.spacing(6),

    '& button': {
      border: `1px solid #f4f4f4`,
      backgroundColor: theme.bg.offWhite,
      minHeight: '70px',
      minWidth: '344px',
      paddingLeft: theme.spacing(3) - 4
    },
    '& button:hover': {
      backgroundColor: theme.bg.offWhite
    },
    '& .MuiButton-label': {
      color: theme.color.headline,
      justifyContent: 'flex-start'
    }
  },
  providerIcon: {
    color: '#939598',
    marginRight: theme.spacing(2)
  },
  enabled: {
    border: `2px solid #3683dc !important`,

    '& svg': {
      color: '#3683dc'
    }
  },
  enabledText: {
    fontFamily: theme.font.normal,
    marginLeft: theme.spacing() - 4
  },
  notice: {
    display: 'inline-block',
    marginBottom: '0 !important',
    marginLeft: '30px'
  }
}));

type CombinedProps = StateProps & DispatchProps;

export const AuthenticationSettings: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const {
    loading,
    authType,
    ipWhitelisting,
    twoFactor,
    username,
    email,
    updateProfile
  } = props;

  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);

  const [success, setSuccess] = React.useState<string | undefined>(undefined);
  const [provider, setProvider] = React.useState<string>('');
  const [disableTPA, setDisableTPA] = React.useState<boolean>(false);

  const thirdPartyEnabled = authType !== 'password';

  const clearState = () => {
    setSuccess(undefined);
  };
  const onWhitelistingDisable = () => {
    setSuccess('IP whitelisting disabled. This feature cannot be re-enabled.');
  };

  const tabs = [
    {
      title: 'Linode Credentials',
      render: () => (
        <React.Fragment>
          <ThirdParty authType={authType} />
          <ResetPassword username={username} disabled={thirdPartyEnabled} />
          <TwoFactor
            twoFactor={twoFactor}
            username={username}
            clearState={clearState}
            updateProfile={updateProfile}
            disabled={thirdPartyEnabled}
          />
          <TrustedDevices disabled={thirdPartyEnabled} />
          {ipWhitelisting && (
            <SecuritySettings
              updateProfile={updateProfile}
              onSuccess={onWhitelistingDisable}
              updateProfileError={props.profileUpdateError}
              ipWhitelistingEnabled={ipWhitelisting}
              data-qa-whitelisting-form
            />
          )}
        </React.Fragment>
      )
    },
    {
      title: 'Third-Party Authentication',
      render: () => (
        <React.Fragment>
          <Typography className={classes.copy}>
            Third-Party Authentication (TPA) allows you to log in to your Linode
            account using another provider. All aspects of logging in, such as
            passwords and Two-Factor Authentication (TFA), are managed through
            this provider.
          </Typography>
          <Typography className={classes.copy}>
            Select a provider below to go to their web site and set up access.
            You may only use one provider at a time.
          </Typography>
          <div className={classes.providers}>
            <Button
              className={thirdPartyEnabled ? classes.enabled : ''}
              onClick={() => {
                setProvider('GitHub');
                setDialogOpen(true);
              }}
              disabled={thirdPartyEnabled}
            >
              <GitHubIcon className={classes.providerIcon} />
              GitHub
              {thirdPartyEnabled && (
                <span className={classes.enabledText}>(Enabled)</span>
              )}
            </Button>
            <ThirdPartyDialog
              open={dialogOpen}
              loading={false}
              onClose={() => setDialogOpen(false)}
              provider={provider}
            />
          </div>
          {thirdPartyEnabled && (
            <React.Fragment>
              <Typography className={classes.copy}>
                If you prefer to log in using your Linode credentials, you can
                disable Third-Party Authentication. We’ll send you an e-mail to
                reset your Linode password.
              </Typography>
              <Button
                aria-describedby="external-site"
                buttonType="primary"
                onClick={() => {
                  setDisableTPA(true);
                  window.open(
                    `${LOGIN_ROOT}/tpa/disable`,
                    '_blank',
                    'noopener'
                  );
                }}
              >
                Disable {provider} Authentication
              </Button>
              {disableTPA && (
                <Notice className={classes.notice} warning>
                  We sent password reset instructions to {email}.
                </Notice>
              )}
            </React.Fragment>
          )}
        </React.Fragment>
      )
    }
  ];

  const initialTab = 0;

  return (
    <div
      id="tabpanel-passwordAuthentication"
      role="tabpanel"
      aria-labelledby="tab-passwordAuthentication"
    >
      <DocumentTitleSegment segment={`Password & Authentication`} />
      {/* Remove when logic above is cleared */}
      {success && <Notice success text={success} />}
      {!loading && (
        <React.Fragment>
          <TabbedPanel
            rootClass={`tabbedPanel`}
            innerClass={`${classes.inner}`}
            header={''}
            tabs={tabs}
            initTab={initialTab}
          />
        </React.Fragment>
      )}
    </div>
  );
};

const docs = [AccountsAndPasswords, SecurityControls];

interface StateProps {
  loading: boolean;
  authType: string | undefined;
  ipWhitelisting: boolean;
  twoFactor?: boolean;
  username?: string;
  email?: string;
  profileUpdateError?: APIError[];
}

const mapStateToProps: MapState<StateProps, {}> = state => {
  const { profile } = state.__resources;

  return {
    loading: profile.loading,
    authType: profile?.data?.authentication_type,
    ipWhitelisting: profile?.data?.ip_whitelist_enabled ?? false,
    twoFactor: profile?.data?.two_factor_auth,
    username: profile?.data?.username,
    email: profile?.data?.email,
    profileUpdateError: profile.error?.update
  };
};

interface DispatchProps {
  updateProfile: (v: Partial<Profile>) => Promise<Profile>;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = dispatch => ({
  updateProfile: (v: Partial<Profile>) => dispatch(_updateProfile(v) as any)
});

const connected = connect(mapStateToProps, mapDispatchToProps);

const enhanced = compose<CombinedProps, {}>(connected, setDocs(docs));

export default enhanced(AuthenticationSettings);
