import { styled } from '@mui/material/styles';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Toggle } from 'src/components/Toggle/Toggle';
import { Typography } from 'src/components/Typography';
import { useOpenClose } from 'src/hooks/useOpenClose';
import { capitalize } from 'src/utilities/capitalize';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import { bucketACLOptions, objectACLOptions } from '../utilities';
import { copy } from './AccessSelect.data';

import type {
  ACLType,
  ObjectStorageBucketAccess,
  ObjectStorageObjectACL,
} from '@linode/api-v4/lib/object-storage';
import type { Theme } from '@mui/material/styles';

export interface Props {
  getAccess: () => Promise<ObjectStorageBucketAccess | ObjectStorageObjectACL>;
  name: string;
  updateAccess: (acl: ACLType, cors_enabled?: boolean) => Promise<{}>;
  variant: 'bucket' | 'object';
}

function isUpdateObjectStorageBucketAccessPayload(
  response: ObjectStorageBucketAccess | ObjectStorageObjectACL
): response is ObjectStorageBucketAccess {
  return 'cors_enabled' in response;
}

export const AccessSelect = React.memo((props: Props) => {
  const { getAccess, name, updateAccess, variant } = props;
  // Access data for this Object (from the API).
  const [aclData, setACLData] = React.useState<ACLType | null>(null);
  const [corsData, setCORSData] = React.useState(true);
  const [accessLoading, setAccessLoading] = React.useState(false);
  const [accessError, setAccessError] = React.useState('');
  // The ACL Option currently selected in the <EnhancedSelect /> component.
  const [selectedACL, setSelectedACL] = React.useState<ACLType | null>(null);
  // The CORS Option currently selected in the <Toggle /> component.
  const [selectedCORSOption, setSelectedCORSOption] = React.useState(true); // TODO: OBJGen2 - We need to handle this in upcoming PR
  // State for submitting access options.
  const [updateAccessLoading, setUpdateAccessLoading] = React.useState(false);
  const [updateAccessError, setUpdateAccessError] = React.useState('');
  const [updateAccessSuccess, setUpdateAccessSuccess] = React.useState(false);
  // State for dealing with the confirmation modal when selecting read/write.
  const { close: closeDialog, isOpen, open: openDialog } = useOpenClose();
  const label = capitalize(variant);

  React.useEffect(() => {
    setUpdateAccessError('');
    setAccessError('');
    setUpdateAccessSuccess(false);
    setAccessLoading(true);
    getAccess()
      .then((response) => {
        setAccessLoading(false);
        const { acl } = response;
        // Don't show "public-read-write" for Objects here; use "custom" instead
        // since "public-read-write" Objects are basically the same as "public-read".
        const _acl =
          variant === 'object' && acl === 'public-read-write' ? 'custom' : acl;
        setACLData(_acl);
        setSelectedACL(_acl);
        if (isUpdateObjectStorageBucketAccessPayload(response)) {
          const { cors_enabled } = response;
          if (typeof cors_enabled === 'boolean') {
            setCORSData(cors_enabled);
            setSelectedCORSOption(cors_enabled);
          }
        }
      })
      .catch((err) => {
        setAccessLoading(false);
        setAccessError(getErrorStringOrDefault(err));
      });
  }, [getAccess, variant]);

  const handleSubmit = () => {
    // TS safety check.
    if (!name || !selectedACL) {
      return;
    }

    setUpdateAccessSuccess(false);
    setUpdateAccessLoading(true);
    setUpdateAccessError('');
    setAccessError('');
    closeDialog();

    updateAccess(selectedACL, selectedCORSOption)
      .then(() => {
        setUpdateAccessSuccess(true);
        setACLData(selectedACL);
        setCORSData(selectedCORSOption);
        setUpdateAccessLoading(false);
      })
      .catch((err) => {
        setUpdateAccessLoading(false);
        setUpdateAccessError(getErrorStringOrDefault(err));
      });
  };

  const aclOptions = variant === 'bucket' ? bucketACLOptions : objectACLOptions;

  // An Object/Bucket's ACL is "custom" if the user has done things with the S3
  // API directly (instead of using one of the canned ACLs). "Custom" is not a
  // valid option, but it is (potentially) returned by the API, so we
  // present it here (though the form cannot be submitted with it selected.)
  //
  // Another situation where this may happen is if the user has used the API to
  // select "public-read-write" as an Object ACL, which is just equivalent to
  // "public-read", so we don't present it as an option.
  const _options =
    aclData === 'custom'
      ? [{ label: 'Custom', value: 'custom' }, ...aclOptions]
      : aclOptions;

  const aclLabel = _options.find(
    (thisOption) => thisOption.value === selectedACL
  )?.label;

  const aclCopy = selectedACL ? copy[variant][selectedACL] : null;

  const errorText = accessError || updateAccessError;

  const CORSLabel = accessLoading
    ? 'Loading access...'
    : selectedCORSOption
    ? 'CORS Enabled'
    : 'CORS Disabled';

  const selectedOption =
    _options.find((thisOption) => thisOption.value === selectedACL) ??
    _options.find((thisOption) => thisOption.value === 'private');

  return (
    <>
      {updateAccessSuccess ? (
        <Notice
          text={`${label} access updated successfully.`}
          variant="success"
        />
      ) : null}

      {errorText ? <Notice text={errorText} variant="error" /> : null}

      <Autocomplete
        onChange={(_, selected) => {
          if (selected) {
            setUpdateAccessSuccess(false);
            setUpdateAccessError('');
            setSelectedACL(selected.value as ACLType);
          }
        }}
        data-testid="acl-select"
        disableClearable
        disabled={Boolean(accessError) || accessLoading}
        label="Access Control List (ACL)"
        loading={accessLoading}
        options={!accessLoading ? _options : []}
        placeholder={accessLoading ? 'Loading access...' : 'Select an ACL...'}
        value={!accessLoading ? selectedOption : undefined}
      />

      <div style={{ marginTop: 8, minHeight: 16 }}>
        {aclLabel && aclCopy ? (
          <Typography>
            {aclLabel}: {aclCopy}
          </Typography>
        ) : null}
      </div>

      {variant === 'bucket' ? (
        <FormControlLabel
          control={
            <Toggle
              checked={selectedCORSOption}
              disabled={accessLoading}
              onChange={() => setSelectedCORSOption((prev) => !prev)}
            />
          }
          label={CORSLabel}
          style={{ display: 'block', marginTop: 16 }}
        />
      ) : null}

      {variant === 'bucket' ? (
        <Typography>
          Whether Cross-Origin Resource Sharing is enabled for all origins. For
          more fine-grained control of CORS, please use another{' '}
          <Link to="https://www.linode.com/docs/guides/how-to-use-object-storage/#object-storage-tools">
            S3-compatible tool
          </Link>
          .
        </Typography>
      ) : null}

      <ActionsPanel
        primaryButtonProps={{
          disabled: aclData === selectedACL && corsData === selectedCORSOption,
          label: 'Save',
          loading: updateAccessLoading,
          onClick: () => {
            // This isn't really a sane option: open a dialog for confirmation.
            if (selectedACL === 'public-read-write') {
              openDialog();
            } else {
              handleSubmit();
            }
          },
          sx: (theme: Theme) => ({
            marginTop: theme.spacing(3),
          }),
        }}
        style={{ padding: 0 }}
      />

      <ConfirmationDialog
        actions={() => (
          <ActionsPanel
            secondaryButtonProps={{
              'data-testid': 'cancel',
              label: 'Cancel',
              onClick: closeDialog,
            }}
            primaryButtonProps={{ label: 'Confirm', onClick: handleSubmit }}
            style={{ padding: 0 }}
          />
        )}
        onClose={closeDialog}
        open={isOpen}
        title={`Confirm ${label} Access`}
      >
        Are you sure you want to set access for {name} to Public Read/Write?
        Everyone will be able to list, create, overwrite, and delete Objects in
        this Bucket. <strong>This is not recommended.</strong>
      </ConfirmationDialog>
    </>
  );
});

export const StyledSubmitButton = styled(Button, {
  label: 'StyledFileUploadsContainer',
})(({ theme }) => ({
  marginTop: theme.spacing(3),
}));
