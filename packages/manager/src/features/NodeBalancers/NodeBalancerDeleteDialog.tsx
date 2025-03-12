import { Notice, Typography } from '@linode/ui';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { useNodebalancerDeleteMutation } from '@linode/queries';

interface Props {
  id: number;
  label: string;
  onClose: () => void;
  open: boolean;
}

export const NodeBalancerDeleteDialog = ({
  id,
  label,
  onClose,
  open,
}: Props) => {
  const { error, isPending, mutateAsync } = useNodebalancerDeleteMutation(id);
  const { push } = useHistory();

  const onDelete = async () => {
    await mutateAsync();
    onClose();
    push('/nodebalancers');
  };

  return (
    <TypeToConfirmDialog
      entity={{
        action: 'deletion',
        name: label,
        primaryBtnText: 'Delete',
        type: 'NodeBalancer',
      }}
      errors={error ?? undefined}
      expand
      label={'NodeBalancer Label'}
      loading={isPending}
      onClick={onDelete}
      onClose={onClose}
      open={open}
      title={`Delete ${label}?`}
      typographyStyle={{ marginTop: '20px' }}
    >
      <Notice variant="warning">
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
