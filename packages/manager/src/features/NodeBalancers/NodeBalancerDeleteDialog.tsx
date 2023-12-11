import * as React from 'react';
import { useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';

import { Notice } from 'src/components/Notice/Notice';
import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { Typography } from 'src/components/Typography';
import { queryKey as firewallsQueryKey } from 'src/queries/firewalls';
import { useNodebalancerDeleteMutation } from 'src/queries/nodebalancers';

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
  const { error, isLoading, mutateAsync } = useNodebalancerDeleteMutation(id);
  const { push } = useHistory();

  const queryClient = useQueryClient();

  const onDelete = async () => {
    await mutateAsync();
    queryClient.invalidateQueries([firewallsQueryKey]);
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
      label={'NodeBalancer Label'}
      loading={isLoading}
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
