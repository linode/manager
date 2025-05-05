import { Box, Paper, Stack, Typography } from '@linode/ui';
import React, { useState } from 'react';
import { useController } from 'react-hook-form';

import { AkamaiBanner } from 'src/components/AkamaiBanner/AkamaiBanner';
import { GenerateFirewallDialog } from 'src/components/GenerateFirewallDialog/GenerateFirewallDialog';
import { Link } from 'src/components/Link';
import { LinkButton } from 'src/components/LinkButton';
import { FIREWALL_GET_STARTED_LINK } from 'src/constants';
import { FirewallSelect } from 'src/features/Firewalls/components/FirewallSelect';
import { CreateFirewallDrawer } from 'src/features/Firewalls/FirewallLanding/CreateFirewallDrawer';
import { useFlags } from 'src/hooks/useFlags';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import { useSecureVMNoticesEnabled } from 'src/hooks/useSecureVMNoticesEnabled';
import { sendLinodeCreateFormInputEvent } from 'src/utilities/analytics/formEventAnalytics';

import { useLinodeCreateQueryParams } from './utilities';

import type { CreateLinodeRequest } from '@linode/api-v4';
import type { LinodeCreateFormEventOptions } from 'src/utilities/analytics/types';

export const Firewall = () => {
  const { field, fieldState } = useController<
    CreateLinodeRequest,
    'firewall_id'
  >({ name: 'firewall_id' });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = React.useState(false);

  const flags = useFlags();

  const { params } = useLinodeCreateQueryParams();

  const { secureVMNoticesEnabled } = useSecureVMNoticesEnabled();
  const secureVMFirewallBanner =
    (secureVMNoticesEnabled && flags.secureVmCopy) ?? false;

  const isLinodeCreateRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_linodes',
  });

  const firewallFormEventOptions: LinodeCreateFormEventOptions = {
    createType: params.type ?? 'OS',
    headerName: 'Firewall',
    interaction: 'click',
    label: 'Firewall',
  };

  return (
    <Paper>
      <Stack spacing={2}>
        <Typography variant="h2">Firewall</Typography>
        <Typography>
          Assign an existing Firewall to this Linode to control inbound and
          outbound network traffic.{' '}
          <Link
            onClick={() =>
              sendLinodeCreateFormInputEvent({
                createType: params.type ?? 'OS',
                headerName: 'Firewall',
                interaction: 'click',
                label: 'Learn more',
              })
            }
            to={FIREWALL_GET_STARTED_LINK}
          >
            Learn more
          </Link>
          .
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
          <FirewallSelect
            onChange={(e, firewall) => {
              field.onChange(firewall?.id);
              if (!firewall?.id) {
                sendLinodeCreateFormInputEvent({
                  ...firewallFormEventOptions,
                  interaction: 'clear',
                  subheaderName: 'Assign Firewall',
                  trackOnce: true,
                });
              } else {
                sendLinodeCreateFormInputEvent({
                  ...firewallFormEventOptions,
                  interaction: 'change',
                  subheaderName: 'Assign Firewall',
                  trackOnce: true,
                });
              }
            }}
            disabled={isLinodeCreateRestricted}
            errorText={fieldState.error?.message}
            label="Assign Firewall"
            onBlur={field.onBlur}
            placeholder="None"
            value={field.value}
          />
          <Box>
            <LinkButton
              onClick={() => {
                setIsDrawerOpen(true);
                sendLinodeCreateFormInputEvent({
                  ...firewallFormEventOptions,
                  label: 'Create Firewall',
                });
              }}
              isDisabled={isLinodeCreateRestricted}
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
      {secureVMNoticesEnabled && (
        <GenerateFirewallDialog
          onClose={() => setIsGenerateDialogOpen(false)}
          onFirewallGenerated={(firewall) => field.onChange(firewall.id)}
          open={isGenerateDialogOpen}
        />
      )}
    </Paper>
  );
};
