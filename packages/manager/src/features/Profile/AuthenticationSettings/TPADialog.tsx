import { Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { LOGIN_ROOT } from 'src/constants';
import { useFlags } from 'src/hooks/useFlags';

import type { TPAProvider } from '@linode/api-v4/lib/profile';
import type { Provider } from 'src/featureFlags';
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
    ? window.open(`${LOGIN_ROOT}/tpa/disable`, '_blank', 'noopener noreferrer')
    : window.open(
        `${LOGIN_ROOT}/tpa/enable/` + `${provider}`,
        '_blank',
        'noopener noreferrer'
      );
};

const renderActions = (onClose: () => void, provider: TPAProvider) => {
  return (
    <ActionsPanel
      primaryButtonProps={{
        'aria-describedby': 'external-site',
        'data-testid': 'confirm-login-change',
        label: 'Change login',
        onClick: () => {
          onClose();
          handleLoginChange(provider);
        },
      }}
      secondaryButtonProps={{
        'data-testid': 'confirm-cancel',
        label: 'Cancel',
        onClick: onClose,
      }}
      className="p0"
    />
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
