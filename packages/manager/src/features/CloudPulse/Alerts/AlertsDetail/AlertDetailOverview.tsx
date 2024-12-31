import { CircleProgress } from '@linode/ui';
import { Grid, Typography, useTheme } from '@mui/material';
import React from 'react';

import { useCloudPulseServiceTypes } from 'src/queries/cloudpulse/services';
import { formatDate } from 'src/utilities/formatDate';

import { convertStringToCamelCasesWithSpaces } from '../../Utils/utils';
import { severityMap, statusColorMap } from '../constants';
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
          status={statusColorMap[status]}
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
          value={formatDate(updated, {
            format: 'MMM dd, yyyy, h:mm a',
          })}
          label="Last Modified"
        />
      </Grid>
    </React.Fragment>
  );
};
