import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Checkbox } from 'src/components/Checkbox';
import Select, { Item } from 'src/components/EnhancedSelect';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Link } from 'src/components/Link';
import { LinkButton } from 'src/components/LinkButton';
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
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';

import { REGION_CAVEAT_HELPER_TEXT } from './constants';
import { VPCCreateDrawer } from './VPCCreateDrawer';

export interface VPCPanelProps {
  assignPublicIPv4Address: boolean;
  autoassignIPv4WithinVPC: boolean;
  from: 'linodeConfig' | 'linodeCreate';
  handleSelectVPC: (vpcId: number) => void;
  handleSubnetChange: (subnetId: number) => void;
  handleVPCIPv4Change: (IPv4: string) => void;
  publicIPv4Error?: string;
  region: string | undefined;
  selectedSubnetId: null | number | undefined;
  selectedVPCId: null | number | undefined;
  subnetError?: string;
  toggleAssignPublicIPv4Address: () => void;
  toggleAutoassignIPv4WithinVPCEnabled: () => void;
  vpcIPv4AddressOfLinode: string | undefined;
  vpcIPv4Error?: string;
  vpcIdError?: string;
}

const ERROR_GROUP_STRING = 'vpc-errors';

export const VPCPanel = (props: VPCPanelProps) => {
  const {
    assignPublicIPv4Address,
    autoassignIPv4WithinVPC,
    from,
    handleSelectVPC,
    handleSubnetChange,
    handleVPCIPv4Change,
    publicIPv4Error,
    region,
    selectedSubnetId,
    selectedVPCId,
    subnetError,
    toggleAssignPublicIPv4Address,
    toggleAutoassignIPv4WithinVPCEnabled,
    vpcIPv4AddressOfLinode,
    vpcIPv4Error,
    vpcIdError,
  } = props;

  const theme = useTheme();
  const isSmallBp = useMediaQuery(theme.breakpoints.down('sm'));

  const flags = useFlags();
  const { account } = useAccountManagement();

  const regions = useRegionsQuery().data ?? [];
  const selectedRegion = region || '';

  const regionSupportsVPCs = doesRegionSupportFeature(
    selectedRegion,
    regions,
    'VPCs'
  );

  const [isVPCCreateDrawerOpen, setIsVPCCreateDrawerOpen] = React.useState(
    false
  );

  const displayVPCPanel = isFeatureEnabled(
    'VPCs',
    Boolean(flags.vpc),
    account?.capabilities ?? []
  );

  /* To prevent unnecessary API calls, pass the displayVPCPanel boolean to determine
     whether the query is enabled and whether it should refetchOnWindowFocus
  */
  const { data: vpcData, error, isLoading } = useVPCsQuery(
    {},
    {},
    displayVPCPanel,
    displayVPCPanel
  );

  React.useEffect(() => {
    if (subnetError || vpcIPv4Error) {
      scrollErrorIntoView(ERROR_GROUP_STRING);
    }
  }, [subnetError, vpcIPv4Error]);

  if (!displayVPCPanel) {
    return null;
  }

  const vpcs = vpcData?.data ?? [];

  const vpcDropdownOptions: Item[] = vpcs.reduce((accumulator, vpc) => {
    return vpc.region === region
      ? [...accumulator, { label: vpc.label, value: vpc.id }]
      : accumulator;
  }, []);

  const fromLinodeCreate = from === 'linodeCreate';
  const fromLinodeConfig = from === 'linodeConfig';

  if (fromLinodeCreate) {
    vpcDropdownOptions.unshift({
      label: 'None',
      value: -1,
    });
  }

  const subnetDropdownOptions: Item[] =
    vpcs
      .find((vpc) => vpc.id === selectedVPCId)
      ?.subnets.map((subnet) => ({
        label: `${subnet.label} (${subnet.ipv4 ?? 'No IPv4 range provided'})`, // @TODO VPC: Support for IPv6 down the line
        value: subnet.id,
      })) ?? [];

  const vpcError = error
    ? getAPIErrorOrDefault(error, 'Unable to load VPCs')[0].reason
    : undefined;

  const getMainCopyVPC = () => {
    if (fromLinodeConfig) {
      return null;
    }

    const copy =
      vpcDropdownOptions.length <= 1
        ? 'Allow Linode to communicate in an isolated environment.'
        : 'Assign this Linode to an existing VPC.';

    return (
      <>
        {/* @TODO VPC: Update link */}
        {copy} <Link to="">Learn more</Link>.
      </>
    );
  };

  return (
    <>
      <Paper
        sx={(theme) => ({
          ...(fromLinodeCreate && {
            marginTop: theme.spacing(3),
          }),
          ...(fromLinodeConfig && {
            padding: 0,
          }),
        })}
        data-testid="vpc-panel"
      >
        {fromLinodeCreate && (
          <Typography
            sx={(theme) => ({ marginBottom: theme.spacing(2) })}
            variant="h2"
          >
            VPC
          </Typography>
        )}
        <Stack>
          <Typography>{getMainCopyVPC()}</Typography>
          <Select
            onChange={(selectedVPC: Item<number, string>) => {
              handleSelectVPC(selectedVPC.value);
            }}
            textFieldProps={{
              tooltipText: REGION_CAVEAT_HELPER_TEXT,
            }}
            value={vpcDropdownOptions.find(
              (option) => option.value === selectedVPCId
            )}
            defaultValue={fromLinodeConfig ? null : vpcDropdownOptions[0]} // If we're in the Config dialog, there is no "None" option at index 0
            disabled={!regionSupportsVPCs}
            errorText={vpcIdError ?? vpcError}
            isClearable={false}
            isLoading={isLoading}
            label={from === 'linodeCreate' ? 'Assign VPC' : 'VPC'}
            noOptionsMessage={() => 'Create a VPC to assign to this Linode.'}
            options={vpcDropdownOptions}
            placeholder={'Select a VPC'}
          />
          {vpcDropdownOptions.length <= 1 && regionSupportsVPCs && (
            <Typography sx={(theme) => ({ paddingTop: theme.spacing(1.5) })}>
              No VPCs exist in the selected region. Click Create VPC to create
              one.
            </Typography>
          )}

          {from === 'linodeCreate' && (
            <LinkButton
              isDisabled={!regionSupportsVPCs}
              onClick={() => setIsVPCCreateDrawerOpen(true)}
              style={{ marginBottom: 16, marginTop: 12, textAlign: 'left' }}
            >
              Create VPC
            </LinkButton>
          )}

          {selectedVPCId !== -1 && regionSupportsVPCs && (
            <Stack data-testid="subnet-and-additional-options-section">
              <Select
                onChange={(selectedSubnet: Item<number, string>) =>
                  handleSubnetChange(selectedSubnet.value)
                }
                value={
                  subnetDropdownOptions.find(
                    (option) => option.value === selectedSubnetId
                  ) || null
                }
                errorGroup={ERROR_GROUP_STRING}
                errorText={subnetError}
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
                      <Typography
                        noWrap={!isSmallBp && from === 'linodeConfig'}
                      >
                        Auto-assign a VPC IPv4 address for this Linode in the
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
                  data-testid="vpc-ipv4-checkbox"
                />
              </Box>
              {!autoassignIPv4WithinVPC && (
                <TextField
                  errorGroup={ERROR_GROUP_STRING}
                  errorText={vpcIPv4Error}
                  label="VPC IPv4"
                  onChange={(e) => handleVPCIPv4Change(e.target.value)}
                  required={!autoassignIPv4WithinVPC}
                  value={vpcIPv4AddressOfLinode}
                />
              )}
              <Box
                sx={(theme) => ({
                  marginLeft: '2px',
                  marginTop: !autoassignIPv4WithinVPC ? theme.spacing() : 0,
                })}
                alignItems="center"
                display="flex"
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={assignPublicIPv4Address}
                      onChange={toggleAssignPublicIPv4Address}
                    />
                  }
                  label={
                    <Box alignItems="center" display="flex" flexDirection="row">
                      <Typography>
                        Assign a public IPv4 address for this Linode
                      </Typography>
                      <TooltipIcon
                        text={
                          'Assign a public IP address for this VPC via 1:1 static NAT.'
                        }
                        status="help"
                      />
                    </Box>
                  }
                />
                {assignPublicIPv4Address && publicIPv4Error && (
                  <Typography
                    sx={(theme) => ({
                      color: theme.color.red,
                    })}
                  >
                    {publicIPv4Error}
                  </Typography>
                )}
              </Box>
            </Stack>
          )}
        </Stack>
      </Paper>
      {isVPCCreateDrawerOpen &&
        from === 'linodeCreate' &&
        regionSupportsVPCs && (
          <VPCCreateDrawer
            handleSelectVPC={(vpcId: number) => handleSelectVPC(vpcId)}
            onClose={() => setIsVPCCreateDrawerOpen(false)}
            open={isVPCCreateDrawerOpen}
            selectedRegion={region}
          />
        )}
    </>
  );
};
