import { useAccountSettings, useProfile } from '@linode/queries';
import {
  Accordion,
  Box,
  Button,
  CircleProgress,
  Notice,
  Stack,
  Typography,
} from '@linode/ui';
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { useCancelObjectStorageMutation } from 'src/queries/object-storage/queries';

export const ObjectStorageSettings = () => {
  const { data: profile } = useProfile();
  const { data: accountSettings, isLoading } = useAccountSettings();

  const {
    error,
    isPending: isCancelLoading,
    mutateAsync: cancelObjectStorage,
    reset,
  } = useCancelObjectStorageMutation();

  const username = profile?.username;

  const [isCancelDialogOpen, setIsCancelDialogOpen] =
    React.useState<boolean>(false);

  const handleCloseCancelDialog = () => {
    setIsCancelDialogOpen(false);
    reset();
  };

  const handleCancelObjectStorage = () => {
    cancelObjectStorage().then(() => {
      handleCloseCancelDialog();
      enqueueSnackbar('Object Storage successfully canceled.', {
        variant: 'success',
      });
    });
  };

  if (isLoading) {
    return <CircleProgress />;
  }

  return (
    <>
      <Accordion defaultExpanded heading="Object Storage">
        {accountSettings?.object_storage === 'active' ? (
          <Stack spacing={2}>
            <Typography variant="body1">
              Object Storage is enabled on your account. Upon cancellation, all
              Object Storage Access Keys will be revoked, all buckets will be
              removed, and their objects deleted.
            </Typography>
            <Box>
              <Button
                buttonType="outlined"
                onClick={() => setIsCancelDialogOpen(true)}
              >
                Cancel Object Storage
              </Button>
            </Box>
          </Stack>
        ) : (
          <Typography variant="body1">
            Content storage and delivery for unstructured data. Great for
            multimedia, static sites, software delivery, archives, and data
            backups. <br />
            To get started with Object Storage, create a{' '}
            <Link to="/object-storage/buckets">Bucket</Link> or an{' '}
            <Link to="/object-storage/access-keys">Access Key.</Link>{' '}
            <Link to="https://www.linode.com/docs/platform/object-storage/">
              Learn more
            </Link>
            .
          </Typography>
        )}
      </Accordion>
      <TypeToConfirmDialog
        entity={{
          action: 'cancellation',
          name: username,
          primaryBtnText: 'Confirm Cancellation',
          subType: 'ObjectStorage',
          type: 'AccountSetting',
        }}
        errors={error}
        label="Username"
        loading={isCancelLoading}
        onClick={handleCancelObjectStorage}
        onClose={handleCloseCancelDialog}
        open={isCancelDialogOpen}
        title="Cancel Object Storage"
      >
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
