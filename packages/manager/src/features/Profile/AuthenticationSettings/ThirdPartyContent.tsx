import { TPAProvider } from '@linode/api-v4/lib/profile';
import * as React from 'react';
import EnabledIcon from 'src/assets/icons/checkmark-enabled.svg';
import LinodeLogo from 'src/assets/logo/logo-footer.svg';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { LOGIN_ROOT } from 'src/constants';
import useFlags from 'src/hooks/useFlags';
import { ProviderOptions, providers } from './shared';
import ThirdPartyDialog from './ThirdPartyDialog';

const useStyles = makeStyles((theme: Theme) => ({
  copy: {
    lineHeight: 1.43,
    marginBottom: theme.spacing(3),
    maxWidth: 970,
  },
  providers: {
    maxWidth: 1150,
    '& button': {
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 1,
      backgroundColor: theme.bg.offWhite,
      minHeight: 70,
      paddingRight: theme.spacing(3) - 4,
      paddingLeft: theme.spacing(3) - 4,
      width: '100%',
      [theme.breakpoints.up('md')]: {
        maxWidth: 344,
      },
      [theme.breakpoints.down('xs')]: {
        marginLeft: 0,
      },
    },
    '& button:hover': {
      backgroundColor: theme.bg.offWhite,
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
}));

interface Props {
  authType: TPAProvider;
}

type CombinedProps = Props;

export const ThirdPartyContent: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const flags = useFlags();

  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [provider, setProvider] = React.useState<ProviderOptions>(
    providers[0].name
  );

  const thirdPartyEnabled = props.authType !== 'password';

  // If the flag is off, remove Google from the list of TPAProviders
  if (!flags.tpaGoogle) {
    const index = providers.findIndex((provider) => provider.name === 'google');
    if (index > -1) {
      providers.splice(index, 1);
    }
  }

  return (
    <>
      <Typography className={classes.copy}>
        You can use your Linode credentials or another provider such as Google
        or GitHub to log in to your Linode account. If you select a provider
        below all aspects of logging in, such as passwords and Two-Factor
        Authentication (TFA), are managed through this provider. You may use
        only one provider at a time.
      </Typography>
      <Grid container className={classes.providers}>
        {providers.map((thisProvider) => {
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
                  <thisProvider.Icon className={classes.providerIcon} />
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
            className={
              !thirdPartyEnabled && props.authType === 'password'
                ? classes.enabled
                : ''
            }
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
                {!thirdPartyEnabled && props.authType === 'password' && (
                  <span className={classes.enabledText}>(Enabled)</span>
                )}
              </div>
              {!thirdPartyEnabled && props.authType === 'password' && (
                <EnabledIcon />
              )}
            </div>
          </Button>
        </Grid>

        <ThirdPartyDialog
          open={dialogOpen}
          loading={false}
          onClose={() => setDialogOpen(false)}
          provider={provider}
        />
      </Grid>
    </>
  );
};

export default ThirdPartyContent;
