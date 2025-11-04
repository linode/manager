import { useAllVPCsQuery, useRegionQuery } from '@linode/queries';
import {
  Autocomplete,
  BetaChip,
  Box,
  Checkbox,
  FormHelperText,
  Notice,
  TooltipIcon,
  Typography,
} from '@linode/ui';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { MANAGE_NETWORKING_LEARN_MORE_LINK } from 'src/features/Databases/constants';
import { useFlags } from 'src/hooks/useFlags';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import type { ClusterSize, Engine, PrivateNetwork, VPC } from '@linode/api-v4';
import type { Theme } from '@mui/material/styles';
import type { FormikErrors } from 'formik';

interface DatabaseCreateValuesFormik {
  allow_list: {
    address: string;
    error: string;
  }[];
  cluster_size: ClusterSize;
  engine: Engine;
  label: string;
  private_network: PrivateNetwork;
  region: string;
  type: string;
}

interface DatabaseVPCSelectorProps {
  errors: FormikErrors<DatabaseCreateValuesFormik>; // TODO (UIE-8903): Replace deprecated Formik with React Hook Form
  mode: 'create' | 'networking';
  onChange: (field: string, value: boolean | null | number) => void;
  onConfigurationChange?: (vpc: null | VPC) => void;
  privateNetworkValues: PrivateNetwork;
  resetFormFields?: (
    partialValues?: Partial<DatabaseCreateValuesFormik>
  ) => void;
  selectedRegionId: string;
}

export const DatabaseVPCSelector = (props: DatabaseVPCSelectorProps) => {
  const {
    errors,
    mode,
    onConfigurationChange,
    onChange,
    selectedRegionId,
    resetFormFields,
    privateNetworkValues,
  } = props;

  const flags = useFlags();
  const isCreate = mode === 'create';
  const { data: selectedRegion } = useRegionQuery(selectedRegionId);
  const regionSupportsVPCs = selectedRegion?.capabilities.includes('VPCs');

  const {
    data: vpcs,
    error: vpcsError,
    isLoading,
  } = useAllVPCsQuery({
    enabled: regionSupportsVPCs,
    filter: { region: selectedRegionId },
  });

  const vpcErrorMessage =
    vpcsError &&
    getAPIErrorOrDefault(vpcsError, 'Unable to load VPCs')[0].reason;

  const selectedVPC = vpcs?.find(
    (vpc) => vpc.id === privateNetworkValues.vpc_id
  );

  const selectedSubnet = selectedVPC?.subnets.find(
    (subnet) => subnet.id === privateNetworkValues.subnet_id
  );

  const prevRegionId = React.useRef<string | undefined>(undefined);
  const regionHasVPCs = Boolean(vpcs && vpcs.length > 0);
  const disableVPCSelectors =
    !!vpcsError || !regionSupportsVPCs || !regionHasVPCs;

  const resetVPCConfiguration = () => {
    resetFormFields?.({
      private_network: {
        vpc_id: null,
        subnet_id: null,
        public_access: false,
      },
    });
  };

  React.useEffect(() => {
    // When the selected region has changed, reset VPC configuration.
    // Then switch back to default validation behavior
    if (prevRegionId.current && prevRegionId.current !== selectedRegionId) {
      resetVPCConfiguration();
      onConfigurationChange?.(null);
    }
    prevRegionId.current = selectedRegionId;
  }, [selectedRegionId]);

  const vpcHelperTextCopy = !selectedRegionId
    ? 'In the Select Engine and Region section, select a region with an existing VPC to see available VPCs.'
    : 'No VPC is available in the selected region.';

  /** Returns dynamic marginTop value used to center TooltipIcon in different scenarios */
  const getVPCTooltipIconMargin = () => {
    const margins = {
      longHelperText: '.75rem',
      shortHelperText: '1.75rem',
      noHelperText: '2.75rem',
      errorText: '1.5rem',
      errorTextWithLongHelperText: '-.5rem',
    };
    if (disableVPCSelectors && vpcsError)
      return margins.errorTextWithLongHelperText;
    if (errors?.private_network?.vpc_id) return margins.errorText;
    if (disableVPCSelectors && !selectedRegionId) return margins.longHelperText;
    if (disableVPCSelectors && selectedRegionId) return margins.shortHelperText;
    return margins.noHelperText;
  };

  const accessNotice = isCreate && (
    <Notice
      sx={(theme: Theme) => ({
        marginTop: theme.spacingFunction(20),
      })}
      text="The cluster will have public access by default if a VPC is not assigned."
      variant="info"
    />
  );

  return (
    <>
      <Box
        sx={(theme: Theme) => ({
          display: 'flex',
          marginTop: theme.spacingFunction(20),
          marginBottom: theme.spacingFunction(4),
        })}
      >
        <Typography variant="h3">Assign a VPC</Typography>
        {flags.databaseVpcBeta && <BetaChip />}
      </Box>

      <Typography>
        Assign this cluster to an existing VPC.{' '}
        <Link
          to={`${MANAGE_NETWORKING_LEARN_MORE_LINK + (flags.databaseVpcBeta ? '-beta' : '')}`}
        >
          Learn more.
        </Link>
      </Typography>
      <Box style={{ display: 'flex' }}>
        <Autocomplete
          data-testid="database-vpc-selector"
          disabled={disableVPCSelectors}
          errorText={vpcErrorMessage || errors?.private_network?.vpc_id}
          helperText={disableVPCSelectors ? vpcHelperTextCopy : undefined}
          label="VPC"
          loading={isLoading}
          noOptionsText="There are no VPCs in the selected region."
          onChange={(e, value) => {
            onChange('private_network.subnet_id', null); // Always reset subnet selection when VPC changes
            if (!value) {
              onChange('private_network.public_access', false);
            }
            onConfigurationChange?.(value ?? null);
            onChange('private_network.vpc_id', value?.id ?? null);
          }}
          options={vpcs ?? []}
          placeholder="Select a VPC"
          sx={{ width: '354px' }}
          value={selectedVPC ?? null}
        />
        <TooltipIcon
          status="info"
          sxTooltipIcon={{
            marginTop: getVPCTooltipIconMargin(),
            padding: '0px 8px',
          }}
          text="A cluster may be assigned only to a VPC in the same region."
          tooltipPosition="top"
        />
      </Box>

      {selectedVPC ? (
        <>
          <Autocomplete
            data-testid="database-subnet-selector"
            disabled={disableVPCSelectors}
            errorText={errors?.private_network?.subnet_id}
            getOptionLabel={(subnet) => `${subnet.label} (${subnet.ipv4})`}
            label="Subnet"
            onChange={(e, value) => {
              onChange('private_network.subnet_id', value?.id ?? null);
            }}
            options={selectedVPC?.subnets ?? []}
            placeholder="Select a subnet"
            value={selectedSubnet ?? null}
          />
          <Box
            sx={(theme: Theme) => ({
              marginTop: theme.spacingFunction(20),
            })}
          >
            <Checkbox
              checked={privateNetworkValues.public_access ?? false}
              data-testid="database-public-access-checkbox"
              onChange={(e, value) => {
                onChange('private_network.public_access', value ?? null);
              }}
              text={'Enable public access'}
              toolTipText={
                'Adds a public endpoint to the database in addition to the private VPC endpoint.'
              }
            />
            {errors?.private_network?.public_access && (
              <FormHelperText
                className="error-for-scroll"
                error
                role="alert"
                sx={{ marginTop: 0 }}
              >
                {errors?.private_network?.public_access}
              </FormHelperText>
            )}
          </Box>
        </>
      ) : (
        accessNotice
      )}
    </>
  );
};
