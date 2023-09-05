import Stack from '@mui/material/Stack';
import * as React from 'react';

import Select from 'src/components/EnhancedSelect';
import { Link } from 'src/components/Link';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import { useFirewallsQuery } from 'src/queries/firewalls';

import { StyledCreateLink } from './LinodeCreate.styles';

interface Props {
  handleFirewallChange: (firewallID: number) => void;
}

export const FirewallPanel = (props: Props) => {
  const { handleFirewallChange } = props;

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

  return (
    <Paper sx={(theme) => ({ marginTop: theme.spacing(3) })}>
      <Typography
        sx={(theme) => ({ marginBottom: theme.spacing(2) })}
        variant="h2"
      >
        Firewall
      </Typography>
      <Stack>
        <Typography>
          Assign an existing Firewall to this Linode to control the inbound and
          outbound network traffic. <Link to="">Learn more</Link>.
        </Typography>
        <Select
          defaultValue={firewallsDropdownOptions[0]}
          errorText={error?.[0].reason}
          isClearable={false}
          isLoading={isLoading}
          label="Assign Firewall"
          noOptionsMessage={() => 'Create a Firewall to assign to this Linode.'}
          onChange={(selection) => handleFirewallChange(selection.value)}
          options={firewallsDropdownOptions}
          placeholder={''}
        />
        <StyledCreateLink to="/firewalls/create">
          Create Firewall
        </StyledCreateLink>
      </Stack>
    </Paper>
  );
};
