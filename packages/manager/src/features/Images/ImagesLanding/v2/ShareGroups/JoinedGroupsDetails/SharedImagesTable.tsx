import { Pagination } from '@akamai/cds-components/react/Pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@akamai/cds-components/react/Table';
import { useShareGroupImagesFromTokenQuery } from '@linode/queries';
import { getAPIFilterFromQuery } from '@linode/search';
import {
  Box,
  ErrorState,
  Hidden,
  Paper,
  Typography,
  useTheme,
  ZeroStateSearchNarrowIcon,
} from '@linode/ui';
import { useNavigate, useSearch } from '@tanstack/react-router';
import * as React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField/DebouncedSearchTextField';
import {
  JOINED_GROUP_DETAILS_PATH,
  JOINED_GROUP_DETAILS_PENDO_IDS,
} from 'src/features/Images/ImagesLanding/v2/constants';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

import { RebuildImageDrawer } from '../../../RebuildImageDrawer';
import { DEFAULT_PAGE_SIZES } from '../../constants';
import { ViewImageDrawer } from '../../ImageLibrary/ViewImageDrawer';
import { TABLE_CELL_BASE_STYLES } from '../ShareGroupTable.styles';
import { SharedImageRow } from './SharedImageRow';

import type { Handlers } from '../../../ImagesActionMenu';
import type { Filter, Image } from '@linode/api-v4';

interface Props {
  isTableStripingEnabled: boolean;
  tokenUuid: string;
}

const IMAGES_COLUMNS = [
  {
    label: 'Image',
    name: 'label',
    sortableProps: { label: 'label' },
    style: { ...TABLE_CELL_BASE_STYLES, maxWidth: '25%' },
  },
  {
    label: 'Replicated in',
    name: 'regions',
    style: { ...TABLE_CELL_BASE_STYLES, whiteSpace: 'nowrap', maxWidth: '25%' },
    hidden: 'smDown',
  },
  {
    label: 'Size',
    name: 'size',
    style: { ...TABLE_CELL_BASE_STYLES, maxWidth: '10%' },
  },
  {
    label: 'Created',
    name: 'created',
    style: { ...TABLE_CELL_BASE_STYLES, maxWidth: '15%' },
    hidden: 'mdDown',
  },
  {
    label: 'Image ID',
    name: 'id',
    style: { ...TABLE_CELL_BASE_STYLES, whiteSpace: 'nowrap', maxWidth: '15%' },
    hidden: 'mdDown',
  },
  {
    label: '',
    name: '',
    style: { ...TABLE_CELL_BASE_STYLES, maxWidth: '10%' },
  }, // For the action menu column
];

export const SharedImagesTable = (props: Props) => {
  const { isTableStripingEnabled, tokenUuid } = props;

  const theme = useTheme();
  const navigate = useNavigate();

  const search = useSearch({
    from: JOINED_GROUP_DETAILS_PATH,
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
      from: JOINED_GROUP_DETAILS_PATH,
    },
    preferenceKey: 'joinedGroupDetailsSharedImages',
    prefix: 'images',
  });

  const filter: Filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
    ...APIfilter,
  };

  const pagination = usePaginationV2({
    currentRoute: JOINED_GROUP_DETAILS_PATH,
    preferenceKey: 'joinedGroupDetailsSharedImages',
    searchParams: (prev) => ({
      ...prev,
      imagesQuery: search.imagesQuery,
    }),
  });

  const {
    data: images,
    error,
    isFetching: imagesIsFetching,
  } = useShareGroupImagesFromTokenQuery(
    tokenUuid,
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    { ...filter },
    !!tokenUuid
  );

  const onSearch = (query: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: undefined,
        imagesQuery: query || undefined,
      }),
      to: JOINED_GROUP_DETAILS_PATH,
      params: { tokenUuid },
    });
  };

  const handlePageChange = (event: CustomEvent<{ page: number }>) => {
    pagination.handlePageChange(Number(event.detail));
  };

  const handlePageSizeChange = (event: CustomEvent<{ pageSize: number }>) => {
    const newSize = event.detail.pageSize;
    pagination.handlePageSizeChange(newSize);
  };

  const [viewDrawerOpen, setViewDrawerOpen] = React.useState(false);
  const [rebuildDrawerOpen, setRebuildDrawerOpen] = React.useState(false);
  const [imageForAction, setImageForAction] = React.useState<Image | undefined>(
    undefined
  );

  const handleViewImage = (image: Image) => {
    setImageForAction(image);
    setViewDrawerOpen(true);
  };

  const handleDeployNewLinode = (imageId: string) => {
    navigate({
      to: '/linodes/create/images',
      search: {
        imageID: imageId,
      },
    });
  };

  const handleRebuild = (image: Image) => {
    setImageForAction(image);
    setRebuildDrawerOpen(true);
  };

  const handlers: Handlers = {
    onView: handleViewImage,
    onDeploy: handleDeployNewLinode,
    onRebuild: handleRebuild,
  };

  return (
    <Paper sx={{ mb: 4, p: 2 }}>
      <Typography mb={2} variant="h3">
        Shared Images
      </Typography>
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
        pendoId={JOINED_GROUP_DETAILS_PENDO_IDS.searchImagesBar}
        placeholder="Search images"
        value={search.imagesQuery ?? ''}
      />

      <Table data-testid="shared-images-table">
        <TableHead>
          <TableRow
            headerbackground={
              theme.tokens.component.Table.HeaderNested.Background
            }
            headerborder
          >
            {IMAGES_COLUMNS.map((col, idx) => {
              const cell = col.sortableProps ? (
                <TableHeaderCell
                  key={idx}
                  onSort={() =>
                    handleOrderChange(
                      col.sortableProps?.label ?? col.label,
                      order === 'asc' ? 'desc' : 'asc'
                    )
                  }
                  sortable
                  sorted={
                    orderBy === col.sortableProps?.label ? order : undefined
                  }
                  style={{ ...col.style }}
                >
                  {col.label}
                </TableHeaderCell>
              ) : (
                <TableHeaderCell key={idx} style={{ ...col.style }}>
                  {col.label}
                </TableHeaderCell>
              );

              return col.hidden ? (
                <Hidden key={idx} {...{ [col.hidden]: true }}>
                  {cell}
                </Hidden>
              ) : (
                cell
              );
            })}
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
                </Box>
              </TableCell>
            </TableRow>
          )}
          {images?.data.map((image) => (
            <SharedImageRow
              handlers={handlers}
              image={image}
              isTableStripingEnabled={isTableStripingEnabled}
              key={image.id}
              pendoIDs={JOINED_GROUP_DETAILS_PENDO_IDS}
            />
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
      {viewDrawerOpen && imageForAction && (
        <ViewImageDrawer
          image={imageForAction}
          isSharedImage
          onClose={() => setViewDrawerOpen(false)}
          open={viewDrawerOpen}
          pendoIDs={JOINED_GROUP_DETAILS_PENDO_IDS.viewDetails}
        />
      )}
      {rebuildDrawerOpen && imageForAction && (
        <RebuildImageDrawer
          image={imageForAction}
          imageError={error}
          isFetching={imagesIsFetching}
          onClose={() => setRebuildDrawerOpen(false)}
          open={rebuildDrawerOpen}
        />
      )}
    </Paper>
  );
};
