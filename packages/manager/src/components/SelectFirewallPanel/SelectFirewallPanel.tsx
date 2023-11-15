import { Firewall, FirewallDeviceEntityType } from '@linode/api-v4';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Paper } from 'src/components/Paper';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { CreateFirewallDrawer } from 'src/features/Firewalls/FirewallLanding/CreateFirewallDrawer';
import { useFirewallsQuery } from 'src/queries/firewalls';

import { Autocomplete } from '../Autocomplete/Autocomplete';
import { LinkButton } from '../LinkButton';

interface Props {
  entityType?: FirewallDeviceEntityType;
  handleFirewallChange: (firewallID: number) => void;
  helperText: JSX.Element;
  selectedFirewallId: number;
}

export const SelectFirewallPanel = (props: Props) => {
  const {
    entityType,
    handleFirewallChange,
    helperText,
    selectedFirewallId,
  } = props;

  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

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
    selectedFirewallId !== -1
      ? firewallsDropdownOptions.find(
          (option) => option.value === selectedFirewallId
        ) || null
      : null;

  return (
    <Paper
      data-testid="select-firewall-panel"
      sx={(theme) => ({ marginTop: theme.spacing(3) })}
    >
      <Typography
        sx={(theme) => ({ marginBottom: theme.spacing(2) })}
        variant="h2"
      >
        Firewall
      </Typography>
      <Stack>
        {helperText}
        <Autocomplete
          onChange={(_, selection) => {
            handleFirewallChange(selection?.value ?? -1);
          }}
          errorText={error?.[0].reason}
          label="Assign Firewall"
          loading={isLoading}
          noOptionsText="No Firewalls available"
          options={firewallsDropdownOptions}
          placeholder={'None'}
          value={selectedFirewall}
        />
        <StyledLinkButtonBox>
          <LinkButton onClick={handleCreateFirewallClick}>
            Create Firewall
          </LinkButton>
        </StyledLinkButtonBox>
        <CreateFirewallDrawer
          createFlow={entityType}
          onClose={() => setIsDrawerOpen(false)}
          onFirewallCreated={handleFirewallCreated}
          open={isDrawerOpen}
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
