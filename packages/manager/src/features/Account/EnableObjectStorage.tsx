import { AccountSettings } from '@linode/api-v4/lib/account';
import { cancelObjectStorage } from '@linode/api-v4/lib/object-storage';
import { APIError } from '@linode/api-v4/lib/types';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { useQueryClient } from 'react-query';

import { Accordion } from 'src/components/Accordion';
import { Button } from 'src/components/Button/Button';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { Typography } from 'src/components/Typography';
import { updateAccountSettingsData } from 'src/queries/accountSettings';
import { queryKey } from 'src/queries/objectStorage';
import { useProfile } from 'src/queries/profile';
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
      <Grid container direction="column" spacing={2}>
        <Grid>
          <Typography variant="body1">
            Object Storage is enabled on your account. Upon cancellation, all
            Object Storage Access Keys will be revoked, all buckets will be
            removed, and their objects deleted.
          </Typography>
        </Grid>
        <Grid>
          <Button
            buttonType="outlined"
            data-testid="open-dialog-button"
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
      static sites, software delivery, archives, and data backups. <br />
      To get started with Object Storage, create a{' '}
      <Link to="/object-storage/buckets">Bucket</Link> or an{' '}
      <Link to="/object-storage/access-keys">Access Key.</Link>{' '}
      <Link to="https://www.linode.com/docs/platform/object-storage/">
        Learn more
      </Link>
      .
    </Typography>
  );
};

export const EnableObjectStorage = (props: Props) => {
  const { object_storage } = props;
  const [isOpen, setOpen] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>();
  const [isLoading, setLoading] = React.useState<boolean>(false);
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const username = profile?.username;

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
        updateAccountSettingsData({ object_storage: 'disabled' }, queryClient);
        handleClose();
        queryClient.invalidateQueries(`${queryKey}-buckets`);
        queryClient.invalidateQueries(`${queryKey}-access-keys`);
      })
      .catch(handleError);
  };

  return (
    <>
      <Accordion defaultExpanded={true} heading="Object Storage">
        <ObjectStorageContent
          object_storage={object_storage}
          openConfirmationModal={() => setOpen(true)}
        />
      </Accordion>
      <TypeToConfirmDialog
        entity={{
          action: 'cancellation',
          name: username,
          primaryBtnText: 'Confirm Cancellation',
          subType: 'ObjectStorage',
          type: 'AccountSetting',
        }}
        label={'Username'}
        loading={isLoading}
        onClick={handleSubmit}
        onClose={handleClose}
        open={isOpen}
        title={`Cancel Object Storage`}
      >
        {error ? <Notice variant="error" text={error} /> : null}
        <Notice variant="warning">
          <Typography sx={{ fontSize: '0.875rem' }}>
            <strong>Warning:</strong> Canceling Object Storage will permanently
            delete all buckets and their objects. Object Storage Access Keys
            will be revoked.
          </Typography>
        </Notice>
      </TypeToConfirmDialog>
    </>
  );
};

export default React.memo(EnableObjectStorage);
