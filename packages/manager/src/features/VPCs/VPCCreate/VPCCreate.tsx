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
import {
  SubnetError,
  handleVPCAndSubnetErrors,
} from 'src/utilities/formikErrorUtils';
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';
import {
  DEFAULT_SUBNET_IPV4_VALUE,
  SubnetFieldState,
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
  const regionsWithVPCCapability =
    regions?.filter((region) => region.capabilities.includes('VPCs')) ?? [];
  const { isLoading, mutateAsync: createVPC } = useCreateVPCMutation();
  const [
    generalSubnetErrorsFromAPI,
    setGeneralSubnetErrorsFromAPI,
  ] = React.useState<APIError[]>();
  const [generalAPIError, setGeneralAPIError] = React.useState<
    string | undefined
  >();

  const userCannotAddVPC = profile?.restricted && !grants?.global.add_vpcs;

  // When creating the subnet payloads, we also create a mapping of the indexes of the subnets that appear on
  // the UI to the indexes of the subnets that the API will receive. This enables users to leave subnets blank
  // on the UI and still have any errors returned by the API correspond to the correct subnet
  const createSubnetsPayloadAndMapping = () => {
    const subnetsPayload: CreateSubnetPayload[] = [];
    const subnetIdxMapping = {};
    let apiSubnetIdx = 0;

    for (let i = 0; i < values.subnets.length; i++) {
      const { ip, label } = values.subnets[i];
      if (ip.ipv4 || label) {
        subnetsPayload.push({ ipv4: ip.ipv4, label });
        subnetIdxMapping[i] = apiSubnetIdx;
        apiSubnetIdx++;
      }
    }

    return {
      subnetsPayload,
      visualToAPISubnetMapping: subnetIdxMapping,
    };
  };

  const combineErrorsAndSubnets = (
    errors: {},
    visualToAPISubnetMapping: {}
  ) => {
    return values.subnets.map((subnet, idx) => {
      const apiSubnetIdx: number | undefined = visualToAPISubnetMapping[idx];
      // If the subnet has errors associated with it, include those errors in its state
      if ((apiSubnetIdx || apiSubnetIdx === 0) && errors[apiSubnetIdx]) {
        const errorData: SubnetError = errors[apiSubnetIdx];
        return {
          ...subnet,
          // @TODO VPC: IPv6 error handling
          ip: {
            ...subnet.ip,
            ipv4Error: errorData.ipv4 ?? '',
          },
          labelError: errorData.label ?? '',
        };
      } else {
        return subnet;
      }
    });
  };

  const onCreateVPC = async () => {
    setSubmitting(true);
    setGeneralAPIError(undefined);

    const {
      subnetsPayload,
      visualToAPISubnetMapping,
    } = createSubnetsPayloadAndMapping();

    const createVPCPayload: CreateVPCPayload = {
      ...values,
      subnets: subnetsPayload,
    };

    try {
      const response = await createVPC(createVPCPayload);
      history.push(`/vpcs/${response.id}`);
    } catch (errors) {
      const generalSubnetErrors = errors.filter(
        (error: APIError) =>
          // Both general and specific subnet errors include 'subnets' in their error field.
          // General subnet errors come in as { field: subnets.some_field, ...}, whereas
          // specific subnet errors come in as { field: subnets[some_index].some_field, ...}. So,
          // to avoid specific subnet errors, we filter out errors with a field that includes '['
          error.field &&
          error.field.includes('subnets') &&
          !error.field.includes('[')
      );

      if (generalSubnetErrors) {
        setGeneralSubnetErrorsFromAPI(generalSubnetErrors);
      }
      const indivSubnetErrors = handleVPCAndSubnetErrors(
        errors.filter(
          // ignore general subnet errors: !(the logic of filtering for only general subnet errors)
          (error: APIError) =>
            !error.field?.includes('subnets') ||
            !error.field ||
            error.field.includes('[')
        ),
        setFieldError,
        setGeneralAPIError
      );

      // must combine errors and subnet data to avoid indexing weirdness when deleting a subnet
      const subnetsAndErrors = combineErrorsAndSubnets(
        indivSubnetErrors,
        visualToAPISubnetMapping
      );
      setFieldValue('subnets', subnetsAndErrors);

      scrollErrorIntoView();
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

  // Helper method to set a field's value and clear existing errors
  const onChangeField = (field: string, value: string) => {
    setFieldValue(field, value);
    if (errors[field]) {
      setFieldError(field, undefined);
    }
  };

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
        docsLink="#" // @TODO VPC: add correct docs link
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
              {/* @TODO VPC: learn more link here */}
            </StyledBodyTypography>
            <RegionSelect
              handleSelection={(region: string) =>
                onChangeField('region', region)
              }
              disabled={userCannotAddVPC}
              errorText={errors.region}
              isClearable
              regions={regionsWithVPCCapability}
              selectedID={values.region}
            />
            <TextField
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChangeField('label', e.target.value)
              }
              disabled={userCannotAddVPC}
              errorText={errors.label}
              label="VPC Label"
              value={values.label}
            />
            <TextField
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChangeField('description', e.target.value)
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
            <StyledHeaderTypography variant="h2">
              Subnets
            </StyledHeaderTypography>
            <StyledBodyTypography variant="body1">
              A subnet divides a VPC into multiple logically defined networks to
              allow for controlled access to VPC resources. Subnets within a VPC
              are routable regardless of the address spaces they are in.
              <Link to="#"> Learn more</Link>.
              {/* @TODO VPC: subnet learn more link here */}
            </StyledBodyTypography>
            {generalSubnetErrorsFromAPI
              ? generalSubnetErrorsFromAPI.map((apiError: APIError) => (
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
