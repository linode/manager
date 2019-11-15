import * as React from 'react';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import { LongviewService } from 'src/features/Longview/request.types';
import LongviewServiceRow from './LongviewServiceRow';

export interface Props {}

export const ListeningServices: React.FC<Props> = props => {
  return (
    <Grid item xs={12} md={8}>
      <Typography variant="h2">Listening Services</Typography>
      <Grid item>
        <ServicesTable
          services={[]}
          servicesLoading={false}
          servicesError={undefined}
        />
      </Grid>
    </Grid>
  );
};

export interface TableProps {
  services: LongviewService[];
  servicesLoading: boolean;
  servicesError?: string;
}

export const ServicesTable: React.FC<TableProps> = props => {
  const { services, servicesError, servicesLoading } = props;
  return (
    <Table spacingTop={16}>
      <TableHead>
        <TableRow>
          <TableCell data-qa-table-header="Process">Process</TableCell>
          <TableCell data-qa-table-header="User">User</TableCell>
          <TableCell data-qa-table-header="Protocol">Protocol</TableCell>
          <TableCell data-qa-table-header="Port">Port</TableCell>
          <TableCell data-qa-table-header="IP">IP</TableCell>
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>
        {renderLoadingErrorData(servicesLoading, services, servicesError)}
      </TableBody>
    </Table>
  );
};

const renderLoadingErrorData = (
  loading: boolean,
  data: LongviewService[],
  error?: string
) => {
  if (loading) {
    return <TableRowLoading colSpan={12} />;
  }
  if (error) {
    return <TableRowError colSpan={12} message={error} />;
  }
  if (data.length === 0) {
    return <TableRowEmptyState colSpan={12} />;
  }

  return data.map((thisService, idx) => (
    <LongviewServiceRow key={`longview-service-${idx}`} service={thisService} />
  ));
};

export default ListeningServices;
