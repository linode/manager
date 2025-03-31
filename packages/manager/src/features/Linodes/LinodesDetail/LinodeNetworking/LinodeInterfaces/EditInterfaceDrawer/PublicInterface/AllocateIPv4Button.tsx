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
}

export const AllocateIPv4Button = (props: Props) => {
  const { interfaceId, linodeId } = props;

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
        enqueueSnackbar('IPv4 address successfully allocated.', {
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
        ipv4: {
          addresses: [
            ...(linodeInterface.public?.ipv4.addresses ?? []),
            { address: 'auto' },
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
      Allocate another Public IPv4
    </Button>
  );
};
