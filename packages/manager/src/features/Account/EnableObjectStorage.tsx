import { AccountSettings } from '@linode/api-v4/lib/account';
import { cancelObjectStorage } from '@linode/api-v4/lib/object-storage';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles, Theme } from 'src/components/core/styles';
import Accordion from 'src/components/Accordion';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import TextField from 'src/components/TextField';
import Notice from 'src/components/Notice';
import ExternalLink from 'src/components/ExternalLink';
import Grid from 'src/components/Grid';
import { updateAccountSettingsData } from 'src/queries/accountSettings';
import { useProfile } from 'src/queries/profile';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: '16px !important',
    '& p': {
      lineHeight: 'unset',
      fontFamily: theme.font.normal,
      fontSize: '0.0875rem',
    },
  },
}));

interface Props {
  object_storage: AccountSettings['object_storage'];
}

type CombinedProps = Props;

interface ContentProps {
  object_storage: AccountSettings['object_storage'];
  openConfirmationModal: () => void;
}

export const ObjectStorageContent: React.FC<ContentProps> = (props) => {
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
            />{' '}
            Upon cancellation, all Object Storage Access Keys will be revoked.
          </Typography>
        </Grid>
        <Grid item>
          <Button buttonType="outlined" onClick={openConfirmationModal}>
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

export const EnableObjectStorage: React.FC<CombinedProps> = (props) => {
  const { object_storage } = props;
  const classes = useStyles();
  const [isOpen, setOpen] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>();
  const [usernameInput, setUsername] = React.useState<string>('');

  const [isLoading, setLoading] = React.useState<boolean>(false);

  const { data: profile } = useProfile();

  const handleClose = () => {
    setOpen(false);
    setError(undefined);
  };

  const handleError = (e: APIError[]) => {
    setError(e[0].reason);
    setLoading(false);
  };
  ``;

  const handleSubmit = () => {
    setLoading(true);
    setError(undefined);
    cancelObjectStorage()
      .then(() => {
        updateAccountSettingsData({ object_storage: 'disabled' });
        handleClose();
      })
      .catch(handleError);
  };

  const actions = () => (
    <ActionsPanel>
      <Button buttonType="secondary" onClick={handleClose}>
        Close
      </Button>

      <Button
        disabled={profile?.username !== usernameInput}
        buttonType="primary"
        onClick={handleSubmit}
        loading={isLoading}
      >
        Cancel Object Storage
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
        <Notice
          warning
          className={classes.root}
          text="Canceling Object Storage will permanently delete all buckets and their objects. Object Storage Access Keys will be revoked."
        />
        <Typography variant="body1">
          To confirm cancellation, type your username in the field below.
        </Typography>
        <TextField
          label="Username"
          value={usernameInput}
          onChange={(e) => setUsername(e.target.value)}
          aria-label="username field"
        />
      </ConfirmationDialog>
    </>
  );
};

export default React.memo(EnableObjectStorage);
