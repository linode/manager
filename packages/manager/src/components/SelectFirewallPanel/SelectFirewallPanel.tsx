import { Firewall } from '@linode/api-v4';
import { Stack } from 'src/components/Stack';
import * as React from 'react';

import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import { CreateFirewallDrawer } from 'src/features/Firewalls/FirewallLanding/CreateFirewallDrawer';
import { useFirewallsQuery } from 'src/queries/firewalls';

import { Autocomplete } from '../Autocomplete/Autocomplete';
import { LinkButton } from '../LinkButton';

interface Props {
  handleFirewallChange: (firewallID: number) => void;
  helperText: JSX.Element;
  selectedFirewallId: number;
}

export const createFirewallLabel = 'Additional Linodes (Optional)';

export const SelectFirewallPanel = (props: Props) => {
  const { handleFirewallChange, helperText, selectedFirewallId } = props;

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
        <LinkButton
          onClick={handleCreateFirewallClick}
          style={{ marginBottom: 16, marginTop: 12, textAlign: 'left' }}
        >
          Create Firewall
        </LinkButton>
        <CreateFirewallDrawer
          inCreateFlow
          onClose={() => setIsDrawerOpen(false)}
          onFirewallCreated={handleFirewallCreated}
          open={isDrawerOpen}
        />
      </Stack>
    </Paper>
  );
};
