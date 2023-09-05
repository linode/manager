import * as React from 'react';

import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { useLoadBalancerDeleteMutation } from 'src/queries/aglb/loadbalancers';

import type { Loadbalancer } from '@linode/api-v4';

interface Props {
  loadbalancer: Loadbalancer | undefined;
  onClose: () => void;
  onSuccess?: () => void;
  open: boolean;
}

export const DeleteLoadBalancerDialog = (props: Props) => {
  const { loadbalancer, onClose, onSuccess, open } = props;

  const {
    error,
    isLoading,
    mutateAsync,
    reset,
  } = useLoadBalancerDeleteMutation(loadbalancer?.id ?? -1);

  React.useEffect(() => {
    if (open) {
      reset();
    }
  }, [open]);

  const onDelete = async () => {
    await mutateAsync();
    onClose();

    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <TypeToConfirmDialog
      entity={{
        action: 'deletion',
        name: loadbalancer?.label,
        primaryBtnText: 'Delete',
        type: 'Load Balancer',
      }}
      errors={error}
      label="Load Balancer Label"
      loading={isLoading}
      onClick={onDelete}
      onClose={onClose}
      open={open}
      title={`Delete ${loadbalancer?.label ?? ''}?`}
    />
  );
};
