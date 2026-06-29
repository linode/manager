import { Button } from '@akamai/cds-components/react/Button';
import { Pagination } from '@akamai/cds-components/react/Pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@akamai/cds-components/react/Table';
import { getAPIErrorOrDefault } from '@akamai/compute-ui-core/api';
import { formatDate } from '@akamai/compute-ui-core/datetime';
import {
  useDeleteShareGroupImageMutation,
  useProfile,
  useShareGroupsImagesQuery,
} from '@linode/queries';
import { getAPIFilterFromQuery } from '@linode/search';
import {
  ActionsPanel,
  Box,
  ErrorState,
  Paper,
  Stack,
  Typography,
  useTheme,
  ZeroStateSearchNarrowIcon,
} from '@linode/ui';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { enqueueSnackbar } from 'notistack';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField/DebouncedSearchTextField';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

import {
  DEFAULT_PAGE_SIZES,
  REMOVE_IMAGE_DIALOG_PENDO_IDS,
  SHARE_GROUP_DETAILS_PENDO_IDS,
} from '../../constants';
import { StyledActionMenuWrapper } from '../ShareGroupTable.styles';
import { EditImageDetailsDrawer } from './EditImageDetailsDrawer';

import type { Filter, Image } from '@linode/api-v4';

interface Props {
  handleAddImagesClick: () => void;
  isTableStripingEnabled: boolean;
  shareGroupId: string;
  shareGroupLabel?: string;
}

const IMAGES_COLUMNS = [
  { label: 'Custom Image Label', name: 'label' },
  { label: 'Created', name: 'created' },
  { label: 'Shared Image ID', name: 'id' },
];

export const SharedImagesTable = (props: Props) => {
  const {
    isTableStripingEnabled,
    shareGroupId,
    shareGroupLabel,
    handleAddImagesClick,
  } = props;
  const theme = useTheme();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = React.useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<Image | null>(null);

  const search = useSearch({
    from: '/images/share-groups/owned-groups/$shareGroupId',
  });

  const { error: searchParseError, filter: APIfilter } = getAPIFilterFromQuery(
    search.imagesQuery,
    {
      searchableFieldsWithoutOperator: ['label'],
    }
  );

  const { handleOrderChange, order, orderBy } = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: 'asc',
        orderBy: 'label',
      },
      from: '/images/share-groups/owned-groups/$shareGroupId',
    },
    preferenceKey: 'shareGroupDetailsSharedImages',
    prefix: 'images',
  });

  const filter: Filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
    ...APIfilter,
  };

  const pagination = usePaginationV2({
    currentRoute: '/images/share-groups/owned-groups/$shareGroupId',
    preferenceKey: 'shareGroupDetailsSharedImages',
    searchParams: (prev) => ({
      ...prev,
      imagesQuery: search.imagesQuery,
    }),
  });

  const {
    data: images,
    error,
    isFetching: imagesIsFetching,
  } = useShareGroupsImagesQuery(
    shareGroupId,
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    { ...filter }
  );

  const {
    mutateAsync: deleteShareGroupImage,
    error: imageDeletionError,
    isPending,
  } = useDeleteShareGroupImageMutation();

  const onSearch = (query: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: undefined,
        imagesQuery: query || undefined,
      }),
      to: '/images/share-groups/owned-groups/$shareGroupId',
      params: { shareGroupId },
    });
  };

  const handlePageChange = (event: CustomEvent<{ page: number }>) => {
    pagination.handlePageChange(Number(event.detail));
  };

  const handlePageSizeChange = (event: CustomEvent<{ pageSize: number }>) => {
    const newSize = event.detail.pageSize;
    pagination.handlePageSizeChange(newSize);
  };

  const handleRemoveImage = async () => {
    try {
      if (!selectedImage) {
        return;
      }
      await deleteShareGroupImage({
        imageId: selectedImage.id,
        shareGroupId,
      });
      setIsRemoveDialogOpen(false);
      setSelectedImage(null);
      enqueueSnackbar('Image removed from share group', {
        variant: 'success',
      });
    } catch (error) {
      enqueueSnackbar(error[0]?.reason, {
        variant: 'error',
      });
    }
  };

  const actions = (
    <ActionsPanel
      primaryButtonProps={{
        label: 'Remove Image',
        loading: isPending,
        'data-pendo-id': REMOVE_IMAGE_DIALOG_PENDO_IDS.removeButton,
        onClick: handleRemoveImage,
      }}
      secondaryButtonProps={{
        label: 'Cancel',
        'data-pendo-id': REMOVE_IMAGE_DIALOG_PENDO_IDS.cancelButton,
        onClick: () => setIsRemoveDialogOpen(false),
      }}
    />
  );

  return (
    <Paper sx={{ mb: 4, p: 2 }}>
      <Typography mb={2} variant="h3">
        Shared Images
      </Typography>

      <Stack direction="row" justifyContent="space-between">
        <DebouncedSearchTextField
          clearable
          containerProps={{
            sx: {
              mb: 2,
              width: '300px',
            },
          }}
          debounceTime={250}
          errorText={searchParseError?.message}
          hideLabel
          isSearching={imagesIsFetching}
          label="Search"
          onSearch={onSearch}
          pendoId={SHARE_GROUP_DETAILS_PENDO_IDS.imagesSearchField}
          placeholder="Search images"
          value={search.imagesQuery ?? ''}
        />
        <Button
          data-pendo-id={SHARE_GROUP_DETAILS_PENDO_IDS.addImagesButton}
          onClick={handleAddImagesClick}
          variant="primary"
        >
          Add Images
        </Button>
      </Stack>

      <Table>
        <TableHead>
          <TableRow
            headerbackground={
              theme.tokens.component.Table.HeaderNested.Background
            }
            headerborder
          >
            {IMAGES_COLUMNS.map((column) => (
              <TableHeaderCell
                key={column.name}
                onSort={() =>
                  handleOrderChange(
                    column.name,
                    order === 'asc' ? 'desc' : 'asc'
                  )
                }
                sortable
                sorted={orderBy === column.name ? order : undefined}
              >
                {column.label}
              </TableHeaderCell>
            ))}
            <TableHeaderCell
              style={{ maxWidth: '5%', boxSizing: 'border-box' }}
            />
          </TableRow>
        </TableHead>
        <TableBody>
          {error && search.imagesQuery && (
            <TableRow rowborder>
              <TableCell style={{ padding: 0 }}>
                <ErrorState compact errorText={error[0].reason} />
              </TableCell>
            </TableRow>
          )}
          {!error && images?.data.length === 0 && (
            <TableRow rowborder>
              <TableCell
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  padding: 0,
                }}
              >
                <Box
                  sx={(theme) => ({
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: theme.spacingFunction(4),
                    p: `${theme.spacingFunction(24)} ${theme.spacingFunction(32)}`,
                    width: '100%',
                  })}
                >
                  <ZeroStateSearchNarrowIcon />
                  <Typography variant="h3">No shared images</Typography>
                  <Typography variant="body1">
                    Click 'Add Images' to share your custom images with members
                    of this group.
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
          {images?.data.map((image) => (
            <TableRow
              key={image.id}
              rowborder={!isTableStripingEnabled}
              style={{ padding: 0, boxSizing: 'border-box' }}
              zebra={isTableStripingEnabled}
            >
              <TableCell>{image.label}</TableCell>
              <TableCell>
                {image.created
                  ? formatDate(image.created, {
                      timezone: profile?.timezone,
                    })
                  : '–'}
              </TableCell>
              <TableCell>{image.id}</TableCell>
              <StyledActionMenuWrapper>
                <ActionMenu
                  actionsList={[
                    {
                      title: 'Edit Details',
                      onClick: () => {
                        setSelectedImage(image);
                        setIsEditDrawerOpen(true);
                      },
                      pendoId:
                        SHARE_GROUP_DETAILS_PENDO_IDS.editImagesDetailsButton,
                      disabled: false,
                      hidden: false,
                    },
                    {
                      title: 'Remove from the Group',
                      onClick: () => {
                        setSelectedImage(image);
                        setIsRemoveDialogOpen(true);
                      },
                      pendoId:
                        SHARE_GROUP_DETAILS_PENDO_IDS.removeFromGroupButton,
                      disabled: false,
                      hidden: false,
                    },
                  ]}
                  ariaLabel="Action menu for shared images"
                />
              </StyledActionMenuWrapper>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {images && images?.data.length > DEFAULT_PAGE_SIZES[0] && (
        <Pagination
          count={images?.data.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          page={pagination.page}
          pageSize={pagination.pageSize}
          pageSizes={DEFAULT_PAGE_SIZES}
        />
      )}
      <ConfirmationDialog
        actions={actions}
        closeIconPendoId={REMOVE_IMAGE_DIALOG_PENDO_IDS.xButton}
        error={
          getAPIErrorOrDefault(
            imageDeletionError ?? [],
            'Unable to remove the image from the group'
          )[0]?.reason
        }
        onClose={() => setIsRemoveDialogOpen(false)}
        open={isRemoveDialogOpen}
        title={`Remove ${selectedImage?.label ?? 'this image'} from ${shareGroupLabel ?? 'Share Group'}`}
      >
        Are you sure you want to remove this image from this share group?
      </ConfirmationDialog>
      <EditImageDetailsDrawer
        image={selectedImage}
        onClose={() => setIsEditDrawerOpen(false)}
        open={isEditDrawerOpen}
        shareGroupId={shareGroupId}
      />
    </Paper>
  );
};
