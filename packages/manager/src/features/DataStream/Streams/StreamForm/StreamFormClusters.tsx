import { Box, Checkbox, Notice, Paper, Typography } from '@linode/ui';
import { isNotNullOrUndefined, usePrevious } from '@linode/utilities';
import React, { useEffect, useState } from 'react';
import type { ControllerRenderProps } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import { Controller, useFormContext } from 'react-hook-form';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableSortCell } from 'src/components/TableSortCell';
import { clusters } from 'src/features/DataStream/Streams/StreamForm/StreamFormClustersData';

import type { StreamAndDestinationFormType } from 'src/features/DataStream/Streams/StreamForm/types';

// TODO: remove type after fetching the clusters will be done
export type Cluster = {
  id: number;
  label: string;
  logGeneration: boolean;
  region: string;
};

type OrderByKeys = 'label' | 'logGeneration' | 'region';

export const StreamFormClusters = () => {
  const { control, setValue, formState } =
    useFormContext<StreamAndDestinationFormType>();

  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<OrderByKeys>('label');
  const [searchText, setSearchText] = useState<string>('');

  const idsWithLogGenerationEnabled = clusters
    .filter(({ logGeneration }) => logGeneration)
    .map(({ id }) => id);

  const [isAutoAddAllClustersEnabled, clusterIds] = useWatch({
    control,
    name: [
      'stream.details.is_auto_add_all_clusters_enabled',
      'stream.details.cluster_ids',
    ],
  });
  const previousIsAutoAddAllClustersEnabled = usePrevious(
    isAutoAddAllClustersEnabled
  );

  useEffect(() => {
    setValue(
      'stream.details.cluster_ids',
      isAutoAddAllClustersEnabled
        ? idsWithLogGenerationEnabled
        : clusterIds || []
    );
  }, []);

  useEffect(() => {
    if (
      isNotNullOrUndefined(previousIsAutoAddAllClustersEnabled) &&
      isAutoAddAllClustersEnabled !== previousIsAutoAddAllClustersEnabled
    ) {
      setValue(
        'stream.details.cluster_ids',
        isAutoAddAllClustersEnabled ? idsWithLogGenerationEnabled : []
      );
    }
  }, [
    isAutoAddAllClustersEnabled,
    idsWithLogGenerationEnabled,
    previousIsAutoAddAllClustersEnabled,
    setValue,
  ]);

  const handleOrderChange = (newOrderBy: OrderByKeys) => {
    if (orderBy === newOrderBy) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(newOrderBy);
      setOrder('asc');
    }
  };

  const getTableContent = (
    field: ControllerRenderProps<
      StreamAndDestinationFormType,
      'stream.details.cluster_ids'
    >
  ) => {
    const selectedIds = field.value || [];

    const isAllSelected =
      selectedIds.length === idsWithLogGenerationEnabled.length;
    const isIndeterminate = selectedIds.length > 0 && !isAllSelected;

    const toggleAllClusters = () =>
      field.onChange(isAllSelected ? [] : idsWithLogGenerationEnabled);

    const toggleCluster = (toggledId: number) => {
      const updatedClusterIds = selectedIds.includes(toggledId)
        ? selectedIds.filter((selectedId) => selectedId !== toggledId)
        : [...selectedIds, toggledId];

      field.onChange(updatedClusterIds);
    };

    const filteredAndSortedClusters = clusters
      .filter(({ label, region, logGeneration }) => {
        const search = searchText.toLowerCase();
        const logStatus = logGeneration ? 'enabled' : 'disabled';

        return (
          label.toLowerCase().includes(search) ||
          region.toLowerCase().includes(search) ||
          logStatus.includes(search)
        );
      })
      .sort((a, b) => {
        const asc = order === 'asc';

        if (orderBy === 'label' || orderBy === 'region') {
          const aValue = a[orderBy].toLowerCase();
          const bValue = b[orderBy].toLowerCase();
          if (aValue === bValue) return 0;
          return asc ? (aValue < bValue ? -1 : 1) : aValue > bValue ? -1 : 1;
        }

        if (orderBy === 'logGeneration') {
          const aLogGenerationNumber = Number(a.logGeneration);
          const bLogGenerationNumber = Number(b.logGeneration);
          return asc
            ? bLogGenerationNumber - aLogGenerationNumber
            : aLogGenerationNumber - bLogGenerationNumber;
        }

        return 0;
      });

    return (
      <>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '5%' }}>
              {!!filteredAndSortedClusters.length && (
                <Checkbox
                  aria-label="Toggle all clusters"
                  checked={isAllSelected}
                  disabled={isAutoAddAllClustersEnabled}
                  indeterminate={isIndeterminate}
                  onChange={toggleAllClusters}
                  sx={{ m: 0 }}
                />
              )}
            </TableCell>
            <TableSortCell
              active={orderBy === 'label'}
              direction={order}
              handleClick={() => handleOrderChange('label')}
              label="label"
              sx={{ width: '35%' }}
            >
              Cluster Name
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'region'}
              direction={order}
              handleClick={() => handleOrderChange('region')}
              label="region"
              sx={{ width: '35%' }}
            >
              Region
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'logGeneration'}
              direction={order}
              handleClick={() => handleOrderChange('logGeneration')}
              label="logGeneration"
              sx={{ width: '25%' }}
            >
              Log Generation
            </TableSortCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredAndSortedClusters.length ? (
            filteredAndSortedClusters.map(
              ({ label, region, id, logGeneration }) => (
                <TableRow key={id}>
                  <TableCell>
                    <Checkbox
                      aria-label={`Toggle ${label} cluster`}
                      checked={selectedIds.includes(id)}
                      disabled={isAutoAddAllClustersEnabled || !logGeneration}
                      onBlur={field.onBlur}
                      onChange={() => toggleCluster(id)}
                    />
                  </TableCell>
                  <TableCell>{label}</TableCell>
                  <TableCell>{region}</TableCell>
                  <TableCell>
                    <Box alignItems="center" display="flex">
                      <StatusIcon status={logGeneration ? 'active' : 'error'} />
                      {logGeneration ? 'Enabled' : 'Disabled'}
                    </Box>
                  </TableCell>
                </TableRow>
              )
            )
          ) : (
            <TableRowEmpty colSpan={4} message="No items to display." />
          )}
        </TableBody>
      </>
    );
  };

  return (
    <Paper>
      <Typography variant="h2">Clusters</Typography>
      <Notice sx={{ mt: 2 }} variant="info">
        Disabling this option allows you to manually define which clusters will
        be included in the stream. Stream will not be updated automatically with
        newly configured clusters.
      </Notice>
      <Controller
        name={'stream.details.is_auto_add_all_clusters_enabled'}
        render={({ field }) => (
          <Checkbox
            checked={field.value}
            onBlur={field.onBlur}
            onChange={(_, checked) => field.onChange(checked)}
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
        hideLabel
        label="Search"
        onSearch={(value) => setSearchText(value)}
        placeholder="Search"
        value={searchText}
      />
      <Box sx={{ mt: 2 }}>
        <Table data-testid="clusters-table">
          <Controller
            control={control}
            name="stream.details.cluster_ids"
            render={({ field }) => getTableContent(field)}
          />
        </Table>
        {!isAutoAddAllClustersEnabled &&
          formState.errors.stream?.details?.cluster_ids?.message && (
            <Notice
              text={formState.errors.stream?.details?.cluster_ids?.message}
              variant="error"
            />
          )}
      </Box>
    </Paper>
  );
};
