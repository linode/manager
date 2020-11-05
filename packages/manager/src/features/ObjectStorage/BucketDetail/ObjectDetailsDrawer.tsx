import {
  ACLType,
  getObjectACL,
  updateObjectACL
} from '@linode/api-v4/lib/object-storage';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import CopyTooltip from 'src/components/CopyTooltip';
import Divider from 'src/components/core/Divider';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import EnhancedSelect from 'src/components/EnhancedSelect';
import { Item } from 'src/components/EnhancedSelect/Select';
import ExternalLink from 'src/components/ExternalLink';
import Notice from 'src/components/Notice';
import useOpenClose from 'src/hooks/useOpenClose';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import formatDate from 'src/utilities/formatDate';
import { truncateMiddle } from 'src/utilities/truncate';
import { readableBytes } from 'src/utilities/unitConversions';
import { aclOptions } from '../utilities';

const useStyles = makeStyles((theme: Theme) => ({
  divider: {
    marginTop: 16,
    marginBottom: 16,
    height: 1,
    backgroundColor: '#EBEBEB'
  },
  copy: { marginTop: 16, padding: 0 },
  submitButton: { marginTop: theme.spacing(2) }
}));

export interface Props {
  open: boolean;
  onClose: () => void;
  name?: string;
  displayName?: string;
  size?: number | null;
  lastModified?: string | null;
  url?: string;
  bucketName: string;
  clusterId: string;
}

const ObjectDetailsDrawer: React.FC<Props> = props => {
  const classes = useStyles();

  const {
    open,
    onClose,
    name,
    displayName,
    size,
    lastModified,
    url,
    bucketName,
    clusterId
  } = props;

  // ACL data for this Object (from the API).
  const [aclData, setACLData] = React.useState<ACLType | null>(null);
  const [aclLoading, setACLLoading] = React.useState(false);
  const [aclError, setACLError] = React.useState('');

  // The ACL Option currently selected in the <EnhancedSelect /> component.
  const [selectedACL, setSelectedACL] = React.useState<ACLType | null>(null);

  // State for submitting the ACL option.
  const [updateACLLoading, setUpdateACLLoading] = React.useState(false);
  const [updateACLError, setUpdateACLError] = React.useState('');
  const [updateACLSuccess, setUpdateACLSuccess] = React.useState(false);

  // State for dealing with the confirmation modal when selecting read/write.
  const { open: openDialog, isOpen, close } = useOpenClose();

  React.useEffect(() => {
    // When the drawer is opened, clear out all old state.
    if (open && name) {
      setACLData(null);
      setSelectedACL(null);
      setACLLoading(true);
      setUpdateACLError('');
      setACLError('');
      setUpdateACLSuccess(false);

      // Then, get the current Object's ACL information.
      getObjectACL(clusterId, bucketName, name)
        .then(({ acl }) => {
          setACLLoading(false);
          setACLData(acl);
          setSelectedACL(acl);
        })
        .catch(err => {
          setACLLoading(false);
          setACLError(getErrorStringOrDefault(err));
        });
    }
  }, [open, clusterId, bucketName, name]);

  const handleSubmit = () => {
    // TS safety check.
    if (!name || !selectedACL) {
      return;
    }

    setUpdateACLSuccess(false);
    setUpdateACLLoading(true);
    setUpdateACLError('');
    setACLError('');

    updateObjectACL(clusterId, bucketName, name, selectedACL)
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

  // An Object's ACL is "custom" is the user has done things with the s3 API
  // directly (instead of using one of the canned ACLs). "Custom" s not a
  // selectable option, but it is (potentially) returned by the API, so we
  // present it here as a disabled option.
  const _options =
    aclData === 'custom'
      ? [{ label: 'Custom', value: 'custom' }, ...aclOptions]
      : aclOptions;

  let formattedLastModified;
  try {
    if (lastModified) {
      formattedLastModified = formatDate(lastModified);
    }
  } catch {}

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={truncateMiddle(displayName ?? 'Object Detail')}
    >
      {size ? (
        <Typography variant="subtitle2">
          {readableBytes(size).formatted}
        </Typography>
      ) : null}
      {formattedLastModified ? (
        <Typography variant="subtitle2" data-testid="lastModified">
          Last modified: {formattedLastModified}
        </Typography>
      ) : null}

      <Divider className={classes.divider} />

      {url ? (
        <>
          <ExternalLink link={url} text={truncateMiddle(url, 50)} />
          <CopyTooltip
            className={classes.copy}
            text={url}
            displayText="Copy to clipboard"
          />
        </>
      ) : null}

      <Divider className={classes.divider} />

      {updateACLSuccess ? (
        <Notice success text="Object access updated successfully." />
      ) : null}

      <EnhancedSelect
        label="Access (Object ACL)"
        placeholder="Loading access..."
        isClearable={false}
        options={_options}
        isLoading={aclLoading}
        disabled={aclLoading}
        errorText={aclError || updateACLError}
        onChange={(selected: Item<ACLType> | null) => {
          if (selected) {
            setUpdateACLSuccess(false);
            setSelectedACL(selected.value);
          }
        }}
        isOptionDisabled={(item: Item<ACLType>) => item.value === 'custom'}
        value={_options.find(
          thisOption => thisOption.value === selectedACL ?? 'private'
        )}
      />

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
        disabled={aclData === selectedACL}
        loading={updateACLLoading}
      >
        Save
      </Button>

      <ConfirmationDialog
        title={`Confirm Object Access`}
        open={isOpen}
        onClose={close}
        actions={() => (
          <ActionsPanel style={{ padding: 0 }}>
            <Button buttonType="cancel" onClick={close} data-qa-cancel>
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
    </Drawer>
  );
};

export default React.memo(ObjectDetailsDrawer);
