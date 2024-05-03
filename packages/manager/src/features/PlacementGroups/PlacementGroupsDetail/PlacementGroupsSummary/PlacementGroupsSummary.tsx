import { AFFINITY_TYPES } from '@linode/api-v4';
import { useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { DescriptionList } from 'src/components/DescriptionList/DescriptionList';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';

import {
  PLACEMENT_GROUP_TOOLTIP_TEXT,
  PLACEMENT_GROUPS_DOCS_LINK,
} from '../../constants';
import { getAffinityTypeEnforcement } from '../../utils';

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
    <Box sx={{ mb: 3, mt: 1 }}>
      {!placementGroup.is_compliant && (
        <Notice spacingBottom={20} spacingTop={24} variant="warning">
          <Typography fontFamily={theme.font.bold}>
            {`Placement Group ${placementGroup.label} is non-compliant. We are working to resolve compliance issues so that you can continue assigning Linodes to this Placement Group. `}
            <Link
              className="secondaryLink"
              data-testid="pg-non-compliant-notice-link"
              to={PLACEMENT_GROUPS_DOCS_LINK}
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

        <Box display="flex">
          <DescriptionList
            items={[
              {
                description: `${linodesCount} of ${region?.placement_group_limits.maximum_linodes_per_pg}`,
                title: 'Linodes',
                tooltip: { text: PLACEMENT_GROUP_TOOLTIP_TEXT, width: 275 },
              },
              {
                description: AFFINITY_TYPES[placementGroup?.affinity_type],
                title: 'Affinity Type',
              },
              {
                description: region?.label ?? 'Unknown',
                title: 'Region',
              },
              {
                description: getAffinityTypeEnforcement(
                  placementGroup?.is_strict
                ),
                title: 'Affinity Type Enforcement',
              },
            ]}
            displayMode="grid"
            gridProps={{ columns: 2 }}
            stackAt={theme.breakpoints.values.sm}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export const StyledLabel = styled(Typography, {
  label: 'StyledLabel',
})(({ theme }) => ({
  fontFamily: theme.font.bold,
  marginRight: theme.spacing(8),
  width: theme.spacing(10),
}));
