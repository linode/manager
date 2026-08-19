import {
  Table,
  TableBody,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@akamai/cds-components/react/Table';
import { getAPIErrorOrDefault } from '@akamai/compute-ui-core/api';
import { useVolumesQuery } from '@linode/queries';
import { getAPIFilterFromQuery } from '@linode/search';
import { useNavigate, useSearch } from '@tanstack/react-router';
import React from 'react';

import './index.css';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useIsBlockStorageEncryptionFeatureEnabled } from 'src/components/Encryption/utils';
import { LandingHeader } from 'src/components/LandingHeader';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';
import {
  VOLUME_TABLE_DEFAULT_ORDER,
  VOLUME_TABLE_DEFAULT_ORDER_BY,
} from 'src/routes/volumes/constants';
import { VOLUME_TABLE_PREFERENCE_KEY } from 'src/routes/volumes/constants';

import { useVolumeActionHandlers } from './hooks/useVolumeActionHandlers';
import { CircleProgress } from './Partials/CircleProgress';
import { EmptyState } from './Partials/EmptyState';
import { ErrorState } from './Partials/ErrorState';
import { VolumesSearchField } from './Partials/VolumesSearchField';
import { VolumeTableRow } from './Partials/VolumeTableRow';
import { VolumeDrawers } from './VolumeDrawers/VolumeDrawers';
import { VolumesLandingEmptyState } from './VolumesLandingEmptyState';

import type { Filter } from '@linode/api-v4';

type OrderDirection = 'asc' | 'desc';

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

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error && !search?.query) {
    return (
      <ErrorState
        errorText={
          getAPIErrorOrDefault(error, 'Error loading your volumes.')[0].reason
        }
        heightPx="300px"
      />
    );
  }

  if (volumes?.results === 0 && !search?.query) {
    return <VolumesLandingEmptyState />;
  }

  return (
    <div className="stack">
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
        spacingBottom={0}
        title="Volumes"
      />

      <VolumesSearchField
        errorText={searchError?.message}
        isLoading={isFetching}
        onSearch={onSearch}
        value={search?.query ?? ''}
      />

      <div style={{ overflowX: 'auto', width: '100%', margin: 0 }}>
        <Table
          style={
            {
              border: '1px solid var(--token-alias-border-normal)',
              marginTop: '10px',
              minWidth: '800px',
              '--token-component-table-header-outlined-border':
                'var(--token-component-table-row-border)',
            } as React.CSSProperties
          }
        >
          <TableHead>
            <TableRow
              headerbackground="var(--token-component-table-header-nested-background)"
              headerborder
            >
              <TableHeaderCell
                onSort={({ detail }) =>
                  handleOrderChange('label', detail as OrderDirection)
                }
                sortable
                sorted={orderBy === 'label' ? order : undefined}
                style={{ flex: '0 1 25%' }}
              >
                Label
              </TableHeaderCell>

              <TableHeaderCell
                onSort={({ detail }) =>
                  handleOrderChange('status', detail as OrderDirection)
                }
                sortable
                sorted={orderBy === 'status' ? order : undefined}
                style={{ flex: '0 1 12%' }}
              >
                Status
              </TableHeaderCell>

              <TableHeaderCell>Region</TableHeaderCell>

              <TableHeaderCell
                onSort={({ detail }) =>
                  handleOrderChange('size', detail as OrderDirection)
                }
                sortable
                sorted={orderBy === 'size' ? order : undefined}
                style={{ flex: '0 1 12%' }}
              >
                Size
              </TableHeaderCell>

              <TableHeaderCell style={{ flex: '0 1 15%' }}>
                Attached To
              </TableHeaderCell>

              {isBlockStorageEncryptionFeatureEnabled && (
                <TableHeaderCell style={{ flex: '0 1 15%' }}>
                  Encryption
                </TableHeaderCell>
              )}

              <TableHeaderCell style={{ maxWidth: 40 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {search?.query && error && (
              <ErrorState errorText={error[0].reason} isTransparent={false} />
            )}
            {volumes?.data.length === 0 && (
              <EmptyState message="No volume found" />
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
      </div>

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
    </div>
  );
};
