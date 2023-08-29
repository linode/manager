import {
  APIError,
  CreateSubnetPayload,
  CreateVPCPayload,
} from '@linode/api-v4';
import { createVPCSchema } from '@linode/validation';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import { useFormik } from 'formik';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { RegionSelect } from 'src/components/EnhancedSelect/variants/RegionSelect';
import { LandingHeader } from 'src/components/LandingHeader';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { TextField } from 'src/components/TextField';
import { useGrants, useProfile } from 'src/queries/profile';
import { useRegionsQuery } from 'src/queries/regions';
import { useCreateVPCMutation } from 'src/queries/vpcs';
import { handleAPIErrors } from 'src/utilities/formikErrorUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import {
  DEFAULT_SUBNET_IPV4_VALUE,
  SubnetFieldState,
  validateSubnets,
} from 'src/utilities/subnets';

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
  const [generalAPIError, setGeneralAPIError] = React.useState<
    string | undefined
  >();

  const userCannotAddVPC = profile?.restricted && !grants?.global.add_vpcs;

  const createSubnetsPayload = () => {
    const subnetPayloads: CreateSubnetPayload[] = [];

    for (const subnetState of values.subnets) {
      const { ip, label } = subnetState;
      if (ip.ipv4 || label) {
        subnetPayloads.push({ ipv4: ip.ipv4, label });
      }
    }

    return subnetPayloads;
  };

  const validateVPCSubnets = () => {
    const validatedSubnets = validateSubnets(values.subnets, {
      ipv4Error: 'The IPv4 range must be in CIDR format',
      labelError:
        'Label is required. Must only be ASCII letters, numbers, and dashes',
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
    setGeneralAPIError(undefined);

    const subnetsPayload = createSubnetsPayload();

    const createVPCPayload: CreateVPCPayload = {
      ...values,
      subnets: subnetsPayload,
    };

    try {
      const response = await createVPC(createVPCPayload);
      history.push(`/vpcs/${response.id}`);
    } catch (errors) {
      const apiSubnetErrors = errors.filter(
        (error: APIError) => error.field && error.field.includes('subnets')
      );
      if (apiSubnetErrors) {
        setSubnetErrorsFromAPI(apiSubnetErrors);
      }
      handleAPIErrors(
        errors.filter(
          (error: APIError) => !error.field?.includes('subnets') || !error.field
        ),
        setFieldError,
        setGeneralAPIError
      );
    }

    setSubmitting(false);
  };

  const {
    errors,
    handleSubmit,
    setFieldError,
    setFieldValue,
    setSubmitting,
    values,
  } = useFormik({
    initialValues: {
      description: '',
      label: '',
      region: '',
      subnets: [
        {
          ip: {
            availIPv4s: 256,
            ipv4: DEFAULT_SUBNET_IPV4_VALUE,
            ipv4Error: '',
          },
          label: '',
          labelError: '',
        },
      ] as SubnetFieldState[],
    },
    onSubmit: onCreateVPC,
    validateOnChange: false,
    validationSchema: createVPCSchema,
  });

  React.useEffect(() => {
    if (errors || generalAPIError) {
      scrollErrorIntoView();
    }
  }, [errors, generalAPIError]);

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
          pathname: `/vpcs/create`,
        }}
        docsLabel="Getting Started"
        docsLink="#" // TODO: VPC - add correct docs link
        title="Create"
      />
      {userCannotAddVPC && (
        <Notice
          text={
            "You don't have permissions to create a new VPC. Please contact an account administrator for details."
          }
          important
          spacingTop={16}
          variant="error"
        />
      )}
      <Grid>
        {generalAPIError ? (
          <Notice text={generalAPIError} variant="error" />
        ) : null}
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
              handleSelection={(region: string) =>
                setFieldValue('region', region)
              }
              disabled={userCannotAddVPC}
              errorText={errors.region}
              isClearable
              regions={regions ?? []}
              selectedID={values.region}
            />
            <TextField
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFieldValue('label', e.target.value)
              }
              disabled={userCannotAddVPC}
              errorText={errors.label}
              label="VPC label"
              value={values.label}
            />
            <TextField
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFieldValue('description', e.target.value)
              }
              disabled={userCannotAddVPC}
              errorText={errors.description}
              label="Description"
              multiline
              optional
              value={values.description}
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
                  <Notice
                    key={apiError.reason}
                    spacingBottom={8}
                    text={apiError.reason}
                    variant="error"
                  />
                ))
              : null}
            <MultipleSubnetInput
              disabled={userCannotAddVPC}
              onChange={(subnets) => setFieldValue('subnets', subnets)}
              subnets={values.subnets}
            />
          </Paper>
          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              disabled: userCannotAddVPC,
              label: 'Create VPC',
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

export default VPCCreate;
