import { useImagesQuery } from '@linode/queries';
import {
  CircleProgress,
  ErrorState,
  Hidden,
  Paper,
  Typography,
} from '@linode/ui';
import { useSearch } from '@tanstack/react-router';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableSortCell } from 'src/components/TableSortCell';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';
import {
  isEventImageUpload,
  isEventInProgressDiskImagize,
} from 'src/queries/events/event.helpers';
import { useEventsInfiniteQuery } from 'src/queries/events/events';

import {
  AUTOMATIC_IMAGES_DEFAULT_ORDER,
  AUTOMATIC_IMAGES_DEFAULT_ORDER_BY,
  AUTOMATIC_IMAGES_ORDER_PREFERENCE_KEY,
  AUTOMATIC_IMAGES_PREFERENCE_KEY,
} from '../constants';
import { getEventsForImages, useImgesTableStyles } from '../utils';
import { ImageRow } from './ImageRow';

import type { Handlers as ImageHandlers } from './ImagesActionMenu';
import type { Filter } from '@linode/api-v4';

interface Props {
  filter: Filter;
  handlers: ImageHandlers;
  onFetchingChange?: (fetching: boolean) => void;
}

export const ImagesRecovery = (props: Props) => {
  const { filter, handlers, onFetchingChange } = props;

  const { classes } = useImgesTableStyles();
  const search = useSearch({ from: '/images' });

  // Pagination, order, and query hooks for automatic/recovery images
  const paginationForAutomaticImages = usePaginationV2({
    currentRoute: '/images/images',
    preferenceKey: AUTOMATIC_IMAGES_PREFERENCE_KEY,
    searchParams: (prev) => ({
      ...prev,
      query: search.query,
    }),
  });

  const {
    handleOrderChange: handleAutomaticImagesOrderChange,
    order: automaticImagesOrder,
    orderBy: automaticImagesOrderBy,
  } = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: AUTOMATIC_IMAGES_DEFAULT_ORDER,
        orderBy: AUTOMATIC_IMAGES_DEFAULT_ORDER_BY,
      },
      from: '/images/images',
    },
    preferenceKey: AUTOMATIC_IMAGES_ORDER_PREFERENCE_KEY,
    prefix: 'automatic',
  });

  const automaticImagesFilter: Filter = {
    ['+order']: automaticImagesOrder,
    ['+order_by']: automaticImagesOrderBy,
    ...filter,
  };

  const {
    data: automaticImages,
    error: automaticImagesError,
    isFetching: automaticImagesIsFetching,
    isLoading: automaticImagesLoading,
  } = useImagesQuery(
    {
      page: paginationForAutomaticImages.page,
      page_size: paginationForAutomaticImages.pageSize,
    },
    {
      ...automaticImagesFilter,
      is_public: false,
      type: 'automatic',
    },
    {
      enabled: search.subType === 'recovery',
      // If we have a search query, disable retries to keep the UI
      // snappy if the user inputs an invalid X-Filter. Otherwise,
      // pass undefined to use the default retry behavior.
      retry: search.query ? false : undefined,
    }
  );

  const { events } = useEventsInfiniteQuery();

  const imageEvents =
    events?.filter(
      (event) =>
        isEventInProgressDiskImagize(event) || isEventImageUpload(event)
    ) ?? [];

  // Automatic images with the associated events tied in.
  const automaticImagesEvents = getEventsForImages(
    automaticImages?.data ?? [],
    imageEvents
  );

  // Notifies parent (search) whenever fetching changes
  React.useEffect(() => {
    onFetchingChange?.(automaticImagesIsFetching);
  }, [automaticImagesIsFetching, onFetchingChange]);

  if (automaticImagesLoading) {
    return <CircleProgress />;
  }

  if (!search.query && automaticImagesError) {
    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Images" />
        <ErrorState errorText="There was an error retrieving your images. Please reload and try again." />
      </React.Fragment>
    );
  }

  return (
    <Paper className={classes.imageTable}>
      <div className={classes.imageTableHeader}>
        <Typography variant="h3">Recovery Images</Typography>
        <Typography className={classes.imageTableSubheader}>
          These are images we automatically capture when Linode disks are
          deleted. They will be deleted after the indicated expiration date.
        </Typography>
      </div>
      <Table>
        <TableHead>
          <TableRow>
            <TableSortCell
              active={automaticImagesOrderBy === 'label'}
              direction={automaticImagesOrder}
              handleClick={handleAutomaticImagesOrderChange}
              label="label"
            >
              Image
            </TableSortCell>
            <Hidden smDown>
              <TableCell>Status</TableCell>
            </Hidden>
            <TableSortCell
              active={automaticImagesOrderBy === 'size'}
              direction={automaticImagesOrder}
              handleClick={handleAutomaticImagesOrderChange}
              label="size"
            >
              Size
            </TableSortCell>
            <Hidden smDown>
              <TableSortCell
                active={automaticImagesOrderBy === 'created'}
                direction={automaticImagesOrder}
                handleClick={handleAutomaticImagesOrderChange}
                label="created"
              >
                Created
              </TableSortCell>
            </Hidden>
            <Hidden smDown>
              <TableCell>Expires</TableCell>
            </Hidden>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {automaticImages?.results === 0 && (
            <TableRowEmpty
              colSpan={6}
              message={`No Recovery Images to display.`}
            />
          )}
          {automaticImagesError && search.query && (
            <TableRowError
              colSpan={9}
              message={automaticImagesError[0].reason}
            />
          )}
          {automaticImages?.data.map((automaticImage) => (
            <ImageRow
              event={automaticImagesEvents[automaticImage.id]}
              handlers={handlers}
              image={automaticImage}
              key={automaticImage.id}
            />
          ))}
        </TableBody>
      </Table>
      <PaginationFooter
        count={automaticImages?.results ?? 0}
        eventCategory="Recovery Images Table"
        handlePageChange={paginationForAutomaticImages.handlePageChange}
        handleSizeChange={paginationForAutomaticImages.handlePageSizeChange}
        page={paginationForAutomaticImages.page}
        pageSize={paginationForAutomaticImages.pageSize}
      />
    </Paper>
  );
};
