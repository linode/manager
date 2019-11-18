import { LongviewClient } from 'linode-js-sdk/lib/longview/types';
import * as React from 'react';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import Box from 'src/components/core/Box';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import { Props as LVProps } from 'src/containers/longview.container';
import LongviewRows from './LongviewListRows';

const useStyles = makeStyles((theme: Theme) => ({
  empty: {
    height: '20em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  button: {
    background: 'none',
    color: theme.palette.primary.main,
    border: 'none',
    padding: 0,
    font: 'inherit',
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  emptyText: {
    fontSize: '1.1em'
  }
}));

type LongviewProps = Omit<
  LVProps,
  | 'longviewClientsData'
  | 'getLongviewClients'
  | 'createLongviewClient'
  | 'deleteLongviewClient'
  | 'updateLongviewClient'
>;

interface Props {
  loading: boolean;
  longviewClientsData: LongviewClient[];
  createLongviewClient: () => void;
  triggerDeleteLongviewClient: (
    longviewClientID: number,
    longviewClientLabel: string
  ) => void;
}

type CombinedProps = Props & LongviewProps;

const LongviewList: React.FC<CombinedProps> = props => {
  const {
    createLongviewClient,
    loading,
    longviewClientsData,
    longviewClientsError,
    longviewClientsLastUpdated,
    longviewClientsLoading,
    longviewClientsResults,
    triggerDeleteLongviewClient
  } = props;

  const classes = useStyles();

  // Empty state and a new client is being created
  const newClientIsLoading = loading && longviewClientsResults === 0;

  if (
    (longviewClientsLoading && longviewClientsLastUpdated === 0) ||
    newClientIsLoading
  ) {
    return (
      <Paper>
        <CircleProgress />
      </Paper>
    );
  }

  /**
   * Only show an error if we haven't received data
   */
  if (longviewClientsError.read && longviewClientsLastUpdated === 0) {
    const errorText = longviewClientsError.read[0].reason;
    return (
      <Paper>
        <ErrorState errorText={errorText} />
      </Paper>
    );
  }

  /** Empty state */
  if (longviewClientsLastUpdated !== 0 && longviewClientsResults === 0) {
    return (
      <Paper className={classes.empty}>
        <Typography variant="body1" className={classes.emptyText}>
          You have no Longview clients configured.{' '}
          <button className={classes.button} onClick={createLongviewClient}>
            Click here to add one.
          </button>
        </Typography>
      </Paper>
    );
  }

  return (
    <React.Fragment>
      <OrderBy data={longviewClientsData} orderBy={'label'} order={'asc'}>
        {({ data: orderedData, handleOrderChange, order, orderBy }) => (
          <Paginate data={orderedData}>
            {({
              data: paginatedAndOrderedData,
              count,
              handlePageChange,
              handlePageSizeChange,
              page,
              pageSize
            }) => (
              <>
                <Box flexDirection="column">
                  <LongviewRows
                    longviewClientsData={paginatedAndOrderedData}
                    triggerDeleteLongviewClient={triggerDeleteLongviewClient}
                  />
                </Box>
                <PaginationFooter
                  count={count}
                  handlePageChange={handlePageChange}
                  handleSizeChange={handlePageSizeChange}
                  page={page}
                  pageSize={pageSize}
                  eventCategory="Longview Table"
                />
              </>
            )}
          </Paginate>
        )}
      </OrderBy>
    </React.Fragment>
  );
};

export default compose<CombinedProps, CombinedProps>(React.memo)(LongviewList);
