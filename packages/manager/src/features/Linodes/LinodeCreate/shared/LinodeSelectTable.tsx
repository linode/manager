import { getAPIFilterFromQuery } from '@linode/search';
import { Box, Notice, Stack, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useQueryClient } from '@tanstack/react-query';
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
import { PowerActionsDialog } from 'src/features/Linodes/PowerActionsDialogOrDrawer';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useLinodesQuery } from '@linode/queries';
import { sendLinodePowerOffEvent } from 'src/utilities/analytics/customEventAnalytics';
import { isPrivateIP } from 'src/utilities/ipUtils';

import {
  getGeneratedLinodeLabel,
  useLinodeCreateQueryParams,
} from '../utilities';
import { LinodeSelectTableRow } from './LinodeSelectTableRow';
import { SelectLinodeCard } from './SelectLinodeCard';

import type { LinodeCreateFormValues } from '../utilities';
import type { Linode } from '@linode/api-v4';
import type { Theme } from '@mui/material';
import type { UseOrder } from 'src/hooks/useOrder';

interface Props {
  /**
   * In desktop view, adds an extra column that will display a "power off" option when the row is selected.
   * In mobile view, allows the "power off" button to display when the card is selected.
   */
  enablePowerOff?: boolean;
}

export const LinodeSelectTable = (props: Props) => {
  const { enablePowerOff } = props;

  const matchesMdUp = useMediaQuery((theme: Theme) =>
    theme.breakpoints.up('md')
  );

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

  const { params } = useLinodeCreateQueryParams();

  const [preselectedLinodeId, setPreselectedLinodeId] = useState(
    params.linodeID
  );

  const [query, setQuery] = useState(field.value?.label ?? '');
  const [linodeToPowerOff, setLinodeToPowerOff] = useState<Linode>();

  const pagination = usePagination();
  const order = useOrder();

  const { filter, filterError } = getLinodeXFilter(
    preselectedLinodeId,
    query,
    order
  );

  const { data, error, isFetching, isLoading } = useLinodesQuery(
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
      private_ip: hasPrivateIP,
      region: linode.region,
      type: linode.type ?? '',
    }));

    if (!isLabelFieldDirty) {
      setValue(
        'label',
        await getGeneratedLinodeLabel({
          queryClient,
          tab: params.type,
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

  return (
    <Stack pt={1} spacing={2}>
      {fieldState.error?.message && (
        <Notice text={fieldState.error?.message} variant="error" />
      )}
      <DebouncedSearchTextField
        onSearch={(value) => {
          if (preselectedLinodeId) {
            setPreselectedLinodeId(undefined);
          }
          setQuery(value);
        }}
        clearable
        debounceTime={250}
        errorText={filterError?.message}
        hideLabel
        isSearching={isFetching}
        label="Search"
        placeholder="Search"
        value={preselectedLinodeId ? field.value?.label ?? '' : query}
      />
      <Box>
        {matchesMdUp ? (
          <Table>
            <TableHead>
              <TableRow>
                <TableSortCell
                  active={order.orderBy === 'label'}
                  direction={order.order}
                  handleClick={order.handleOrderChange}
                  label="label"
                >
                  Linode
                </TableSortCell>
                <TableCell>Status</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Plan</TableCell>
                <TableSortCell
                  active={order.orderBy === 'region'}
                  direction={order.order}
                  handleClick={order.handleOrderChange}
                  label="region"
                >
                  Region
                </TableSortCell>
                {enablePowerOff && <TableCell sx={{ minWidth: 100 }} />}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && <TableRowLoading columns={columns} rows={10} />}
              {error && (
                <TableRowError colSpan={columns} message={error[0].reason} />
              )}
              {data?.results === 0 && <TableRowEmpty colSpan={columns} />}
              {data?.data.map((linode) => (
                <LinodeSelectTableRow
                  onPowerOff={
                    enablePowerOff
                      ? () => {
                          setLinodeToPowerOff(linode);
                          sendLinodePowerOffEvent('Clone Linode');
                        }
                      : undefined
                  }
                  key={linode.id}
                  linode={linode}
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
  preselectedLinodeId: number | undefined,
  query: string,
  order?: UseOrder
) => {
  if (preselectedLinodeId) {
    return {
      id: preselectedLinodeId,
    };
  }

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
      filter: { ...filter, '+order': order.order, '+order_by': order.orderBy },
      filterError,
    };
  }

  return { filter, filterError };
};
