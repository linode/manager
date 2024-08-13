import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import * as React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { Box } from 'src/components/Box';
import { Checkbox } from 'src/components/Checkbox';
import { FormControlLabel } from 'src/components/FormControlLabel';
import { Link } from 'src/components/Link';
import { LinkButton } from 'src/components/LinkButton';
import { Paper } from 'src/components/Paper';
import { StyledLinkButtonBox } from 'src/components/SelectFirewallPanel/SelectFirewallPanel';
import { Stack } from 'src/components/Stack';
import { TextField } from 'src/components/TextField';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { VPC_AUTO_ASSIGN_IPV4_TOOLTIP } from 'src/features/VPCs/constants';
import { AssignIPRanges } from 'src/features/VPCs/VPCDetail/AssignIPRanges';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { useAllVPCsQuery } from 'src/queries/vpcs/vpcs';
import { sendLinodeCreateFormInputEvent } from 'src/utilities/analytics/formEventAnalytics';
import { doesRegionSupportFeature } from 'src/utilities/doesRegionSupportFeature';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';

import { REGION_CAVEAT_HELPER_TEXT } from './constants';
import { VPCCreateDrawer } from './VPCCreateDrawer';

import type { LinodeCreateQueryParams } from 'src/features/Linodes/types';
import type { LinodeCreateFormEventOptions } from 'src/utilities/analytics/types';
import type { ExtendedIP } from 'src/utilities/ipUtils';

export interface VPCPanelProps {
  additionalIPv4RangesForVPC: ExtendedIP[];
  assignPublicIPv4Address: boolean;
  autoassignIPv4WithinVPC: boolean;
  from: 'linodeConfig' | 'linodeCreate';
  handleIPv4RangeChange: (ranges: ExtendedIP[]) => void;
  handleSelectVPC: (vpcId: number) => void;
  handleSubnetChange: (subnetId: number | undefined) => void;
  handleVPCIPv4Change: (IPv4: string) => void;
  publicIPv4Error?: string;
  region: string | undefined;
  selectedSubnetId: null | number | undefined;
  selectedVPCId: null | number | undefined;
  subnetError?: string;
  toggleAssignPublicIPv4Address: () => void;
  toggleAutoassignIPv4WithinVPCEnabled: () => void;
  vpcIPRangesError?: string;
  vpcIPv4AddressOfLinode: string | undefined;
  vpcIPv4Error?: string;
  vpcIdError?: string;
}

const ERROR_GROUP_STRING = 'vpc-errors';

export const VPCPanel = (props: VPCPanelProps) => {
  const {
    additionalIPv4RangesForVPC,
    assignPublicIPv4Address,
    autoassignIPv4WithinVPC,
    from,
    handleIPv4RangeChange,
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
    vpcIPRangesError,
    vpcIPv4AddressOfLinode,
    vpcIPv4Error,
    vpcIdError,
  } = props;

  const theme = useTheme();
  const isSmallBp = useMediaQuery(theme.breakpoints.down('sm'));

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

  const { data: vpcsData, error, isLoading } = useAllVPCsQuery();

  React.useEffect(() => {
    if (subnetError || vpcIPv4Error) {
      scrollErrorIntoView(ERROR_GROUP_STRING);
    }
  }, [subnetError, vpcIPv4Error]);

  const params = getQueryParamsFromQueryString<LinodeCreateQueryParams>(
    location.search
  );
  const vpcFormEventOptions: LinodeCreateFormEventOptions = {
    createType: params.type ?? 'OS',
    headerName: 'VPC',
    interaction: 'click',
    label: 'VPC',
  };

  const vpcs = vpcsData ?? [];

  const fromLinodeCreate = from === 'linodeCreate';
  const fromLinodeConfig = from === 'linodeConfig';

  interface DropdownOption {
    label: string;
    value: number;
  }

  const vpcDropdownOptions: DropdownOption[] = React.useMemo(() => {
    return vpcs.reduce(
      (accumulator, vpc) => {
        return vpc.region === region
          ? [...accumulator, { label: vpc.label, value: vpc.id }]
          : accumulator;
      },
      fromLinodeCreate ? [{ label: 'None', value: -1 }] : []
    );
  }, [vpcs, region, fromLinodeCreate]);

  const subnetDropdownOptions: DropdownOption[] =
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
        {copy}{' '}
        <Link
          onClick={() =>
            fromLinodeCreate &&
            sendLinodeCreateFormInputEvent({
              ...vpcFormEventOptions,
              label: 'Learn more',
            })
          }
          to="https://www.linode.com/docs/products/networking/vpc/guides/assign-services/"
        >
          Learn more
        </Link>
        .
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
          <Autocomplete
            isOptionEqualToValue={(option, value) => {
              return option.label === value.label;
            }}
            onChange={(_, selectedVPC) => {
              handleSelectVPC(selectedVPC?.value || -1);
              // Track clearing and changing the value once per page view, configured by inputValue in AA backend.
              if (selectedVPC?.label === 'None') {
                sendLinodeCreateFormInputEvent({
                  ...vpcFormEventOptions,
                  interaction: 'clear',
                  subheaderName: 'Assign VPC',
                  trackOnce: true,
                });
              } else {
                sendLinodeCreateFormInputEvent({
                  ...vpcFormEventOptions,
                  interaction: 'change',
                  subheaderName: 'Assign VPC',
                  trackOnce: true,
                });
              }
            }}
            textFieldProps={{
              tooltipText: REGION_CAVEAT_HELPER_TEXT,
            }}
            value={
              selectedVPCId && selectedVPCId !== -1
                ? vpcDropdownOptions.find(
                    (option) => option.value === selectedVPCId
                  ) || null
                : null
            }
            autoHighlight
            clearIcon={null}
            defaultValue={fromLinodeConfig ? null : vpcDropdownOptions[0]} // If we're in the Config dialog, there is no "None" option at index 0
            disabled={!regionSupportsVPCs}
            errorText={vpcIdError ?? vpcError}
            label={from === 'linodeCreate' ? 'Assign VPC' : 'VPC'}
            loading={isLoading}
            noOptionsText="No VPCs exist in this Linode's region."
            options={vpcDropdownOptions}
            placeholder={'Select a VPC'}
          />
          {from === 'linodeCreate' &&
            vpcDropdownOptions.length <= 1 &&
            regionSupportsVPCs && (
              <Typography sx={(theme) => ({ paddingTop: theme.spacing(1.5) })}>
                No VPCs exist in the selected region. Click Create VPC to create
                one.
              </Typography>
            )}
          {from === 'linodeCreate' &&
            (regionSupportsVPCs ? (
              <StyledLinkButtonBox>
                <LinkButton
                  onClick={() => {
                    setIsVPCCreateDrawerOpen(true);
                    sendLinodeCreateFormInputEvent({
                      ...vpcFormEventOptions,
                      label: 'Create VPC',
                    });
                  }}
                >
                  Create VPC
                </LinkButton>
              </StyledLinkButtonBox>
            ) : (
              region && (
                <Typography
                  sx={(theme) => ({ paddingTop: theme.spacing(1.5) })}
                >
                  VPC is not available in the selected region.
                </Typography>
              )
            ))}

          {selectedVPCId !== -1 && regionSupportsVPCs && (
            <Stack data-testid="subnet-and-additional-options-section">
              <Autocomplete
                onChange={(_, selectedSubnet) => {
                  handleSubnetChange(selectedSubnet?.value);
                }}
                textFieldProps={{
                  errorGroup: ERROR_GROUP_STRING,
                }}
                value={
                  subnetDropdownOptions.find(
                    (option) => option.value === selectedSubnetId
                  ) ?? null
                }
                autoHighlight
                clearIcon={null}
                errorText={subnetError}
                label="Subnet"
                options={subnetDropdownOptions}
                placeholder="Select Subnet"
              />
              {selectedSubnetId && (
                <>
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
                        >
                          <Typography
                            noWrap={!isSmallBp && from === 'linodeConfig'}
                          >
                            Auto-assign a VPC IPv4 address for this Linode in
                            the VPC
                          </Typography>
                          <TooltipIcon
                            status="help"
                            text={VPC_AUTO_ASSIGN_IPV4_TOOLTIP}
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
                        <Box
                          alignItems="center"
                          display="flex"
                          flexDirection="row"
                        >
                          <Typography>
                            Assign a public IPv4 address for this Linode
                          </Typography>
                          <TooltipIcon
                            text={
                              'Access the internet through the public IPv4 address using static 1:1 NAT.'
                            }
                            status="help"
                          />
                        </Box>
                      }
                    />
                  </Box>
                  {assignPublicIPv4Address && publicIPv4Error && (
                    <Typography
                      sx={(theme) => ({
                        color: theme.color.red,
                      })}
                    >
                      {publicIPv4Error}
                    </Typography>
                  )}
                  <AssignIPRanges
                    handleIPRangeChange={handleIPv4RangeChange}
                    includeDescriptionInTooltip={fromLinodeConfig}
                    ipRanges={additionalIPv4RangesForVPC}
                    ipRangesError={vpcIPRangesError}
                  />
                </>
              )}
            </Stack>
          )}
        </Stack>
      </Paper>
      {isVPCCreateDrawerOpen && (
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
