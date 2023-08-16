import * as React from 'react';
import {
  CreateVPCPayload,
  CreateSubnetPayload,
  APIError,
} from '@linode/api-v4';
import { useHistory } from 'react-router-dom';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import { useFormik } from 'formik';
import { createVPCSchema } from '@linode/validation';

import { useProfile, useGrants } from 'src/queries/profile';
import { useRegionsQuery } from 'src/queries/regions';
import { useCreateVPCMutation } from 'src/queries/vpcs';

import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { RegionSelect } from 'src/components/EnhancedSelect/variants/RegionSelect';
import { TextField } from 'src/components/TextField';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { Paper } from 'src/components/Paper';
import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { handleAPIErrors } from 'src/utilities/formikErrorUtils';
import { SubnetFieldState, validateSubnets } from 'src/utilities/subnets';
import { MultipleSubnetInput } from './MultipleSubnetInput';
import {
  StyledBodyTypography,
  StyledHeaderTypography,
} from './VPCCreate.styles';

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

  const disabled = profile?.restricted && !grants?.global.add_vpcs;

  const createSubnetsPayload = () => {
    const subnetPayloads: CreateSubnetPayload[] = [];

    for (const subnetState of values.subnets) {
      const { label, ip } = subnetState;
      if (ip.ipv4 || label) {
        subnetPayloads.push({ label: label, ipv4: ip.ipv4 });
      }
    }

    return subnetPayloads;
  };

  const validateVPCSubnets = () => {
    const validatedSubnets = validateSubnets(values.subnets, {
      labelError:
        'Label is required. Must only be ASCII letters, numbers, and dashes',
      ipv4Error: 'The IPv4 range must be in CIDR format',
    });

    if (
      validatedSubnets.some(
        (subnet) => subnet.labelError || subnet.ip.ipv4Error
      )
    ) {
      setFieldValue('subnets', validatedSubnets);
      return false;
    } else {
      setFieldValue(
        'subnets',
        validatedSubnets.map((subnet) => {
          delete subnet.labelError;
          delete subnet.ip.ipv4Error;
          return { ...subnet };
        })
      );
      return true;
    }
  };

  const onCreateVPC = async () => {
    if (!validateVPCSubnets()) {
      return;
    }

    setSubmitting(true);

    const subnetsPayload = createSubnetsPayload();

    const createVPCPayload: CreateVPCPayload = {
      ...values,
      subnets: subnetsPayload,
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
          labelError: '',
          ip: { ipv4: '', ipv4Error: '' },
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
            <StyledHeaderTypography variant="h2">VPC</StyledHeaderTypography>
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
            <StyledHeaderTypography variant="h2">Subnet</StyledHeaderTypography>
            <StyledBodyTypography variant="body1">
              A subnet divides a VPC into multiple logically defined networks to
              allow for controlled access to VPC resources. Subnets within a VPC
              are routable regardless of the address spaces they are in.
              <Link to="#"> Learn more</Link>.
              {/* TODO: VPC - subnet learn more link here */}
            </StyledBodyTypography>
            {subnetErrorsFromAPI
              ? subnetErrorsFromAPI.map((apiError: APIError) => (
                  <Notice error key={apiError.reason} text={apiError.reason} />
                ))
              : null}
            <MultipleSubnetInput
              disabled={disabled}
              onChange={(subnets) => setFieldValue('subnets', subnets)}
              subnets={values.subnets}
            />
          </Paper>
          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              label: 'Create VPC',
              disabled: disabled,
              loading: isLoading,
              onClick: onCreateVPC,
              // TODO: VPC - generate event on creation?
            }}
            style={{ marginTop: theme.spacing(1) }}
          />
        </form>
      </Grid>
    </>
  );
};

export default VPCCreate;
