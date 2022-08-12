import * as React from 'react';
import Button from 'src/components/Button';
import DeletionDialog from 'src/components/DeletionDialog';
import { makeStyles, Theme } from 'src/components/core/styles';
import { useDeleteDomainMutation } from 'src/queries/domains';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { useSnackbar } from 'notistack';

export interface Props {
  domainId: number;
  domainLabel: string;
  // Function that is invoked after Domain has been successfully deleted.
  onSuccess?: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    float: 'right',
    [theme.breakpoints.down('md')]: {
      marginRight: theme.spacing(),
    },
  },
}));

export const DeleteDomain = (props: Props) => {
  const classes = useStyles();

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
      <Button
        className={classes.button}
        buttonType="outlined"
        onClick={() => setOpen(true)}
      >
        Delete Domain
      </Button>
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

export default DeleteDomain;
