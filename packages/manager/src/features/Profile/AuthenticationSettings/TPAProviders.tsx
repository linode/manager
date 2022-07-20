import { TPAProvider } from '@linode/api-v4/lib/profile';
import classNames from 'classnames';
import * as React from 'react';
import EnabledIcon from 'src/assets/icons/checkmark-enabled.svg';
import GitHubIcon from 'src/assets/icons/providers/github-logo.svg';
import GoogleIcon from 'src/assets/icons/providers/google-logo.svg';
import LinodeLogo from 'src/assets/logo/logo-footer.svg';
import Button from 'src/components/Button';
import Box from 'src/components/core/Box';
import Divider from 'src/components/core/Divider';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';
import Grid from 'src/components/Grid';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';
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
  providersList: {
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
  button: {
    borderRadius: 1,
    backgroundColor: theme.name === 'lightTheme' ? '#f5f6f7' : '#444',
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
    '& > span': {
      display: 'inline-block',
      color: theme.color.headline,
    },
  },
  providerIcon: {
    color: '#939598',
    height: 32,
    width: 32,
    marginRight: theme.spacing(2),
  },
  providerContent: {
    width: '100%',
  },
  isButtonEnabled: {
    border: `1px solid ${theme.palette.primary.main} !important`,
  },
  enabledText: {
    fontFamily: theme.font.normal,
    marginLeft: 4,
  },
  notice: {
    fontFamily: theme.font.bold,
    fontSize: '0.875rem',
  },
}));

interface Props {
  authType: TPAProvider;
}

type CombinedProps = Props;

const icons: Record<TPAProvider, any> = {
  password: LinodeLogo,
  google: GoogleIcon,
  github: GitHubIcon,
};

const linode = {
  displayName: 'Linode',
  name: 'password' as TPAProvider,
  icon: LinodeLogo,
  href: '',
};

export const TPAProviders: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const flags = useFlags();

  // Get list of providers from LaunchDarkly
  const providers = flags.tpaProviders ?? [];
  const providersIncludingLinode = [{ ...linode }, ...providers];
  const currentProvider =
    providers.find((thisProvider) => thisProvider.name === props.authType) ??
    linode;

  const isThirdPartyAuthEnabled = props.authType !== 'password';

  const [isDialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [newProvider, setNewProvider] = React.useState<TPAProvider>(
    providers[0]?.name
  );

  const handleProviderChange = (newProviderName: TPAProvider) => {
    setNewProvider(newProviderName);
    setDialogOpen(true);
  };

  return (
    <>
      <Paper className={classes.root}>
        <Typography variant="h3">Login Method</Typography>
        <Typography className={classes.copy}>
          You can use your Linode credentials or another provider such as Google
          or GitHub to log in to your Linode account. More information is
          available in{' '}
          <Link to="https://www.linode.com/docs/guides/third-party-authentication/">
            How to Enable Third Party Authentication on Your Linode Account
          </Link>
          . We strongly recommend setting up Two-Factor Authentication (2FA).
        </Typography>
        <Grid container className={classes.providersList}>
          {providersIncludingLinode.map((thisProvider) => {
            const ProviderIcon = icons[thisProvider.name];
            const isProviderEnabled = props.authType === thisProvider.name;

            return (
              <Grid item md={4} key={thisProvider.displayName}>
                <Button
                  className={classNames({
                    [classes.button]: true,
                    [classes.isButtonEnabled]: isProviderEnabled,
                  })}
                  disabled={isProviderEnabled}
                  onClick={() => {
                    handleProviderChange(thisProvider.name);
                  }}
                >
                  <ProviderIcon className={classes.providerIcon} />
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    className={classes.providerContent}
                  >
                    <div>
                      {thisProvider.displayName}
                      {isProviderEnabled ? (
                        <span className={classes.enabledText}>(Enabled)</span>
                      ) : null}
                    </div>
                    {isProviderEnabled ? <EnabledIcon /> : null}
                  </Box>
                </Button>
              </Grid>
            );
          })}
        </Grid>
        {isThirdPartyAuthEnabled ? (
          <>
            <Divider spacingTop={24} spacingBottom={16} />
            <Typography variant="h3">
              {currentProvider.displayName} Authentication
            </Typography>
            <Notice
              className={classes.notice}
              spacingTop={16}
              spacingBottom={16}
              warning
            >
              Your login credentials are currently managed via{' '}
              {currentProvider.displayName}.
            </Notice>
            <Typography variant="body1" className={classes.copy}>
              If you need to reset your password or set up Two-Factor
              Authentication (2FA), please visit the{' '}
              <ExternalLink
                hideIcon
                link={currentProvider.href}
                text={`${currentProvider.displayName}` + ` website`}
              />
              .
            </Typography>
            <Typography
              variant="body1"
              className={classes.copy}
              style={{ marginBottom: 8 }}
            >
              To disable {currentProvider.displayName} authentication and log in
              using your Linode credentials, click the Linode button above.
              We&rsquo;ll send you an e-mail with instructions on how to reset
              your password.
            </Typography>
          </>
        ) : null}
      </Paper>
      <TPADialog
        currentProvider={currentProvider}
        newProvider={newProvider}
        open={isDialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
};

export default TPAProviders;
