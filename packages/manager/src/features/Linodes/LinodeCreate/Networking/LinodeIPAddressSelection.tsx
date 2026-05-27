import { useReservedIPsQuery } from '@linode/queries';
import * as React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { IPAddressSelection } from 'src/features/ReservedIps/IPAddressSelection/IPAddressSelection';

import type { LinodeCreateFormValues } from '../utilities';
import type { IPAddress } from '@linode/api-v4';

/**
 * Sentinel value used to indicate "auto-assign" mode for IP addresses.
 * Similar to how VPCIPv4Address uses "auto" as its autoAssignValue.
 */
export const IP_AUTO_ASSIGN_VALUE = [{ address: 'auto', primary: true }];

interface Props {
  index: number;
}

export const LinodeIPAddressSelection = ({ index }: Props) => {
  const { control } = useFormContext<LinodeCreateFormValues>();

  const regionId = useWatch({ control, name: 'region' });

  const ipv4Addresses = useWatch({
    control,
    name: `linodeInterfaces.${index}.public.ipv4.addresses`,
  });

  // Derive mode from value — same pattern as VPCIPv4Address's `shouldAutoAssign`
  // undefined/no value = auto (default), sentinel 'auto' = auto, empty array = reserved (no selection yet)
  const isReservedMode =
    Array.isArray(ipv4Addresses) && ipv4Addresses[0]?.address !== 'auto';
  const mode: 'auto' | 'reserved' = isReservedMode ? 'reserved' : 'auto';

  const [selectedIP, setSelectedIP] = React.useState<IPAddress | null>(null);

  const { data: reservedIPsPage } = useReservedIPsQuery(
    {},
    { region: regionId },
    Boolean(regionId)
  );

  const reservedIPs = reservedIPsPage?.data ?? [];

  // Restore the full IPAddress object from stored address string
  React.useEffect(() => {
    if (isReservedMode && ipv4Addresses?.length && reservedIPs.length > 0) {
      const ip = reservedIPs.find(
        (ip: IPAddress) => ip.address === ipv4Addresses[0]?.address
      );
      setSelectedIP(ip ?? null);
    }
  }, [ipv4Addresses, reservedIPs, isReservedMode]);

  return (
    <Controller
      control={control}
      name={`linodeInterfaces.${index}.public.ipv4.addresses`}
      render={({ field, fieldState }) => (
        <IPAddressSelection
          disabled={!regionId}
          error={fieldState.error?.message}
          mode={mode}
          onIPModeChange={(newMode) => {
            if (newMode === 'auto') {
              // Set sentinel value — satisfies schema's required check
              field.onChange(IP_AUTO_ASSIGN_VALUE);
              setSelectedIP(null);
            } else {
              // Clear value — schema will require a selection
              field.onChange([]);
              setSelectedIP(null);
            }
          }}
          onReservedIPSelect={(ip: IPAddress | null) => {
            field.onChange(
              ip?.address ? [{ address: ip.address, primary: true }] : []
            );
            setSelectedIP(ip);
          }}
          regionId={regionId ?? ''}
          selectedIP={selectedIP}
        />
      )}
    />
  );
};
