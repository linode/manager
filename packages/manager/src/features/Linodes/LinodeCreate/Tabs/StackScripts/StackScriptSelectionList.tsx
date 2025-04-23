import {
  useStackScriptQuery,
  useStackScriptsInfiniteQuery,
} from '@linode/queries';
import { getAPIFilterFromQuery } from '@linode/search';
import {
  Box,
  Button,
  CircleProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  TooltipIcon,
} from '@linode/ui';
import CloseIcon from '@mui/icons-material/Close';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { Waypoint } from 'react-waypoint';
import { debounce } from 'throttle-debounce';

import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { TableSortCell } from 'src/components/TableSortCell';
import { StackScriptSearchHelperText } from 'src/features/StackScripts/Partials/StackScriptSearchHelperText';
import { useOrder } from 'src/hooks/useOrder';

import {
  getGeneratedLinodeLabel,
  useLinodeCreateQueryParams,
} from '../../utilities';
import { StackScriptDetailsDialog } from './StackScriptDetailsDialog';
import { StackScriptSelectionRow } from './StackScriptSelectionRow';
import { getDefaultUDFData } from './UserDefinedFields/utilities';
import {
  accountStackScriptFilter,
  communityStackScriptFilter,
} from './utilities';

import type { LinodeCreateFormValues } from '../../utilities';
import type { StackScriptTabType } from './utilities';

interface Props {
  type: StackScriptTabType;
}

export const StackScriptSelectionList = ({ type }: Props) => {
  const [query, setQuery] = useState<string>();

  const queryClient = useQueryClient();

  const { handleOrderChange, order, orderBy } = useOrder({
    order: 'desc',
    orderBy: 'deployments_total',
  });

  const {
    control,
    formState: {
      dirtyFields: { label: isLabelFieldDirty },
    },
    getValues,
    setValue,
  } = useFormContext<LinodeCreateFormValues>();

  const { field } = useController({
    control,
    name: 'stackscript_id',
  });

  const [selectedStackScriptId, setSelectedStackScriptId] = useState<number>();

  const { params, updateParams } = useLinodeCreateQueryParams();

  const hasPreselectedStackScript = Boolean(params.stackScriptID);

  const {
    data: stackscript,
    isLoading: isSelectedStackScriptLoading,
  } = useStackScriptQuery(
    params.stackScriptID ?? -1,
    hasPreselectedStackScript
  );

  const filter =
    type === 'Community'
      ? communityStackScriptFilter
      : accountStackScriptFilter;

  const {
    error: searchParseError,
    filter: searchFilter,
  } = getAPIFilterFromQuery(query, {
    searchableFieldsWithoutOperator: ['username', 'label', 'description'],
  });

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
  } = useStackScriptsInfiniteQuery(
    {
      ['+order']: order,
      ['+order_by']: orderBy,
      ...filter,
      ...searchFilter,
    },
    !hasPreselectedStackScript
  );

  const stackscripts = data?.pages.flatMap((page) => page.data);

  if (hasPreselectedStackScript) {
    return (
      <Stack spacing={1}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 20 }} />
              <TableCell>StackScript</TableCell>
              <TableCell sx={{ minWidth: 120 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {stackscript && (
              <StackScriptSelectionRow
                isSelected={field.value === stackscript.id}
                onOpenDetails={() => setSelectedStackScriptId(stackscript.id)}
                stackscript={stackscript}
              />
            )}
            {isSelectedStackScriptLoading && (
              <TableRowLoading columns={3} rows={1} />
            )}
          </TableBody>
        </Table>
        <Box display="flex" justifyContent="flex-end">
          <Button
            onClick={() => {
              field.onChange(null);
              setValue('image', null);
              updateParams({ stackScriptID: undefined });
            }}
          >
            Choose Another StackScript
          </Button>
        </Box>
        <StackScriptDetailsDialog
          id={selectedStackScriptId}
          onClose={() => setSelectedStackScriptId(undefined)}
          open={Boolean(selectedStackScriptId)}
        />
      </Stack>
    );
  }

  return (
    <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
      <TextField
        InputProps={{
          endAdornment: query && (
            <InputAdornment position="end">
              {isFetching && <CircleProgress size="sm" />}
              {searchParseError && (
                <TooltipIcon status="error" text={searchParseError.message} />
              )}
              <IconButton
                aria-label="Clear"
                onClick={() => setQuery('')}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        hideLabel
        label="Search"
        onChange={debounce(400, (e) => setQuery(e.target.value))}
        placeholder="Search StackScripts"
        spellCheck={false}
        tooltipText={<StackScriptSearchHelperText />}
        tooltipWidth={300}
        value={query}
      />
      <Table sx={{ mt: 1 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 20 }} />
            <TableSortCell
              active={orderBy === 'label'}
              direction={order}
              handleClick={handleOrderChange}
              label="label"
            >
              StackScript
            </TableSortCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {stackscripts?.map((stackscript) => (
            <StackScriptSelectionRow
              onSelect={async () => {
                setValue('image', null);
                setValue(
                  'stackscript_data',
                  getDefaultUDFData(stackscript.user_defined_fields)
                );
                field.onChange(stackscript.id);

                if (!isLabelFieldDirty) {
                  setValue(
                    'label',
                    await getGeneratedLinodeLabel({
                      queryClient,
                      tab: 'StackScripts',
                      values: getValues(),
                    })
                  );
                }
              }}
              isSelected={field.value === stackscript.id}
              key={stackscript.id}
              onOpenDetails={() => setSelectedStackScriptId(stackscript.id)}
              stackscript={stackscript}
            />
          ))}
          {data?.pages[0].results === 0 && <TableRowEmpty colSpan={3} />}
          {error && <TableRowError colSpan={3} message={error[0].reason} />}
          {isLoading && <TableRowLoading columns={3} rows={25} />}
          {(isFetchingNextPage || hasNextPage) && (
            <TableRowLoading columns={3} rows={1} />
          )}
        </TableBody>
      </Table>
      {hasNextPage && <Waypoint onEnter={() => fetchNextPage()} />}
      <StackScriptDetailsDialog
        id={selectedStackScriptId}
        onClose={() => setSelectedStackScriptId(undefined)}
        open={Boolean(selectedStackScriptId)}
      />
    </Box>
  );
};
