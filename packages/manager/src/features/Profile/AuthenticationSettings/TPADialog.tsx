import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import { LOGIN_ROOT } from 'src/constants';
import { ProviderOptions } from 'src/featureFlags';
import useFlags from 'src/hooks/useFlags';

const useStyles = makeStyles(() => ({
  dialog: {
    '& .dialog-content': {
      paddingTop: 0,
      paddingBottom: 0,
    },
  },
  copy: {
    lineHeight: '1.25rem',
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

const TPADialog: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const flags = useFlags();

  const { open, error, loading, provider, onClose } = props;

  const providers = flags.tpaProviders ?? [];

  const displayName =
    providers.find((thisProvider) => thisProvider.name === provider)
      ?.displayName || '';

  return (
    <ConfirmationDialog
      className={classes.dialog}
      open={open}
      title="Change Log-in Method?"
      onClose={onClose}
      actions={() => renderActions(loading, provider, displayName, onClose)}
    >
      {error && <Notice error text={error} />}
      <Typography className={classes.copy} variant="body1">
        You will disable your current log-in and be asked to reset your Linode
        password. You can then use your Linode credentials or select another
        provider. Whichever provider you select will manage all aspects of
        logging in, such as passwords and Two-Factor Authentication (TFA).
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
        Change Log-in
      </Button>
    </ActionsPanel>
  );
};

export default React.memo(TPADialog);
