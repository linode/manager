import { useRegionsQuery } from '@linode/queries';
import { useIsGeckoEnabled } from '@linode/shared';
import {
  Box,
  Checkbox,
  CircleProgress,
  ErrorState,
  Notice,
  Paper,
  Typography,
} from '@linode/ui';
import { capitalize } from '@linode/utilities';
import Grid from '@mui/material/Grid';
import { styled, type Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useFlags } from 'launchdarkly-react-client-sdk';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useMemo, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { Controller, useFormContext } from 'react-hook-form';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { sortData } from 'src/components/OrderBy';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { MIN_PAGE_SIZE } from 'src/components/PaginationFooter/PaginationFooter.constants';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { Table } from 'src/components/Table';
import { StreamFormClusterTableContent } from 'src/features/Delivery/Streams/StreamForm/Clusters/StreamFormClustersTableContent';
import { useAllKubernetesClustersQuery } from 'src/queries/kubernetes';

import type { KubernetesCluster } from '@linode/api-v4';
import type { FormMode } from 'src/features/Delivery/Shared/types';
import type { OrderByKeys } from 'src/features/Delivery/Streams/StreamForm/Clusters/StreamFormClustersTableContent';
import type { StreamAndDestinationFormType } from 'src/features/Delivery/Streams/StreamForm/types';

const controlPaths = {
  isAutoAddAllClustersEnabled:
    'stream.details.is_auto_add_all_clusters_enabled',
  clusterIds: 'stream.details.cluster_ids',
} as const;

interface StreamFormClustersProps {
  mode: FormMode;
}

export const StreamFormClusters = (props: StreamFormClustersProps) => {
  const { mode } = props;
  const { control, setValue, formState, trigger } =
    useFormContext<StreamAndDestinationFormType>();

  const xsDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const { gecko2 } = useFlags();
  const { isGeckoLAEnabled } = useIsGeckoEnabled(gecko2?.enabled, gecko2?.la);
  const { data: regions } = useRegionsQuery();

  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<OrderByKeys>('label');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(MIN_PAGE_SIZE);
  const [searchText, setSearchText] = useState<string>('');
  const [regionFilter, setRegionFilter] = useState<string>('');

  const {
    data: clusters = [],
    isLoading,
    error,
  } = useAllKubernetesClustersQuery({ enabled: true });

  const clusterIdsWithLogsEnabled = useMemo(
    () =>
      clusters
        ?.filter((cluster) => cluster.control_plane.audit_logs_enabled)
        .map(({ id }) => id),
    [clusters]
  );

  const [isAutoAddAllClustersEnabled, clusterIds] = useWatch({
    control,
    name: [controlPaths.isAutoAddAllClustersEnabled, controlPaths.clusterIds],
  });

  const areArraysDifferent = (a: number[], b: number[]) => {
    if (a.length !== b.length) {
      return true;
    }

    const setB = new Set(b);

    return !a.every((element) => setB.has(element));
  };

  // Check for clusters that no longer have log generation enabled and remove them from cluster_ids
  useEffect(() => {
    if (!isLoading) {
      const selectedClusterIds = clusterIds ?? [];
      const filteredClusterIds = selectedClusterIds.filter((id) =>
        clusterIdsWithLogsEnabled.includes(id)
      );

      const nextValue =
        (isAutoAddAllClustersEnabled
          ? clusterIdsWithLogsEnabled
          : filteredClusterIds) || [];

      if (
        !isAutoAddAllClustersEnabled &&
        areArraysDifferent(selectedClusterIds, filteredClusterIds)
      ) {
        enqueueSnackbar(
          'One or more clusters were removed from the selection because Log Generation is no longer enabled on them.',
          { variant: 'info' }
        );
      }
      if (areArraysDifferent(selectedClusterIds, nextValue)) {
        setValue(controlPaths.clusterIds, nextValue);
      }
    }
  }, [
    isLoading,
    clusterIds,
    isAutoAddAllClustersEnabled,
    setValue,
    clusterIdsWithLogsEnabled,
  ]);

  const handleOrderChange = (newOrderBy: OrderByKeys) => {
    if (orderBy === newOrderBy) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(newOrderBy);
      setOrder('asc');
    }
  };

  const filteredClusters =
    !searchText && !regionFilter
      ? clusters
      : clusters.filter((cluster) => {
          const lowerSearch = searchText.toLowerCase();

          let result = true;

          if (searchText) {
            result =
              cluster.label.toLowerCase().includes(lowerSearch) ||
              cluster.region.toLowerCase().includes(lowerSearch) ||
              (cluster.control_plane.audit_logs_enabled
                ? 'enabled'
                : 'disabled'
              ).includes(lowerSearch);
          }

          if (result && regionFilter) {
            return cluster.region === regionFilter;
          }

          return result;
        });

  const sortedAndFilteredClusters = sortData<KubernetesCluster>(
    orderBy,
    order
  )(filteredClusters);

  // Paginate clusters
  const indexOfFirstClusterInPage = (page - 1) * pageSize;
  const indexOfLastClusterInPage = indexOfFirstClusterInPage + pageSize;
  const paginatedClusters = sortedAndFilteredClusters.slice(
    indexOfFirstClusterInPage,
    indexOfLastClusterInPage
  );

  // If the current page is out of range after filtering, change to the last available page
  useEffect(() => {
    if (indexOfFirstClusterInPage >= sortedAndFilteredClusters.length) {
      const lastPage = Math.max(
        1,
        Math.ceil(sortedAndFilteredClusters.length / pageSize)
      );

      setPage(lastPage);
    }
  }, [sortedAndFilteredClusters, indexOfFirstClusterInPage, pageSize]);

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
          <div hidden={true}>
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
                  data-pendo-id={`Logs Delivery Streams ${capitalize(mode)}-Clusters-Include All`}
                  onChange={async (_, checked) => {
                    field.onChange(checked);
                    if (checked) {
                      setValue(
                        controlPaths.clusterIds,
                        clusterIdsWithLogsEnabled
                      );
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
          </div>
          <StyledGrid
            sx={{
              alignItems: 'center',
              display: 'flex',
              flexWrap: xsDown ? 'wrap' : 'nowrap',
              gap: 3,
              justifyContent: 'space-between',
              flex: '1 1 auto',
              mt: 2,
            }}
          >
            <DebouncedSearchTextField
              clearable
              containerProps={{
                sx: {
                  width: '40%',
                },
              }}
              debounceTime={250}
              hideLabel
              inputProps={{
                'data-pendo-id': `Logs Delivery Streams ${capitalize(mode)}-Clusters-Search`,
              }}
              label="Search"
              onSearch={(value) => setSearchText(value)}
              placeholder="Search"
              value={searchText}
            />
            <RegionSelect
              currentCapability="Object Storage"
              isGeckoLAEnabled={isGeckoLAEnabled}
              label="Region"
              onChange={(_, region) => {
                setRegionFilter(region?.id ?? '');
              }}
              regionFilter="core"
              regions={regions ?? []}
              sx={{
                width: '280px !important',
              }}
              value={regionFilter}
            />
          </StyledGrid>
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
                    clusters={paginatedClusters}
                    field={field}
                    idsWithLogsEnabled={clusterIdsWithLogsEnabled}
                    isAutoAddAllClustersEnabled={isAutoAddAllClustersEnabled}
                    onOrderChange={handleOrderChange}
                    order={order}
                    orderBy={orderBy}
                  />
                )}
              />
            </Table>
            <PaginationFooter
              count={sortedAndFilteredClusters.length || 0}
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

const StyledGrid = styled(Grid)(({ theme }) => ({
  '& .MuiAutocomplete-root > .MuiBox-root': {
    display: 'flex',

    '& > .MuiBox-root': {
      margin: '0',

      '& > .MuiInputLabel-root': {
        margin: 0,
        marginRight: theme.spacingFunction(12),
      },
    },
  },
}));
