import { enableManaged } from '@linode/api-v4/lib/managed';
import { APIError } from '@linode/api-v4/lib/types';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { Accordion } from 'src/components/Accordion';
import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Link } from 'src/components/Link';
import { SupportLink } from 'src/components/SupportLink';
import { Typography } from 'src/components/Typography';
import { updateAccountSettingsData } from 'src/queries/accountSettings';
import { useLinodesQuery } from 'src/queries/linodes/linodes';
import { pluralize } from 'src/utilities/pluralize';

interface Props {
  isManaged: boolean;
}

interface ContentProps {
  isManaged: boolean;
  openConfirmationModal: () => void;
}

export const ManagedContent = (props: ContentProps) => {
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
    <Grid container direction="column" spacing={2}>
      <Grid>
        <Typography variant="body1">
          Linode Managed includes Backups, Longview Pro, cPanel, and
          round-the-clock monitoring to help keep your systems up and running.
          +$100/month per Linode.{'  '}
          <Link to="https://linode.com/managed">Learn more</Link>.
        </Typography>
      </Grid>
      <Grid>
        <Button buttonType="outlined" onClick={openConfirmationModal}>
          Add Linode Managed
        </Button>
      </Grid>
    </Grid>
  );
};

export const EnableManaged = (props: Props) => {
  const { isManaged } = props;
  const queryClient = useQueryClient();
  const { data: linodes } = useLinodesQuery();
  const [isOpen, setOpen] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>();
  const [isLoading, setLoading] = React.useState<boolean>(false);

  const linodeCount = linodes?.results ?? 0;

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
        updateAccountSettingsData({ managed: true }, queryClient);
      })
      .catch(handleError);
  };

  const actions = (
    <ActionsPanel
      primaryButtonProps={{
        'data-testid': 'submit-managed-enrollment',
        label: 'Add Linode Managed',
        loading: isLoading,
        onClick: handleSubmit,
      }}
      secondaryButtonProps={{
        'data-testid': 'cancel',
        label: 'Cancel',
        onClick: handleClose,
      }}
    />
  );

  return (
    <>
      <Accordion defaultExpanded={true} heading="Linode Managed">
        <ManagedContent
          isManaged={isManaged}
          openConfirmationModal={() => setOpen(true)}
        />
      </Accordion>
      <ConfirmationDialog
        actions={actions}
        error={error}
        onClose={() => handleClose()}
        open={isOpen}
        title="Just to confirm..."
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
