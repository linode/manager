import {
  useLinodeInterfaceQuery,
  useUpdateLinodeInterfaceMutation,
} from '@linode/queries';
import { Button } from '@linode/ui';
import { useSnackbar } from 'notistack';
import React from 'react';

interface Props {
  interfaceId: number;
  linodeId: number;
  prefix: '/56' | '/64';
}

export const AllocateIPv6Button = (props: Props) => {
  const { interfaceId, linodeId, prefix } = props;

  const { enqueueSnackbar } = useSnackbar();

  const { data: linodeInterface, isLoading } = useLinodeInterfaceQuery(
    linodeId,
    interfaceId
  );
  const { isPending, mutate } = useUpdateLinodeInterfaceMutation(
    linodeId,
    interfaceId,
    {
      onError(error) {
        enqueueSnackbar(error[0].reason, { variant: 'error' });
      },
      onSuccess() {
        enqueueSnackbar(`${prefix} IPv6 range successfully allocated.`, {
          variant: 'success',
        });
      },
    }
  );

  const onAllocate = () => {
    if (!linodeInterface) {
      enqueueSnackbar(
        'Unable to allocate IP because we could not fetch the interface in the first place.',
        { variant: 'error' }
      );
      return;
    }

    mutate({
      ...linodeInterface,
      public: {
        ...linodeInterface?.public,
        ipv6: {
          ranges: [
            ...(linodeInterface.public?.ipv6.ranges ?? []),
            { range: prefix },
          ],
        },
      },
    });
  };

  return (
    <Button
      buttonType="outlined"
      disabled={isLoading}
      loading={isPending}
      onClick={onAllocate}
    >
      Allocate another {prefix} IPv6 range
    </Button>
  );
};
