import { AccountSettings } from '@linode/api-v4/lib/account';
import { cancelObjectStorage } from '@linode/api-v4/lib/object-storage';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Accordion from 'src/components/Accordion';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import Button from 'src/components/Button';
import { Notice } from 'src/components/Notice/Notice';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';
import Grid from '@mui/material/Unstable_Grid2';
import { updateAccountSettingsData } from 'src/queries/accountSettings';
import { useProfile } from 'src/queries/profile';
import { queryKey } from 'src/queries/objectStorage';
import { useQueryClient } from 'react-query';
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
      <Accordion heading="Object Storage" defaultExpanded={true}>
        <ObjectStorageContent
          object_storage={object_storage}
          openConfirmationModal={() => setOpen(true)}
        />
      </Accordion>
      <TypeToConfirmDialog
        title={`Cancel Object Storage`}
        entity={{
          type: 'AccountSetting',
          subType: 'ObjectStorage',
          label: username,
        }}
        open={isOpen}
        loading={isLoading}
        typographyStyle={{ marginTop: '20px' }}
        onClose={handleClose}
        onClick={handleSubmit}
      >
        {error ? <Notice error text={error} /> : null}
        <Notice warning>
          <Typography style={{ fontSize: '0.875rem' }}>
            Deleting this NodeBalancer is permanent and can’t be undone.
          </Typography>
        </Notice>
        <Typography variant="body1">
          Traffic will no longer be routed through this NodeBalancer. Please
          check your DNS settings and either provide the IP address of another
          NodeBalancer, or route traffic directly to your Linode.
        </Typography>
      </TypeToConfirmDialog>
    </>
  );
};

export default React.memo(EnableObjectStorage);
