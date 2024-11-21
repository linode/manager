import { getAPIFilterFromQuery } from '@linode/search';
import {
  CircleProgress,
  IconButton,
  InputAdornment,
  Notice,
  Paper,
  TextField,
} from '@linode/ui';
import CloseIcon from '@mui/icons-material/Close';
import { useQueryClient } from '@tanstack/react-query';
import { createLazyRoute } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { debounce } from 'throttle-debounce';
import { makeStyles } from 'tss-react/mui';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Drawer } from 'src/components/Drawer';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Hidden } from 'src/components/Hidden';
import { LandingHeader } from 'src/components/LandingHeader';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableSortCell } from 'src/components/TableSortCell';
import { Typography } from 'src/components/Typography';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useFlags } from 'src/hooks/useFlags';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import {
  isEventImageUpload,
  isEventInProgressDiskImagize,
} from 'src/queries/events/event.helpers';
import { useEventsInfiniteQuery } from 'src/queries/events/events';
import {
  imageQueries,
  useDeleteImageMutation,
  useImagesQuery,
} from 'src/queries/images';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import { getEventsForImages } from '../utils';
import { EditImageDrawer } from './EditImageDrawer';
import { ManageImageReplicasForm } from './ImageRegions/ManageImageRegionsForm';
import { ImageRow } from './ImageRow';
import { ImagesLandingEmptyState } from './ImagesLandingEmptyState';
import { RebuildImageDrawer } from './RebuildImageDrawer';

import type { Handlers as ImageHandlers } from './ImagesActionMenu';
import type { Filter, ImageStatus } from '@linode/api-v4';
import type { Theme } from '@mui/material/styles';

const searchParamKey = 'query';

const useStyles = makeStyles()((theme: Theme) => ({
  imageTable: {
    marginBottom: theme.spacing(3),
    padding: 0,
  },
  imageTableHeader: {
    marginLeft: theme.spacing(),
    padding: theme.spacing(),
  },
  imageTableSubheader: {
    marginTop: theme.spacing(),
  },
}));

interface ImageDialogState {
  error?: string;
  image?: string;
  imageID?: string;
  open: boolean;
  status?: ImageStatus;
  submitting: boolean;
}

const defaultDialogState = {
  error: undefined,
  image: '',
  imageID: '',
  open: false,
  submitting: false,
};

export const ImagesLanding = () => {
  const { classes } = useStyles();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const flags = useFlags();
  const location = useLocation();
  const isImagesReadOnly = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_images',
  });
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get(searchParamKey) ?? '';

  const queryClient = useQueryClient();

  /**
   * At the time of writing: `label`, `tags`, `size`, `status`, `region` are filterable.
   *
   * Some fields like `status` and `region` can't be used in complex filters using '+or' / '+and'
   *
   * Using `tags` in a '+or' is currently broken. See ARB-5792
   */
  const { error: searchParseError, filter } = getAPIFilterFromQuery(query, {
    // Because Images have an array of region objects, we need to transform
    // search queries like "region: us-east" to { regions: { region: "us-east" } }
    // rather than the default behavior which is { region: { '+contains': "us-east" } }
    filterShapeOverrides: {
      '+contains': {
        field: 'region',
        filter: (value) => ({ regions: { region: value } }),
      },
      '+eq': {
        field: 'region',
        filter: (value) => ({ regions: { region: value } }),
      },
    },
    searchableFieldsWithoutOperator: ['label', 'tags'],
  });

  const paginationForManualImages = usePagination(1, 'images-manual', 'manual');

  const {
    handleOrderChange: handleManualImagesOrderChange,
    order: manualImagesOrder,
    orderBy: manualImagesOrderBy,
  } = useOrder(
    {
      order: 'asc',
      orderBy: 'label',
    },
    'images-manual-order',
    'manual'
  );

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
      // Refetch custom images every 30 seconds.
      // We do this because we have no /v4/account/events we can use
      // to update Image region statuses. We should make the API
      // team and Images team implement events for this.
      refetchInterval: 30_000,
      // If we have a search query, disable retries to keep the UI
      // snappy if the user inputs an invalid X-Filter. Otherwise,
      // pass undefined to use the default retry behavior.
      retry: query ? false : undefined,
    }
  );

  // Pagination, order, and query hooks for automatic/recovery images
  const paginationForAutomaticImages = usePagination(
    1,
    'images-automatic',
    'automatic'
  );
  const {
    handleOrderChange: handleAutomaticImagesOrderChange,
    order: automaticImagesOrder,
    orderBy: automaticImagesOrderBy,
  } = useOrder(
    {
      order: 'asc',
      orderBy: 'label',
    },
    'images-automatic-order',
    'automatic'
  );

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
      // If we have a search query, disable retries to keep the UI
      // snappy if the user inputs an invalid X-Filter. Otherwise,
      // pass undefined to use the default retry behavior.
      retry: query ? false : undefined,
    }
  );

  const { mutateAsync: deleteImage } = useDeleteImageMutation();

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

  // TODO Image Service V2: delete after GA
  const multiRegionsEnabled =
    (flags.imageServiceGen2 &&
      manualImages?.data.some((image) => image.regions?.length)) ??
    false;

  // Automatic images with the associated events tied in.
  const automaticImagesEvents = getEventsForImages(
    automaticImages?.data ?? [],
    imageEvents
  );

  const [selectedImageId, setSelectedImageId] = React.useState<string>();

  const [
    isManageReplicasDrawerOpen,
    setIsManageReplicasDrawerOpen,
  ] = React.useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = React.useState(false);
  const [isRebuildDrawerOpen, setIsRebuildDrawerOpen] = React.useState(false);

  const selectedImage =
    manualImages?.data.find((i) => i.id === selectedImageId) ??
    automaticImages?.data.find((i) => i.id === selectedImageId);

  const [dialog, setDialogState] = React.useState<ImageDialogState>(
    defaultDialogState
  );

  const dialogAction = dialog.status === 'pending_upload' ? 'cancel' : 'delete';
  const dialogMessage =
    dialogAction === 'cancel'
      ? 'Are you sure you want to cancel this Image upload?'
      : 'Are you sure you want to delete this Image?';

  const openDialog = (image: string, imageID: string, status: ImageStatus) => {
    setDialogState({
      error: undefined,
      image,
      imageID,
      open: true,
      status,
      submitting: false,
    });
  };

  const closeDialog = () => {
    setDialogState({ ...dialog, open: false });
  };

  const handleRemoveImage = () => {
    if (!dialog.imageID) {
      setDialogState((dialog) => ({
        ...dialog,
        error: 'Image is not available.',
      }));
    }
    setDialogState((dialog) => ({
      ...dialog,
      error: undefined,
      submitting: true,
    }));

    deleteImage({ imageId: dialog.imageID! })
      .then(() => {
        closeDialog();
        /**
         * request generated by the Pagey HOC.
         *
         * We're making a request here because the image is being
         * optimistically deleted on the API side, so a GET to /images
         * will not return the image scheduled for deletion. This request
         * is ensuring the image is removed from the list, to prevent the user
         * from taking any action on the Image.
         */
        // this.props.onDelete();
        enqueueSnackbar('Image has been scheduled for deletion.', {
          variant: 'info',
        });
      })
      .catch((err) => {
        const _error = getErrorStringOrDefault(
          err,
          'There was an error deleting the image.'
        );
        setDialogState((dialog) => ({
          ...dialog,
          error: _error,
          submitting: false,
        }));
      });
  };

  const onRetryClick = (
    imageId: string,
    imageLabel: string,
    imageDescription: string
  ) => {
    queryClient.invalidateQueries({
      queryKey: imageQueries.paginated._def,
    });
    history.push('/images/create/upload', {
      imageDescription,
      imageLabel,
    });
  };

  const onCancelFailedClick = () => {
    queryClient.invalidateQueries({
      queryKey: imageQueries.paginated._def,
    });
  };

  const deployNewLinode = (imageID: string) => {
    history.push({
      pathname: `/linodes/create/`,
      search: `?type=Images&imageID=${imageID}`,
      state: { selectedImageId: imageID },
    });
  };

  const resetSearch = () => {
    queryParams.delete(searchParamKey);
    history.push({ search: queryParams.toString() });
  };

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    queryParams.delete('page');
    queryParams.set(searchParamKey, e.target.value);
    history.push({ search: queryParams.toString() });
  };

  const handlers: ImageHandlers = {
    onCancelFailed: onCancelFailedClick,
    onDelete: openDialog,
    onDeploy: deployNewLinode,
    onEdit: (image) => {
      setSelectedImageId(image.id);
      setIsEditDrawerOpen(true);
    },
    onManageRegions: multiRegionsEnabled
      ? (image) => {
          setSelectedImageId(image.id);
          setIsManageReplicasDrawerOpen(true);
        }
      : undefined,
    onRestore: (image) => {
      setSelectedImageId(image.id);
      setIsRebuildDrawerOpen(true);
    },
    onRetry: onRetryClick,
  };

  if (manualImagesLoading || automaticImagesLoading) {
    return <CircleProgress />;
  }

  if (!query && (manualImagesError || automaticImagesError)) {
    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Images" />
        <ErrorState errorText="There was an error retrieving your images. Please reload and try again." />
      </React.Fragment>
    );
  }

  if (manualImages?.results === 0 && automaticImages?.results === 0 && !query) {
    return <ImagesLandingEmptyState />;
  }

  const isFetching = manualImagesIsFetching || automaticImagesIsFetching;

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Images" />
      <LandingHeader
        buttonDataAttrs={{
          tooltipText: getRestrictedResourceText({
            action: 'create',
            isSingular: false,
            resourceType: 'Images',
          }),
        }}
        disabledCreateButton={isImagesReadOnly}
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/images"
        entity="Image"
        onButtonClick={() => history.push('/images/create')}
        title="Images"
      />
      <TextField
        InputProps={{
          endAdornment: query && (
            <InputAdornment position="end">
              {isFetching && <CircleProgress size="sm" />}
              <IconButton
                aria-label="Clear"
                data-testid="clear-images-search"
                onClick={resetSearch}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        onChange={debounce(400, (e) => {
          onSearch(e);
        })}
        containerProps={{ mb: 2 }}
        errorText={searchParseError?.message}
        hideLabel
        label="Search"
        placeholder="Search Images"
        value={query}
      />
      <Paper className={classes.imageTable}>
        <div className={classes.imageTableHeader}>
          <Typography variant="h3">Custom Images</Typography>
          <Typography className={classes.imageTableSubheader}>
            These are images you manually uploaded or captured from an existing
            compute instance disk. You can deploy an image to a compute instance
            in any region.
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
              {multiRegionsEnabled && (
                <Hidden smDown>
                  <TableCell>Replicated in</TableCell>
                </Hidden>
              )}
              {multiRegionsEnabled && !flags.imageServiceGen2Ga && (
                <Hidden smDown>
                  <TableCell>Compatibility</TableCell>
                </Hidden>
              )}
              <TableSortCell
                active={manualImagesOrderBy === 'size'}
                direction={manualImagesOrder}
                handleClick={handleManualImagesOrderChange}
                label="size"
              >
                {multiRegionsEnabled ? 'Original Image' : 'Size'}
              </TableSortCell>
              {multiRegionsEnabled && (
                <Hidden mdDown>
                  <TableCell>All Replicas</TableCell>
                </Hidden>
              )}
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
              {multiRegionsEnabled && (
                <Hidden mdDown>
                  <TableCell>Image ID</TableCell>
                </Hidden>
              )}
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {manualImages?.results === 0 && (
              <TableRowEmpty
                colSpan={9}
                message={`No Custom Images to display.`}
              />
            )}
            {manualImagesError && query && (
              <TableRowError
                colSpan={9}
                message={manualImagesError[0].reason}
              />
            )}
            {manualImages?.data.map((manualImage) => (
              <ImageRow
                event={manualImagesEvents[manualImage.id]}
                handlers={handlers}
                image={manualImage}
                key={manualImage.id}
                multiRegionsEnabled={multiRegionsEnabled}
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
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {automaticImages?.results === 0 && (
              <TableRowEmpty
                colSpan={6}
                message={`No Recovery Images to display.`}
              />
            )}
            {automaticImagesError && query && (
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
      <EditImageDrawer
        image={selectedImage}
        onClose={() => setIsEditDrawerOpen(false)}
        open={isEditDrawerOpen}
      />
      <RebuildImageDrawer
        image={selectedImage}
        onClose={() => setIsRebuildDrawerOpen(false)}
        open={isRebuildDrawerOpen}
      />
      <Drawer
        onClose={() => setIsManageReplicasDrawerOpen(false)}
        open={isManageReplicasDrawerOpen}
        title={`Manage Replicas for ${selectedImage?.label}`}
      >
        <ManageImageReplicasForm
          image={selectedImage}
          onClose={() => setIsManageReplicasDrawerOpen(false)}
        />
      </Drawer>
      <ConfirmationDialog
        actions={
          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              label:
                dialogAction === 'cancel' ? 'Cancel Upload' : 'Delete Image',
              loading: dialog.submitting,
              onClick: handleRemoveImage,
            }}
            secondaryButtonProps={{
              'data-testid': 'cancel',
              label: dialogAction === 'cancel' ? 'Keep Image' : 'Cancel',
              onClick: closeDialog,
            }}
          />
        }
        title={
          dialogAction === 'cancel'
            ? 'Cancel Upload'
            : `Delete Image ${dialog.image}`
        }
        onClose={closeDialog}
        open={dialog.open}
      >
        {dialog.error && <Notice text={dialog.error} variant="error" />}
        <Typography>{dialogMessage}</Typography>
      </ConfirmationDialog>
    </React.Fragment>
  );
};

export const imagesLandingLazyRoute = createLazyRoute('/images')({
  component: ImagesLanding,
});

export default ImagesLanding;
