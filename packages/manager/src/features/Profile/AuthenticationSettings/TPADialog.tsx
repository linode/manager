import { TPAProvider } from '@linode/api-v4/lib/profile';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import { makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
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
  currentProvider: Provider;
  newProvider: TPAProvider;
  open: boolean;
  onClose: () => void;
}

type CombinedProps = Props;

const TPADialog: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const flags = useFlags();

  const { currentProvider, newProvider, open, onClose } = props;

  // Get list of providers from LaunchDarkly
  const providers = flags.tpaProviders ?? [];

  const displayName =
    providers.find((thisProvider) => thisProvider.name === newProvider)
      ?.displayName ?? 'Linode';

  return (
    <ConfirmationDialog
      className={classes.dialog}
      title={`Change login method to ${displayName}?`}
      actions={() => renderActions(onClose, newProvider)}
      open={open}
      onClose={onClose}
    >
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

const handleLoginChange = (provider: TPAProvider) => {
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

const renderActions = (onClose: () => void, provider: TPAProvider) => {
  return (
    <ActionsPanel className="p0">
      <Button
        buttonType="secondary"
        onClick={onClose}
        data-testid="confirm-cancel"
      >
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={() => {
          onClose();
          handleLoginChange(provider);
        }}
        aria-describedby="external-site"
        data-testid="confirm-login-change"
      >
        Change login
      </Button>
    </ActionsPanel>
  );
};

export default React.memo(TPADialog);
