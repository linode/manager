import { getAPIFilterFromQuery } from '@linode/search';
import {
  ActionsPanel,
  CircleProgress,
  CloseIcon,
  Drawer,
  ErrorState,
  IconButton,
  InputAdornment,
  Notice,
  Paper,
  TextField,
  Typography,
} from '@linode/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { useSnackbar } from 'notistack';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import { useHistory } from 'react-router-dom';
import { debounce } from 'throttle-debounce';
import { makeStyles } from 'tss-react/mui';

import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Hidden } from 'src/components/Hidden';
import { LandingHeader } from 'src/components/LandingHeader';
import { Link } from 'src/components/Link';
import { NotFound } from 'src/components/NotFound';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableSortCell } from 'src/components/TableSortCell';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useDialogData } from 'src/hooks/useDialogData';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';
import { useRestrictedGlobalGrantCheck } from 'src/hooks/useRestrictedGlobalGrantCheck';
import {
  isEventImageUpload,
  isEventInProgressDiskImagize,
} from 'src/queries/events/event.helpers';
import { useEventsInfiniteQuery } from 'src/queries/events/events';
import {
  imageQueries,
  useDeleteImageMutation,
  useImageQuery,
  useImagesQuery,
} from 'src/queries/images';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import {
  AUTOMATIC_IMAGES_DEFAULT_ORDER,
  AUTOMATIC_IMAGES_DEFAULT_ORDER_BY,
  AUTOMATIC_IMAGES_ORDER_PREFERENCE_KEY,
  AUTOMATIC_IMAGES_PREFERENCE_KEY,
  MANUAL_IMAGES_DEFAULT_ORDER,
  MANUAL_IMAGES_DEFAULT_ORDER_BY,
  MANUAL_IMAGES_PREFERENCE_KEY,
} from '../constants';
import { getEventsForImages } from '../utils';
import { EditImageDrawer } from './EditImageDrawer';
import { ManageImageReplicasForm } from './ImageRegions/ManageImageRegionsForm';
import { ImageRow } from './ImageRow';
import { ImagesLandingEmptyState } from './ImagesLandingEmptyState';
import { RebuildImageDrawer } from './RebuildImageDrawer';

import type { Handlers as ImageHandlers } from './ImagesActionMenu';
import type { Filter, Image, ImageStatus } from '@linode/api-v4';
import type { Theme } from '@mui/material/styles';
import type { ImageAction, ImagesSearchParams } from 'src/routes/images';

const useStyles = makeStyles()((theme: Theme) => ({
  imageTable: {
    marginBottom: theme.spacingFunction(24),
    padding: 0,
  },
  imageTableHeader: {
    border: `1px solid ${theme.tokens.alias.Border.Normal}`,
    borderBottom: 0,
    padding: theme.spacingFunction(8),
    paddingLeft: theme.spacingFunction(12),
  },
  imageTableSubheader: {
    marginTop: theme.spacingFunction(8),
  },
}));

interface ImageDialogState {
  error?: string;
  status?: ImageStatus;
  submitting: boolean;
}

const defaultDialogState: ImageDialogState = {
  error: undefined,
  submitting: false,
};

export const ImagesLanding = () => {
  const { classes } = useStyles();
  const {
    action,
    imageId: selectedImageId,
  }: { action: ImageAction; imageId: string } = useParams({
    strict: false,
  });
  const search: ImagesSearchParams = useSearch({ from: '/images' });
  const { query } = search;
  const history = useHistory();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const isCreateImageRestricted = useRestrictedGlobalGrantCheck({
    globalGrantType: 'add_images',
  });
  const queryClient = useQueryClient();
  const [dialogState, setDialogState] =
    React.useState<ImageDialogState>(defaultDialogState);
  const dialogStatus =
    dialogState.status === 'pending_upload' ? 'cancel' : 'delete';

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

  const paginationForManualImages = usePaginationV2({
    currentRoute: '/images',
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
      from: '/images',
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
  const paginationForAutomaticImages = usePaginationV2({
    currentRoute: '/images',
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
      from: '/images',
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
      // If we have a search query, disable retries to keep the UI
      // snappy if the user inputs an invalid X-Filter. Otherwise,
      // pass undefined to use the default retry behavior.
      retry: query ? false : undefined,
    }
  );

  const { data: selectedImage, isFetching: isFetchingSelectedImage } =
    useDialogData({
      enabled: !!selectedImageId,
      paramKey: 'imageId',
      queryHook: useImageQuery,
      redirectToOnNotFound: '/images',
    });

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

  // Automatic images with the associated events tied in.
  const automaticImagesEvents = getEventsForImages(
    automaticImages?.data ?? [],
    imageEvents
  );

  const actionHandler = (image: Image, action: ImageAction) => {
    navigate({
      params: { action, imageId: image.id },
      search: (prev) => prev,
      to: '/images/$imageId/$action',
    });
  };

  const handleEdit = (image: Image) => {
    actionHandler(image, 'edit');
  };

  const handleRebuild = (image: Image) => {
    actionHandler(image, 'rebuild');
  };

  const handleDelete = (image: Image) => {
    actionHandler(image, 'delete');
  };

  const handleCloseDialog = () => {
    setDialogState(defaultDialogState);
    navigate({ search: (prev) => prev, to: '/images' });
  };

  const handleManageRegions = (image: Image) => {
    actionHandler(image, 'manage-replicas');
  };

  const handleDeleteImage = (image: Image) => {
    if (!image.id) {
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

    deleteImage({ imageId: image.id })
      .then(() => {
        handleCloseDialog();
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
        setDialogState({
          ...dialogState,
          error: _error,
          submitting: false,
        });
        handleCloseDialog();
      });
  };

  const onCancelFailedClick = () => {
    queryClient.invalidateQueries({
      queryKey: imageQueries.paginated._def,
    });
  };

  const handleDeployNewLinode = (imageId: string) => {
    history.push({
      pathname: `/linodes/create/`,
      search: `?type=Images&imageID=${imageId}`,
    });
  };

  const resetSearch = () => {
    navigate({
      search: (prev) => ({ ...prev, query: undefined }),
      to: '/images',
    });
  };

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: undefined,
        query: e.target.value || undefined,
      }),
      to: '/images',
    });
  };

  const handlers: ImageHandlers = {
    onCancelFailed: onCancelFailedClick,
    onDelete: handleDelete,
    onDeploy: handleDeployNewLinode,
    onEdit: handleEdit,
    onManageRegions: handleManageRegions,
    onRebuild: handleRebuild,
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
      {isCreateImageRestricted && (
        <Notice
          sx={{ marginBottom: 2 }}
          text={getRestrictedResourceText({
            action: 'create',
            isSingular: false,
            resourceType: 'Images',
          })}
          variant="error"
        />
      )}
      <LandingHeader
        breadcrumbProps={{
          pathname: 'Images',
          removeCrumbX: 1,
        }}
        buttonDataAttrs={{
          tooltipText: getRestrictedResourceText({
            action: 'create',
            isSingular: false,
            resourceType: 'Images',
          }),
        }}
        disabledCreateButton={isCreateImageRestricted}
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/images"
        entity="Image"
        onButtonClick={() =>
          navigate({ search: () => ({}), to: '/images/create' })
        }
        title="Images"
      />
      <TextField
        containerProps={{ mb: 2 }}
        errorText={searchParseError?.message}
        hideLabel
        InputProps={{
          endAdornment: query && (
            <InputAdornment position="end">
              {isFetching && <CircleProgress noPadding size="xs" />}
              <IconButton
                aria-label="Clear"
                data-testid="clear-images-search"
                onClick={resetSearch}
                size="small"
                sx={{
                  padding: 0,
                }}
              >
                <CloseIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        label="Search"
        onChange={debounce(400, (e) => {
          onSearch(e);
        })}
        placeholder="Search Images"
        value={query ?? ''}
      />
      <Paper className={classes.imageTable}>
        <div className={classes.imageTableHeader}>
          <Typography variant="h3">Custom Images</Typography>
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
        isFetching={isFetchingSelectedImage}
        onClose={handleCloseDialog}
        open={action === 'edit'}
      />
      <RebuildImageDrawer
        image={selectedImage}
        isFetching={isFetchingSelectedImage}
        onClose={handleCloseDialog}
        open={action === 'rebuild'}
      />
      <Drawer
        isFetching={isFetchingSelectedImage}
        NotFoundComponent={NotFound}
        onClose={handleCloseDialog}
        open={action === 'manage-replicas'}
        title={`Manage Replicas for ${selectedImage?.label}`}
      >
        <ManageImageReplicasForm
          image={selectedImage}
          onClose={handleCloseDialog}
        />
      </Drawer>
      <ConfirmationDialog
        actions={
          <ActionsPanel
            primaryButtonProps={{
              'data-testid': 'submit',
              label:
                dialogStatus === 'cancel' ? 'Cancel Upload' : 'Delete Image',
              loading: dialogState.submitting,
              onClick: () => handleDeleteImage(selectedImage!),
            }}
            secondaryButtonProps={{
              'data-testid': 'cancel',
              label: dialogStatus === 'cancel' ? 'Keep Image' : 'Cancel',
              onClick: handleCloseDialog,
            }}
          />
        }
        isFetching={isFetchingSelectedImage}
        onClose={handleCloseDialog}
        open={action === 'delete'}
        title={
          dialogStatus === 'cancel'
            ? 'Cancel Upload'
            : `Delete Image ${selectedImage?.label}`
        }
      >
        {dialogState.error && (
          <Notice text={dialogState.error} variant="error" />
        )}
        <Typography>
          {dialogStatus === 'cancel'
            ? 'Are you sure you want to cancel this Image upload?'
            : 'Are you sure you want to delete this Image?'}
        </Typography>
      </ConfirmationDialog>
    </React.Fragment>
  );
};

export default ImagesLanding;
