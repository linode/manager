import { AccountSettings } from '@linode/api-v4/lib/account';
import { cancelObjectStorage } from '@linode/api-v4/lib/object-storage';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Accordion from 'src/components/Accordion';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Notice from 'src/components/Notice';
import TypeToConfirm from 'src/components/TypeToConfirm';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';
import Grid from 'src/components/Grid';
import { updateAccountSettingsData } from 'src/queries/accountSettings';
import { usePreferences } from 'src/queries/preferences';
import { useProfile } from 'src/queries/profile';
import { queryClient } from 'src/queries/base';
import { queryKey } from 'src/queries/objectStorage';

interface Props {
  object_storage: AccountSettings['object_storage'];
}

interface ContentProps extends Props {
  openConfirmationModal: () => void;
}

export const ObjectStorageContent = (props: ContentProps) => {
  const { object_storage, openConfirmationModal } = props;

  if (object_storage !== 'disabled') {
    return (
      <Grid container direction="column">
        <Grid item>
          <Typography variant="body1">
            Object Storage is enabled on your account. Upon cancellation, all
            Object Storage Access Keys will be revoked, all buckets will be
            removed, and their objects deleted.
          </Typography>
        </Grid>
        <Grid item>
          <Button
            data-testid="open-dialog-button"
            buttonType="outlined"
            onClick={openConfirmationModal}
          >
            Cancel Object Storage
          </Button>
        </Grid>
      </Grid>
    );
  }

  return (
    <Typography variant="body1">
      Content storage and delivery for unstructured data. Great for multimedia,
      static sites, software delivery, archives, and data backups. To get
      started with Object Storage, create a{' '}
      <Link to="/object-storage/buckets">Bucket</Link> or an{' '}
      <Link to="/object-storage/access-keys">Access Key.</Link>{' '}
      <ExternalLink
        fixedIcon
        text="Learn more."
        link="https://www.linode.com/docs/platform/object-storage/"
      />
    </Typography>
  );
};

export const EnableObjectStorage = (props: Props) => {
  const { object_storage } = props;
  const [isOpen, setOpen] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>();
  const [isLoading, setLoading] = React.useState<boolean>(false);
  const [confirmText, setConfirmText] = React.useState('');
  const { data: preferences } = usePreferences();
  const { data: profile } = useProfile();
  const username = profile?.username;
  const disabledConfirm =
    preferences?.type_to_confirm !== false && confirmText !== username;

  const handleClose = () => {
    setOpen(false);
    setError(undefined);
  };

  const handleError = (e: APIError[]) => {
    setError(e[0].reason);
    setLoading(false);
  };

  const handleSubmit = () => {
    setLoading(true);
    setError(undefined);
    cancelObjectStorage()
      .then(() => {
        updateAccountSettingsData({ object_storage: 'disabled' });
        handleClose();
        queryClient.invalidateQueries(`${queryKey}-buckets`);
        queryClient.invalidateQueries(`${queryKey}-access-keys`);
      })
      .catch(handleError);
  };

  const actions = (
    <ActionsPanel>
      <Button
        buttonType="secondary"
        onClick={handleClose}
        data-testid="dialog-cancel"
      >
        Cancel
      </Button>

      <Button
        buttonType="primary"
        onClick={handleSubmit}
        disabled={disabledConfirm}
        loading={isLoading}
        data-testid="dialog-confirm"
      >
        Confirm Cancellation
      </Button>
    </ActionsPanel>
  );

  return (
    <>
      <Accordion heading="Object Storage" defaultExpanded={true}>
        <ObjectStorageContent
          object_storage={object_storage}
          openConfirmationModal={() => setOpen(true)}
        />
      </Accordion>
      <ConfirmationDialog
        open={isOpen}
        error={error}
        onClose={() => handleClose()}
        title="Cancel Object Storage"
        actions={actions}
      >
        <Notice warning>
          <Typography style={{ fontSize: '0.875rem' }}>
            <strong>Warning:</strong> Canceling Object Storage will permanently
            delete all buckets and their objects. Object Storage Access Keys
            will be revoked.
          </Typography>
        </Notice>
        <TypeToConfirm
          data-testid="dialog-confirm-text-input"
          label="Username"
          onChange={(input) => setConfirmText(input)}
          expand
          value={confirmText}
          confirmationText={
            <span>
              To confirm cancellation, type your username (<b>{username}</b>) in
              the field below:
            </span>
          }
          visible={preferences?.type_to_confirm}
        />
      </ConfirmationDialog>
    </>
  );
};

export default React.memo(EnableObjectStorage);
