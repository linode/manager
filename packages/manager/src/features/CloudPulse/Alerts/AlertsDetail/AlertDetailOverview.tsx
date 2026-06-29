import { formatDate } from '@akamai/compute-ui-core/datetime';
import { useProfile } from '@linode/queries';
import { CircleProgress, Typography } from '@linode/ui';
import { Grid } from '@mui/material';
import React from 'react';

import { useFlags } from 'src/hooks/useFlags';
import {
  useCloudPulseServiceTypes,
  useGetCloudPulseMetricDefinitionsByServiceType,
} from 'src/queries/cloudpulse/services';

import { convertStringToCamelCasesWithSpaces } from '../../Utils/utils';
import {
  alertStatusToIconStatusMap,
  entityGroupMap,
  severityMap,
} from '../constants';
import { getServiceTypeLabel } from '../Utils/utils';
import { AlertDetailRow } from './AlertDetailRow';

import type { Alert } from '@linode/api-v4';

interface OverviewProps {
  /*
   * The alert object containing all the details (e.g., description, severity, status) for which the overview needs to be displayed.
   */
  alertDetails: Alert;
}
export const AlertDetailOverview = React.memo((props: OverviewProps) => {
  const { alertDetails } = props;
  const { data: profile } = useProfile();
  const {
    created,
    created_by: createdBy,
    description,
    label,
    service_type: serviceType,
    severity,
    status,
    type,
    updated,
    updated_by: updatedBy,
    scope,
    group_by: groupBy,
  } = alertDetails;

  const { data: serviceTypeList, isFetching } = useCloudPulseServiceTypes(true);
  const { data: metricDefinitions, isLoading } =
    useGetCloudPulseMetricDefinitionsByServiceType(
      serviceType,
      serviceType !== undefined
    );
  const { aclpServices } = useFlags();

  // display user-friendly labels for any configured group_by dimensions.
  const dimensionLabelMap = React.useMemo(() => {
    const map = new Map<string, string>();

    map.set('entity_id', 'Entity');

    if (!metricDefinitions?.data) {
      return map;
    }

    for (const def of metricDefinitions.data) {
      if (!def.dimensions) {
        continue;
      }

      for (const dim of def.dimensions) {
        if (!map.has(dim.dimension_label)) {
          map.set(dim.dimension_label, dim.label);
        }
      }
    }

    return map;
  }, [metricDefinitions]);

  const groupByValues = React.useMemo(() => {
    if (!groupBy) return [];
    return Array.isArray(groupBy) ? groupBy : [groupBy];
  }, [groupBy]);

  const groupByLabels = React.useMemo(() => {
    if (groupByValues.length === 0) return null;
    return groupByValues.map((g) => dimensionLabelMap.get(g) ?? g);
  }, [groupByValues, dimensionLabelMap]);

  const groupByLabelsFormattedString = React.useMemo(() => {
    return groupByLabels?.join(', ');
  }, [groupByLabels]);

  if (isFetching || isLoading) {
    return <CircleProgress />;
  }

  return (
    <>
      <Typography marginBottom={2} variant="h2">
        Overview
      </Typography>
      <Grid
        container
        spacing={2}
        sx={{
          alignItems: 'center',
        }}
      >
        <AlertDetailRow label="Name" value={label} />
        <AlertDetailRow label="Description" value={description} />
        <AlertDetailRow
          label="Status"
          status={alertStatusToIconStatusMap[status]}
          value={convertStringToCamelCasesWithSpaces(status)}
        />
        <AlertDetailRow label="Severity" value={severityMap[severity]} />
        <AlertDetailRow
          label="Service"
          showBetaChip={aclpServices?.[serviceType]?.alerts?.beta}
          value={getServiceTypeLabel(serviceType, serviceTypeList)}
        />
        <AlertDetailRow
          label="Type"
          value={convertStringToCamelCasesWithSpaces(type)}
        />
        <AlertDetailRow
          label="Created"
          value={formatDate(created, {
            format: 'MMM dd, yyyy, h:mm a',
            timezone: profile?.timezone,
          })}
        />
        <AlertDetailRow label="Created By" value={createdBy} />
        <AlertDetailRow
          label="Last Modified"
          value={formatDate(updated, {
            format: 'MMM dd, yyyy, h:mm a',
            timezone: profile?.timezone,
          })}
        />
        <AlertDetailRow label="Last Modified By" value={updatedBy} />
        <AlertDetailRow label="Scope" value={entityGroupMap[scope]} />
        {groupByLabelsFormattedString && (
          <AlertDetailRow
            label="Group By"
            value={groupByLabelsFormattedString}
          />
        )}
      </Grid>
    </>
  );
});
