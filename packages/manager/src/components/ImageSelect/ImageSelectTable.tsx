import {
  useAllImagesQuery,
  useAllTagsQuery,
  useProfile,
  useRegionsQuery,
} from '@linode/queries';
import { getAPIFilterFromQuery } from '@linode/search';
import {
  Autocomplete,
  Box,
  CircleProgress,
  ErrorState,
  Hidden,
  Notice,
  Stack,
  TooltipIcon,
  useTheme,
} from '@linode/ui';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Pagination } from 'akamai-cds-react-components/Pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from 'akamai-cds-react-components/Table';
import React, { useState } from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { SHARE_GROUP_COLUMN_HEADER_TOOLTIP } from 'src/features/Images/constants';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

import {
  DEFAULT_CLIENT_SIDE_PAGE_SIZE,
  IMAGE_SELECT_TABLE_PREFERENCE_KEY,
  TABLE_CELL_BASE_STYLE,
} from './constants';
import { ImageSelectTableRow } from './ImageSelectTableRow';

import type {
  IMAGE_SELECT_TABLE_LINODE_CREATE_PENDO_IDS,
  IMAGE_SELECT_TABLE_LINODE_REBUILD_PENDO_IDS,
} from './constants';
import type { Filter, Image } from '@linode/api-v4';
import type { LinkProps } from '@tanstack/react-router';

interface Props {
  /**
   * The route this table is rendered on. Used to persist pagination and
   * sort state in the URL.
   */
  currentRoute: LinkProps['to'];
  /**
   * Error message to display above the table, e.g. from form validation.
   */
  errorText?: string;
  /**
   * Callback fired when the user selects an image row.
   */
  onSelect: (image: Image) => void;
  /**
   * An object containing Pendo IDs for elements in this component.
   */
  pendoIDs:
    | typeof IMAGE_SELECT_TABLE_LINODE_CREATE_PENDO_IDS
    | typeof IMAGE_SELECT_TABLE_LINODE_REBUILD_PENDO_IDS;
  queryParamsPrefix?: string;
  /**
   * The ID of the currently selected image.
   */
  selectedImageId?: null | string;
}

type OptionType = { label: string; value: string };

export const ImageSelectTable = (props: Props) => {
  const {
    currentRoute,
    errorText,
    onSelect,
    pendoIDs,
    queryParamsPrefix,
    selectedImageId,
  } = props;

  const theme = useTheme();

  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<null | string>(null);
  const [selectedRegion, setSelectedRegion] = useState<null | string>(null);

  const matchesMdDown = useMediaQuery(theme.breakpoints.down('md'));

  const { data: profile } = useProfile();
  const { data: tags } = useAllTagsQuery();
  const { data: regions } = useRegionsQuery();

  const { filter: searchFilter, error: filterError } = getAPIFilterFromQuery(
    query,
    {
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
    }
  );

  const combinedFilter = buildImageFilter({
    searchFilter,
    selectedRegion,
    selectedTag,
  });

  const {
    data: imagesData,
    error: imagesError,
    isFetching,
    isLoading,
  } = useAllImagesQuery(
    {},
    {
      ...combinedFilter,
    }
  );

  const pagination = usePaginationV2({
    clientSidePaginationData: imagesData,
    currentRoute,
    defaultPageSize: DEFAULT_CLIENT_SIDE_PAGE_SIZE,
    initialPage: 1,
    preferenceKey: IMAGE_SELECT_TABLE_PREFERENCE_KEY,
    queryParamsPrefix,
  });

  const tagOptions =
    tags?.map((tag) => ({ label: tag.label, value: tag.label })) ?? [];

  const regionOptions =
    regions?.map((r) => ({ label: r.label, value: r.id })) ?? [];

  const selectedTagOption =
    tagOptions.find((t) => t.value === selectedTag) ?? null;

  const selectedRegionOption =
    regionOptions.find((r) => r.value === selectedRegion) ?? null;

  const handlePageChange = (event: CustomEvent<{ page: number }>) => {
    pagination.handlePageChange(Number(event.detail));
  };

  const handlePageSizeChange = (event: CustomEvent<{ pageSize: number }>) => {
    const newSize = event.detail.pageSize;
    pagination.handlePageSizeChange(newSize);
  };

  return (
    <Stack pt={1} spacing={2}>
      {errorText && <Notice text={errorText} variant="error" />}
      <Stack
        alignItems={matchesMdDown ? 'stretch' : 'center'}
        direction={matchesMdDown ? 'column' : 'row'}
        flexWrap="wrap"
        gap={2}
      >
        <Box sx={{ flex: 1, minWidth: 200, maxWidth: 350 }}>
          <DebouncedSearchTextField
            clearable
            data-pendo-id={pendoIDs.searchImagesBar}
            debounceTime={250}
            errorText={filterError?.message}
            hideLabel
            isSearching={isFetching}
            label="Search"
            onSearch={(q) => {
              setQuery(q);
              pagination.handlePageChange(1);
            }}
            placeholder="Search images"
            value={query}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 150, maxWidth: 250 }}>
          <Autocomplete
            data-pendo-id={pendoIDs.tagFilterSelect}
            label="Filter by tag"
            noMarginTop
            onChange={(_, value) => {
              setSelectedTag((value as null | OptionType)?.value ?? null);
              pagination.handlePageChange(1);
            }}
            options={tagOptions}
            placeholder="Filter by tag"
            renderOption={(props, option) => (
              <li {...props} data-pendo-id={option.value} key={option.value}>
                {option.label}
              </li>
            )}
            textFieldProps={{
              hideLabel: true,
            }}
            value={selectedTagOption}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 150, maxWidth: 250 }}>
          <Autocomplete
            data-pendo-id={pendoIDs.regionFilterSelect}
            label="Filter by region"
            noMarginTop
            onChange={(_, value) => {
              setSelectedRegion((value as null | OptionType)?.value ?? null);
              pagination.handlePageChange(1);
            }}
            options={regionOptions}
            placeholder="Filter by region"
            renderOption={(props, option) => (
              <li {...props} data-pendo-id={option.value} key={option.value}>
                {option.label}
              </li>
            )}
            textFieldProps={{
              hideLabel: true,
            }}
            value={selectedRegionOption}
          />
        </Box>
      </Stack>
      <Box>
        <Table>
          <TableHead>
            <TableRow
              headerbackground={
                theme.tokens.component.Table.HeaderNested.Background
              }
              headerborder
            >
              <TableHeaderCell
                style={{
                  paddingLeft: '58px',
                  whiteSpace: 'nowrap',
                  ...TABLE_CELL_BASE_STYLE,
                }}
              >
                Image
              </TableHeaderCell>
              <Hidden lgDown>
                <TableHeaderCell>Replicated in</TableHeaderCell>
              </Hidden>
              <Hidden smDown>
                <TableHeaderCell
                  style={{ whiteSpace: 'nowrap', ...TABLE_CELL_BASE_STYLE }}
                >
                  <Stack alignItems="center" direction="row">
                    Share Group
                    <TooltipIcon
                      data-pendo-id={pendoIDs.shareGroupInfoIcon}
                      status="info"
                      sxTooltipIcon={{
                        padding: '4px',
                      }}
                      text={SHARE_GROUP_COLUMN_HEADER_TOOLTIP}
                      tooltipPosition="right"
                    />
                  </Stack>
                </TableHeaderCell>
              </Hidden>
              <Hidden lgDown>
                <TableHeaderCell
                  style={{ whiteSpace: 'nowrap', ...TABLE_CELL_BASE_STYLE }}
                >
                  Size
                </TableHeaderCell>
              </Hidden>
              <TableHeaderCell
                style={{ whiteSpace: 'nowrap', ...TABLE_CELL_BASE_STYLE }}
              >
                Created
              </TableHeaderCell>
              <TableHeaderCell
                style={{ whiteSpace: 'nowrap', ...TABLE_CELL_BASE_STYLE }}
              >
                Image ID
              </TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && <CircleProgress />}
            {imagesError && (
              <ErrorState errorText="There was a problem retrieving your images. Refresh the page or try again later." />
            )}
            {!isLoading && !imagesError && imagesData?.length === 0 && (
              <TableRow>
                <TableCell
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  No items to display.
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              !imagesError &&
              pagination.paginatedData.map((image) => (
                <ImageSelectTableRow
                  image={image}
                  key={image.id}
                  onSelect={() => onSelect(image)}
                  pendoIDs={pendoIDs}
                  regions={regions ?? []}
                  selected={image.id === selectedImageId}
                  timezone={profile?.timezone}
                />
              ))}
          </TableBody>
        </Table>
        <Pagination
          count={imagesData?.length ?? 0}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          page={pagination.page}
          pageSize={pagination.pageSize}
          style={{ border: 0 }}
        />
      </Box>
    </Stack>
  );
};

interface BuildImageFilterParams {
  searchFilter: Filter;
  selectedRegion: null | string;
  selectedTag: null | string;
}

/**
 * Merges the search filter with optional tag and region dropdown filters
 * into a single API filter object.
 */
const buildImageFilter = ({
  searchFilter,
  selectedRegion,
  selectedTag,
}: BuildImageFilterParams) => {
  return {
    ...searchFilter,
    ...(selectedTag ? { tags: { '+contains': selectedTag } } : {}),
    ...(selectedRegion ? { regions: { region: selectedRegion } } : {}),
  };
};
