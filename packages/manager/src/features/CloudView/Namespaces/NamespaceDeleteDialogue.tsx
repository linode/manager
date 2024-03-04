import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { useDeleteCloudViewNamespace } from 'src/queries/cloudview/namespaces';

interface Props {
  id?: number;
  label?: string;
  onClose: () => void;
  open: boolean;
}

export const NamespaceDeleteDialog = (props: Props) => {
  const { id, label, onClose, open } = props;
  const { enqueueSnackbar } = useSnackbar();
  const {
    error,
    isLoading,
    mutateAsync: deleteNamespace,
    reset,
  } = useDeleteCloudViewNamespace(id ?? -1);
  const history = useHistory();

  React.useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const onDeleteNamespace = () => {
    deleteNamespace().then(() => {
      enqueueSnackbar('Namespace deleted successfully.', {
        variant: 'success',
      });
      onClose();
      if (history.location.pathname !== '/cloudview/namespaces') {
        history.push('/cloudview/namespaces');
      }
    });
  };

  return (
    <TypeToConfirmDialog
      entity={{
        action: 'deletion',
        name: label,
        primaryBtnText: 'Delete',
        type: 'Namespace',
      }}
      errors={error}
      label="Namespace Label"
      loading={isLoading}
      onClick={onDeleteNamespace}
      onClose={onClose}
      open={open}
      title={`Delete Namespace ${label}`}
    />
  );
};
