import Grid from '@mui/material/Unstable_Grid2';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { Box } from 'src/components/Box';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { Notice } from 'src/components/Notice/Notice';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Stack } from 'src/components/Stack';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { TableSortCell } from 'src/components/TableSortCell';
import { Typography } from 'src/components/Typography';
import { SelectLinodeCard } from 'src/features/Linodes/LinodesCreate/SelectLinodePanel/SelectLinodeCard';
import { PowerActionsDialog } from 'src/features/Linodes/PowerActionsDialogOrDrawer';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useLinodesQuery } from 'src/queries/linodes/linodes';
import { sendLinodePowerOffEvent } from 'src/utilities/analytics/customEventAnalytics';
import { privateIPRegex } from 'src/utilities/ipUtils';
import { isNumeric } from 'src/utilities/stringUtils';

import {
  LinodeCreateFormValues,
  useLinodeCreateQueryParams,
} from '../utilities';
import { LinodeSelectTableRow } from './LinodeSelectTableRow';

import type { Linode } from '@linode/api-v4';
import type { Theme } from '@mui/material';

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

  const { control, reset } = useFormContext<LinodeCreateFormValues>();

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

  const filter = preselectedLinodeId
    ? { id: preselectedLinodeId }
    : {
        '+or': [
          { label: { '+contains': query } },
          ...(isNumeric(query) ? [{ id: Number(query) }] : []), // let users filter by Linode id
        ],
        '+order': order.order,
        '+order_by': order.orderBy,
        // backups: { enabled: true }, womp womp! We can't filter on values within objects
      };

  const { data, error, isFetching, isLoading } = useLinodesQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  const handleSelect = (linode: Linode) => {
    const hasPrivateIP = linode.ipv4.some((ipv4) => privateIPRegex.test(ipv4));
    reset((prev) => ({
      ...prev,
      backup_id: null,
      linode,
      private_ip: hasPrivateIP,
      region: linode.region,
      type: linode.type ?? '',
    }));
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
        customValue={{
          onChange: (value) => {
            if (preselectedLinodeId) {
              setPreselectedLinodeId(undefined);
            }
            setQuery(value ?? '');
          },
          value: preselectedLinodeId ? field.value?.label ?? '' : query,
        }}
        clearable
        hideLabel
        isSearching={isFetching}
        label="Search"
        placeholder="Search"
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
          onClose={() => setLinodeToPowerOff(undefined)}
        />
      )}
    </Stack>
  );
};
