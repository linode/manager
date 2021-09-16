import { enableManaged } from '@linode/api-v4/lib/managed';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import Accordion from 'src/components/Accordion';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';
import Grid from 'src/components/Grid';
import SupportLink from 'src/components/SupportLink';
import withLinodes, {
  DispatchProps,
} from 'src/containers/withLinodes.container';
import { pluralize } from 'src/utilities/pluralize';
import { updateAccountSettingsData } from 'src/queries/accountSettings';

interface Props {
  isManaged: boolean;
}

interface StateProps {
  linodeCount: number;
}

type CombinedProps = Props & StateProps & DispatchProps;

interface ContentProps {
  isManaged: boolean;
  openConfirmationModal: () => void;
}
export const ManagedContent: React.FC<ContentProps> = (props) => {
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
          +$100/month per Linode.{'  '}
          <ExternalLink
            fixedIcon
            text="Learn more."
            link="https://linode.com/managed"
          />
        </Typography>
      </Grid>
      <Grid item>
        <Button buttonType="outlined" onClick={openConfirmationModal}>
          Add Linode Managed
        </Button>
      </Grid>
    </Grid>
  );
};

export const EnableManaged: React.FC<CombinedProps> = (props) => {
  const { isManaged, linodeCount } = props;
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
        updateAccountSettingsData({ managed: true });
      })
      .catch(handleError);
  };

  const actions = () => (
    <ActionsPanel>
      <Button buttonType="secondary" onClick={handleClose} data-qa-cancel>
        Cancel
      </Button>
      <Button
        buttonType="primary"
        onClick={handleSubmit}
        loading={isLoading}
        data-qa-submit-managed-enrollment
      >
        Add Linode Managed
      </Button>
    </ActionsPanel>
  );

  return (
    <>
      <Accordion heading="Linode Managed" defaultExpanded={true}>
        <ManagedContent
          isManaged={isManaged}
          openConfirmationModal={() => setOpen(true)}
        />
      </Accordion>
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

export default withLinodes<StateProps, Props>(
  (ownProps, entities, loading, error) => ({
    linodeCount: entities.length,
  })
)(EnableManaged);
