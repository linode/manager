import * as React from 'react';
import { useHistory } from 'react-router-dom';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';

import { useGrants, useProfile } from 'src/queries/profile';
import { useRegionsQuery } from 'src/queries/regions';

import { Link } from 'src/components/Link';
import { RegionSelect } from 'src/components/EnhancedSelect/variants/RegionSelect';
import { TextField } from 'src/components/TextField';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import { Box } from 'src/components/Box';
import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Button } from 'src/components/Button/Button';
import { SubnetNode } from './SubnetNode';

const VPCCreate = () => {
  // TODO CONNIE: all the logic ;-; 
  const theme = useTheme();
  const history = useHistory();
  const { data: profile } = useProfile();
  const { data: grants } = useGrants();
  const { data: regions } = useRegionsQuery();

  const doesNotHavePermission =
    profile?.restricted && !grants?.global.add_volumes; // TODO: VPC - add vpc grant
  
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
      <Grid>
        <Paper>
          <Typography sx={{ marginTop: theme.spacing(1) }} variant="h2">VPC</Typography>
          <Typography 
            sx={{ 
              marginTop: theme.spacing(2), 
              marginBottom: theme.spacing(1),
              maxWidth: '80%',
            }} 
            variant="body1"
          >
            A virtual private cloud (VPC) is an isolated network which allows for 
            control over how resources are networked and can communicate. 
            <Link to="#"> Learn more</Link>. 
            {/* TODO: VPC - learn more link here */}
          </Typography>
          <RegionSelect
            handleSelection={() => { return; }} 
            regions={regions ?? []}
            isClearable
            selectedID={"TODO"}
          />
          <TextField 
            label="VPC label"
          />
          <TextField 
            label="Description"
            optional
            multiline
          />
        </Paper>
        <Box marginTop={2.5}>
          <Paper>
            {/* TODO CONNIE  can turn typography into styled component since repeated */}
            <Typography sx={{ marginTop: theme.spacing(1) }} variant="h2">Subnet</Typography> 
            <Typography 
              sx={{ 
                marginTop: theme.spacing(2), 
                marginBottom: theme.spacing(1),
                maxWidth: '80%',
              }} 
              variant="body1"
            >
              A subnet divides a VPC into multiple logically defined networks to allow for 
              controlled access to VPC resources. Subnets within a VPC are routable regardless 
              of the address spaces they are in.
              <Link to="#"> Learn more</Link>. 
              {/* TODO: VPC - subnet learn more link here */}
            </Typography>
            {/* TODO CONNIE: subnet node  */}
            <SubnetNode /> 
            <Button
                // todo
                buttonType="outlined"
                disabled={false}
                onClick={() => {}}
                sx={{ marginTop: theme.spacing(3) }}
              >
                Add a Subnet
            </Button>
          </Paper>
        </Box>
        <ActionsPanel
          primaryButtonProps={{
            'data-testid': 'submit',
            label: 'Create VPC',
            //loading: formik.isSubmitting,
            //onClick: () => formik.handleSubmit(),
          }}
          style={{ marginTop: theme.spacing(1) }}
        />
      </Grid>
    </>
  );
};

export default VPCCreate;
