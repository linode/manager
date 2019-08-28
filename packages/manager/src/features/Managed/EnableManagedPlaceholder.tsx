import * as React from 'react';
import ManagedIcon from 'src/assets/icons/managed.svg';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import Placeholder from 'src/components/Placeholder';
import withLinodes from 'src/containers/withLinodes.container';
import { pluralize } from 'src/utilities/pluralize';

import { enableManaged } from 'src/services/managed';

export interface StateProps {
  linodeCount: number;
}

const ManagedPlaceholder: React.FC<StateProps> = props => {
  const [isOpen, setOpen] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>();
  const [isLoading, setLoading] = React.useState<boolean>(false);

  const handleClose = () => {
    setOpen(false);
    setError(undefined);
  };

  const handleError = (e: Linode.ApiFieldError[]) => {
    setError(e[0].reason);
    setLoading(false);
  };

  const handleSubmit = () => {
    setLoading(true);
    enableManaged()
      .then(handleClose)
      .catch(handleError);
  };

  const actions = () => (
    <ActionsPanel>
      <Button buttonType="cancel" onClick={handleClose} data-qa-cancel>
        Cancel
      </Button>
      <Button
        buttonType="secondary"
        destructive
        onClick={handleSubmit}
        data-qa-submit-managed-enrollment
        loading={isLoading}
      >
        Enable Managed
      </Button>
    </ActionsPanel>
  );

  return (
    <>
      <Placeholder
        icon={ManagedIcon}
        title="Linode Managed"
        copy={`Linode Managed is an amazing feature.`}
        buttonProps={{
          onClick: () => setOpen(true),
          children: 'Add Managed to your Linode account.'
        }}
      />
      <ConfirmationDialog
        open={isOpen}
        error={error}
        onClose={() => handleClose()}
        title="Confirm Managed Enrollment"
        actions={actions}
      >
        <Typography>
          The Managed service is billed at $100 monthly per Linode on your
          account. You currently have{' '}
          {pluralize('Linode', 'Linodes', props.linodeCount)} for a cost of $
          {`${props.linodeCount * 100}/month`}.
        </Typography>
      </ConfirmationDialog>
    </>
  );
};

export default withLinodes((ownProps, entities, loading, error) => ({
  linodeCount: entities.length
}))(ManagedPlaceholder);
