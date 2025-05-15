import { useRegionsQuery } from '@linode/queries';
import { ActionsPanel, Box, Notice } from '@linode/ui';
import { getRegionsByRegionId, isFeatureEnabledV2 } from '@linode/utilities';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { CopyableTextField } from 'src/components/CopyableTextField/CopyableTextField';
import { CopyAllHostnames } from 'src/features/ObjectStorage/AccessKeyLanding/CopyAllHostnames';
import { HostNamesList } from 'src/features/ObjectStorage/AccessKeyLanding/HostNamesList';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useFlags } from 'src/hooks/useFlags';

import type { ObjectStorageKey } from '@linode/api-v4/lib/object-storage';

interface Props {
  objectStorageKey?: null | ObjectStorageKey;
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

  const { data: regionsData } = useRegionsQuery();
  const regionsLookup = regionsData && getRegionsByRegionId(regionsData);

  const flags = useFlags();
  const { account } = useAccountManagement();

  const isObjMultiClusterEnabled = isFeatureEnabledV2(
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
      sx={() => ({
        '.MuiPaper-root': {
          overflow: 'hidden',
        },
      })}
      title={title}
    >
      <StyledNotice
        spacingTop={8}
        text={`${
          objectStorageKey ? 'Your keys have been generated.' : ''
        } For security purposes, we can only display your ${
          objectStorageKey ? 'secret key' : title.toLowerCase()
        } once, after which it can\u{2019}t be recovered. Be sure to keep it in a safe place.`}
        variant="warning"
      />
      {/* @TODO OBJ Multicluster: The objectStorageKey check is a temporary fix
      to handle error cases when the feature flag is enabled without Mock
      Service Worker (MSW). This can be removed during the feature flag cleanup. */}
      {isObjMultiClusterEnabled &&
        objectStorageKey &&
        objectStorageKey?.regions?.length > 0 && (
          <div>
            <CopyAllHostnames
              hideShowAll={Boolean(
                objectStorageKey && objectStorageKey?.regions?.length <= 1
              )}
              text={
                objectStorageKey?.regions
                  .map(
                    (region) =>
                      `${regionsLookup?.[region.id]?.label}: ${
                        region.s3_endpoint
                      }`
                  )
                  .join('\n') ?? ''
              }
            />
          </div>
        )}
      {/* @TODO OBJ Multicluster: The objectStorageKey check is a temporary fix
      to handle error cases when the feature flag is enabled without Mock
      Service Worker (MSW). This can be removed during the feature flag cleanup. */}
      {isObjMultiClusterEnabled &&
        objectStorageKey &&
        objectStorageKey?.regions?.length > 0 && (
          <HostNamesList objectStorageKey={objectStorageKey} />
        )}

      {objectStorageKey ? (
        <>
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
        </>
      ) : value ? (
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
