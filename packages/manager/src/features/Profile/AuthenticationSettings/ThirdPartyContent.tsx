import { TPAProvider } from '@linode/api-v4/lib/profile';
import * as React from 'react';
import EnabledIcon from 'src/assets/icons/checkmark_selected_option.svg';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { LOGIN_ROOT } from 'src/constants';
import { ProviderOptions, providers } from './shared';
import ThirdPartyDialog from './ThirdPartyDialog';

const useStyles = makeStyles((theme: Theme) => ({
  copy: {
    lineHeight: 1.43,
    marginBottom: theme.spacing(3),
  },
  providers: {
    marginBottom: theme.spacing(4),

    '& button': {
      border: `1px solid ${theme.palette.divider}`,
      backgroundColor: theme.bg.offWhite,
      marginBottom: theme.spacing(2),
      minHeight: '70px',
      minWidth: '344px',
      paddingRight: theme.spacing(3) - 4,
      paddingLeft: theme.spacing(3) - 4,
      '&:not(last-child)': {
        marginRight: theme.spacing(2),
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
    border: `1px solid ${theme.cmrBorderColors.borderTabs} !important`,
  },
  enabledWrapper: {
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

  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [provider, setProvider] = React.useState<ProviderOptions>(
    providers[0].name
  );

  const thirdPartyEnabled = props.authType !== 'password';

  return (
    <>
      <Typography className={classes.copy}>
        Third-Party Authentication (TPA) allows you to log in to your Linode
        account using another provider. All aspects of logging in, such as
        passwords and Two-Factor Authentication (TFA), are managed through this
        provider.
      </Typography>
      <Typography className={classes.copy}>
        Select a provider below to go to their web site and set up access. You
        may only use one provider at a time.
      </Typography>
      <div className={classes.providers}>
        {providers.map((thisProvider) => {
          return (
            <Button
              className={
                thirdPartyEnabled && props.authType === thisProvider.name
                  ? classes.enabled
                  : ''
              }
              key={thisProvider.displayName}
              onClick={() => {
                setProvider(thisProvider.name);
                setDialogOpen(true);
              }}
              disabled={thirdPartyEnabled}
            >
              <div>
                <thisProvider.Icon className={classes.providerIcon} />
              </div>
              <div className={classes.enabledWrapper}>
                {thisProvider.displayName}
                {thirdPartyEnabled && props.authType === thisProvider.name && (
                  <div className={classes.enabledWrapper}>
                    <span className={classes.enabledText}>(Enabled)</span>
                    <EnabledIcon />
                  </div>
                )}
              </div>
            </Button>
          );
        })}

        <ThirdPartyDialog
          open={dialogOpen}
          loading={false}
          onClose={() => setDialogOpen(false)}
          provider={provider}
        />
      </div>
      {thirdPartyEnabled && (
        <>
          <Typography className={classes.copy}>
            If you prefer to log in using your Linode credentials, you can
            disable Third-Party Authentication. We’ll send you an e-mail to
            reset your Linode password.
          </Typography>
          <Button
            aria-describedby="external-site"
            buttonType="primary"
            onClick={() => {
              window.open(`${LOGIN_ROOT}/tpa/disable`, '_blank', 'noopener');
            }}
          >
            Disable Third-Party Authentication
          </Button>
        </>
      )}
    </>
  );
};

export default ThirdPartyContent;
