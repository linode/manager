import { TPAProvider } from '@linode/api-v4/lib/profile';
import * as React from 'react';
import EnabledIcon from 'src/assets/icons/checkmark-enabled.svg';
import LinodeLogo from 'src/assets/logo/logo-footer.svg';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import { LOGIN_ROOT } from 'src/constants';
import { ProviderOptions } from 'src/featureFlags';
import useFlags from 'src/hooks/useFlags';
import TPADialog from './TPADialog';
import GitHubIcon from 'src/assets/icons/providers/github-logo.svg';
import GoogleIcon from 'src/assets/icons/providers/google-logo.svg';

const useStyles = makeStyles((theme: Theme) => ({
  tpa: {
    marginBottom: theme.spacing(),
  },
  copy: {
    lineHeight: 1.43,
    marginBottom: theme.spacing(3),
    maxWidth: 970,
  },
  providers: {
    '& button': {
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 1,
      backgroundColor: theme.bg.offWhiteDT,
      minHeight: 70,
      paddingRight: theme.spacing(3) - 4,
      paddingLeft: theme.spacing(3) - 4,
      width: '100%',
      [theme.breakpoints.down('xs')]: {
        marginLeft: 0,
      },
    },
    '& button:hover': {
      backgroundColor: theme.color.grey6,
    },
    '& .MuiButton-label': {
      color: theme.color.headline,
      justifyContent: 'flex-start',
      '& > span': {
        width: '100%',
      },
    },
  },
  providerIcon: {
    color: '#939598',
    height: 32,
    width: 32,
    marginRight: theme.spacing(2),
  },
  enabled: {
    border: `1px solid ${theme.palette.primary.main} !important`,
  },
  providerWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  enabledText: {
    fontFamily: theme.font.normal,
    marginLeft: theme.spacing() - 4,
  },
  enabledDetails: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(),
    marginLeft: theme.spacing(),
  },
  notice: {
    fontFamily: theme.font.bold,
    fontSize: '0.875rem',
    marginBottom: `${theme.spacing(2)}px !important`,
  },
}));

interface Props {
  authType: TPAProvider;
}

type CombinedProps = Props;

const icons: Record<TPAProvider, any> = {
  google: GoogleIcon,
  github: GitHubIcon,
  password: null,
};

export const TPAProviders: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const flags = useFlags();

  const providers = flags.tpaProviders ?? [];
  const thirdPartyEnabled = props.authType !== 'password';

  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [provider, setProvider] = React.useState<ProviderOptions>(
    providers[0].name
  );

  const currentProvider = providers.find(
    (thisProvider) => thisProvider.name === props.authType
  );

  return (
    <>
      <Typography className={classes.tpa} variant="h3">
        Log-In Method
      </Typography>
      <Typography className={classes.copy}>
        You can use your Linode credentials or another provider such as Google
        or GitHub to log in to your Linode account. If you select a provider
        below all aspects of logging in, such as passwords and Two-Factor
        Authentication (TFA), are managed through this provider. You may use
        only one provider at a time.
      </Typography>
      <Grid container className={classes.providers}>
        {providers.map((thisProvider) => {
          const Icon = icons[thisProvider.name];
          return (
            <Grid item xs={12} sm={6} md={4} key={thisProvider.displayName}>
              <Button
                className={
                  thirdPartyEnabled && props.authType === thisProvider.name
                    ? classes.enabled
                    : ''
                }
                onClick={() => {
                  setProvider(thisProvider.name);
                  setDialogOpen(true);
                }}
                disabled={thirdPartyEnabled}
              >
                <div>
                  <Icon className={classes.providerIcon} />
                </div>
                <div className={classes.providerWrapper}>
                  <div>
                    {thisProvider.displayName}
                    {thirdPartyEnabled &&
                      props.authType === thisProvider.name && (
                        <span className={classes.enabledText}>(Enabled)</span>
                      )}
                  </div>
                  {thirdPartyEnabled &&
                    props.authType === thisProvider.name && <EnabledIcon />}
                </div>
              </Button>
            </Grid>
          );
        })}
        <Grid item xs={12} sm={6} md={4}>
          <Button
            className={!thirdPartyEnabled ? classes.enabled : ''}
            onClick={() => {
              window.open(`${LOGIN_ROOT}/tpa/disable`, '_blank', 'noopener');
            }}
            disabled={!thirdPartyEnabled}
          >
            <div>
              <LinodeLogo className={classes.providerIcon} />
            </div>
            <div className={classes.providerWrapper}>
              <div>
                Linode
                {!thirdPartyEnabled && (
                  <span className={classes.enabledText}>(Enabled)</span>
                )}
              </div>
              {!thirdPartyEnabled && <EnabledIcon />}
            </div>
          </Button>
        </Grid>

        {thirdPartyEnabled && (
          <div className={classes.enabledDetails}>
            <Notice className={classes.notice} warning>
              Third-Party Authentication via {currentProvider?.displayName} is
              enabled on your account.
            </Notice>
            <Typography variant="body1" className={classes.copy}>
              Your login credentials are currently managed by{' '}
              {currentProvider?.displayName}. If you need to reset your
              password, please visit the{' '}
              <ExternalLink
                hideIcon
                link={currentProvider?.href ?? ''}
                text={`${currentProvider?.displayName}` + ` website`}
              />
              .
            </Typography>
            <Typography variant="body1" className={classes.copy}>
              To remove the current Third-Party Authentication (TPA) from your
              account and allow you to log in with Linode credentials, click on
              the Linode button above.
              <br />
              We&apos;ll send you an e-mail with instructions on how to reset
              your password.
            </Typography>
          </div>
        )}

        <TPADialog
          open={dialogOpen}
          loading={false}
          onClose={() => setDialogOpen(false)}
          provider={provider}
        />
      </Grid>
    </>
  );
};

export default TPAProviders;
