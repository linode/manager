import { AFFINITY_TYPES } from '@linode/api-v4';
import { useTheme } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { useRegionsQuery } from 'src/queries/regions';

import { PLACEMENT_GROUP_TOOLTIP_TEXT } from '../../constants';

import type { PlacementGroup } from '@linode/api-v4';

interface Props {
  placementGroup: PlacementGroup;
}

export const PlacementGroupsSummary = (props: Props) => {
  const { placementGroup } = props;
  const { data: regions } = useRegionsQuery();
  const theme = useTheme();

  const regionLabel = regions?.find(
    (region) => region.id === placementGroup.region
  )?.label;

  return (
    <>
      {!placementGroup.compliant && (
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
                {`${placementGroup.linode_ids.length} of ${placementGroup.capacity}`}
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
