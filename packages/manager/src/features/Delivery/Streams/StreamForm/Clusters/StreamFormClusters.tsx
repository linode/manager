import { useRegionsQuery } from '@linode/queries';
import { useIsGeckoEnabled } from '@linode/shared';
import {
  Autocomplete,
  Box,
  Checkbox,
  CircleProgress,
  ErrorState,
  Notice,
  Paper,
  Typography,
} from '@linode/ui';
import Grid from '@mui/material/Grid';
import { styled, type Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useFlags } from 'launchdarkly-react-client-sdk';
import { enqueueSnackbar } from 'notistack';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { Link } from 'src/components/Link';
import { sortData } from 'src/components/OrderBy';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { MIN_PAGE_SIZE } from 'src/components/PaginationFooter/PaginationFooter.constants';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { Table } from 'src/components/Table';
import {
  getPendoPageId,
  renderOptionsWithPendo,
} from 'src/features/Delivery/deliveryUtils';
import { StreamFormClusterTableContent } from 'src/features/Delivery/Streams/StreamForm/Clusters/StreamFormClustersTableContent';
import { useAllKubernetesClustersQuery } from 'src/queries/kubernetes';

import type {
  AutocompleteBooleanOption,
  FormMode,
} from 'src/features/Delivery/Shared/types';
import type { OrderByKeys } from 'src/features/Delivery/Streams/StreamForm/Clusters/StreamFormClustersTableContent';
import type {
  ExtendedKubernetesCluster,
  StreamAndDestinationFormType,
} from 'src/features/Delivery/Streams/StreamForm/types';

const controlPaths = {
  isAutoAddAllClustersEnabled:
    'stream.details.is_auto_add_all_clusters_enabled',
  clusterIds: 'stream.details.cluster_ids',
} as const;

interface StreamFormClustersProps {
  mode: FormMode;
}

const logGenerationOptions: AutocompleteBooleanOption[] = [
  { label: 'Enabled', value: true },
  { label: 'Disabled', value: false },
];

export const StreamFormClusters = (props: StreamFormClustersProps) => {
  const { mode } = props;
  const { control, setValue, formState, trigger } =
    useFormContext<StreamAndDestinationFormType>();

  const xsDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const { gecko2 } = useFlags();
  const { isGeckoLAEnabled } = useIsGeckoEnabled(gecko2?.enabled, gecko2?.la);
  const { data: regions = [] } = useRegionsQuery();
  const {
    data: clusters = [],
    isLoading,
    error,
  } = useAllKubernetesClustersQuery({ enabled: true });

  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<OrderByKeys>('label');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(MIN_PAGE_SIZE);
  const [searchText, setSearchText] = useState<string>('');
  const [regionFilter, setRegionFilter] = useState<string>('');
  const [logGenerationFilter, setLogGenerationFilter] = useState<boolean>();

  const pendoPageId = getPendoPageId('stream', mode);
  const pendoIdPrefix = `${pendoPageId} Clusters-`;
  const loggingStatusOptionsWithPendo: AutocompleteBooleanOption[] =
    logGenerationOptions.map((option) => ({
      ...option,
      pendoId: `${pendoPageId} Clusters Logging-${option.label}`,
    }));
  const eligibleRegions = useMemo(
    () =>
      regions?.filter(({ capabilities }) =>
        capabilities.includes('ACLP Logs Datacenter LKE-E')
      ),
    [regions]
  );

  const eligibleClusters: ExtendedKubernetesCluster[] = useMemo(() => {
    const regionMap = new Map(
      eligibleRegions.map(({ id, label }) => [id, label])
    );

    return clusters
      .filter(({ region }) => regionMap.has(region))
      .map((cluster) => ({
        ...cluster,
        regionLabel: regionMap.get(cluster.region)
          ? `${regionMap.get(cluster.region)} (${cluster.region})`
          : cluster.region,
      }));
  }, [clusters, eligibleRegions]);

  const visibleRegions = useMemo(() => {
    const clusterRegions = new Set(clusters.map(({ region }) => region));
    return eligibleRegions.filter(({ id }) => clusterRegions.has(id));
  }, [clusters, eligibleRegions]);

  const clusterIdsWithLogsEnabled = useMemo(
    () =>
      eligibleClusters
        ?.filter((cluster) => cluster.control_plane.audit_logs_enabled)
        .map(({ id }) => id),
    [eligibleClusters]
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

  const filteredClusters = useMemo(() => {
    return !searchText && !regionFilter && logGenerationFilter === undefined
      ? eligibleClusters
      : eligibleClusters.filter((cluster) => {
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
            result = cluster.region === regionFilter;
          }

          if (result && logGenerationFilter !== undefined) {
            result =
              cluster.control_plane.audit_logs_enabled === logGenerationFilter;
          }

          return result;
        });
  }, [searchText, regionFilter, logGenerationFilter, eligibleClusters]);

  const sortedAndFilteredClusters = useMemo(
    () => sortData<ExtendedKubernetesCluster>(orderBy, order)(filteredClusters),
    [orderBy, order, filteredClusters]
  );

  // Paginate clusters
  const maxPage = Math.max(
    1,
    Math.ceil(sortedAndFilteredClusters.length / pageSize)
  );
  const safePage = page > maxPage ? maxPage : page;

  if (safePage !== page) {
    setPage(safePage);
  }

  const indexOfFirstClusterInPage = (safePage - 1) * pageSize;
  const indexOfLastClusterInPage = indexOfFirstClusterInPage + pageSize;
  const paginatedClusters = sortedAndFilteredClusters.slice(
    indexOfFirstClusterInPage,
    indexOfLastClusterInPage
  );

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
          <Typography sx={{ mt: 2 }}>
            Select the LKE clusters that will send audit logs to the configured
            destination. Logging must be enabled for a cluster before it can be
            selected. To enable logging for a cluster, use the Linode API to{' '}
            <Link
              external
              hideIcon
              to="https://techdocs.akamai.com/linode-api/reference/put-lke-cluster"
            >
              update the cluster
            </Link>{' '}
            to set <i>audit_logs_enabled</i> to <i>true</i>.
          </Typography>
          <div hidden={true}>
            <Controller
              name={controlPaths.isAutoAddAllClustersEnabled}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  data-pendo-id={`${pendoIdPrefix}Include All`}
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
                  sxFormLabel={{ ml: -1, mt: 2 }}
                  text="Automatically include all existing and recently configured clusters."
                />
              )}
            />
            <Notice sx={{ mt: 2 }} variant="info">
              Disable this option if you wish to manually define which clusters
              are included in the stream. The stream won’t be automatically
              updated when new clusters are configured.
            </Notice>
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
                'data-pendo-id': `${pendoIdPrefix}Search`,
              }}
              label="Search"
              onSearch={(value) => setSearchText(value)}
              placeholder="Search for a cluster"
              value={searchText}
            />
            <StyledSelectsWrapper>
              <RegionSelect
                currentCapability="ACLP Logs Datacenter LKE-E"
                isGeckoLAEnabled={isGeckoLAEnabled}
                label=""
                onChange={(_, region) => {
                  setRegionFilter(region?.id ?? '');
                }}
                placeholder="Select a Region"
                regionFilter="core"
                regions={visibleRegions ?? []}
                sx={{
                  width: '160px !important',
                }}
                value={regionFilter}
              />
              <Autocomplete
                label=""
                onChange={(_, option: AutocompleteBooleanOption | null) =>
                  setLogGenerationFilter(option?.value)
                }
                options={loggingStatusOptionsWithPendo}
                placeholder="Logging Status"
                renderOption={renderOptionsWithPendo}
                sx={{
                  width: '160px !important',
                }}
                textFieldProps={{
                  inputProps: {
                    'data-pendo-id': `${pendoIdPrefix}Logging Status`,
                  },
                }}
              />
            </StyledSelectsWrapper>
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
              page={safePage}
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

const StyledSelectsWrapper = styled('div')({
  display: 'flex',
  gap: '20px',

  '& .MuiAutocomplete-root [data-testid="inputLabelWrapper"] ': {
    width: 0,
  },
});
