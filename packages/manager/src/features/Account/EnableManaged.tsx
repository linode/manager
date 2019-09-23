import { AccountSettings } from 'linode-js-sdk/lib/account';
import { enableManaged } from 'linode-js-sdk/lib/managed';
import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import ExpansionPanel from 'src/components/ExpansionPanel';
import ExternalLink from 'src/components/ExternalLink';
import Grid from 'src/components/Grid';
import SupportLink from 'src/components/SupportLink';
import withLinodes from 'src/containers/withLinodes.container';
import useFlags from 'src/hooks/useFlags';
import { pluralize } from 'src/utilities/pluralize';

interface Props {
  isManaged: boolean;
  update: (data: Partial<AccountSettings>) => void;
  push: (url: string) => void;
}

interface StateProps {
  linodeCount: number;
}

type CombinedProps = Props & StateProps;

interface ContentProps {
  isManaged: boolean;
  openConfirmationModal: () => void;
}
export const ManagedContent: React.FC<ContentProps> = props => {
  const { isManaged, openConfirmationModal } = props;

  if (isManaged) {
    return (
      <Typography>
        Managed is already enabled on your account. To cancel Linode Managed,
        please open a {` `}
        <SupportLink text="Support Ticket" title="Cancel Linode Managed" />.
      </Typography>
    );
  }

  return (
    <Grid container direction="column">
      <Grid item>
        <Typography variant="body1">
          Linode Managed includes Backups, Longview Pro, cPanel, and
          round-the-clock monitoring to help keep your systems up and running.
          +$100/month per Linode.{' '}
          <ExternalLink
            fixedIcon
            text="Learn more."
            link="https://linode.com/managed"
          />
        </Typography>
      </Grid>
      <Grid item>
        <Button buttonType="primary" onClick={openConfirmationModal}>
          Add Linode Managed
        </Button>
      </Grid>
    </Grid>
  );
};

export const EnableManaged: React.FC<CombinedProps> = props => {
  const { isManaged, linodeCount, push, update } = props;
  const flags = useFlags();
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
    enableManaged()
      .then(() => {
        handleClose();
        update({ managed: true });
        push('/managed');
      })
      .catch(handleError);
  };

  const actions = () => (
    <ActionsPanel>
      <Button buttonType="cancel" onClick={handleClose} data-qa-cancel>
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={handleSubmit}
        data-qa-submit-managed-enrollment
        loading={isLoading}
      >
        Add Linode Managed
      </Button>
    </ActionsPanel>
  );

  if (!flags.managed) {
    return null;
  }

  return (
    <>
      <ExpansionPanel heading="Linode Managed" defaultExpanded={true}>
        <ManagedContent
          isManaged={isManaged}
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
          Linode Managed costs an additional{' '}
          <strong>$100 per month per Linode.</strong> {` `}
          You currently have{` `}
          <strong>{pluralize('Linode', 'Linodes', linodeCount)}</strong>, so
          Managed will increase your projected monthly bill by{' '}
          <strong>${`${linodeCount * 100}`}</strong>.
        </Typography>
      </ConfirmationDialog>
    </>
  );
};

export default withLinodes((ownProps, entities, loading, error) => ({
  linodeCount: entities.length
}))(EnableManaged);
