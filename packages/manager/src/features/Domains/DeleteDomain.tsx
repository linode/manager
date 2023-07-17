import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { Button } from 'src/components/Button/Button';
import { DeletionDialog } from 'src/components/DeletionDialog/DeletionDialog';
import { useDeleteDomainMutation } from 'src/queries/domains';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

export interface Props {
  domainId: number;
  domainLabel: string;
  // Function that is invoked after Domain has been successfully deleted.
  onSuccess?: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    float: 'right',
    [theme.breakpoints.down('lg')]: {
      marginRight: theme.spacing(),
    },
  },
}));

export const DeleteDomain = (props: Props) => {
  const classes = useStyles();

  const { domainId, domainLabel } = props;
  const { enqueueSnackbar } = useSnackbar();

  const {
    error,
    isLoading,
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
      <Button
        buttonType="outlined"
        className={classes.button}
        onClick={() => setOpen(true)}
      >
        Delete Domain
      </Button>
      <DeletionDialog
        error={
          error
            ? getAPIErrorOrDefault(error, 'Error deleting domain.')[0].reason
            : undefined
        }
        entity="domain"
        label={domainLabel}
        loading={isLoading}
        onClose={() => setOpen(false)}
        onDelete={onDelete}
        open={open}
        typeToConfirm
      />
    </>
  );
};

export default DeleteDomain;
