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
import { formatDate } from '@akamai/compute-ui-core/datetime';
import { useProfile, useShareGroupsImagesQuery } from '@linode/queries';
import { getAPIFilterFromQuery } from '@linode/search';
import {
  Box,
  ErrorState,
  Paper,
  Stack,
  Typography,
  useTheme,
  ZeroStateSearchNarrowIcon,
} from '@linode/ui';
import { useNavigate, useSearch } from '@tanstack/react-router';
import * as React from 'react';

import { ActionMenu } from 'src/components/ActionMenu/ActionMenu';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField/DebouncedSearchTextField';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

import {
  DEFAULT_PAGE_SIZES,
  SHARE_GROUP_DETAILS_PENDO_IDS,
} from '../../constants';
import { StyledActionMenuWrapper } from '../ShareGroupTable.styles';

import type { Filter } from '@linode/api-v4';

interface Props {
  isTableStripingEnabled: boolean;
  shareGroupId: string;
}

const IMAGES_COLUMNS = [
  { label: 'Original Image Label', name: 'label' },
  { label: 'Created', name: 'created' },
  { label: 'Shared Image ID', name: 'id' },
];

export const SharedImagesTable = (props: Props) => {
  const { isTableStripingEnabled, shareGroupId } = props;
  const theme = useTheme();
  const { data: profile } = useProfile();
  const navigate = useNavigate();

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
              style={{ maxWidth: '40px', boxSizing: 'border-box' }}
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
              <StyledActionMenuWrapper
                style={{ maxWidth: '40px', boxSizing: 'border-box' }}
              >
                <ActionMenu
                  actionsList={[
                    {
                      title: 'Edit Details',
                      onClick: () => {},
                      pendoId:
                        SHARE_GROUP_DETAILS_PENDO_IDS.editImagesDetailsButton,
                      disabled: false,
                      hidden: false,
                    },
                    {
                      title: 'Remove from the Group',
                      onClick: () => {},
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
    </Paper>
  );
};
