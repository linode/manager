import { getRegionsByRegionId } from '@akamai/compute-ui-core/api';
import { useRegionsQuery } from '@linode/queries';
import { ActionsPanel, Box, Notice } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { CopyableTextField } from 'src/components/CopyableTextField/CopyableTextField';

import { CopyAllEndpointHostnames } from '../EndpointHostnames/CopyAllEndpointHostnames';
import { EndpointHostnameList } from '../EndpointHostnames/EndpointHostnameList';

import type { ObjectStorageKey } from '@linode/api-v4';

interface Props {
  objectStorageKey: ObjectStorageKey;
  onClose: () => void;
  open: boolean;
  title: string;
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

export const AccessKeySecretTokenDialog = (props: Props) => {
  const { objectStorageKey, onClose, open, title } = props;

  const { data: regionsData } = useRegionsQuery();
  const regionsLookup = regionsData && getRegionsByRegionId(regionsData);

  const modalConfirmationButtonText = 'I Have Saved My Secret Key';

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
        text={`Your keys have been generated. For security purposes, we can only display your secret key once, after which it can\u{2019}t be recovered. Be sure to keep it in a safe place.`}
        variant="warning"
      />
      <div>
        <CopyAllEndpointHostnames
          hideShowAll={objectStorageKey?.regions?.length <= 1}
          text={
            objectStorageKey?.regions
              .map(
                (region) =>
                  `${regionsLookup?.[region.id]?.label}: ${region.s3_endpoint}`
              )
              .join('\n') ?? ''
          }
        />
      </div>
      <EndpointHostnameList objectStorageKey={objectStorageKey} />

      <Box marginBottom="16px">
        <CopyableTextField
          expand
          label={'Access Key'}
          showDownloadIcon
          spellCheck={false}
          value={objectStorageKey.access_key || ''}
        />
      </Box>
      <Box marginBottom="16px">
        <CopyableTextField
          expand
          label={'Secret Key'}
          showDownloadIcon
          spellCheck={false}
          value={objectStorageKey.secret_key || ''}
        />
      </Box>
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
