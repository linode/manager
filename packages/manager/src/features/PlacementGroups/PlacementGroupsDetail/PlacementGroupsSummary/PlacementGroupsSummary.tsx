import { AFFINITY_TYPES } from '@linode/api-v4';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { Box } from 'src/components/Box';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { useRegionsQuery } from 'src/queries/regions';

import type { PlacementGroup } from '@linode/api-v4';

const tooltipText = `The Affinity Type and Region determine the maximum number of VMs per group`;

interface Props {
  placementGroup: PlacementGroup;
}

export const PlacementGroupsSummary = (props: Props) => {
  const { placementGroup } = props;
  const { data: regions } = useRegionsQuery();

  const regionLabel =
    regions?.find((region) => region.id === placementGroup.region)?.label ??
    placementGroup.region;

  const warningNoticeText = `Placement Group ${placementGroup.label} (${
    AFFINITY_TYPES[placementGroup?.affinity_type]
  }) is non-compliant.
  We are working to resolve compliance issues so that you can continue assigning Linodes to this Placement Group.`;

  return (
    <>
      {!placementGroup.compliant && (
        <Notice spacingBottom={0} spacingTop={12} variant="warning">
          {warningNoticeText}
          <br />
          {/* TODO VM_Placement: Get link location */}
          <Link className="secondaryLink" to={'#'}>
            Learn more.
          </Link>
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
                {`${placementGroup.linode_ids.length} of ${placementGroup.capacity}`}
                <TooltipIcon
                  sxTooltipIcon={{
                    marginLeft: '10px',
                    padding: 0,
                  }}
                  status="help"
                  text={tooltipText}
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
              <Typography sx={{ mx: 8 }}>{regionLabel}</Typography>
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
