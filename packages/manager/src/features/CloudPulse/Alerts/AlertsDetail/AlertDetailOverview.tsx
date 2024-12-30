import { CircleProgress } from '@linode/ui';
import { Grid, Typography, useTheme } from '@mui/material';
import React from 'react';

import { useCloudPulseServiceTypes } from 'src/queries/cloudpulse/services';

import { convertStringToCamelCasesWithSpaces } from '../../Utils/utils';
import { severityMap } from '../constants';
import { formatTimestamp, getServiceTypeLabel } from '../Utils/utils';
import { AlertDetailRow } from './AlertDetailRow';

import type { Alert } from '@linode/api-v4';

interface OverviewProps {
  /*
   * The alert for which the criteria is displayed
   */
  alert: Alert;
}
export const AlertDetailOverview = (props: OverviewProps) => {
  const { alert } = props;

  const {
    created_by: createdBy,
    description,
    label,
    service_type: serviceType,
    severity,
    status,
    type,
    updated,
  } = alert;

  const { data: serviceTypes, isFetching } = useCloudPulseServiceTypes(true);

  const theme = useTheme();

  const statusColorMap: Record<string, string> = {
    disabled: theme.color.grey8,
    enabled: theme.palette.success.dark,
    failed: theme.palette.error.dark,
    provisioning: theme.palette.warning.dark,
  };

  if (isFetching) {
    return <CircleProgress />;
  }

  return (
    <React.Fragment>
      <Typography
        fontSize={theme.spacing(2.25)}
        gutterBottom
        marginBottom={2}
        variant="h2"
      >
        Overview
      </Typography>
      <Grid alignItems="center" container spacing={2}>
        <AlertDetailRow label="Name" value={label} />
        <AlertDetailRow label="Description" value={description} />
        <AlertDetailRow
          label="Status"
          statusColor={statusColorMap[status]}
          value={convertStringToCamelCasesWithSpaces(status)}
        />
        <AlertDetailRow
          label="Severity"
          value={severity !== undefined ? severityMap[severity] : severity}
        />
        <AlertDetailRow
          label="Service"
          value={getServiceTypeLabel(serviceType, serviceTypes)}
        />
        <AlertDetailRow
          label="Type"
          value={convertStringToCamelCasesWithSpaces(type)}
        />
        <AlertDetailRow label="Created By" value={createdBy} />
        <AlertDetailRow
          label="Last Modified"
          value={formatTimestamp(updated)}
        />
      </Grid>
    </React.Fragment>
  );
};
