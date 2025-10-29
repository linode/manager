import { useImagesQuery } from '@linode/queries';
import {
  Box,
  Button,
  CircleProgress,
  ErrorState,
  Hidden,
  Paper,
  Typography,
} from '@linode/ui';
import { useNavigate, useSearch } from '@tanstack/react-router';
import * as React from 'react';

import { DocsLink } from 'src/components/DocsLink/DocsLink';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Link } from 'src/components/Link';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableSortCell } from 'src/components/TableSortCell';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';
import {
  isEventImageUpload,
  isEventInProgressDiskImagize,
} from 'src/queries/events/event.helpers';
import { useEventsInfiniteQuery } from 'src/queries/events/events';

import {
  MANUAL_IMAGES_DEFAULT_ORDER,
  MANUAL_IMAGES_DEFAULT_ORDER_BY,
  MANUAL_IMAGES_PREFERENCE_KEY,
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

export const ImagesCustom = (props: Props) => {
  const { filter, handlers, onFetchingChange } = props;
  const navigate = useNavigate();
  const search = useSearch({ from: '/images' });
  const { classes } = useImgesTableStyles();

  const { data: permissions } = usePermissions('account', ['create_image']);
  const canCreateImage = permissions?.create_image;

  const paginationForManualImages = usePaginationV2({
    currentRoute: '/images/images',
    preferenceKey: MANUAL_IMAGES_PREFERENCE_KEY,
    searchParams: (prev) => ({
      ...prev,
      query: search.query,
    }),
  });

  const {
    handleOrderChange: handleManualImagesOrderChange,
    order: manualImagesOrder,
    orderBy: manualImagesOrderBy,
  } = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: MANUAL_IMAGES_DEFAULT_ORDER,
        orderBy: MANUAL_IMAGES_DEFAULT_ORDER_BY,
      },
      from: '/images/images',
    },
    preferenceKey: MANUAL_IMAGES_PREFERENCE_KEY,
    prefix: 'manual',
  });

  const manualImagesFilter: Filter = {
    ['+order']: manualImagesOrder,
    ['+order_by']: manualImagesOrderBy,
    ...filter,
  };

  const {
    data: manualImages,
    error: manualImagesError,
    isFetching: manualImagesIsFetching,
    isLoading: manualImagesLoading,
  } = useImagesQuery(
    {
      page: paginationForManualImages.page,
      page_size: paginationForManualImages.pageSize,
    },
    {
      ...manualImagesFilter,
      is_public: false,
      type: 'manual',
    },
    {
      enabled: search.subType === 'custom',
      // Refetch custom images every 30 seconds.
      // We do this because we have no /v4/account/events we can use
      // to update Image region statuses. We should make the API
      // team and Images team implement events for this.
      refetchInterval: 30_000,
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

  // Private images with the associated events tied in.
  const manualImagesEvents = getEventsForImages(
    manualImages?.data ?? [],
    imageEvents
  );

  // Notifies parent (search) whenever fetching changes
  React.useEffect(() => {
    onFetchingChange?.(manualImagesIsFetching);
  }, [manualImagesIsFetching, onFetchingChange]);

  if (manualImagesLoading) {
    return <CircleProgress />;
  }

  if (!search.query && manualImagesError) {
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
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h3">My Custom Images</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <DocsLink
              analyticsLabel={'Custom Images'}
              href={'https://techdocs.akamai.com/cloud-computing/docs/images'}
            />
            <Button
              buttonType="primary"
              disabled={!canCreateImage}
              onClick={() =>
                navigate({ search: () => ({}), to: '/images/create' })
              }
              tooltipText={
                !canCreateImage
                  ? "You don't have permissions to create Images. Please contact your account administrator to request the necessary permissions."
                  : undefined
              }
            >
              Create Image
            </Button>
          </Box>
        </Box>
        <Typography className={classes.imageTableSubheader}>
          These are{' '}
          <Link to="https://techdocs.akamai.com/cloud-computing/docs/capture-an-image#capture-an-image">
            encrypted
          </Link>{' '}
          images you manually uploaded or captured from an existing compute
          instance disk. You can deploy an image to a compute instance in any
          region.
        </Typography>
      </div>
      <Table>
        <TableHead>
          <TableRow>
            <TableSortCell
              active={manualImagesOrderBy === 'label'}
              direction={manualImagesOrder}
              handleClick={handleManualImagesOrderChange}
              label="label"
            >
              Image
            </TableSortCell>
            <Hidden smDown>
              <TableCell>Status</TableCell>
            </Hidden>
            <Hidden smDown>
              <TableCell>Replicated in</TableCell>
            </Hidden>
            <TableSortCell
              active={manualImagesOrderBy === 'size'}
              direction={manualImagesOrder}
              handleClick={handleManualImagesOrderChange}
              label="size"
            >
              Original Image
            </TableSortCell>
            <Hidden mdDown>
              <TableCell>All Replicas</TableCell>
            </Hidden>
            <Hidden mdDown>
              <TableSortCell
                active={manualImagesOrderBy === 'created'}
                direction={manualImagesOrder}
                handleClick={handleManualImagesOrderChange}
                label="created"
              >
                Created
              </TableSortCell>
            </Hidden>
            <Hidden mdDown>
              <TableCell>Image ID</TableCell>
            </Hidden>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {manualImages?.results === 0 && (
            <TableRowEmpty
              colSpan={9}
              message={`No Custom Images to display.`}
            />
          )}
          {manualImagesError && search.query && (
            <TableRowError colSpan={9} message={manualImagesError[0].reason} />
          )}
          {manualImages?.data.map((manualImage) => (
            <ImageRow
              event={manualImagesEvents[manualImage.id]}
              handlers={handlers}
              image={manualImage}
              key={manualImage.id}
            />
          ))}
        </TableBody>
      </Table>
      <PaginationFooter
        count={manualImages?.results ?? 0}
        eventCategory="Custom Images Table"
        handlePageChange={paginationForManualImages.handlePageChange}
        handleSizeChange={paginationForManualImages.handlePageSizeChange}
        page={paginationForManualImages.page}
        pageSize={paginationForManualImages.pageSize}
      />
    </Paper>
  );
};
