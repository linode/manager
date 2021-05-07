import { TPAProvider } from '@linode/api-v4/lib/profile';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import { LOGIN_ROOT } from 'src/constants';
import { Provider } from 'src/featureFlags';
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
  currentProvider: Provider;
  provider: TPAProvider;
  onClose: () => void;
}

type CombinedProps = Props;

const TPADialog: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const flags = useFlags();

  const { open, error, loading, currentProvider, provider, onClose } = props;

  const providers = flags.tpaProviders ?? [];

  const displayName =
    providers.find((thisProvider) => thisProvider.name === provider)
      ?.displayName ?? 'Linode';

  return (
    <ConfirmationDialog
      className={classes.dialog}
      open={open}
      title={`Change login method to ${displayName}?`}
      onClose={onClose}
      actions={() => renderActions(loading, onClose, provider)}
    >
      {error && <Notice error text={error} />}
      <Typography className={classes.copy} variant="body1">
        This will disable your login via{' '}
        {currentProvider.displayName === 'Linode'
          ? 'username and password'
          : currentProvider.displayName}
        .
      </Typography>
    </ConfirmationDialog>
  );
};

const changeLogin = (provider: TPAProvider) => {
  // If the selected provider is 'password', that means the user has decided
  // to disable TPA and revert to using Linode credentials
  return provider === 'password'
    ? window.open(`${LOGIN_ROOT}/tpa/disable`, '_blank', 'noopener')
    : window.open(
        `${LOGIN_ROOT}/tpa/enable/` + `${provider}`,
        '_blank',
        'noopener'
      );
};

const renderActions = (
  loading: boolean,
  onClose: () => void,
  provider: TPAProvider
) => {
  return (
    <ActionsPanel className="p0">
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
          changeLogin(provider);
        }}
        data-qa-confirm
        data-testid={'dialog-confirm'}
      >
        Change login
      </Button>
    </ActionsPanel>
  );
};

export default React.memo(TPADialog);
