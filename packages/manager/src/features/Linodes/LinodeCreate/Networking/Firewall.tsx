import { Box, Stack } from '@linode/ui';
import React, { useState } from 'react';
import { useController } from 'react-hook-form';

import { LinkButton } from 'src/components/LinkButton';
import { FirewallSelect } from 'src/features/Firewalls/components/FirewallSelect';
import { CreateFirewallDrawer } from 'src/features/Firewalls/FirewallLanding/CreateFirewallDrawer';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';

import type { LinodeCreateFormValues } from '../utilities';

export const Firewall = () => {
  const { field, fieldState } = useController<
    LinodeCreateFormValues,
    'firewall_id'
  >({
    name: 'firewall_id',
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isLinodeCreateRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  return (
    <Stack spacing={2}>
      <Stack spacing={1.5}>
        <FirewallSelect
          disabled={isLinodeCreateRestricted}
          errorText={fieldState.error?.message}
          onBlur={field.onBlur}
          onChange={(e, firewall) => field.onChange(firewall?.id ?? null)}
          placeholder="None"
          value={field.value}
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
