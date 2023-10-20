import { Firewall } from '@linode/api-v4';
import Stack from '@mui/material/Stack';
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
}

export const createFirewallLabel = 'Additional Linodes (Optional)';

export const SelectFirewallPanel = (props: Props) => {
  const { handleFirewallChange, helperText } = props;

  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const handleCreateFirewallClick = () => {
    setIsDrawerOpen(true);
  };

  const handleFirewallCreated = (firewall: Firewall) => {
    setDropdownValue({ label: firewall.label, value: firewall.id });
    handleFirewallChange(firewall.id);
  };

  const { data: firewallsData, error, isLoading } = useFirewallsQuery();

  const firewalls = firewallsData?.data ?? [];
  const firewallsDropdownOptions = firewalls.map((firewall) => ({
    label: firewall.label,
    value: firewall.id,
  }));

  const [dropdownValue, setDropdownValue] = React.useState<{
    label: string;
    value: number;
  } | null>(null);

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
            setDropdownValue(selection);
            handleFirewallChange(selection?.value ?? -1);
          }}
          errorText={error?.[0].reason}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          label="Assign Firewall"
          loading={isLoading}
          noOptionsText="Create a Firewall to assign to this Linode."
          options={firewallsDropdownOptions}
          placeholder={'None'}
          value={dropdownValue}
        />
        <LinkButton
          onClick={handleCreateFirewallClick}
          style={{ marginBottom: 16, marginTop: 12, textAlign: 'left' }}
        >
          Create Firewall
        </LinkButton>
        <CreateFirewallDrawer
          label={createFirewallLabel}
          onClose={() => setIsDrawerOpen(false)}
          onFirewallCreated={handleFirewallCreated}
          open={isDrawerOpen}
        />
      </Stack>
    </Paper>
  );
};
