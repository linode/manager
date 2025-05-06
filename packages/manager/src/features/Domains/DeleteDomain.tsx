import { Button, Notice, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { useDeleteDomainMutation } from 'src/queries/domains';

import type { APIError } from '@linode/api-v4';
export interface DeleteDomainProps {
  domainError: APIError[] | null;
  domainId: number;
  domainLabel: string;
  // Function that is invoked after Domain has been successfully deleted.
  onSuccess?: () => void;
}

export const DeleteDomain = (props: DeleteDomainProps) => {
  const { domainError, domainId, domainLabel } = props;
  const { enqueueSnackbar } = useSnackbar();

  const {
    error,
    isPending,
    mutateAsync: deleteDomain,
  } = useDeleteDomainMutation(domainId);

  const [open, setOpen] = React.useState(false);

  const onDelete = () => {
    deleteDomain().then(() => {
      enqueueSnackbar('Domain deleted successfully.', {
        variant: 'success',
      });
      if (props.onSuccess) {
        props.onSuccess();
      }
    });
  };

  return (
    <>
      <StyledButton buttonType="outlined" onClick={() => setOpen(true)}>
        Delete Domain
      </StyledButton>
      <TypeToConfirmDialog
        entity={{
          action: 'deletion',
          error: domainError,
          name: domainLabel ?? 'Unknown',
          primaryBtnText: 'Delete Domain',
          type: 'Domain',
        }}
        errors={error}
        label="Domain Name"
        loading={isPending}
        onClick={onDelete}
        onClose={() => setOpen(false)}
        open={open}
        title={`Delete Domain ${domainLabel ?? 'Unknown'}?`}
      >
        <Notice variant="warning">
          <Typography>
            Warning: Deleting this domain is permanent and can’t be undone.
          </Typography>
        </Notice>
      </TypeToConfirmDialog>
    </>
  );
};

const StyledButton = styled(Button, { label: 'StyledButton' })(({ theme }) => ({
  [theme.breakpoints.down('lg')]: {
    marginRight: theme.spacing(),
  },
}));
