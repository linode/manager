import {
  Box,
  CircleProgress,
  ErrorState,
  Paper,
  StyledLinkButton,
  Typography,
} from '@linode/ui';
import * as React from 'react';

import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';

import { LongviewListRows } from './LongviewListRows';

import type { LongviewClient } from '@linode/api-v4/lib/longview/types';
import type { Props as LVProps } from 'src/containers/longview.container';

type LongviewProps = Omit<
  LVProps,
  | 'createLongviewClient'
  | 'deleteLongviewClient'
  | 'getLongviewClients'
  | 'longviewClientsData'
  | 'updateLongviewClient'
>;

interface Props extends LongviewProps {
  createLongviewClient: () => void;
  filteredData: LongviewClient[];
  loading: boolean;
  openPackageDrawer: (id: number, label: string) => void;
  triggerDeleteLongviewClient: (
    longviewClientID: number,
    longviewClientLabel: string
  ) => void;
  userCanCreateLongviewClient: boolean;
}

export const LongviewList = React.memo((props: Props) => {
  const {
    createLongviewClient,
    filteredData,
    loading,
    longviewClientsError,
    longviewClientsLastUpdated,
    longviewClientsLoading,
    longviewClientsResults,
    openPackageDrawer,
    triggerDeleteLongviewClient,
    userCanCreateLongviewClient,
  } = props;

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
      <Paper
        data-testid="no-client-list"
        sx={{
          alignItems: 'center',
          display: 'flex',
          height: '20em',
          justifyContent: 'center',
        }}
      >
        <Typography sx={{ fontSize: '1.1em' }} variant="body1">
          {userCanCreateLongviewClient ? (
            <React.Fragment>
              You have no Longview clients configured.{' '}
              <StyledLinkButton onClick={createLongviewClient}>
                Click here to add one.
              </StyledLinkButton>
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
        count,
        data: paginatedAndOrderedData,
        handlePageChange,
        handlePageSizeChange,
        page,
        pageSize,
      }) => (
        <>
          <Box flexDirection="column">
            <LongviewListRows
              longviewClientsData={paginatedAndOrderedData}
              openPackageDrawer={openPackageDrawer}
              triggerDeleteLongviewClient={triggerDeleteLongviewClient}
            />
          </Box>
          {filteredData.length > pageSize ? (
            <PaginationFooter
              count={count}
              eventCategory="Longview Table"
              fixedSize
              handlePageChange={handlePageChange}
              handleSizeChange={handlePageSizeChange}
              page={page}
              pageSize={pageSize}
            />
          ) : null}
        </>
      )}
    </Paginate>
  );
});
