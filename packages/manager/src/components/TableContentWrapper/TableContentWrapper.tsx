import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid/Grid';
import TableCell from 'src/components/TableCell/TableCell';
import TableRow from 'src/components/TableRow/TableRow';
import TableRowEmpty from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import {
  Props as TableLoadingProps,
  TableRowLoading,
} from 'src/components/TableRowLoading/TableRowLoading';
import { akamaiBillingInvoiceText } from 'src/features/Billing/billingUtils';

interface Props {
  length: number;
  loading: boolean;
  lastUpdated?: number;
  error?: APIError[];
  emptyMessage?: string;
  loadingProps?: TableLoadingProps;
  isAkamaiCustomer?: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  grid: {
    width: '100%',
    padding: theme.spacing(10),
  },
}));

const TableContentWrapper: React.FC<Props> = (props) => {
  const {
    length,
    loading,
    emptyMessage,
    error,
    lastUpdated,
    loadingProps,
    isAkamaiCustomer,
  } = props;

  const classes = useStyles();

  if (loading) {
    return <TableRowLoading {...loadingProps} />;
  }

  if (error && error.length > 0) {
    return <TableRowError colSpan={6} message={error[0].reason} />;
  }

  if (lastUpdated !== 0 && length === 0) {
    if (isAkamaiCustomer) {
      return (
        <TableRow>
          <TableCell colSpan={6}>
            <Grid
              container
              justifyContent="center"
              alignItems="center"
              className={classes.grid}
            >
              <Grid item>
                <Typography style={{ textAlign: 'center' }}>
                  <strong>{akamaiBillingInvoiceText}</strong>
                </Typography>
              </Grid>
            </Grid>
          </TableCell>
        </TableRow>
      );
    }
    return (
      <TableRowEmpty
        colSpan={6}
        message={emptyMessage ?? 'No data to display.'}
      />
    );
  }

  return (
    <>
      {isAkamaiCustomer ? (
        <TableRow>
          <TableCell colSpan={6} style={{ textAlign: 'center' }}>
            <strong>Future {akamaiBillingInvoiceText}</strong>
          </TableCell>
        </TableRow>
      ) : null}
      {props.children}
    </>
  );
};

export default TableContentWrapper;
