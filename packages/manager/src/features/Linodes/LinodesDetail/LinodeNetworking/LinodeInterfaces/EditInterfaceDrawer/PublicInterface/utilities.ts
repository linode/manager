import {
  useLinodeInterfaceQuery,
  useUpdateLinodeInterfaceMutation,
} from '@linode/queries';
import { useSnackbar } from 'notistack';

interface Options {
  interfaceId: number;
  linodeId: number;
}

export const useAllocateIPv6Range = (options: Options) => {
  const { interfaceId, linodeId } = options;

  const { enqueueSnackbar } = useSnackbar();

  const { data: linodeInterface } = useLinodeInterfaceQuery(
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
        enqueueSnackbar('IPv6 range successfully allocated.', {
          variant: 'success',
        });
      },
    }
  );

  const onAllocate = (prefix: '/56' | '/64') => {
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

  return { isAllocating: isPending, onAllocate };
};

export const useAllocatePublicIPv4 = (options: Options) => {
  const { interfaceId, linodeId } = options;

  const { enqueueSnackbar } = useSnackbar();

  const { data: linodeInterface } = useLinodeInterfaceQuery(
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

  return { isAllocating: isPending, onAllocate };
};
