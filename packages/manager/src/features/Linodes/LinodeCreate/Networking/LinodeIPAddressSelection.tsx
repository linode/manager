import { IPAddress } from '@linode/api-v4';
import { useReservedIPsQuery } from '@linode/queries';
import * as React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { IPAddressSelection } from 'src/features/ReservedIps/IPAddressSelection/IPAddressSelection';

import { LinodeCreateFormValues } from '../utilities';

interface Props {
  index: number;
}

export const LinodeIPAddressSelection = ({ index }: Props) => {
  const { control, formState, clearErrors, setError } =
    useFormContext<LinodeCreateFormValues>();

  // Watch region for disabling the dropdown when no region is selected
  const regionId = useWatch({ control, name: 'region' });

  // Watch the IP address from form state
  const ipv4Address = useWatch({
    control,
    name: `linodeInterfaces.${index}.public.ipv4.addresses`,
  });

  // Derive mode from IP address value
  const [mode, setMode] = React.useState<'auto' | 'reserved'>('auto');

  // Local state for full IPAddress object (needed for Autocomplete)
  const [selectedIP, setSelectedIP] = React.useState<IPAddress | null>(null);

  // Query Reserved IPs to restore full object when needed
  const { data: reservedIPsPage } = useReservedIPsQuery(
    {},
    { region: regionId },
    Boolean(regionId)
  );

  const reservedIPs = reservedIPsPage?.data ?? [];

  // Restore selectedIP from form state when component mounts or IP address changes
  React.useEffect(() => {
    if (ipv4Address?.length && reservedIPs.length > 0) {
      setMode('reserved');
      // Find the full IPAddress object that matches the stored address string
      const ip = reservedIPs.find(
        (ip: IPAddress) => ip.address === ipv4Address[0]?.address
      );
      setSelectedIP(ip ?? null);
    } else if (!ipv4Address) {
      setMode('auto');
      setSelectedIP(null);
    }
  }, [ipv4Address, reservedIPs]);

  // Validate on submit: if mode is reserved but no IP selected, set error
  React.useEffect(() => {
    if (formState.isSubmitting || formState.submitCount > 0) {
      if (mode === 'reserved' && (!ipv4Address || ipv4Address.length === 0)) {
        setError(`linodeInterfaces.${index}.public.ipv4.addresses`, {
          type: 'required',
          message: 'Please select a reserved IP address',
        });
      } else {
        // Clear error if validation passes
        clearErrors(`linodeInterfaces.${index}.public.ipv4.addresses`);
      }
    }
  }, [
    formState.isSubmitting,
    formState.submitCount,
    mode,
    ipv4Address,
    setError,
    clearErrors,
    index,
  ]);

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
            setMode(newMode);
            // When switching to auto mode, clear both form state and local state
            if (newMode === 'auto') {
              field.onChange([]);
              setSelectedIP(null);
            }
          }}
          onReservedIPSelect={(ip: IPAddress | null) => {
            field.onChange(
              ip?.address ? [{ address: ip?.address, primary: true }] : []
            );
            // Store IP address string in form state
            // Store full object in local state for Autocomplete
            setSelectedIP(ip);
          }}
          regionId={regionId ?? ''}
          selectedIP={selectedIP}
        />
      )}
    />
  );
};
