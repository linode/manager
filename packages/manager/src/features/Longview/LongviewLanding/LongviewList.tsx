import { LongviewClient } from '@linode/api-v4/lib/longview/types';
import * as React from 'react';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import Box from 'src/components/core/Box';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import { Props as LVProps } from 'src/containers/longview.container';
import LongviewRows from './LongviewListRows';

const useStyles = makeStyles((theme: Theme) => ({
  empty: {
    height: '20em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    ...theme.applyLinkStyles,
  },
  emptyText: {
    fontSize: '1.1em',
  },
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
  filteredData: LongviewClient[];
  createLongviewClient: () => void;
  openPackageDrawer: (id: number, label: string) => void;
  triggerDeleteLongviewClient: (
    longviewClientID: number,
    longviewClientLabel: string
  ) => void;
  userCanCreateLongviewClient: boolean;
}

type CombinedProps = Props & LongviewProps;

const LongviewList: React.FC<CombinedProps> = (props) => {
  const {
    createLongviewClient,
    loading,
    filteredData,
    longviewClientsError,
    longviewClientsLastUpdated,
    longviewClientsLoading,
    longviewClientsResults,
    openPackageDrawer,
    triggerDeleteLongviewClient,
    userCanCreateLongviewClient,
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
      <Paper data-testid="no-client-list" className={classes.empty}>
        <Typography variant="body1" className={classes.emptyText}>
          {userCanCreateLongviewClient ? (
            <React.Fragment>
              You have no Longview clients configured.{' '}
              <button className={classes.button} onClick={createLongviewClient}>
                Click here to add one.
              </button>
            </React.Fragment>
          ) : (
            'You have no Longview clients configured.'
          )}
        </Typography>
      </Paper>
    );
  }

  const pageSize = 5;

  return (
    // Don't use the value from local storage for this case,
    // since displaying a large number of client rows has performance impacts.
    <Paginate data={filteredData} pageSize={pageSize}>
      {({
        data: paginatedAndOrderedData,
        count,
        handlePageChange,
        handlePageSizeChange,
        page,
        pageSize,
      }) => (
        <>
          <Box flexDirection="column">
            <LongviewRows
              longviewClientsData={paginatedAndOrderedData}
              triggerDeleteLongviewClient={triggerDeleteLongviewClient}
              openPackageDrawer={openPackageDrawer}
            />
          </Box>
          {filteredData.length > pageSize ? (
            <PaginationFooter
              count={count}
              handlePageChange={handlePageChange}
              handleSizeChange={handlePageSizeChange}
              page={page}
              pageSize={pageSize}
              eventCategory="Longview Table"
              fixedSize
            />
          ) : null}
        </>
      )}
    </Paginate>
  );
};

export default compose<CombinedProps, CombinedProps>(React.memo)(LongviewList);
