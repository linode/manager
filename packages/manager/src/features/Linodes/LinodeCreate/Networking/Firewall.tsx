import { Box, Stack } from '@linode/ui';
import { LinkButton } from '@linode/ui';
import React, { useState } from 'react';
import { useController } from 'react-hook-form';

import { AkamaiBanner } from 'src/components/AkamaiBanner/AkamaiBanner';
import { GenerateFirewallDialog } from 'src/components/GenerateFirewallDialog/GenerateFirewallDialog';
import { FirewallSelect } from 'src/features/Firewalls/components/FirewallSelect';
import { CreateFirewallDrawer } from 'src/features/Firewalls/FirewallLanding/CreateFirewallDrawer';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useFlags } from 'src/hooks/useFlags';
import { useSecureVMNoticesEnabled } from 'src/hooks/useSecureVMNoticesEnabled';

import type { LinodeCreateFormValues } from '../utilities';

export const Firewall = () => {
  const { field, fieldState } = useController<
    LinodeCreateFormValues,
    'firewall_id'
  >({
    name: 'firewall_id',
  });

  const { secureVMNoticesEnabled } = useSecureVMNoticesEnabled();
  const flags = useFlags();

  const [
    isGenerateAkamaiEmployeeFirewallDialogOpen,
    setIsGenerateAkamaiEmployeeFirewallDialogOpen,
  ] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data: permissions } = usePermissions('account', [
    'create_linode',
    'create_firewall',
  ]);

  return (
    <Stack spacing={2}>
      <Stack spacing={1.5}>
        {secureVMNoticesEnabled && (
          <AkamaiBanner
            action={
              <LinkButton
                onClick={() =>
                  setIsGenerateAkamaiEmployeeFirewallDialogOpen(true)
                }
              >
                {flags.secureVmCopy?.generateActionText ??
                  'Generate Compliant Firewall'}
              </LinkButton>
            }
            text={
              flags.secureVmCopy?.linodeCreate?.text ??
              'All accounts must apply an compliant firewall to all their Linodes.'
            }
          />
        )}
        <FirewallSelect
          disabled={!permissions.create_linode}
          errorText={fieldState.error?.message}
          onBlur={field.onBlur}
          onChange={(e, firewall) => field.onChange(firewall?.id ?? null)}
          placeholder="None"
          value={field.value}
        />
        <Box>
          <LinkButton
            disabled={!permissions.create_firewall}
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
      {secureVMNoticesEnabled && (
        <GenerateFirewallDialog
          onClose={() => setIsGenerateAkamaiEmployeeFirewallDialogOpen(false)}
          onFirewallGenerated={(firewall) => field.onChange(firewall.id)}
          open={isGenerateAkamaiEmployeeFirewallDialogOpen}
        />
      )}
    </Stack>
  );
};
