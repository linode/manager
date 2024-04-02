import { AFFINITY_TYPES } from '@linode/api-v4';
import { useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';

import { PLACEMENT_GROUP_TOOLTIP_TEXT } from '../../constants';

import type { PlacementGroup, Region } from '@linode/api-v4';

interface Props {
  placementGroup: PlacementGroup;
  region: Region | undefined;
}

export const PlacementGroupsSummary = (props: Props) => {
  const { placementGroup, region } = props;
  const theme = useTheme();
  const linodesCount = placementGroup.members.length;

  return (
    <>
      {!placementGroup.is_compliant && (
        <Notice spacingBottom={20} spacingTop={24} variant="warning">
          <Typography fontFamily={theme.font.bold}>
            {`Placement Group ${placementGroup.label} (${
              AFFINITY_TYPES[placementGroup.affinity_type]
            }) is non-compliant.
          We are working to resolve compliance issues so that you can continue assigning Linodes to this Placement Group. `}
            {/* TODO VM_Placement: Get link location */}
            <Link
              className="secondaryLink"
              data-testid="pg-non-compliant-notice-link"
              to={'#'}
            >
              Learn more
            </Link>
            .
          </Typography>
        </Notice>
      )}
      <Paper>
        <Typography
          sx={(theme) => ({ marginBottom: theme.spacing(3) })}
          variant="h3"
        >
          Placement Group Configuration
        </Typography>
        <Grid container spacing={1}>
          <Grid md={8} sm={12}>
            <Box display="flex">
              <StyledLabel>Linodes</StyledLabel>
              <Typography sx={{ mx: 8 }}>
                {`${linodesCount} of ${region?.maximum_vms_per_pg}`}
                <TooltipIcon
                  sxTooltipIcon={{
                    marginLeft: '10px',
                    padding: 0,
                  }}
                  status="help"
                  text={PLACEMENT_GROUP_TOOLTIP_TEXT}
                  tooltipPosition="right"
                />
              </Typography>
            </Box>
          </Grid>
          <Grid md={8} sm={12}>
            <Box display="flex">
              <StyledLabel>Affinity Type</StyledLabel>
              <Typography sx={{ mx: 8 }}>
                {AFFINITY_TYPES[placementGroup?.affinity_type]}
              </Typography>
            </Box>
          </Grid>
          <Grid md={8} sm={12}>
            <Box display="flex">
              <StyledLabel>Region</StyledLabel>
              <Typography sx={{ mx: 8 }}>{region?.label}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};

export const StyledLabel = styled(Typography, {
  label: 'StyledLabel',
})(({ theme }) => ({
  fontFamily: theme.font.bold,
  marginRight: theme.spacing(8),
  width: theme.spacing(10),
}));
