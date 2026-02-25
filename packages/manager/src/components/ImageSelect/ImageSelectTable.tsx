import {
  useAllTagsQuery,
  useImagesQuery,
  useProfile,
  useRegionsQuery,
} from '@linode/queries';
import { getAPIFilterFromQuery } from '@linode/search';
import {
  Autocomplete,
  Box,
  IconButton,
  Notice,
  Stack,
  TooltipIcon,
} from '@linode/ui';
import React, { useState } from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { SHARE_GROUP_COLUMN_HEADER_TOOLTIP } from 'src/features/Images/constants';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

import { ImageSelectTableRow } from './ImageSelectTableRow';

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
   * The ID of the currently selected image.
   */
  selectedImageId?: null | string;
}

type OptionType = { label: string; value: string };

const COLUMNS = 6;
const PREFERENCE_KEY = 'image-select-table';

export const ImageSelectTable = (props: Props) => {
  const { currentRoute, errorText, onSelect, selectedImageId } = props;

  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<null | string>(null);
  const [selectedRegion, setSelectedRegion] = useState<null | string>(null);

  const { data: profile } = useProfile();
  const { data: tags } = useAllTagsQuery();
  const { data: regions } = useRegionsQuery();

  const pagination = usePaginationV2({
    currentRoute,
    initialPage: 1,
    preferenceKey: PREFERENCE_KEY,
  });

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
    data,
    error: imagesError,
    isFetching,
    isLoading,
  } = useImagesQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    {
      ...combinedFilter,
      is_public: false,
      type: 'manual',
    }
  );

  const tagOptions =
    tags?.map((tag) => ({ label: tag.label, value: tag.label })) ?? [];

  const regionOptions =
    regions?.map((r) => ({ label: r.label, value: r.id })) ?? [];

  const selectedTagOption =
    tagOptions.find((t) => t.value === selectedTag) ?? null;

  const selectedRegionOption =
    regionOptions.find((r) => r.value === selectedRegion) ?? null;

  return (
    <Stack pt={1} spacing={2}>
      {errorText && <Notice text={errorText} variant="error" />}
      <Stack alignItems="center" direction="row" flexWrap="wrap" gap={2}>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <DebouncedSearchTextField
            clearable
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
        <Box sx={{ flex: 1, minWidth: 150 }}>
          <Autocomplete
            label=""
            noMarginTop
            onChange={(_, value) => {
              setSelectedTag((value as null | OptionType)?.value ?? null);
              pagination.handlePageChange(1);
            }}
            options={tagOptions}
            placeholder="Filter by tag"
            sx={{ paddingBottom: '9px' }} // to align with search field
            value={selectedTagOption}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 150 }}>
          <Autocomplete
            label=""
            noMarginTop
            onChange={(_, value) => {
              setSelectedRegion((value as null | OptionType)?.value ?? null);
              pagination.handlePageChange(1);
            }}
            options={regionOptions}
            placeholder="Filter by region"
            sx={{ paddingBottom: '9px' }} // to align with search field
            value={selectedRegionOption}
          />
        </Box>
      </Stack>
      <Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ paddingLeft: '58px' }}>Image</TableCell>
              <TableCell>Replicated in</TableCell>
              <TableCell>
                <Stack alignItems="center" direction="row">
                  Share Group
                  {
                    <IconButton aria-label="Share group" size="small">
                      <TooltipIcon
                        status="info"
                        sxTooltipIcon={{
                          padding: '4px',
                        }}
                        text={SHARE_GROUP_COLUMN_HEADER_TOOLTIP}
                        tooltipPosition="right"
                      />
                    </IconButton>
                  }
                </Stack>
              </TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Image ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRowLoading columns={COLUMNS} rows={pagination.pageSize} />
            )}
            {imagesError && (
              <TableRowError
                colSpan={COLUMNS}
                message={imagesError[0].reason}
              />
            )}
            {!isLoading && !imagesError && data?.results === 0 && (
              <TableRowEmpty colSpan={COLUMNS} />
            )}
            {!isLoading &&
              !imagesError &&
              data?.data.map((image) => (
                <ImageSelectTableRow
                  image={image}
                  key={image.id}
                  onSelect={() => onSelect(image)}
                  selected={image.id === selectedImageId}
                  timezone={profile?.timezone}
                />
              ))}
          </TableBody>
        </Table>
        <PaginationFooter
          count={data?.results ?? 0}
          handlePageChange={pagination.handlePageChange}
          handleSizeChange={pagination.handlePageSizeChange}
          page={pagination.page}
          pageSize={pagination.pageSize}
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
