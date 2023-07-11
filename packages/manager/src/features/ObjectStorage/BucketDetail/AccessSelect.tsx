import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import EnhancedSelect from 'src/components/EnhancedSelect';
import ExternalLink from 'src/components/ExternalLink';
import FormControlLabel from 'src/components/core/FormControlLabel';
import { Typography } from 'src/components/Typography';
import useOpenClose from 'src/hooks/useOpenClose';
import { ACLType } from '@linode/api-v4/lib/object-storage';
import { bucketACLOptions, objectACLOptions } from '../utilities';
import { capitalize } from 'src/utilities/capitalize';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { copy } from './AccessSelect.data';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import { Notice } from 'src/components/Notice/Notice';
import { Theme, styled } from '@mui/material/styles';
import { Toggle } from 'src/components/Toggle';

interface AccessPayload {
  acl: ACLType;
  cors_enabled?: boolean;
}

export interface Props {
  getAccess: () => Promise<AccessPayload>;
  name: string;
  updateAccess: (acl: ACLType, cors_enabled?: boolean) => Promise<{}>;
  variant: 'bucket' | 'object';
}

export const AccessSelect = React.memo((props: Props) => {
  const { getAccess, updateAccess, name, variant } = props;
  // Access data for this Object (from the API).
  const [aclData, setACLData] = React.useState<ACLType | null>(null);
  const [corsData, setCORSData] = React.useState(true);
  const [accessLoading, setAccessLoading] = React.useState(false);
  const [accessError, setAccessError] = React.useState('');
  // The ACL Option currently selected in the <EnhancedSelect /> component.
  const [selectedACL, setSelectedACL] = React.useState<ACLType | null>(null);
  // The CORS Option currently selected in the <Toggle /> component.
  const [selectedCORSOption, setSelectedCORSOption] = React.useState(true);
  // State for submitting access options.
  const [updateAccessLoading, setUpdateAccessLoading] = React.useState(false);
  const [updateAccessError, setUpdateAccessError] = React.useState('');
  const [updateAccessSuccess, setUpdateAccessSuccess] = React.useState(false);
  // State for dealing with the confirmation modal when selecting read/write.
  const { open: openDialog, isOpen, close: closeDialog } = useOpenClose();
  const label = capitalize(variant);

  React.useEffect(() => {
    setUpdateAccessError('');
    setAccessError('');
    setUpdateAccessSuccess(false);
    setAccessLoading(true);
    getAccess()
      .then(({ acl, cors_enabled }) => {
        setAccessLoading(false);
        // Don't show "public-read-write" for Objects here; use "custom" instead
        // since "public-read-write" Objects are basically the same as "public-read".
        const _acl =
          variant === 'object' && acl === 'public-read-write' ? 'custom' : acl;
        setACLData(_acl);
        setSelectedACL(_acl);
        if (typeof cors_enabled !== 'undefined') {
          setCORSData(cors_enabled);
          setSelectedCORSOption(cors_enabled);
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

  return (
    <>
      {updateAccessSuccess ? (
        <Notice success text={`${label} access updated successfully.`} />
      ) : null}

      {errorText ? <Notice error text={errorText} /> : null}

      <EnhancedSelect
        label="Access Control List (ACL)"
        placeholder={accessLoading ? 'Loading access...' : 'Select an ACL...'}
        isClearable={false}
        options={_options}
        isLoading={accessLoading}
        disabled={accessLoading}
        onChange={(selected) => {
          if (selected) {
            setUpdateAccessSuccess(false);
            setUpdateAccessError('');
            setSelectedACL(selected.value as ACLType);
          }
        }}
        value={_options.find(
          (thisOption) => thisOption.value === selectedACL ?? 'private'
        )}
        data-testid="acl-select"
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
          style={{ marginTop: 16, display: 'block' }}
          control={
            <Toggle
              disabled={accessLoading}
              onChange={() => setSelectedCORSOption((prev) => !prev)}
              checked={selectedCORSOption}
            />
          }
          label={CORSLabel}
        />
      ) : null}

      {variant === 'bucket' ? (
        <Typography>
          Whether Cross-Origin Resource Sharing is enabled for all origins. For
          more fine-grained control of CORS, please use another{' '}
          <ExternalLink
            text="S3-compatible tool"
            hideIcon
            link="https://www.linode.com/docs/guides/how-to-use-object-storage/#object-storage-tools"
          />
          .
        </Typography>
      ) : null}

      <ActionsPanel
        showPrimary
        primaryButtonDisabled={
          aclData === selectedACL && corsData === selectedCORSOption
        }
        primaryButtonHandler={() => {
          // This isn't really a sane option: open a dialog for confirmation.
          if (selectedACL === 'public-read-write') {
            openDialog();
          } else {
            handleSubmit();
          }
        }}
        primaryButtonLoading={updateAccessLoading}
        primaryButtonSx={(theme: Theme) => ({
          marginTop: theme.spacing(3),
        })}
        primaryButtonText="Save"
        style={{ padding: 0 }}
      />

      <ConfirmationDialog
        title={`Confirm ${label} Access`}
        open={isOpen}
        onClose={closeDialog}
        actions={() => (
          <ActionsPanel
            style={{ padding: 0 }}
            showSecondary
            secondaryButtonHandler={closeDialog}
            secondaryButtonText="Cancel"
            secondaryButtonDataTestId="cancel"
            showPrimary
            primaryButtonHandler={handleSubmit}
            primaryButtonText="Confirm"
          />
        )}
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
})(({ theme }) => ({}));
