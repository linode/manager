import { enableManaged } from '@linode/api-v4/lib/managed';
import { updateAccountSettingsData, useLinodesQuery } from '@linode/queries';
import {
  ActionsPanel,
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from '@linode/ui';
import { pluralize } from '@linode/utilities';
import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { Link } from 'src/components/Link';
import { SupportLink } from 'src/components/SupportLink';

import type { APIError } from '@linode/api-v4/lib/types';

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
    <Stack spacing={2}>
      <Typography variant="body1">
        Linode Managed includes Backups, Longview Pro, cPanel, and
        round-the-clock monitoring to help keep your systems up and running.
        +$100/month per Linode.{'  '}
        <Link to="https://linode.com/managed">Learn more</Link>.
      </Typography>
      <Box>
        <Button buttonType="outlined" onClick={openConfirmationModal}>
          Add Linode Managed
        </Button>
      </Box>
    </Stack>
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
      <Paper>
        <Typography marginBottom={1} variant="h2">
          Linode Managed
        </Typography>
        <ManagedContent
          isManaged={isManaged}
          openConfirmationModal={() => setOpen(true)}
        />
      </Paper>
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
