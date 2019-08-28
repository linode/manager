import * as React from 'react';
import ManagedIcon from 'src/assets/icons/managed.svg';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Typography from 'src/components/core/Typography';
import Placeholder from 'src/components/Placeholder';

// import { enableManaged } from 'src/services/managed';

const ManagedPlaceholder: React.FC<{}> = props => {
  const [isOpen, setOpen] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>();
  const [isLoading, setLoading] = React.useState<boolean>(false);

  const handleClose = () => {
    setOpen(false);
    setError(undefined);
  };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
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
        title="Are you sure?"
        actions={actions}
      >
        <Typography>
          The Managed service is billed at $100 monthly per Linode on your
          account. You currently have 4 Linodes for a cost of $400/month.
        </Typography>
      </ConfirmationDialog>
    </>
  );
};

export default ManagedPlaceholder;
