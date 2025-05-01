import { Box, Stack } from '@linode/ui';
import React, { useState } from 'react';
import { useController } from 'react-hook-form';

import { AkamaiBanner } from 'src/components/AkamaiBanner/AkamaiBanner';
import { GenerateFirewallDialog } from 'src/components/GenerateFirewallDialog/GenerateFirewallDialog';
import { LinkButton } from 'src/components/LinkButton';
import { FirewallSelect } from 'src/features/Firewalls/components/FirewallSelect';
import { CreateFirewallDrawer } from 'src/features/Firewalls/FirewallLanding/CreateFirewallDrawer';
import { useFlags } from 'src/hooks/useFlags';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
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

  const isLinodeCreateRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

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
              'All Akamai accounts must apply an InfoSec-compliant firewall to all their Linodes.'
            }
          />
        )}
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
