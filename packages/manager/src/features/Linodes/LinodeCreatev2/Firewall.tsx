import React, { useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { AkamaiBanner } from 'src/components/AkamaiBanner/AkamaiBanner';
import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { Link } from 'src/components/Link';
import { LinkButton } from 'src/components/LinkButton';
import { Paper } from 'src/components/Paper';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { FIREWALL_GET_STARTED_LINK } from 'src/constants';
import { CreateFirewallDrawer } from 'src/features/Firewalls/FirewallLanding/CreateFirewallDrawer';
import { useFlags } from 'src/hooks/useFlags';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useSecureVMNoticesEnabled } from 'src/hooks/useSecureVMNoticesEnabled';
import { useAllFirewallsQuery } from 'src/queries/firewalls';

import type { LinodeCreateFormValues } from './utilities';
import type { CreateLinodeRequest } from '@linode/api-v4';

export const Firewall = () => {
  const { clearErrors } = useFormContext<LinodeCreateFormValues>();
  const { field, fieldState } = useController<
    CreateLinodeRequest,
    'firewall_id'
  >({ name: 'firewall_id' });

  const { data: firewalls, error, isLoading } = useAllFirewallsQuery();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // @ts-expect-error TODO Secure VMs: wire up firewall generation dialog
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = React.useState(false);

  const flags = useFlags();

  const { secureVMNoticesEnabled } = useSecureVMNoticesEnabled();
  const secureVMFirewallBanner =
    (secureVMNoticesEnabled && flags.secureVmCopy) ?? false;

  const isLinodeCreateRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  const selectedFirewall =
    firewalls?.find((firewall) => firewall.id === field.value) ?? null;

  const onChange = (firewallId: number | undefined) => {
    if (firewallId !== undefined) {
      clearErrors('firewallOverride');
    }
    field.onChange(firewallId ?? null);
  };

  return (
    <Paper>
      <Stack spacing={2}>
        <Typography variant="h2">Firewall</Typography>
        <Typography>
          Assign an existing Firewall to this Linode to control inbound and
          outbound network traffic.{' '}
          <Link to={FIREWALL_GET_STARTED_LINK}>Learn more</Link>.
        </Typography>
        {secureVMFirewallBanner !== false &&
          secureVMFirewallBanner.linodeCreate && (
            <AkamaiBanner
              action={
                secureVMFirewallBanner.generateActionText ? (
                  <LinkButton onClick={() => setIsGenerateDialogOpen(true)}>
                    {secureVMFirewallBanner.generateActionText}
                  </LinkButton>
                ) : undefined
              }
              margin={2}
              {...secureVMFirewallBanner.linodeCreate}
            />
          )}
        <Stack spacing={1.5}>
          <Autocomplete
            disabled={isLinodeCreateRestricted}
            errorText={fieldState.error?.message ?? error?.[0].reason}
            label="Assign Firewall"
            loading={isLoading}
            noMarginTop
            onBlur={field.onBlur}
            onChange={(e, firewall) => onChange(firewall?.id)}
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
      </Stack>
      <CreateFirewallDrawer
        createFlow="linode"
        onClose={() => setIsDrawerOpen(false)}
        onFirewallCreated={(firewall) => field.onChange(firewall.id)}
        open={isDrawerOpen}
      />
    </Paper>
  );
};
