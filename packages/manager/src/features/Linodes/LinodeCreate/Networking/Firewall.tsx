import { Autocomplete, Box, Stack } from '@linode/ui';
import React, { useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { LinkButton } from 'src/components/LinkButton';
import { CreateFirewallDrawer } from 'src/features/Firewalls/FirewallLanding/CreateFirewallDrawer';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useAllFirewallsQuery } from 'src/queries/firewalls';

import type { LinodeCreateFormValues } from '../utilities';
import type { CreateLinodeRequest } from '@linode/api-v4';

export const Firewall = () => {
  const { control } = useFormContext<LinodeCreateFormValues>();
  const { field, fieldState } = useController<CreateLinodeRequest>({
    control,
    name: 'firewall_id',
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
          label="Firewall"
          loading={isLoading}
          noMarginTop
          onBlur={field.onBlur}
          onChange={(e, firewall) => field.onChange(firewall?.id)}
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
