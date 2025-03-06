import { Autocomplete, Box, Stack } from '@linode/ui';
import React, { useState } from 'react';
import { useController, useWatch } from 'react-hook-form';

import { LinkButton } from 'src/components/LinkButton';
import { CreateFirewallDrawer } from 'src/features/Firewalls/FirewallLanding/CreateFirewallDrawer';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useAllFirewallsQuery } from 'src/queries/firewalls';

import type { LinodeCreateFormValues } from '../utilities';

interface Props {
  index: number;
}

export const InterfaceFirewall = ({ index }: Props) => {
  const interfaceType = useWatch<
    LinodeCreateFormValues,
    `linodeInterfaces.${number}.purpose`
  >({
    name: `linodeInterfaces.${index}.purpose`,
  });

  const { field, fieldState } = useController<
    LinodeCreateFormValues,
    `linodeInterfaces.${number}.firewall_id`
  >({
    name: `linodeInterfaces.${index}.firewall_id`,
  });

  const { data: firewalls, error, isLoading } = useAllFirewallsQuery();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isLinodeCreateRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  const selectedFirewall =
    firewalls?.find((firewall) => firewall.id === field.value) ?? null;

  return (
    <Stack spacing={2}>
      <Stack spacing={1.5}>
        <Autocomplete
          disabled={isLinodeCreateRestricted}
          errorText={fieldState.error?.message ?? error?.[0].reason}
          label={`${labelMap[interfaceType]} Interface Firewall`}
          loading={isLoading}
          noMarginTop
          onBlur={field.onBlur}
          onChange={(e, firewall) => field.onChange(firewall?.id ?? null)}
          options={firewalls ?? []}
          placeholder="None"
          value={selectedFirewall}
        />
        <Box>
          <LinkButton
            isDisabled={isLinodeCreateRestricted}
            onClick={() => setIsDrawerOpen(true)}
          >
            Create Firewall
          </LinkButton>
        </Box>
      </Stack>
      <CreateFirewallDrawer
        createFlow="linode"
        onClose={() => setIsDrawerOpen(false)}
        onFirewallCreated={(firewall) => field.onChange(firewall.id)}
        open={isDrawerOpen}
      />
    </Stack>
  );
};

const labelMap: Record<'public' | 'vlan' | 'vpc', string> = {
  public: 'Public',
  vlan: 'VLAN',
  vpc: 'VPC',
};
