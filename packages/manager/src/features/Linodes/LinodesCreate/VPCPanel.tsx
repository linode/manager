import Stack from '@mui/material/Stack';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Checkbox } from 'src/components/Checkbox';
import Select, { Item } from 'src/components/EnhancedSelect';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Link } from 'src/components/Link';
import { Paper } from 'src/components/Paper';
import { TextField } from 'src/components/TextField';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { useAccountManagement } from 'src/hooks/useAccountManagement';
import { useFlags } from 'src/hooks/useFlags';
import { useRegionsQuery } from 'src/queries/regions';
import { useVPCsQuery } from 'src/queries/vpcs';
import { isFeatureEnabled } from 'src/utilities/accountCapabilities';
import { doesRegionSupportFeature } from 'src/utilities/doesRegionSupportFeature';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { StyledCreateLink } from './LinodeCreate.styles';

interface VPCPanelProps {
  assignPublicIPv4Address: boolean;
  autoassignIPv4WithinVPC: boolean;
  handleSelectVPC: (vpcID: number) => void;
  handleSubnetChange: (subnetID: number) => void;
  handleVPCIPv4Change: (IPv4: string) => void;
  region?: string;
  selectedVPCID: number | undefined;
  toggleAssignPublicIPv4Address: () => void;
  toggleAutoassignIPv4WithinVPCEnabled: () => void;
  vpcIPv4AddressOfLinode: string | undefined;
}

export const VPCPanel = (props: VPCPanelProps) => {
  const {
    assignPublicIPv4Address,
    autoassignIPv4WithinVPC,
    handleSelectVPC,
    handleSubnetChange,
    handleVPCIPv4Change,
    region,
    selectedVPCID,
    toggleAssignPublicIPv4Address,
    toggleAutoassignIPv4WithinVPCEnabled,
    vpcIPv4AddressOfLinode,
  } = props;

  const [selectedVPC, setSelectedVPC] = React.useState<number>(-1);

  const flags = useFlags();
  const { account } = useAccountManagement();
  const { data: vpcData, error, isLoading } = useVPCsQuery({}, {});

  const regions = useRegionsQuery().data ?? [];
  const selectedRegion = region || '';

  const regionSupportsVPCs = doesRegionSupportFeature(
    selectedRegion,
    regions,
    'VPCs'
  );

  const displayVPCPanel = isFeatureEnabled(
    'VPCs',
    Boolean(flags.vpc),
    account?.capabilities ?? []
  );

  if (!displayVPCPanel) {
    return null;
  }

  const vpcs = vpcData?.data ?? [];

  const vpcDropdownOptions: Item[] = vpcs.reduce((accumulator, vpc) => {
    return vpc.region === region
      ? [...accumulator, { label: vpc.label, value: vpc.id }]
      : accumulator;
  }, []);

  vpcDropdownOptions.unshift({
    label: 'None',
    value: -1,
  });

  const subnetDropdownOptions: Item[] =
    vpcs
      .find((vpc) => vpc.id === selectedVPC)
      ?.subnets.map((subnet) => ({
        label: subnet.label,
        value: subnet.id,
      })) ?? [];

  const vpcError = error
    ? getAPIErrorOrDefault(error, 'Unable to load VPCs')[0].reason
    : undefined;

  const mainCopyVPC =
    vpcDropdownOptions.length <= 1
      ? 'Allow Linode to communicate in an isolated environment.'
      : 'Assign this Linode to an existing VPC.';

  return (
    <Paper sx={(theme) => ({ marginTop: theme.spacing(3) })}>
      <Typography
        sx={(theme) => ({ marginBottom: theme.spacing(2) })}
        variant="h2"
      >
        VPC
      </Typography>
      <Stack>
        <Typography>
          {mainCopyVPC} <Link to="">Learn more</Link>.
        </Typography>
        <Select
          onChange={(selectedVPC: Item<number, string>) => {
            handleSelectVPC(selectedVPC.value);
            setSelectedVPC(selectedVPC.value);
          }}
          textFieldProps={{
            tooltipText: REGION_CAVEAT_HELPER_TEXT,
          }}
          value={vpcDropdownOptions.find(
            (option) => option.value === selectedVPCID
          )}
          defaultValue={vpcDropdownOptions[0]}
          disabled={!regionSupportsVPCs}
          errorText={vpcError}
          isClearable={false}
          isLoading={isLoading}
          label="Assign VPC"
          noOptionsMessage={() => 'Create a VPC to assign to this Linode.'}
          options={vpcDropdownOptions}
          placeholder={''}
        />
        {vpcDropdownOptions.length <= 1 && regionSupportsVPCs && (
          <Typography sx={(theme) => ({ paddingTop: theme.spacing(1.5) })}>
            No VPCs exist in the selected region. Click Create VPC to create
            one.
          </Typography>
        )}

        <StyledCreateLink to="/vpc/create">Create VPC</StyledCreateLink>

        {selectedVPC !== -1 && regionSupportsVPCs && (
          <Stack>
            <Select
              onChange={(selectedSubnet: Item<number, string>) =>
                handleSubnetChange(selectedSubnet.value)
              }
              isClearable={false}
              label="Subnet"
              options={subnetDropdownOptions}
              placeholder="Select Subnet"
            />
            <Box
              sx={(theme) => ({
                marginLeft: '2px',
                paddingTop: theme.spacing(),
              })}
              alignItems="center"
              display="flex"
              flexDirection="row"
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={autoassignIPv4WithinVPC}
                    onChange={toggleAutoassignIPv4WithinVPCEnabled}
                  />
                }
                label={
                  <Box
                    alignItems="center"
                    display="flex"
                    flexDirection="row"
                    sx={{}}
                  >
                    <Typography noWrap>
                      Auto-assign a private IPv4 address for this Linode in the
                      VPC
                    </Typography>
                    <TooltipIcon
                      text={
                        'A range of non-internet facing IP addresses used in an internal network.'
                      }
                      status="help"
                    />
                  </Box>
                }
              />
            </Box>
            {!autoassignIPv4WithinVPC ? (
              <TextField
                label="VPC IPv4"
                onChange={(e) => handleVPCIPv4Change(e.target.value)}
                value={vpcIPv4AddressOfLinode}
              />
            ) : null}
            <Box
              sx={{
                marginLeft: '2px',
              }}
              alignItems="center"
              display="flex"
              flexDirection="row"
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={assignPublicIPv4Address}
                    onChange={toggleAssignPublicIPv4Address}
                  />
                }
                label={
                  <Box
                    alignItems="center"
                    display="flex"
                    flexDirection="row"
                    sx={{}}
                  >
                    <Typography>
                      Assign a public IPv4 address for this Linode
                    </Typography>
                    <TooltipIcon
                      text={
                        'A public IP address is an IPv4 address that is reachable from the internet.'
                      }
                      status="help"
                    />
                  </Box>
                }
              />
            </Box>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};

const REGION_CAVEAT_HELPER_TEXT =
  'A Linode may only be assigned to a VPC in the same region.';
