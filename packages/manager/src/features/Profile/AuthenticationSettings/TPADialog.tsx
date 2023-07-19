import { TPAProvider } from '@linode/api-v4/lib/profile';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import ActionsPanel from 'src/components/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Typography } from 'src/components/Typography';
import { LOGIN_ROOT } from 'src/constants';
import { Provider } from 'src/featureFlags';
import useFlags from 'src/hooks/useFlags';
export interface TPADialogProps {
  currentProvider: Provider;
  newProvider: TPAProvider;
  onClose: () => void;
  open: boolean;
}

export const TPADialog = (props: TPADialogProps) => {
  const flags = useFlags();
  const { currentProvider, newProvider, onClose, open } = props;
  // Get list of providers from LaunchDarkly
  const providers = flags.tpaProviders ?? [];
  const displayName =
    providers.find((thisProvider) => thisProvider.name === newProvider)
      ?.displayName ?? 'Linode';

  return (
    <StyledConfirmationDialog
      actions={() => renderActions(onClose, newProvider)}
      onClose={onClose}
      open={open}
      title={`Change login method to ${displayName}?`}
    >
      <Typography sx={{ lineHeight: '1.25rem' }} variant="body1">
        This will disable your login via{' '}
        {currentProvider.displayName === 'Linode'
          ? 'username and password'
          : currentProvider.displayName}
        .
      </Typography>
    </StyledConfirmationDialog>
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
        data-testid="confirm-cancel"
        onClick={onClose}
      >
        Cancel
      </Button>
      <Button
        onClick={() => {
          onClose();
          handleLoginChange(provider);
        }}
        aria-describedby="external-site"
        buttonType="primary"
        data-testid="confirm-login-change"
      >
        Change login
      </Button>
    </ActionsPanel>
  );
};

const StyledConfirmationDialog = styled(ConfirmationDialog, {
  label: 'StyledConfirmationDialog',
})(() => ({
  '& .dialog-content': {
    paddingBottom: 0,
    paddingTop: 0,
  },
}));
