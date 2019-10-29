import { AccountSettings } from 'linode-js-sdk/lib/account';
import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import { Link } from 'react-router-dom';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import ExpansionPanel from 'src/components/ExpansionPanel';
import ExternalLink from 'src/components/ExternalLink';
import Grid from 'src/components/Grid';
import { cancelObjectStorage } from 'src/services/objectStorage/account';

interface Props {
  update: (data: Partial<AccountSettings>) => void;
  object_storage: AccountSettings['object_storage'];
}

type CombinedProps = Props;

interface ContentProps {
  object_storage: AccountSettings['object_storage'];
  openConfirmationModal: () => void;
}

export const ObjectStorageContent: React.FC<ContentProps> = props => {
  const { object_storage, openConfirmationModal } = props;

  if (object_storage !== 'disabled') {
    return (
      <Grid container direction="column">
        <Grid item>
          <Typography variant="body1">
            Object Storage is enabled on your account. To cancel Object Storage,
            all buckets must be removed from the account. For more information
            on how to delete large amounts of objects within a bucket, consult
            our guide on{' '}
            <ExternalLink
              fixedIcon
              text="lifecycle policies."
              link="https://www.linode.com/docs/platform/object-storage/lifecycle-policies/"
            />
          </Typography>
        </Grid>
        <Grid item>
          <Button
            buttonType="secondary"
            destructive
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

export const EnableObjectStorage: React.FC<CombinedProps> = props => {
  const { object_storage, update } = props;
  const [isOpen, setOpen] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>();
  const [isLoading, setLoading] = React.useState<boolean>(false);

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
        update({ object_storage: 'disabled' });
        handleClose();
      })
      .catch(handleError);
  };

  const actions = () => (
    <ActionsPanel>
      <Button buttonType="cancel" onClick={handleClose}>
        Cancel
      </Button>

      <Button
        buttonType="secondary"
        destructive
        onClick={handleSubmit}
        loading={isLoading}
      >
        Confirm cancellation
      </Button>
    </ActionsPanel>
  );

  return (
    <>
      <ExpansionPanel heading="Object Storage" defaultExpanded={true}>
        <ObjectStorageContent
          object_storage={object_storage}
          openConfirmationModal={() => setOpen(true)}
        />
      </ExpansionPanel>
      <ConfirmationDialog
        open={isOpen}
        error={error}
        onClose={() => handleClose()}
        title="Just to confirm..."
        actions={actions}
      >
        <Typography variant="subtitle1">
          Are you sure you want to cancel Object Storage?
        </Typography>
      </ConfirmationDialog>
    </>
  );
};

export default React.memo(EnableObjectStorage);
