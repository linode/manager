import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import { makeStyles } from 'src/components/core/styles';
import DeletionDialog from 'src/components/DeletionDialog';
import { useDialog } from 'src/hooks/useDialog';
import {
  DomainActionsProps,
  withDomainActions,
} from 'src/store/domains/domains.container';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

interface Props {
  domainId: number;
  domainLabel: string;
  // Function that is invoked after Domain has been successfully deleted.
  onSuccess?: () => void;
}

const useStyles = makeStyles(() => ({
  button: {
    float: 'right',
  },
}));

export type CombinedProps = Props & WithSnackbarProps & DomainActionsProps;

export const DeleteDomain: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const {
    dialog,
    openDialog,
    closeDialog,
    submitDialog,
    handleError,
  } = useDialog<number>((domainId: number) =>
    props.domainActions.deleteDomain({ domainId })
  );

  const handleDelete = () => {
    submitDialog(dialog.entityID)
      .then(() => {
        props.enqueueSnackbar('Domain deleted successfully.', {
          variant: 'success',
        });
        if (props.onSuccess) {
          props.onSuccess();
        }
      })
      .catch((e) =>
        handleError(getAPIErrorOrDefault(e, 'Error deleting domain.')[0].reason)
      );
  };

  return (
    <>
      <Button
        className={classes.button}
        buttonType="outlined"
        onClick={() => openDialog(props.domainId, props.domainLabel)}
      >
        Delete Domain
      </Button>
      <DeletionDialog
        typeToConfirm
        entity="domain"
        open={dialog.isOpen}
        label={dialog.entityLabel || ''}
        loading={dialog.isLoading}
        error={dialog.error}
        onClose={closeDialog}
        onDelete={handleDelete}
      />
    </>
  );
};

const enhanced = compose<CombinedProps, Props>(
  withSnackbar,
  withDomainActions,
  React.memo
);

export default enhanced(DeleteDomain);
