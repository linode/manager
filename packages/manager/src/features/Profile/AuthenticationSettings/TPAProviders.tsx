import { TPAProvider } from '@linode/api-v4/lib/profile';
import * as classnames from 'classnames';
import * as React from 'react';
import EnabledIcon from 'src/assets/icons/checkmark-enabled.svg';
import GitHubIcon from 'src/assets/icons/providers/github-logo.svg';
import GoogleIcon from 'src/assets/icons/providers/google-logo.svg';
import LinodeLogo from 'src/assets/logo/logo-footer.svg';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';
import Grid from 'src/components/Grid';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';
import { ProviderOptions } from 'src/featureFlags';
import useFlags from 'src/hooks/useFlags';
import TPADialog from './TPADialog';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(3),
    paddingTop: 17,
  },
  copy: {
    lineHeight: '1.25rem',
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(2),
    maxWidth: 960,
  },
  providers: {
    marginBottom: 0,
    width: 'calc(100% + 24px)',
    '& .MuiGrid-item': {
      [theme.breakpoints.down(1100)]: {
        flexBasis: '50%',
        maxWidth: '50%',
      },
      [theme.breakpoints.down('xs')]: {
        flexBasis: '100%',
        maxWidth: '100%',
      },
    },
    [theme.breakpoints.down('xs')]: {
      marginTop: theme.spacing(),
    },
  },
  provider: {
    borderRadius: 1,
    backgroundColor: theme.cmrBGColors.bgTPAButton,
    marginTop: theme.spacing(),
    minHeight: 70,
    paddingRight: theme.spacing(3) - 4,
    paddingLeft: theme.spacing(3) - 4,
    width: 'calc(100% - 8px)',
    [theme.breakpoints.down('sm')]: {
      marginLeft: 0,
    },
    [theme.breakpoints.down('xs')]: {
      marginTop: 0,
      marginLeft: 0,
    },
    '&:hover': {
      backgroundColor: theme.color.grey6,
    },
    '&.Mui-disabled': {
      color: 'inherit',
      opacity: 1,
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
  notice: {
    fontFamily: theme.font.bold,
    fontSize: '0.875rem',
    margin: `${theme.spacing(2)}px 0 !important`,
  },
}));

interface Props {
  authType: TPAProvider;
}

type CombinedProps = Props;

const icons: Record<TPAProvider, any> = {
  password: null,
  google: GoogleIcon,
  github: GitHubIcon,
};

export const TPAProviders: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const flags = useFlags();

  const providers = flags.tpaProviders ?? [];
  const thirdPartyEnabled = props.authType !== 'password';

  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [provider, setProvider] = React.useState<ProviderOptions | undefined>(
    providers[0].name
  );

  const currentProvider = providers.find(
    (thisProvider) => thisProvider.name === props.authType
  );

  return (
    <>
      <Paper className={classes.root}>
        <Typography variant="h3">Login Method</Typography>
        <Typography className={classes.copy}>
          You can use your Linode credentials or another provider such as Google
          or GitHub to log in to your Linode account. More information is
          availible in{' '}
          <Link to="https://www.linode.com/docs/guides/third-party-authentication/">
            How to Enable Third Party Authentication on Your Linode Account
          </Link>
          . We strongly recommend setting up Two-Factor Authentication (TFA).
        </Typography>
        <Grid container className={classes.providers}>
          <Grid item md={4}>
            <Button
              className={classnames({
                [classes.provider]: true,
                [classes.enabled]: !thirdPartyEnabled,
              })}
              onClick={() => {
                setProvider(undefined);
                setDialogOpen(true);
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

          {providers.map((thisProvider) => {
            const Icon = icons[thisProvider.name];
            return (
              <Grid item md={4} key={thisProvider.displayName}>
                <Button
                  className={classnames({
                    [classes.provider]: true,
                    [classes.enabled]:
                      thirdPartyEnabled && props.authType === thisProvider.name,
                  })}
                  onClick={() => {
                    setProvider(thisProvider.name);
                    setDialogOpen(true);
                  }}
                  disabled={
                    thirdPartyEnabled && props.authType === thisProvider.name
                  }
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
        </Grid>
      </Paper>

      {thirdPartyEnabled && (
        <Paper className={classes.root}>
          <Typography variant="h3">
            {currentProvider?.displayName} Authentication
          </Typography>
          <Notice className={classes.notice} warning>
            Your login credentials are currently managed via{' '}
            {currentProvider?.displayName}.
          </Notice>
          <Typography variant="body1" className={classes.copy}>
            If you need to reset your password or set up Two-Factor
            Authentication (TFA), please visit the{' '}
            <ExternalLink
              hideIcon
              link={currentProvider?.href ?? ''}
              text={`${currentProvider?.displayName}` + ` website`}
            />
            .
          </Typography>
          <Typography
            variant="body1"
            className={classes.copy}
            style={{ marginBottom: 8 }}
          >
            To disable {currentProvider?.displayName} authentication and log in
            using your Linode credentials, click the Linode button above.
            We&apos;ll send you an e-mail with instructions on how to reset your
            password.
          </Typography>
        </Paper>
      )}

      <TPADialog
        open={dialogOpen}
        loading={false}
        onClose={() => setDialogOpen(false)}
        currentProvider={currentProvider}
        provider={provider}
      />
    </>
  );
};

export default TPAProviders;
