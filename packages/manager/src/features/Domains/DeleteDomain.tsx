import * as React from 'react';
import { Button } from 'src/components/Button/Button';
import { DeletionDialog } from 'src/components/DeletionDialog/DeletionDialog';
import { styled } from '@mui/material/styles';
import { useDeleteDomainMutation } from 'src/queries/domains';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { useSnackbar } from 'notistack';

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
    mutateAsync: deleteDomain,
    error,
    isLoading,
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
        typeToConfirm
        entity="domain"
        open={open}
        label={domainLabel}
        loading={isLoading}
        error={
          error
            ? getAPIErrorOrDefault(error, 'Error deleting domain.')[0].reason
            : undefined
        }
        onClose={() => setOpen(false)}
        onDelete={onDelete}
      />
    </>
  );
};

const StyledButton = styled(Button, { label: 'StyledButton' })(({ theme }) => ({
  [theme.breakpoints.down('lg')]: {
    marginRight: theme.spacing(),
  },
}));
