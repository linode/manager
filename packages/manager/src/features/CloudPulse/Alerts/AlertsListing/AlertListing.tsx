import { CircleProgress, Paper } from '@linode/ui';
import { Grid } from '@mui/material';
import React from 'react';

import AlertIcon from 'src/assets/icons/entityIcons/alert.svg';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { StyledPlaceholder } from 'src/features/StackScripts/StackScriptBase/StackScriptBase.styles';
import { useAllAlertDefinitionsQuery } from 'src/queries/cloudpulse/alerts';

import { AlertTableRow } from './AlertTableRow';

export const AlertListing = () => {
  // These are dummy order and handlers, will replace them in the next PR
  const order = 'asc';
  const handleOrderChange = () => {
    return 'asc';
  };
  const { data: alerts, isError, isLoading } = useAllAlertDefinitionsQuery();
  if (isError || alerts?.length === 0) {
    return (
      <Grid item xs={12}>
        <Paper>
          <StyledPlaceholder
            icon={AlertIcon}
            subtitle="Start Monitoring your resources."
            title=""
          />
        </Paper>
      </Grid>
    );
  }
  if (isLoading) {
    return <CircleProgress />;
  }
  return (
    <Grid marginTop={2}>
      <Table colCount={7} size="small">
        <TableHead>
          <TableRow>
            <TableSortCell
              active={true}
              direction={order}
              handleClick={handleOrderChange}
              label="alertName"
            >
              Alert Name
            </TableSortCell>
            <TableSortCell
              handleClick={() => {
                'asc';
              }}
              active={true}
              direction={order}
              label="serviceType"
              size="small"
            >
              Service Type
            </TableSortCell>
            <TableSortCell
              active={true}
              direction={order}
              handleClick={handleOrderChange}
              label="severity"
            >
              Severity
            </TableSortCell>
            <TableSortCell
              active={true}
              direction={order}
              handleClick={handleOrderChange}
              label="status"
            >
              Status
            </TableSortCell>
            <TableSortCell
              active={true}
              direction={order}
              handleClick={handleOrderChange}
              label="lastModified"
            >
              Last Modified
            </TableSortCell>
            <TableSortCell
              active={true}
              direction={order}
              handleClick={handleOrderChange}
              label="createdBy"
              size="small"
            >
              Created By
            </TableSortCell>
            <TableCell actionCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {alerts?.map((alert) => (
            <AlertTableRow alert={alert} key={alert.id} />
          ))}
        </TableBody>
      </Table>
    </Grid>
  );
};
