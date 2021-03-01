import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import { LOGIN_ROOT } from 'src/constants';
import { ProviderOptions, providers } from './shared';

const useStyles = makeStyles((theme: Theme) => ({
  dialog: {
    '& .dialog-content': {
      paddingTop: 0,
      paddingBottom: 0,
    },
    '& p': {
      lineHeight: '1.25rem',
    },
    '& p:first-child': {
      marginBottom: theme.spacing(2),
    },
  },
}));

interface Props {
  open: boolean;
  error?: string;
  loading: boolean;
  provider: ProviderOptions;
  onClose: () => void;
}

type CombinedProps = Props;

const ThirdPartyDialog: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const { open, error, loading, provider, onClose } = props;

  const displayName =
    providers.find((thisProvider) => thisProvider.name === provider)
      ?.displayName || '';

  return (
    <ConfirmationDialog
      className={classes.dialog}
      open={open}
      title={`Enable ` + `${displayName}` + ` Authentication`}
      onClose={onClose}
      actions={() => renderActions(loading, provider, displayName, onClose)}
    >
      {error && <Notice error text={error} />}
      <Typography>
        After you enable {displayName} authentication, your Linode account
        password will be disabled and any trusted devices will be removed from
        your account. If you&apos;ve enabled Two-Factor Authentication (TFA)
        with your Linode account, that will also be disabled. LISH access will
        be set to key authentication only. You should enable TFA via
        {` `}
        {displayName} for extra security.
      </Typography>
      <Typography>
        Do you want to go to {displayName} and enable Third-Party
        Authentication?
      </Typography>
    </ConfirmationDialog>
  );
};

const renderActions = (
  loading: boolean,
  provider: ProviderOptions,
  displayName: string,
  onClose: () => void
) => {
  return (
    <ActionsPanel style={{ padding: 0 }}>
      <Button
        buttonType="cancel"
        onClick={onClose}
        data-qa-cancel
        data-testid={'dialog-cancel'}
      >
        Cancel
      </Button>
      <Button
        aria-describedby="external-site"
        buttonType="primary"
        loading={loading}
        onClick={() => {
          onClose();
          window.open(
            `${LOGIN_ROOT}/tpa/enable/` + `${provider}`,
            '_blank',
            'noopener'
          );
        }}
        data-qa-confirm
        data-testid={'dialog-confirm'}
      >
        Go to {displayName}
      </Button>
    </ActionsPanel>
  );
};

export default React.memo(ThirdPartyDialog);
