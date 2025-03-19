import { Autocomplete, Box, Paper, Stack, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { CreateFirewallDrawer } from 'src/features/Firewalls/FirewallLanding/CreateFirewallDrawer';
import { useFlags } from 'src/hooks/useFlags';
import { useSecureVMNoticesEnabled } from 'src/hooks/useSecureVMNoticesEnabled';
import { useFirewallsQuery } from '@linode/queries';

import { AkamaiBanner } from '../AkamaiBanner/AkamaiBanner';
import { GenerateFirewallDialog } from '../GenerateFirewallDialog/GenerateFirewallDialog';
import { LinkButton } from '../LinkButton';

import type { Firewall, FirewallDeviceEntityType } from '@linode/api-v4';

interface Props {
  disabled?: boolean;
  entityType: FirewallDeviceEntityType | undefined;
  handleFirewallChange: (firewallID: number | undefined) => void;
  helperText: JSX.Element;
  selectedFirewallId: number | undefined;
}

export const SelectFirewallPanel = (props: Props) => {
  const {
    disabled,
    entityType,
    handleFirewallChange,
    helperText,
    selectedFirewallId,
  } = props;

  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isFirewallDialogOpen, setIsFirewallDialogOpen] = React.useState(false);

  const flags = useFlags();

  const { secureVMNoticesEnabled } = useSecureVMNoticesEnabled();
  const secureVMFirewallBanner =
    (secureVMNoticesEnabled && flags.secureVmCopy) ?? false;

  const handleCreateFirewallClick = () => {
    setIsDrawerOpen(true);
  };

  const handleFirewallCreated = (firewall: Firewall) => {
    handleFirewallChange(firewall.id);
  };

  const { data: firewallsData, error, isLoading } = useFirewallsQuery();

  const firewalls = firewallsData?.data ?? [];
  const firewallsDropdownOptions = firewalls.map((firewall) => ({
    label: firewall.label,
    value: firewall.id,
  }));

  const selectedFirewall =
    selectedFirewallId !== undefined
      ? firewallsDropdownOptions.find(
          (option) => option.value === selectedFirewallId
        ) || null
      : null;

  return (
    <Paper data-testid="select-firewall-panel">
      <Typography
        sx={(theme) => ({ marginBottom: theme.spacing(2) })}
        variant="h2"
      >
        Firewall
      </Typography>
      <Stack>
        {helperText}
        {secureVMFirewallBanner !== false &&
          secureVMFirewallBanner.linodeCreate && (
            <AkamaiBanner
              action={
                secureVMFirewallBanner.generateActionText ? (
                  <LinkButton onClick={() => setIsFirewallDialogOpen(true)}>
                    {secureVMFirewallBanner.generateActionText}
                  </LinkButton>
                ) : undefined
              }
              margin={2}
              {...secureVMFirewallBanner.linodeCreate}
            />
          )}
        <Autocomplete
          disabled={disabled}
          errorText={error?.[0].reason}
          label="Assign Firewall"
          loading={isLoading}
          noOptionsText="No Firewalls available"
          onChange={(_, selection) => handleFirewallChange(selection?.value)}
          options={firewallsDropdownOptions}
          placeholder={'None'}
          value={selectedFirewall}
        />
        <StyledLinkButtonBox>
          <LinkButton isDisabled={disabled} onClick={handleCreateFirewallClick}>
            Create Firewall
          </LinkButton>
        </StyledLinkButtonBox>
        <CreateFirewallDrawer
          createFlow={entityType}
          onClose={() => setIsDrawerOpen(false)}
          onFirewallCreated={handleFirewallCreated}
          open={isDrawerOpen}
        />
        <GenerateFirewallDialog
          onClose={() => setIsFirewallDialogOpen(false)}
          onFirewallGenerated={handleFirewallCreated}
          open={isFirewallDialogOpen}
        />
      </Stack>
    </Paper>
  );
};

export const StyledLinkButtonBox = styled(Box, {
  label: 'StyledLinkButtonBox',
})({
  display: 'flex',
  justifyContent: 'flex-start',
  marginTop: '12px',
});
