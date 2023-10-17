import Stack from '@mui/material/Stack';
import * as React from 'react';

import Select from 'src/components/EnhancedSelect';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import { CreateFirewallDrawer } from 'src/features/Firewalls/FirewallLanding/CreateFirewallDrawer';
import { useFirewallsQuery } from 'src/queries/firewalls';

import { StyledCreateLink } from '../../features/Linodes/LinodesCreate/LinodeCreate.styles';

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

  const handleFirewallCreated = (id: number, label: string) => {
    setDropdownValue({ label, value: id });
    handleFirewallChange(id);
  };

  const { data: firewallsData, error, isLoading } = useFirewallsQuery();

  const firewalls = firewallsData?.data ?? [];
  const firewallsDropdownOptions = firewalls.map((firewall) => ({
    label: firewall.label,
    value: firewall.id,
  }));

  firewallsDropdownOptions.unshift({
    label: 'None',
    value: -1,
  });

  const [dropdownValue, setDropdownValue] = React.useState<{
    label: string;
    value: number;
  }>(firewallsDropdownOptions[0]);

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
        <Select
          onChange={(selection) => {
            setDropdownValue(selection);
            handleFirewallChange(selection.value);
          }}
          errorText={error?.[0].reason}
          isClearable={false}
          isLoading={isLoading}
          label="Assign Firewall"
          noOptionsMessage={() => 'Create a Firewall to assign to this Linode.'}
          options={firewallsDropdownOptions}
          placeholder={''}
          value={dropdownValue}
        />
        <StyledCreateLink
          onClick={(e) => {
            e.preventDefault();
            handleCreateFirewallClick();
          }}
          to="#"
        >
          Create Firewall
        </StyledCreateLink>
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
