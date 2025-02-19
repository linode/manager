import { CircleProgress, Typography } from '@linode/ui';
import { Grid } from '@mui/material';
import React from 'react';

import { useCloudPulseServiceTypes } from 'src/queries/cloudpulse/services';
import { formatDate } from 'src/utilities/formatDate';

import { convertStringToCamelCasesWithSpaces } from '../../Utils/utils';
import { alertStatusToIconStatusMap, severityMap } from '../constants';
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

  const {
    created_by: createdBy,
    description,
    label,
    service_type: serviceType,
    severity,
    status,
    type,
    updated,
  } = alertDetails;

  const { data: serviceTypeList, isFetching } = useCloudPulseServiceTypes(true);

  if (isFetching) {
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
          value={getServiceTypeLabel(serviceType, serviceTypeList)}
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
    </>
  );
});
