import { TPAProvider } from 'linode-js-sdk/lib/profile';
import * as React from 'react';
import GitHubIcon from 'src/assets/icons/providers/git-hub-logo.svg';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { LOGIN_ROOT } from 'src/constants';
import { updateProfile as _updateProfile } from 'src/store/profile/profile.requests';
import ThirdPartyDialog from './ThirdPartyDialog';

const useStyles = makeStyles((theme: Theme) => ({
  copy: {
    lineHeight: 1.43,
    marginBottom: theme.spacing(3)
  },
  providers: {
    marginBottom: theme.spacing(6),

    '& button': {
      border: `1px solid ${theme.palette.divider}`,
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
    border: `2px solid ${theme.color.blue} !important`,

    '& svg': {
      color: theme.color.blue
    }
  },
  enabledText: {
    fontFamily: theme.font.normal,
    marginLeft: theme.spacing() - 4
  }
}));

interface Props {
  authType: string | undefined;
}

type CombinedProps = Props;

export const ThirdPartyContent: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [provider, setProvider] = React.useState<string>('');

  const thirdPartyEnabled = props.authType !== 'password';
  const authTypeToDisplayName: Record<TPAProvider, string | undefined> = {
    password: undefined,
    github: 'GitHub'
  };

  return (
    <React.Fragment>
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
        <Button
          className={thirdPartyEnabled ? classes.enabled : ''}
          onClick={() => {
            setProvider('github');
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
          provider={authTypeToDisplayName[provider ?? '']}
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
              window.open(`${LOGIN_ROOT}/tpa/disable`, '_blank', 'noopener');
            }}
          >
            Disable {authTypeToDisplayName[props.authType ?? '']} Authentication
          </Button>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default ThirdPartyContent;
