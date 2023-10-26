import { APIError } from '@linode/api-v4';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { RegionSelect } from 'src/components/EnhancedSelect/variants/RegionSelect';
import { LandingHeader } from 'src/components/LandingHeader';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { TextField } from 'src/components/TextField';
import { useCreateVPC } from 'src/hooks/useCreateVPC';

import { MultipleSubnetInput } from './MultipleSubnetInput';
import {
  StyledBodyTypography,
  StyledHeaderTypography,
} from './VPCCreate.styles';

const VPCCreate = () => {
  const theme = useTheme();

  const {
    formik,
    generalAPIError,
    generalSubnetErrorsFromAPI,
    isLoadingCreateVPC,
    onChangeField,
    onCreateVPC,
    regionsWithVPCCapability,
    userCannotAddVPC,
  } = useCreateVPC({ pushToPage: true });

  const { errors, handleSubmit, setFieldValue, values } = formik;

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
              loading: isLoadingCreateVPC,
              onClick: onCreateVPC,
            }}
            style={{
              display: 'flex',
              justifyContent: 'right',
              marginTop: theme.spacing(1),
            }}
          />
        </form>
      </Grid>
    </>
  );
};

export default VPCCreate;
