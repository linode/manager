import { Firewall } from '@linode/api-v4';
import { Stack } from '@mui/material';
import { Theme, useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Action } from 'src/components/ActionMenu';
import { Box } from 'src/components/Box';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { Typography } from 'src/components/Typography';
import { RemoveDeviceDialog } from 'src/features/Firewalls/FirewallDetail/Devices/RemoveDeviceDialog';
import { noPermissionTooltipText } from 'src/features/Firewalls/FirewallLanding/FirewallActionMenu';
import {
  StyledLink,
  getCountOfRules,
  getRuleString,
} from 'src/features/Firewalls/FirewallLanding/FirewallRow';
import { useAllFirewallDevicesQuery } from 'src/queries/firewalls';
import { useLinodeFirewallsQuery } from 'src/queries/linodes/firewalls';
import { useGrants, useProfile } from 'src/queries/profile';
import { capitalize } from 'src/utilities/capitalize';

interface LinodeFirewallsProps {
  linodeID: number;
}

// Action menu
interface LinodeFirewallsActionMenuProps {
  firewallID: number;
  onUnassign: () => void;
}

const LinodeFirewallsActionMenu = (props: LinodeFirewallsActionMenuProps) => {
  const { firewallID, onUnassign } = props;

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();

  const userCanModifyFirewall =
    !profile?.restricted ||
    grants?.firewall?.find((firewall) => firewall.id === firewallID)
      ?.permissions === 'read_write';

  const disabledProps = !userCanModifyFirewall
    ? {
        disabled: true,
        tooltip: noPermissionTooltipText,
      }
    : {};

  const action: Action = {
    onClick: () => {
      onUnassign();
    },
    title: 'Unassign',
    ...disabledProps,
  };

  return (
    <InlineMenuAction
      actionText={action.title}
      disabled={action.disabled}
      key={action.title}
      onClick={action.onClick}
    />
  );
};

// Row
interface LinodeFirewallsRowProps {
  firewall: Firewall;
  triggerRemoveDevice: () => void;
}

const LinodeFirewallsRow = (props: LinodeFirewallsRowProps) => {
  const {
    firewall: { id, label, rules, status },
    triggerRemoveDevice,
  } = props;

  const count = getCountOfRules(rules);

  return (
    <TableRow
      ariaLabel={`Firewall ${label}`}
      data-qa-linode-firewall-row
      key={`firewall-${id}`}
    >
      <TableCell data-qa-firewall-label>
        <StyledLink tabIndex={0} to={`/firewalls/${id}`}>
          {label}
        </StyledLink>
      </TableCell>
      <TableCell data-qa-firewall-status statusCell>
        <StatusIcon status={status === 'enabled' ? 'active' : 'inactive'} />
        {capitalize(status)}
      </TableCell>
      <TableCell data-qa-firewall-rules>{getRuleString(count)}</TableCell>
      <TableCell actionCell>
        <LinodeFirewallsActionMenu
          firewallID={id}
          onUnassign={triggerRemoveDevice}
        />
      </TableCell>
    </TableRow>
  );
};

// Component
export const LinodeFirewalls = (props: LinodeFirewallsProps) => {
  const { linodeID } = props;

  const theme = useTheme<Theme>();

  const {
    data: attachedFirewallData,
    error,
    isLoading,
  } = useLinodeFirewallsQuery(linodeID);

  const attachedFirewall = attachedFirewallData?.data[0];

  const { data: devices } = useAllFirewallDevicesQuery(
    attachedFirewall?.id ?? -1
  );

  const [
    isRemoveDeviceDialogOpen,
    setIsRemoveDeviceDialogOpen,
  ] = React.useState<boolean>(false);

  const firewallDevice = devices?.find(
    (device) => device.entity.type === 'linode' && device.entity.id === linodeID
  );

  const renderTableContent = () => {
    if (isLoading) {
      return <TableRowLoading columns={5} rows={1} />;
    }

    if (error) {
      return <ErrorState errorText={error?.[0].reason} />;
    }

    if (!attachedFirewall) {
      return <TableRowEmpty colSpan={5} message="No Firewalls are assigned." />;
    }

    return (
      <LinodeFirewallsRow
        firewall={attachedFirewall}
        triggerRemoveDevice={() => setIsRemoveDeviceDialogOpen(true)}
      />
    );
  };

  return (
    <Stack sx={{ marginTop: '20px' }}>
      <Box bgcolor={theme.color.white} display="flex">
        <Typography
          sx={{
            lineHeight: '1.5rem',
            marginBottom: theme.spacing(),
            marginLeft: '15px',
            marginTop: theme.spacing(),
          }}
          variant="h3"
        >
          Firewalls
        </Typography>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Firewall</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Rules</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{renderTableContent()}</TableBody>
      </Table>
      <RemoveDeviceDialog
        device={firewallDevice}
        firewallId={attachedFirewall?.id ?? -1}
        firewallLabel={attachedFirewall?.label ?? ''}
        linodeId={linodeID}
        onClose={() => setIsRemoveDeviceDialogOpen(false)}
        onLinodeNetworkTab
        open={isRemoveDeviceDialogOpen}
      />
    </Stack>
  );
};
