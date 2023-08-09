import * as React from 'react';
import { useHistory } from 'react-router-dom';
import Grid from '@mui/material/Unstable_Grid2';
import { styled, useTheme } from '@mui/material/styles';
import { useFormik } from 'formik';
import { createVPCSchema } from '@linode/validation';

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

export interface SubnetFieldState {
  label: string;
  ip: string;
}

const VPCCreate = () => {
  // TODO CONNIE: all the logic ;-; 
  const theme = useTheme();
  const history = useHistory();
  const { data: profile } = useProfile();
  const { data: grants } = useGrants();
  const { data: regions } = useRegionsQuery();
  const { error, isLoading, mutateAsync: createVPC } = useCreateVPCMutation();

  const disabled =
    profile?.restricted && !grants?.global.add_volumes; // TODO: VPC - add vpc grant

  
  const onCreateVPC = () => {
    console.log("the vpc data", values);
  };

  const { values, ...formik } = useFormik({
    initialValues: {
      subnets: [ // TODO somehow figure out if it's an ipv4 or ipv6 and transform accordingly
        {
          label: '',
          ip: '',
        },
      ] as SubnetFieldState[],
      label: '',
      description: '',
      region: '',
    },
    onSubmit: onCreateVPC,
    //validate: handleIPValidation,
    validateOnChange: false,
    validationSchema: createVPCSchema, // todo ip subnet validation??
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
        <form>
          <Paper>
            <Typography sx={{ marginTop: theme.spacing(1) }} variant="h2">VPC</Typography>
            <StyledBodyTypography variant="body1">
              A virtual private cloud (VPC) is an isolated network which allows for 
              control over how resources are networked and can communicate. 
              <Link to="#"> Learn more</Link>. 
              {/* TODO: VPC - learn more link here */}
            </StyledBodyTypography>
            <RegionSelect
              disabled={disabled}
              handleSelection={(region: string) => formik.setFieldValue('region', region)} 
              regions={regions ?? []}
              isClearable
              selectedID={values.region}
            />
            <TextField 
              disabled={disabled}
              label="VPC label"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => formik.setFieldValue('label', e.target.value)}
              value={values.label}
            />
            <TextField 
              disabled={disabled}
              label="Description"
              onChange={formik.handleChange}
              value={values.description}
              optional
              multiline
            />
          </Paper>
          <Paper sx={{ marginTop: theme.spacing(2.5) }}>
            {/* TODO CONNIE  can turn typography into styled component since repeated */}
            <Typography sx={{ marginTop: theme.spacing(1) }} variant="h2">Subnet</Typography> 
            <StyledBodyTypography variant="body1">
              A subnet divides a VPC into multiple logically defined networks to allow for 
              controlled access to VPC resources. Subnets within a VPC are routable regardless 
              of the address spaces they are in.
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
                  const newSubnets = [...values.subnets]
                  newSubnets[subnetIdx] = subnet;
                  formik.setFieldValue('subnets', [...newSubnets])
                }}
              /> 
            ))}
            <Button
                // todo...something
                buttonType="outlined"
                disabled={disabled}
                onClick={() => formik.setFieldValue('subnets', [...values.subnets, { label: '', ip: ''}])}
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

const StyledBodyTypography = styled(Typography, { label: 'StyledBodyTypography' })(({ theme }) => ({
  marginTop: theme.spacing(2), 
  marginBottom: theme.spacing(1),
  [theme.breakpoints.up('sm')]: {
    maxWidth: '80%',
  }
}));

export default VPCCreate;
