import { Paper } from '@linode/ui';
import { Grid } from '@mui/material';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { TableSortCell } from 'src/components/TableSortCell';
import { StyledPlaceholder } from 'src/features/StackScripts/StackScriptBase/StackScriptBase.styles';
import { useAllAlertDefinitionsQuery } from 'src/queries/cloudpulse/alerts';

import { AlertTableRow } from './AlertTableRow';
import { AlertListingTableLabelMap } from './constants';

import type { Alert } from '@linode/api-v4';

export const AlertListing = () => {
  // These are dummy order value and handleOrder methods, will replace them in the next PR
  const order = 'asc';
  const handleOrderChange = () => {
    return 'asc';
  };
  const { data: alerts, isError, isLoading } = useAllAlertDefinitionsQuery();

  const history = useHistory();

  const handleDetails = ({ id, service_type: serviceType }: Alert) => {
    history.push(`${location.pathname}/detail/${serviceType}/${id}`);
  };

  if (alerts?.length === 0) {
    return (
      <Grid item xs={12}>
        <Paper>
          <StyledPlaceholder
            subtitle="Start Monitoring your resources."
            title=""
          />
        </Paper>
      </Grid>
    );
  }
  return (
    <Grid marginTop={2}>
      <Table colCount={7} size="small">
        <TableHead>
          <TableRow>
            {AlertListingTableLabelMap.map((value) => (
              <TableSortCell
                active={true}
                direction={order}
                handleClick={handleOrderChange}
                key={value.label}
                label={value.label}
              >
                {value.colName}
              </TableSortCell>
            ))}
            <TableCell actionCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {isError && (
            <TableRowError
              colSpan={7}
              message={'Error in fetching the alerts.'}
            />
          )}
          {isLoading && <TableRowLoading columns={7} />}
          {alerts?.map((alert) => (
            <AlertTableRow
              handlers={{
                handleDetails: () => handleDetails(alert),
              }}
              alert={alert}
              hover
              key={alert.id}
            />
          ))}
        </TableBody>
      </Table>
    </Grid>
  );
};
