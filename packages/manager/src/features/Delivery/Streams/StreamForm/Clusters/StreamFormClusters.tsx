import { getAPIFilterFromQuery } from '@linode/search';
import {
  Box,
  Checkbox,
  CircleProgress,
  ErrorState,
  Notice,
  Paper,
  Typography,
} from '@linode/ui';
import React, { useEffect, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { Controller, useFormContext } from 'react-hook-form';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { MIN_PAGE_SIZE } from 'src/components/PaginationFooter/PaginationFooter.constants';
import { Table } from 'src/components/Table';
import { StreamFormClusterTableContent } from 'src/features/Delivery/Streams/StreamForm/Clusters/StreamFormClustersTable';
import { useKubernetesClustersQuery } from 'src/queries/kubernetes';

import type { OrderByKeys } from 'src/features/Delivery/Streams/StreamForm/Clusters/StreamFormClustersTable';
import type { StreamAndDestinationFormType } from 'src/features/Delivery/Streams/StreamForm/types';

const controlPaths = {
  isAutoAddAllClustersEnabled:
    'stream.details.is_auto_add_all_clusters_enabled',
  clusterIds: 'stream.details.cluster_ids',
} as const;

export const StreamFormClusters = () => {
  const { control, setValue, formState, trigger } =
    useFormContext<StreamAndDestinationFormType>();

  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<OrderByKeys>('label');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(MIN_PAGE_SIZE);
  const [searchText, setSearchText] = useState<string>('');

  const { error: searchParseError, filter: searchFilter } =
    getAPIFilterFromQuery(searchText, {
      searchableFieldsWithoutOperator: ['label', 'region'],
    });

  const filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
    ...searchFilter,
  };

  const {
    data: clusters,
    isLoading,
    error,
  } = useKubernetesClustersQuery({
    filter,
    params: {
      page,
      page_size: pageSize,
    },
  });

  const idsWithLogsEnabled = clusters?.data
    .filter((cluster) => cluster.control_plane.audit_logs_enabled)
    .map(({ id }) => id);

  const [isAutoAddAllClustersEnabled, clusterIds] = useWatch({
    control,
    name: [controlPaths.isAutoAddAllClustersEnabled, controlPaths.clusterIds],
  });

  useEffect(() => {
    setValue(
      controlPaths.clusterIds,
      isAutoAddAllClustersEnabled ? idsWithLogsEnabled : clusterIds || []
    );
  }, [isLoading]);

  const handleOrderChange = (newOrderBy: OrderByKeys) => {
    if (orderBy === newOrderBy) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(newOrderBy);
      setOrder('asc');
    }
  };

  return (
    <Paper>
      <Typography variant="h2">Clusters</Typography>
      {isLoading ? (
        <CircleProgress
          size="md"
          style={{ display: 'block', margin: 'auto' }}
        />
      ) : error ? (
        <ErrorState errorText="There was an error loading your Kubernetes clusters." />
      ) : (
        <>
          <Notice sx={{ mt: 2 }} variant="info">
            Disabling this option allows you to manually define which clusters
            will be included in the stream. Stream will not be updated
            automatically with newly configured clusters.
          </Notice>
          <Controller
            name={controlPaths.isAutoAddAllClustersEnabled}
            render={({ field }) => (
              <Checkbox
                checked={field.value}
                onChange={async (_, checked) => {
                  field.onChange(checked);
                  if (checked) {
                    setValue(controlPaths.clusterIds, idsWithLogsEnabled);
                  } else {
                    setValue(controlPaths.clusterIds, []);
                  }
                  await trigger('stream.details');
                }}
                sxFormLabel={{ ml: -1 }}
                text="Automatically include all existing and recently configured clusters."
              />
            )}
          />
          <DebouncedSearchTextField
            clearable
            containerProps={{
              sx: {
                width: '40%',
                mt: 2,
              },
            }}
            debounceTime={250}
            errorText={searchParseError?.message}
            hideLabel
            label="Search"
            onSearch={(value) => setSearchText(value)}
            placeholder="Search"
            value={searchText}
          />
          <Box sx={{ mt: 2 }}>
            {!isAutoAddAllClustersEnabled &&
              formState.errors.stream?.details?.cluster_ids?.message && (
                <Notice
                  text={formState.errors.stream?.details?.cluster_ids?.message}
                  variant="error"
                />
              )}
            <Table data-testid="clusters-table">
              <Controller
                control={control}
                name={controlPaths.clusterIds}
                render={({ field }) => (
                  <StreamFormClusterTableContent
                    clusters={clusters}
                    field={field}
                    idsWithLogsEnabled={idsWithLogsEnabled}
                    isAutoAddAllClustersEnabled={isAutoAddAllClustersEnabled}
                    onOrderChange={handleOrderChange}
                    order={order}
                    orderBy={orderBy}
                  />
                )}
              />
            </Table>
            <PaginationFooter
              count={clusters?.results || 0}
              eventCategory="Clusters Table"
              handlePageChange={setPage}
              handleSizeChange={setPageSize}
              page={page}
              pageSize={pageSize}
            />
          </Box>
        </>
      )}
    </Paper>
  );
};
