import * as React from 'react';
import { useHistory } from 'react-router-dom';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';
import TypeToConfirmDialog from 'src/components/TypeToConfirmDialog';
import { useNodebalancerDeleteMutation } from 'src/queries/nodebalancers';

interface Props {
  id: number;
  label: string;
  open: boolean;
  onClose: () => void;
}

export const NodeBalancerDeleteDialog = ({
  id,
  label,
  open,
  onClose,
}: Props) => {
  const { mutateAsync, isLoading, error } = useNodebalancerDeleteMutation(id);
  const { push } = useHistory();

  const onDelete = async () => {
    await mutateAsync();
    onClose();
    push('/nodebalancers');
  };

  return (
    <TypeToConfirmDialog
      title={`Delete ${label}?`}
      entity={{
        type: 'NodeBalancer',
        label,
      }}
      open={open}
      loading={isLoading}
      errors={error ?? undefined}
      onClose={onClose}
      onClick={onDelete}
      typographyStyle={{ marginTop: '20px' }}
    >
      <Notice warning>
        <Typography style={{ fontSize: '0.875rem' }}>
          Deleting this NodeBalancer is permanent and can’t be undone.
        </Typography>
      </Notice>
      <Typography variant="body1">
        Traffic will no longer be routed through this NodeBalancer. Please check
        your DNS settings and either provide the IP address of another active
        NodeBalancer, or route traffic directly to your Linode.
      </Typography>
    </TypeToConfirmDialog>
  );
};
