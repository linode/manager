import {
  ACLType,
  ObjectStorageObjectACL
} from '@linode/api-v4/lib/object-storage';
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
  getACL: () => Promise<AccessPayload>;
  updateACL: (
    acl: ACLType,
    cors_enabled?: boolean
  ) => Promise<ObjectStorageObjectACL>; // | ObjectStorageBucketACL type
  name: string;
}

type CombinedProps = Props;

const ACLSelect: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { getACL, updateACL, name, variant } = props;

  // ACL data for this Object (from the API).
  const [aclData, setACLData] = React.useState<ACLType | null>(null);
  const [corsData, setCORSData] = React.useState(true);
  const [aclLoading, setACLLoading] = React.useState(false);
  const [aclError, setACLError] = React.useState('');

  // The ACL Option currently selected in the <EnhancedSelect /> component.
  const [selectedACL, setSelectedACL] = React.useState<ACLType | null>(null);
  const [corsEnabled, setCorsEnabled] = React.useState(true);

  // State for submitting the ACL option.
  const [updateACLLoading, setUpdateACLLoading] = React.useState(false);
  const [updateACLError, setUpdateACLError] = React.useState('');
  const [updateACLSuccess, setUpdateACLSuccess] = React.useState(false);

  // State for dealing with the confirmation modal when selecting read/write.
  const { open: openDialog, isOpen, close: closeDialog } = useOpenClose();

  const label = capitalize(variant);

  React.useEffect(() => {
    setUpdateACLError('');
    setACLError('');
    setUpdateACLSuccess(false);
    setACLLoading(true);
    getACL()
      .then(({ acl, cors_enabled }) => {
        setACLLoading(false);
        setACLData(acl);
        setSelectedACL(acl);
        if (typeof cors_enabled !== 'undefined') {
          setCorsEnabled(cors_enabled);
          setCORSData(cors_enabled);
        }
      })
      .catch(err => {
        setACLLoading(false);
        setACLError(getErrorStringOrDefault(err));
      });
  }, [getACL]);

  const handleSubmit = () => {
    // TS safety check.
    if (!name || !selectedACL) {
      return;
    }

    setUpdateACLSuccess(false);
    setUpdateACLLoading(true);
    setUpdateACLError('');
    setACLError('');
    closeDialog();

    updateACL(selectedACL, corsEnabled)
      .then(() => {
        setUpdateACLSuccess(true);
        setACLData(selectedACL);
        setUpdateACLLoading(false);
      })
      .catch(err => {
        setUpdateACLLoading(false);
        setUpdateACLError(getErrorStringOrDefault(err));
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

  return (
    <>
      {updateACLSuccess ? (
        <Notice success text={`${label} access updated successfully.`} />
      ) : null}

      <EnhancedSelect
        label={`Access (${label} ACL)`}
        placeholder={aclLoading ? 'Loading access...' : 'Select an ACL...'}
        isClearable={false}
        options={_options}
        isLoading={aclLoading}
        disabled={aclLoading || aclError}
        errorText={aclError || updateACLError}
        onChange={(selected: Item<ACLType> | null) => {
          if (selected) {
            setUpdateACLSuccess(false);
            setUpdateACLError('');
            setSelectedACL(selected.value);
          }
        }}
        isOptionDisabled={(item: Item<ACLType>) => item.value === 'custom'}
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
              disabled={aclLoading}
              onChange={() => setCorsEnabled(prev => !prev)}
              checked={corsEnabled}
            />
          }
          label={aclLoading ? 'Loading access...' : 'CORS Enabled'}
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
        disabled={aclData === selectedACL && corsData === corsEnabled}
        loading={updateACLLoading}
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

export default ACLSelect;
