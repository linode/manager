import { useVolumesQuery } from '@linode/queries';
import { getAPIFilterFromQuery } from '@linode/search';
import { CircleProgress, ErrorState, Stack } from '@linode/ui';
import { useNavigate, useSearch } from '@tanstack/react-router';
import React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useIsBlockStorageEncryptionFeatureEnabled } from 'src/components/Encryption/utils';
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
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';
import {
  VOLUME_TABLE_DEFAULT_ORDER,
  VOLUME_TABLE_DEFAULT_ORDER_BY,
} from 'src/routes/volumes/constants';
import { VOLUME_TABLE_PREFERENCE_KEY } from 'src/routes/volumes/constants';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { useVolumeActionHandlers } from './hooks/useVolumeActionHandlers';
import { VolumeTableRow } from './Partials/VolumeTableRow';
import { VolumeDrawers } from './VolumeDrawers/VolumeDrawers';
import { VolumesLandingEmptyState } from './VolumesLandingEmptyState';

import type { Filter } from '@linode/api-v4';

export const VolumesLanding = () => {
  const navigate = useNavigate();

  const search = useSearch({
    from: '/volumes/',
    shouldThrow: false,
  });
  const { data: permissions } = usePermissions('account', ['create_volume']);

  const pagination = usePaginationV2({
    currentRoute: '/volumes',
    preferenceKey: VOLUME_TABLE_PREFERENCE_KEY,
    searchParams: (prev) => ({
      ...prev,
      query: search?.query,
    }),
  });

  const canCreateVolume = permissions?.create_volume;

  const { handleOrderChange, order, orderBy } = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: VOLUME_TABLE_DEFAULT_ORDER,
        orderBy: VOLUME_TABLE_DEFAULT_ORDER_BY,
      },
      from: '/volumes',
    },
    preferenceKey: VOLUME_TABLE_PREFERENCE_KEY,
  });

  const { getActionHandlers } = useVolumeActionHandlers('/volumes/$volumeId');

  const { filter: searchFilter, error: searchError } = getAPIFilterFromQuery(
    search?.query,
    {
      searchableFieldsWithoutOperator: ['label', 'tags'],
    }
  );

  const filter: Filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
    ...searchFilter,
  };

  const {
    data: volumes,
    error,
    isFetching,
    isLoading,
  } = useVolumesQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  const { isBlockStorageEncryptionFeatureEnabled } =
    useIsBlockStorageEncryptionFeatureEnabled();

  const onSearch = (query: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: undefined,
        query: query ? query : undefined,
      }),
      to: '/volumes',
    });
  };

  const navigateToVolumes = () => {
    navigate({
      search: (prev) => prev,
      to: '/volumes',
    });
  };

  const numberOfColumns = isBlockStorageEncryptionFeatureEnabled ? 7 : 6;

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error && !search?.query) {
    return (
      <ErrorState
        errorText={
          getAPIErrorOrDefault(error, 'Error loading your volumes.')[0].reason
        }
      />
    );
  }

  if (volumes?.results === 0 && !search?.query) {
    return <VolumesLandingEmptyState />;
  }

  return (
    <Stack spacing={2}>
      <DocumentTitleSegment segment="Volumes" />
      <LandingHeader
        breadcrumbProps={{
          pathname: 'Volumes',
          removeCrumbX: 1,
        }}
        buttonDataAttrs={{
          tooltipText: getRestrictedResourceText({
            action: 'create',
            isSingular: false,
            resourceType: 'Volumes',
          }),
        }}
        disabledCreateButton={!canCreateVolume}
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/block-storage"
        entity="Volume"
        onButtonClick={() => navigate({ to: '/volumes/create' })}
        title="Volumes"
      />
      <DebouncedSearchTextField
        clearable
        errorText={searchError?.message}
        hideLabel
        isSearching={isFetching}
        label="Search"
        onSearch={onSearch}
        placeholder="Search Volumes"
        value={search?.query ?? ''}
      />
      <Table>
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'label'}
              direction={order}
              handleClick={handleOrderChange}
              label="label"
            >
              Label
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'status'}
              direction={order}
              handleClick={handleOrderChange}
              label="status"
            >
              Status
            </TableSortCell>
            <TableCell>Region</TableCell>
            <TableSortCell
              active={orderBy === 'size'}
              direction={order}
              handleClick={handleOrderChange}
              label="size"
            >
              Size
            </TableSortCell>
            <TableCell>Attached To</TableCell>
            {isBlockStorageEncryptionFeatureEnabled && (
              <TableCell>Encryption</TableCell>
            )}
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {search?.query && error && (
            <TableRowError
              colSpan={numberOfColumns}
              message={error[0].reason}
            />
          )}
          {volumes?.data.length === 0 && (
            <TableRowEmpty
              colSpan={numberOfColumns}
              message="No volume found"
            />
          )}
          {volumes?.data.map((volume) => (
            <VolumeTableRow
              handlers={getActionHandlers(volume.id)}
              isBlockStorageEncryptionFeatureEnabled={
                isBlockStorageEncryptionFeatureEnabled
              }
              key={volume.id}
              volume={volume}
            />
          ))}
        </TableBody>
      </Table>
      <PaginationFooter
        count={volumes?.results ?? 0}
        eventCategory="Volumes Table"
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />

      <VolumeDrawers
        onCloseHandler={navigateToVolumes}
        onDeleteSuccessHandler={navigateToVolumes}
      />
    </Stack>
  );
};
