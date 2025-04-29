import { Box, Stack } from '@linode/ui';
import React, { useState } from 'react';
import { useController, useFormContext, useWatch } from 'react-hook-form';

import { LinkButton } from 'src/components/LinkButton';
import { FirewallSelect } from 'src/features/Firewalls/components/FirewallSelect';
import { CreateFirewallDrawer } from 'src/features/Firewalls/FirewallLanding/CreateFirewallDrawer';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';

import type { LinodeCreateFormValues } from '../utilities';

interface Props {
  index: number;
}

export const InterfaceFirewall = ({ index }: Props) => {
  const { control } = useFormContext<LinodeCreateFormValues>();

  const interfaceType = useWatch({
    control,
    name: `linodeInterfaces.${index}.purpose`,
  });

  const { field, fieldState } = useController({
    control,
    name: `linodeInterfaces.${index}.firewall_id`,
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
          helperText="Cloud Firewalls are assigned to individual interfaces. Templates are available for both Public and VPC interfaces, with pre-configured rules to help protect your network traffic."
          label={`${labelMap[interfaceType ?? 'public']} Interface Firewall`}
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

const labelMap: Record<'public' | 'vlan' | 'vpc', string> = {
  public: 'Public',
  vlan: 'VLAN',
  vpc: 'VPC',
};
