import { useSnackbar } from 'notistack';
import * as React from 'react';

import { Notice } from 'src/components/Notice/Notice';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { useDeleteVPCMutation } from 'src/queries/vpcs';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

interface Props {
  id: number;
  label: string;
  onClose: (id: number, label: string) => void;
  open: boolean;
}

const DEFAULT_ERROR = 'There was an error deleting this VPC.';

export const VPCDeleteDialog: React.FC<Props> = (props) => {
  const { id, label, onClose, open } = props;
  const { enqueueSnackbar } = useSnackbar();
  const { mutateAsync: deleteVPC } = useDeleteVPCMutation(id);
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const onDeleteVPC = () => {
    setIsLoading(true);
    deleteVPC()
      .then(() => {
        setIsLoading(false);
        enqueueSnackbar('VPC deleted successfully.', {
          variant: 'success',
        });
        onClose(id, label);
      })
      .catch((e) => {
        setIsLoading(false);
        setError(getAPIErrorOrDefault(e, DEFAULT_ERROR)[0].reason);
      });
  };

  return (
    <TypeToConfirmDialog
      entity={{
        action: 'deletion',
        name: label,
        primaryBtnText: 'Delete',
        type: 'VPC',
      }}
      label={'VPC Label'}
      loading={isLoading}
      onClick={onDeleteVPC}
      onClose={() => onClose(id, label)}
      open={open}
      title={`Delete VPC ${label}`}
    >
      {error ? <Notice error text={error} /> : null}
    </TypeToConfirmDialog>
  );
};

export default VPCDeleteDialog;
