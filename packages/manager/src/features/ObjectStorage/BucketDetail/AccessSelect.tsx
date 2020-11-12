import { ACLType } from '@linode/api-v4/lib/object-storage';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import FormControlLabel from 'src/components/core/FormControlLabel';
import { makeStyles, Theme } from 'src/components/core/styles';
import EnhancedSelect from 'src/components/EnhancedSelect';
import { Item } from 'src/components/EnhancedSelect/Select';
import Notice from 'src/components/Notice';
import Toggle from 'src/components/Toggle';
import useOpenClose from 'src/hooks/useOpenClose';
import capitalize from 'src/utilities/capitalize';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import { aclOptions } from '../utilities';

const useStyles = makeStyles((theme: Theme) => ({
  submitButton: { marginTop: theme.spacing(2) }
}));

interface AccessPayload {
  acl: ACLType;
  cors_enabled?: boolean;
}

export interface Props {
  variant: 'bucket' | 'object';
  name: string;
  getAccess: () => Promise<AccessPayload>;
  updateAccess: (
    acl: ACLType,
    cors_enabled?: boolean
  ) => Promise<AccessPayload>;
}

type CombinedProps = Props;

const AccessSelect: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { getAccess, updateAccess, name, variant } = props;

  // Access data for this Object (from the API).
  const [aclData, setACLData] = React.useState<ACLType | null>(null);
  const [corsData, setCORSData] = React.useState(true);

  const [accessLoading, setAccessLoading] = React.useState(false);
  const [accessError, setAccessError] = React.useState('');

  // The ACL Option currently selected in the <EnhancedSelect /> component.
  const [selectedACL, setSelectedACL] = React.useState<ACLType | null>(null);
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
        setACLData(acl);
        setSelectedACL(acl);
        if (typeof cors_enabled !== 'undefined') {
          setCORSData(cors_enabled);
          setSelectedCORSOption(cors_enabled);
        }
      })
      .catch(err => {
        setAccessLoading(false);
        setAccessError(getErrorStringOrDefault(err));
      });
  }, [getAccess]);

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
      .catch(err => {
        setUpdateAccessLoading(false);
        setUpdateAccessError(getErrorStringOrDefault(err));
      });
  };

  // An Object/Bucket's ACL is "custom" is the user has done things with the s3
  // API directly (instead of using one of the canned ACLs). "Custom" is not a
  // selectable option, but it is (potentially) returned by the API, so we
  // present it here as a disabled option.
  const _options =
    aclData === 'custom'
      ? [{ label: 'Custom', value: 'custom' }, ...aclOptions]
      : aclOptions;

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

      <EnhancedSelect
        label={`Access (${label} ACL)`}
        placeholder={accessLoading ? 'Loading access...' : 'Select an ACL...'}
        isClearable={false}
        options={_options}
        isLoading={accessLoading}
        disabled={accessLoading || accessError}
        errorText={accessError || updateAccessError}
        onChange={(selected: Item<ACLType> | null) => {
          if (selected) {
            setUpdateAccessSuccess(false);
            setUpdateAccessError('');
            setSelectedACL(selected.value);
          }
        }}
        value={_options.find(
          thisOption => thisOption.value === selectedACL ?? 'private'
        )}
        data-testid="acl-select"
      />
      {variant === 'bucket' ? (
        <FormControlLabel
          style={{ marginTop: 8, display: 'block' }}
          control={
            <Toggle
              disabled={accessLoading}
              onChange={() => setSelectedCORSOption(prev => !prev)}
              checked={selectedCORSOption}
            />
          }
          label={CORSLabel}
        />
      ) : null}

      <Button
        className={classes.submitButton}
        buttonType="primary"
        onClick={() => {
          if (selectedACL === 'public-read-write') {
            openDialog();
          } else {
            handleSubmit();
          }
        }}
        disabled={aclData === selectedACL && corsData === selectedCORSOption}
        loading={updateAccessLoading}
      >
        Save
      </Button>

      <ConfirmationDialog
        title={`Confirm ${label} Access`}
        open={isOpen}
        onClose={closeDialog}
        actions={() => (
          <ActionsPanel style={{ padding: 0 }}>
            <Button buttonType="cancel" onClick={closeDialog} data-qa-cancel>
              Cancel
            </Button>
            <Button buttonType="secondary" destructive onClick={handleSubmit}>
              Confirm
            </Button>
          </ActionsPanel>
        )}
      >
        Are you sure want make {name} writable by everyone? This is not
        recommended for most use cases.
      </ConfirmationDialog>
    </>
  );
};

export default React.memo(AccessSelect);
