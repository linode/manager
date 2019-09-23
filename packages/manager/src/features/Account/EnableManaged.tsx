import { AccountSettings } from 'linode-js-sdk/lib/account';
import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Grid from 'src/components/Grid';
import withLinodes from 'src/containers/withLinodes.container';
import useFlags from 'src/hooks/useFlags';
import { pluralize } from 'src/utilities/pluralize';

interface Props {
  isManaged: boolean;
  update: (data: Partial<AccountSettings>) => void;
}

interface StateProps {
  linodeCount: number;
}

const enableManaged = jest.fn();

type CombinedProps = Props & StateProps;

export const EnableManaged: React.FC<CombinedProps> = props => {
  const { isManaged, linodeCount, update } = props;
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
        <Grid container direction="column">
          <Grid item>
            <Typography variant="h2">Managed panel {isManaged}</Typography>
          </Grid>
        </Grid>
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
