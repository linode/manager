import { useLinodesQuery } from '@linode/queries';
import { getAPIFilterFromQuery } from '@linode/search';
import { Box, Notice, Stack, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useQueryClient } from '@tanstack/react-query';
import { useSearch } from '@tanstack/react-router';
import React, { useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';

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
import { TableSortCell } from 'src/components/TableSortCell';
import { useGetAllUserEntitiesByPermission } from 'src/features/IAM/hooks/useGetAllUserEntitiesByPermission';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import {
  linodesCreateTypesMap,
  useGetLinodeCreateType,
} from 'src/features/Linodes/LinodeCreate/Tabs/utils/useGetLinodeCreateType';
import { PowerActionsDialog } from 'src/features/Linodes/PowerActionsDialogOrDrawer';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';
import { sendLinodePowerOffEvent } from 'src/utilities/analytics/customEventAnalytics';
import { isPrivateIP } from 'src/utilities/ipUtils';

import { getGeneratedLinodeLabel } from '../utilities';
import { LinodeSelectTableRow } from './LinodeSelectTableRow';
import { SelectLinodeCard } from './SelectLinodeCard';

import type { LinodeCreateFormValues } from '../utilities';
import type { Linode } from '@linode/api-v4';
import type { Theme } from '@mui/material';
import type { Order } from 'src/hooks/useOrderV2';

interface Props {
  /**
   * In desktop view, adds an extra column that will display a "power off" option when the row is selected.
   * In mobile view, allows the "power off" button to display when the card is selected.
   */
  enablePowerOff?: boolean;
}

export const LinodeSelectTable = (props: Props) => {
  const { enablePowerOff } = props;
  const search = useSearch({
    from: '/linodes/create',
  });

  const matchesMdUp = useMediaQuery((theme: Theme) =>
    theme.breakpoints.up('md')
  );

  const { data: accountPermissions, isLoading: isLoadingAccountPermissions } =
    usePermissions('account', ['create_linode']);

  const {
    data: shutdownableLinodes = [],
    isLoading: isLoadingShutdownableLinodes,
    error: shutdownableLinodesError,
  } = useGetAllUserEntitiesByPermission({
    entityType: 'linode',
    permission: 'shutdown_linode',
  });
  const {
    data: cloneableLinodes = [],
    isLoading: isLoadingCloneableLinodes,
    error: cloneableLinodesError,
  } = useGetAllUserEntitiesByPermission({
    entityType: 'linode',
    permission: 'clone_linode',
  });

  const {
    control,
    formState: {
      dirtyFields: { label: isLabelFieldDirty },
    },
    getValues,
    reset,
    setValue,
  } = useFormContext<LinodeCreateFormValues>();

  const { field, fieldState } = useController<LinodeCreateFormValues, 'linode'>(
    {
      control,
      name: 'linode',
    }
  );

  const createType = useGetLinodeCreateType();

  const [query, setQuery] = useState(
    search.linodeID ? `id = ${search.linodeID}` : ''
  );

  const [linodeToPowerOff, setLinodeToPowerOff] = useState<Linode>();

  const createPath = linodesCreateTypesMap.get(createType) ?? 'os';

  const pagination = usePaginationV2({
    currentRoute: `/linodes/create/${createPath}`,
    initialPage: 1,
    preferenceKey: 'linode-clone-select-table',
  });

  const { order, orderBy, handleOrderChange } = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: 'asc',
        orderBy: 'label',
      },
      from: `/linodes/create/${createPath}`,
    },
    preferenceKey: 'linode-clone-select-table',
  });

  const { filter, filterError } = getLinodeXFilter(query, order, orderBy);

  const {
    data,
    error: linodesError,
    isFetching,
    isLoading: isLoadingLinodes,
  } = useLinodesQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  const queryClient = useQueryClient();

  const handleSelect = async (linode: Linode) => {
    const hasPrivateIP = linode.ipv4.some(isPrivateIP);
    reset((prev) => ({
      ...prev,
      backup_id: null,
      backups_enabled: linode.backups.enabled,
      linode,
      private_ip: linode.interface_generation !== 'linode' && hasPrivateIP,
      region: linode.region,
      type: linode.type ?? '',
      interface_generation: undefined,
    }));

    if (!isLabelFieldDirty) {
      setValue(
        'label',
        await getGeneratedLinodeLabel({
          queryClient,
          tab: createType,
          values: getValues(),
        })
      );
    }
  };

  const handlePowerOff = (linode: Linode) => {
    setLinodeToPowerOff(linode);
    sendLinodePowerOffEvent('Clone Linode');
  };

  const columns = enablePowerOff ? 6 : 5;

  const isLoading =
    isLoadingAccountPermissions ||
    isLoadingShutdownableLinodes ||
    isLoadingCloneableLinodes ||
    isLoadingLinodes;
  const error =
    shutdownableLinodesError || cloneableLinodesError || linodesError;

  return (
    <Stack pt={1} spacing={2}>
      {fieldState.error?.message && (
        <Notice text={fieldState.error?.message} variant="error" />
      )}
      <DebouncedSearchTextField
        clearable
        debounceTime={250}
        errorText={filterError?.message}
        hideLabel
        isSearching={isFetching}
        label="Search"
        onSearch={(query) => {
          // If a Linode is selected and the user changes the search query, clear their current selection.
          // We do this because the new list of Linodes may not include the selected one.
          if (field.value?.id) {
            field.onChange(null);
          }
          setQuery(query);
        }}
        placeholder="Search"
        value={query}
      />
      <Box>
        {matchesMdUp ? (
          <Table>
            <TableHead>
              <TableRow>
                <TableSortCell
                  active={orderBy === 'label'}
                  direction={order}
                  handleClick={handleOrderChange}
                  label="label"
                >
                  Linode
                </TableSortCell>
                <TableCell>Status</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Plan</TableCell>
                <TableSortCell
                  active={orderBy === 'region'}
                  direction={order}
                  handleClick={handleOrderChange}
                  label="region"
                >
                  Region
                </TableSortCell>
                {enablePowerOff && <TableCell sx={{ minWidth: 100 }} />}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && (
                <TableRowLoading columns={columns} rows={pagination.pageSize} />
              )}
              {error && (
                <TableRowError colSpan={columns} message={error[0].reason} />
              )}
              {data?.results === 0 && <TableRowEmpty colSpan={columns} />}
              {!isLoading &&
                !error &&
                data?.data.map((linode) => (
                  <LinodeSelectTableRow
                    disabled={!accountPermissions?.create_linode}
                    isCloneable={cloneableLinodes?.some(
                      (l) => l.id === linode.id
                    )}
                    isShutdownable={shutdownableLinodes?.some(
                      (l) => l.id === linode.id
                    )}
                    key={linode.id}
                    linode={linode}
                    onPowerOff={
                      enablePowerOff
                        ? () => {
                            setLinodeToPowerOff(linode);
                            sendLinodePowerOffEvent('Clone Linode');
                          }
                        : undefined
                    }
                    onSelect={() => handleSelect(linode)}
                    selected={linode.id === field.value?.id}
                  />
                ))}
            </TableBody>
          </Table>
        ) : (
          <Grid container spacing={2}>
            {data?.data.map((linode) => (
              <SelectLinodeCard
                handlePowerOff={() => handlePowerOff(linode)}
                handleSelection={() => handleSelect(linode)}
                key={linode.id}
                linode={linode}
                selected={linode.id === field.value?.id}
                showPowerActions={Boolean(enablePowerOff)}
              />
            ))}
            {data?.results === 0 && (
              <Typography padding={1}>No results</Typography>
            )}
          </Grid>
        )}
        <PaginationFooter
          count={data?.results ?? 0}
          handlePageChange={pagination.handlePageChange}
          handleSizeChange={pagination.handlePageSizeChange}
          page={pagination.page}
          pageSize={pagination.pageSize}
        />
      </Box>
      {enablePowerOff && (
        <PowerActionsDialog
          action="Power Off"
          isOpen={Boolean(linodeToPowerOff)}
          linodeId={linodeToPowerOff?.id}
          linodeLabel={linodeToPowerOff?.label}
          onClose={() => setLinodeToPowerOff(undefined)}
        />
      )}
    </Stack>
  );
};

export const getLinodeXFilter = (
  query: string,
  order?: Order,
  orderBy?: string
) => {
  const { error: filterError, filter: apiFilter } = getAPIFilterFromQuery(
    query,
    {
      searchableFieldsWithoutOperator: ['label', 'id', 'ipv4', 'tags'],
    }
  );

  const filter = {
    ...apiFilter,
    site_type: 'core', // backups and cloning are not supported for distributed regions
    // backups: { enabled: true }, womp womp! We can't filter on values within objects
  };

  if (order) {
    return {
      filter: { ...filter, '+order': order, '+order_by': orderBy },
      filterError,
    };
  }

  return { filter, filterError };
};
