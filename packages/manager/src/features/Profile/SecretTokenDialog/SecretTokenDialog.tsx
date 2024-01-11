import { styled } from '@mui/material/styles';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Box } from 'src/components/Box';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { CopyableAndDownloadableTextField } from 'src/components/CopyableAndDownloadableTextField';
import { CopyableTextField } from 'src/components/CopyableTextField/CopyableTextField';
import { Notice } from 'src/components/Notice/Notice';
import { CopyAll } from 'src/features/ObjectStorage/AccessKeyLanding/CopyAll';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useFlags } from 'src/hooks/useFlags';
import { isFeatureEnabled } from 'src/utilities/accountCapabilities';

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
  <ActionsPanel
    primaryButtonProps={{
      'data-testid': 'confirm',
      label: modalConfirmationButtonText,
      onClick: onClose,
    }}
  />
);

export const SecretTokenDialog = (props: Props) => {
  const { objectStorageKey, onClose, open, title, value } = props;

  const flags = useFlags();
  const { account } = useAccountManagement();

  const isObjMultiClusterFlagEnabled = isFeatureEnabled(
    'Object Storage Access Key Regions',
    Boolean(flags.objMultiCluster),
    account?.capabilities ?? []
  );

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
        text={`${
          objectStorageKey ? 'Your keys have been generated.' : ''
        } For security purposes, we can only display your ${
          objectStorageKey ? 'secret key' : title.toLowerCase()
        } once, after which it can\u{2019}t be recovered. Be sure to keep it in a safe place.`}
        spacingTop={8}
        variant="warning"
      />
      {isObjMultiClusterFlagEnabled && (
        <div>
          <CopyAll
            text={
              objectStorageKey?.regions
                .map(
                  (region) => `s3 Endpoint: ${region.id}: ${region.s3_endpoint}`
                )
                .join('\n') ?? ''
            }
          />
        </div>
      )}
      {isObjMultiClusterFlagEnabled && (
        <Box
          sx={(theme) => ({
            backgroundColor: theme.bg.main,
            border: `1px solid ${theme.color.grey3}`,
            padding: theme.spacing(1),
          })}
        >
          {objectStorageKey?.regions.map((region, index) => (
            <CopyableTextField
              hideLabel
              key={index}
              label="Create a Filesystem"
              sx={{ border: 'none', maxWidth: '100%' }}
              value={`s3 Endpoint: ${region.id}: ${region.s3_endpoint}`}
            />
          ))}
        </Box>
      )}
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
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    lineHeight: 'inherit',
  },
}));
