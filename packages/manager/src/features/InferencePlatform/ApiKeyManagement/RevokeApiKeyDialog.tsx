import { useRevokeInferenceApiKeyMutation } from '@linode/queries';
import { ActionsPanel, Box, Notice } from '@linode/ui';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { TypeToConfirm } from 'src/components/TypeToConfirm/TypeToConfirm';

import type { ApiKey } from '@linode/api-v4';

interface RevokeApiKeyDialogProps {
  apiKey: ApiKey | null;
  onClose: () => void;
  open: boolean;
}

export const RevokeApiKeyDialog = ({
  apiKey,
  onClose,
  open,
}: RevokeApiKeyDialogProps) => {
  const [confirmationText, setConfirmationText] = React.useState('');

  const {
    error,
    isPending: isRevoking,
    mutateAsync: revokeApiKey,
    reset,
  } = useRevokeInferenceApiKeyMutation();

  const handleRevoke = () => {
    if (!apiKey) return;

    revokeApiKey(apiKey.id).then(() => {
      onClose();
    });
  };

  const handleClose = () => {
    reset();
    setConfirmationText('');
    onClose();
  };

  const isConfirmationValid = confirmationText === apiKey?.label;

  const actions = (
    <ActionsPanel
      primaryButtonProps={{
        color: 'error',
        'data-testid': 'revoke-api-key-confirm',
        disabled: !isConfirmationValid,
        label: 'Revoke API key',
        loading: isRevoking,
        onClick: handleRevoke,
      }}
      secondaryButtonProps={{
        'data-testid': 'revoke-api-key-cancel',
        label: 'Cancel',
        onClick: handleClose,
      }}
      style={{ padding: 0 }}
    />
  );

  return (
    <ConfirmationDialog
      actions={actions}
      error={error?.[0]?.reason}
      onClose={handleClose}
      open={open}
      title={`Revoke key ${apiKey?.label ?? ''}`}
    >
      <Notice spacingBottom={16} variant="warning">
        <span>Are you sure you want to revoke this key?</span>
        <br />
        <span>This action cannot be undone.</span>
      </Notice>
      <TypeToConfirm
        confirmationText={
          <Box
            alignItems="center"
            component="span"
            display="inline-flex"
            gap={0.5}
          >
            <span>Confirm by typing the name of the API Key:</span>
            <Box
              component="span"
              sx={(theme) => ({
                backgroundColor:
                  theme.name === 'dark'
                    ? theme.tokens.color.Neutrals[70]
                    : theme.tokens.color.Neutrals[10],
                borderRadius: '4px',
                color: theme.palette.text.primary,
                fontFamily: theme.tokens.font.FontFamily.Code,
                px: 1,
                py: 0.25,
              })}
            >
              {apiKey?.label}
            </Box>
            <CopyTooltip copyableText={false} text={apiKey?.label ?? ''} />
          </Box>
        }
        expand
        hideInstructions
        label="API Key Name"
        onChange={(value) => setConfirmationText(value)}
        value={confirmationText}
        visible
      />
    </ConfirmationDialog>
  );
};
