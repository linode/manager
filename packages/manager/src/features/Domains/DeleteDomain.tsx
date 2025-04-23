import { Button } from '@linode/ui';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { DeletionDialog } from 'src/components/DeletionDialog/DeletionDialog';
import { useDeleteDomainMutation } from 'src/queries/domains';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

export interface DeleteDomainProps {
  domainId: number;
  domainLabel: string;
  // Function that is invoked after Domain has been successfully deleted.
  onSuccess?: () => void;
}

export const DeleteDomain = (props: DeleteDomainProps) => {
  const { domainId, domainLabel } = props;
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
      <DeletionDialog
        error={
          error
            ? getAPIErrorOrDefault(error, 'Error deleting domain.')[0].reason
            : undefined
        }
        entity="domain"
        label={domainLabel}
        loading={isPending}
        onClose={() => setOpen(false)}
        onDelete={onDelete}
        open={open}
      />
    </>
  );
};

const StyledButton = styled(Button, { label: 'StyledButton' })(({ theme }) => ({
  [theme.breakpoints.down('lg')]: {
    marginRight: theme.spacing(),
  },
}));
