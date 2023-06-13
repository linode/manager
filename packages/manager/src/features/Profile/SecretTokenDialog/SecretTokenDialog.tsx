import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Box from 'src/components/core/Box';
import Button from 'src/components/Button';
import CopyableAndDownloadableTextField from 'src/components/CopyableAndDownloadableTextField';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Notice } from 'src/components/Notice/Notice';
import { styled } from '@mui/material/styles';
import type { ObjectStorageKey } from '@linode/api-v4/lib/object-storage';

interface Props {
  objectStorageKey?: ObjectStorageKey | null;
  onClose: () => void;
  open: boolean;
  title: string;
  value?: string | undefined;
}

const renderActions = (
  onClose: () => void,
  modalConfirmationButtonText: string
) => (
  <ActionsPanel>
    <Button
      buttonType="primary"
      data-qa-confirm
      data-testid="dialog-confirm"
      onClick={onClose}
    >
      {modalConfirmationButtonText}
    </Button>
  </ActionsPanel>
);

export const SecretTokenDialog = (props: Props) => {
  const { title, value, objectStorageKey, open, onClose } = props;

  const modalConfirmationButtonText = objectStorageKey
    ? 'I Have Saved My Secret Key'
    : `I Have Saved My ${title}`;

  const actions = renderActions(onClose, modalConfirmationButtonText);

  return (
    <ConfirmationDialog
      actions={actions}
      disableEscapeKeyDown
      fullWidth
      maxWidth="sm"
      onClose={onClose}
      open={open}
      title={title}
    >
      <StyledNotice
        spacingTop={8}
        warning
        text={`${
          objectStorageKey ? 'Your keys have been generated.' : ''
        } For security purposes, we can only display your ${
          objectStorageKey ? 'secret key' : title.toLowerCase()
        } once, after which it can\u{2019}t be recovered. Be sure to keep it in a safe place.`}
      />
      {objectStorageKey ? (
        <>
          <Box marginBottom="16px">
            <CopyableAndDownloadableTextField
              expand
              label={'Access Key'}
              spellCheck={false}
              value={objectStorageKey.access_key || ''}
            />
          </Box>
          <Box marginBottom="16px">
            <CopyableAndDownloadableTextField
              expand
              label={'Secret Key'}
              spellCheck={false}
              value={objectStorageKey.secret_key || ''}
            />
          </Box>
        </>
      ) : value ? (
        <Box marginBottom="16px">
          <CopyableAndDownloadableTextField
            expand
            label={title}
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
    lineHeight: 'inherit',
    fontFamily: 'inherit',
    fontSize: '0.875rem',
  },
}));
