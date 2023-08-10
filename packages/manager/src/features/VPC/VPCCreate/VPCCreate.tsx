import * as React from 'react';
import {
  CreateVPCPayload,
  CreateSubnetPayload,
  APIError,
} from '@linode/api-v4';
import { useHistory } from 'react-router-dom';
import Grid from '@mui/material/Unstable_Grid2';
import { styled, useTheme } from '@mui/material/styles';
import { useFormik } from 'formik';
import {
  createVPCSchema,
  vpcsValidateIP,
  determineIPType,
} from '@linode/validation';

import { useGrants, useProfile } from 'src/queries/profile';
import { useRegionsQuery } from 'src/queries/regions';
import { useCreateVPCMutation } from 'src/queries/vpcs';

import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { RegionSelect } from 'src/components/EnhancedSelect/variants/RegionSelect';
import { TextField } from 'src/components/TextField';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { SubnetNode } from './SubnetNode';
import { handleAPIErrors } from 'src/utilities/formikErrorUtils';
import { ExtendedIP, validateIPs } from 'src/utilities/ipUtils';

export interface SubnetFieldState {
  label: string;
  ip: ExtendedIP;
}

const VPCCreate = () => {
  const theme = useTheme();
  const history = useHistory();
  const { data: profile } = useProfile();
  const { data: grants } = useGrants();
  const { data: regions } = useRegionsQuery();
  const { isLoading, mutateAsync: createVPC } = useCreateVPCMutation();
  const [subnetErrorsFromAPI, setSubnetErrorsFromAPI] = React.useState<
    APIError[]
  >();

  const disabled = profile?.restricted && !grants?.global.add_volumes; // TODO: VPC - add vpc grant

  const determineIfValidIps = () => {
    const validatedIps = validateIPs(
      values.subnets.map((subnet) => subnet.ip),
      {
        allowEmptyAddress: true,
        errorMessage: 'Must be a valid IPv4 or IPv6 address',
      }
    );

    if (validatedIps.some((ip) => ip.error)) {
      const newSubnets: SubnetFieldState[] = [];
      for (let i = 0; i < validatedIps.length; i++) {
        newSubnets.push({
          label: values.subnets[i].label,
          ip: validatedIps[i],
        });
      }

      setFieldValue('subnets', newSubnets);
      return false;
    } else {
      const newSubnets = values.subnets.map((subnet) => {
        delete subnet.ip.error;
        return { ...subnet };
      });
      setFieldValue('subnets', newSubnets);
      return true;
    }
  };

  const createSubnetsPayload = () => {
    const subnetPayloads: CreateSubnetPayload[] = [];

    for (const subnetState of values.subnets) {
      const { label, ip } = subnetState;
      if (vpcsValidateIP(ip.address) && label !== '') {
        let subnet: CreateSubnetPayload;
        const ipType = determineIPType(ip.address);
        if (ipType === 'ipv4') {
          subnet = {
            label: label,
            ipv4: ip.address,
          };
        } else {
          subnet = {
            label: label,
            ipv6: ip.address,
          };
        }
        subnetPayloads.push(subnet);
      }
    }

    return subnetPayloads;
  };

  const onCreateVPC = async () => {
    if (!determineIfValidIps()) {
      return;
    }

    setSubmitting(true);

    const createVPCPayload: CreateVPCPayload = {
      ...values,
      subnets: createSubnetsPayload(),
    };

    try {
      const response = await createVPC(createVPCPayload);
      history.push(`/vpc/${response.id}`);
    } catch (errors) {
      const apiSubnetErrors = errors.filter(
        (error: APIError) => error.field === 'subnets'
      );
      if (apiSubnetErrors) {
        setSubnetErrorsFromAPI(apiSubnetErrors);
      }
      handleAPIErrors(errors, setFieldError);
    }

    setSubmitting(false);
  };

  const {
    values,
    errors,
    setFieldValue,
    setFieldError,
    setSubmitting,
    handleChange,
    handleSubmit,
  } = useFormik({
    initialValues: {
      subnets: [
        {
          label: '',
          ip: { address: '', error: '' },
        },
      ] as SubnetFieldState[],
      label: '',
      description: '',
      region: '',
    },
    onSubmit: onCreateVPC,
    validateOnChange: false,
    validationSchema: createVPCSchema,
  });

  return (
    <>
      <DocumentTitleSegment segment="Create VPC" />
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: 'Virtual Private Cloud',
              position: 1,
            },
          ],
          pathname: `/vpc/create`,
        }}
        docsLabel="Getting Started"
        docsLink="#" // TODO: VPC - add correct docs link
        title="Create"
      />
      {disabled && (
        <Notice
          text={
            "You don't have permissions to create a new VPC. Please contact an account administrator for details."
          }
          error={true}
          important
          spacingTop={16}
        />
      )}
      <Grid>
        <form onSubmit={handleSubmit}>
          <Paper>
            <Typography sx={{ marginTop: theme.spacing(1) }} variant="h2">
              VPC
            </Typography>
            <StyledBodyTypography variant="body1">
              A virtual private cloud (VPC) is an isolated network which allows
              for control over how resources are networked and can communicate.
              <Link to="#"> Learn more</Link>.
              {/* TODO: VPC - learn more link here */}
            </StyledBodyTypography>
            <RegionSelect
              disabled={disabled}
              errorText={errors.region}
              handleSelection={(region: string) =>
                setFieldValue('region', region)
              }
              regions={regions ?? []}
              isClearable
              selectedID={values.region}
            />
            <TextField
              disabled={disabled}
              errorText={errors.label}
              label="VPC label"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFieldValue('label', e.target.value)
              }
              value={values.label}
            />
            <TextField
              disabled={disabled}
              label="Description"
              errorText={errors.description}
              onChange={handleChange}
              value={values.description}
              optional
              multiline
            />
          </Paper>
          <Paper sx={{ marginTop: theme.spacing(2.5) }}>
            <Typography sx={{ marginTop: theme.spacing(1) }} variant="h2">
              Subnet
            </Typography>
            <StyledBodyTypography variant="body1">
              A subnet divides a VPC into multiple logically defined networks to
              allow for controlled access to VPC resources. Subnets within a VPC
              are routable regardless of the address spaces they are in.
              <Link to="#"> Learn more</Link>.
              {/* TODO: VPC - subnet learn more link here */}
            </StyledBodyTypography>
            {values.subnets.map((subnet, subnetIdx) => (
              <SubnetNode
                disabled={!!disabled}
                idx={subnetIdx}
                key={`subnet-${subnetIdx}`}
                subnet={subnet}
                onChange={(subnet) => {
                  const newSubnets = [...values.subnets];
                  newSubnets[subnetIdx] = subnet;
                  setFieldValue('subnets', [...newSubnets]);
                }}
              />
            ))}
            {subnetErrorsFromAPI
              ? subnetErrorsFromAPI.map((apiError: APIError) => (
                  <Notice error key={apiError.reason} text={apiError.reason} />
                ))
              : null}
            <Button
              buttonType="outlined"
              disabled={disabled}
              onClick={() =>
                setFieldValue('subnets', [
                  ...values.subnets,
                  { label: '', ip: { address: '', error: '' } },
                ])
              }
              sx={{ marginTop: theme.spacing(3) }}
            >
              Add a Subnet
            </Button>
          </Paper>
          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              label: 'Create VPC',
              disabled: disabled,
              loading: isLoading,
              onClick: onCreateVPC,
            }}
            style={{ marginTop: theme.spacing(1) }}
          />
        </form>
      </Grid>
    </>
  );
};

const StyledBodyTypography = styled(Typography, {
  label: 'StyledBodyTypography',
})(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
  [theme.breakpoints.up('sm')]: {
    maxWidth: '80%',
  },
}));

export default VPCCreate;
