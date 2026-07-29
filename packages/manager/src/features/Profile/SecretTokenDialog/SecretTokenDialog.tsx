import { ActionsPanel, Box, Notice } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { CopyableTextField } from 'src/components/CopyableTextField/CopyableTextField';

interface Props {
  onClose: () => void;
  open: boolean;
  title: string;
  value?: string | undefined;
}

const renderActions = (
  onClose: () => void,
  modalConfirmationButtonText: string
) => (
  <ActionsPanel
    primaryButtonProps={{
      'data-testid': 'confirm',
      label: modalConfirmationButtonText,
      onClick: onClose,
    }}
  />
);

export const SecretTokenDialog = (props: Props) => {
  const { onClose, open, title, value } = props;

  const modalConfirmationButtonText = `I Have Saved My ${title}`;

  const actions = renderActions(onClose, modalConfirmationButtonText);

  return (
    <ConfirmationDialog
      actions={actions}
      disableEscapeKeyDown
      fullWidth
      maxWidth="sm"
      onClose={onClose}
      open={open}
      sx={() => ({
        '.MuiPaper-root': {
          overflow: 'hidden',
        },
      })}
      title={title}
    >
      <StyledNotice
        spacingTop={8}
        text={`For security purposes, we can only display your ${title.toLowerCase()} once, after which it can\u{2019}t be recovered. Be sure to keep it in a safe place.`}
        variant="warning"
      />

      {value ? (
        <Box marginBottom="16px">
          <CopyableTextField
            expand
            label={title}
            showDownloadIcon
            spellCheck={false}
            value={value || ''}
          />
        </Box>
      ) : null}
    </ConfirmationDialog>
  );
};

const StyledNotice = styled(Notice, {
  label: 'StyledNotice',
})(() => ({
  '& .noticeText': {
    color: 'inherit',
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    lineHeight: 'inherit',
  },
}));
