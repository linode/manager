import {
  useLinodeInterfaceQuery,
  useUpdateLinodeInterfaceMutation,
} from '@linode/queries';
import { useSnackbar } from 'notistack';

interface AllocateIPv6Options {
  interfaceId: number;
  linodeId: number;
  prefix: '/56' | '/64';
}

export const useAllocateIPv6Range = (options: AllocateIPv6Options) => {
  const { interfaceId, linodeId, prefix } = options;

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

  return { isAllocating: isPending, onAllocate };
};

interface AllocateIPv4Options {
  interfaceId: number;
  linodeId: number;
  onSuccess?: () => void;
}

export const useAllocatePublicIPv4 = (options: AllocateIPv4Options) => {
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

export const useMakeIPv4Primary = (options: AllocateIPv4Options) => {
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
        enqueueSnackbar('Primary IPv4 address successfully updated.', {
          variant: 'success',
        });
      },
    }
  );

  const onMakePrimary = (address: string) => {
    if (!linodeInterface || !linodeInterface.public) {
      enqueueSnackbar(
        'Unable to make address primary because we could not fetch the interface in the first place.',
        { variant: 'error' }
      );
      return;
    }

    const updatedInterface = structuredClone(linodeInterface);

    for (let i = 0; i < updatedInterface.public!.ipv4.addresses.length; i++) {
      updatedInterface.public!.ipv4.addresses[i].primary =
        updatedInterface.public!.ipv4.addresses[i].address === address;
    }

    mutate(updatedInterface);
  };

  return { isPending, onMakePrimary };
};

export const useRemoveIPv4 = (options: AllocateIPv4Options) => {
  const { interfaceId, linodeId, onSuccess } = options;

  const { enqueueSnackbar } = useSnackbar();

  const { data: linodeInterface } = useLinodeInterfaceQuery(
    linodeId,
    interfaceId
  );

  const mutation = useUpdateLinodeInterfaceMutation(linodeId, interfaceId, {
    onSuccess() {
      enqueueSnackbar('IPv4 address successfully removed.', {
        variant: 'success',
      });
      if (onSuccess) {
        onSuccess();
      }
    },
  });

  const onRemove = (address: string) => {
    if (!linodeInterface || !linodeInterface.public) {
      enqueueSnackbar(
        'Unable to remove address because we could not fetch the interface in the first place.',
        { variant: 'error' }
      );
      return;
    }

    const updatedInterface = structuredClone(linodeInterface);

    const indexOfAddress = updatedInterface.public!.ipv4.addresses.findIndex(
      (i) => i.address === address
    );

    updatedInterface.public?.ipv4.addresses.splice(indexOfAddress, 1);

    mutation.mutate(updatedInterface);
  };

  return { ...mutation, onRemove };
};

export const useRemoveIPv6 = (options: AllocateIPv4Options) => {
  const { interfaceId, linodeId, onSuccess } = options;

  const { enqueueSnackbar } = useSnackbar();

  const { data: linodeInterface } = useLinodeInterfaceQuery(
    linodeId,
    interfaceId
  );

  const mutation = useUpdateLinodeInterfaceMutation(linodeId, interfaceId, {
    onSuccess() {
      enqueueSnackbar('IPv6 range successfully removed.', {
        variant: 'success',
      });
      if (onSuccess) {
        onSuccess();
      }
    },
  });

  const onRemove = (range: string) => {
    if (!linodeInterface || !linodeInterface.public) {
      enqueueSnackbar(
        'Unable to remove range because we could not fetch the interface in the first place.',
        { variant: 'error' }
      );
      return;
    }

    const updatedInterface = structuredClone(linodeInterface);

    const indexOfRange = updatedInterface.public!.ipv6.ranges.findIndex(
      (i) => i.range === range
    );

    updatedInterface.public?.ipv6.ranges.splice(indexOfRange, 1);

    mutation.mutate(updatedInterface);
  };

  return { ...mutation, onRemove };
};

export const ipv4AddressSorter = (
  a: { address: string },
  b: { address: string }
) => {
  if (a.address > b.address) {
    return 1;
  }
  if (a.address < b.address) {
    return -1;
  }
  return 0;
};
