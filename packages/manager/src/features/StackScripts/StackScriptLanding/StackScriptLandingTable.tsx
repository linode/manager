import { getAPIFilterFromQuery } from '@linode/search';
import { CircleProgress, ErrorState, Stack, TooltipIcon } from '@linode/ui';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Waypoint } from 'react-waypoint';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { Hidden } from 'src/components/Hidden';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { TableSortCell } from 'src/components/TableSortCell';
import {
  accountStackScriptFilter,
  communityStackScriptFilter,
} from 'src/features/Linodes/LinodeCreate/Tabs/StackScripts/utilities';
import { useOrder } from 'src/hooks/useOrder';
import { useStackScriptsInfiniteQuery } from 'src/queries/stackscripts';

import { StackScriptSearchHelperText } from '../Partials/StackScriptSearchHelperText';
import { StackScriptsEmptyLandingState } from '../StackScriptBase/StackScriptsEmptyLandingPage';
import { isLKEStackScript } from '../stackScriptUtils';
import { StackScriptDeleteDialog } from './StackScriptDeleteDialog';
import { StackScriptMakePublicDialog } from './StackScriptMakePublicDialog';
import { StackScriptRow } from './StackScriptRow';

import type { StackScript } from '@linode/api-v4';

interface Props {
  type: 'account' | 'community';
}

export const StackScriptLandingTable = (props: Props) => {
  const { type } = props;

  const filter =
    type === 'community'
      ? communityStackScriptFilter
      : accountStackScriptFilter;

  const defaultOrder =
    type === 'community'
      ? { order: 'desc' as const, orderBy: 'deployments_total' }
      : { order: 'desc' as const, orderBy: 'updated' };

  const history = useHistory();

  const queryParams = new URLSearchParams(history.location.search);
  const query = queryParams.get('query') ?? '';

  const {
    error: searchParseError,
    filter: searchFilter,
  } = getAPIFilterFromQuery(query, {
    searchableFieldsWithoutOperator: ['username', 'label', 'description'],
  });

  const { handleOrderChange, order, orderBy } = useOrder(defaultOrder);

  const [selectedStackScriptId, setSelectedStackScriptId] = useState<number>();
  const [isMakePublicDialogOpen, setIsMakePublicDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
  } = useStackScriptsInfiniteQuery({
    ...filter,
    ...searchFilter,
    '+order': order,
    '+order_by': orderBy,
  });

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error) {
    return <ErrorState errorText={error[0].reason} />;
  }

  // Never show LKE StackScripts. We try to hide these from the user even though they
  // are returned by the API.
  const stackscripts = data?.pages.reduce<StackScript[]>((acc, page) => {
    for (const stackscript of page.data) {
      if (!isLKEStackScript(stackscript)) {
        acc.push(stackscript);
      }
    }
    return acc;
  }, []);

  if (!query && stackscripts?.length === 0) {
    return <StackScriptsEmptyLandingState />;
  }

  const selectedStackScript = selectedStackScriptId
    ? stackscripts?.find((s) => s.id === selectedStackScriptId)
    : undefined;

  return (
    <Stack spacing={1}>
      <DebouncedSearchTextField
        InputProps={
          searchParseError
            ? {
                endAdornment: (
                  <TooltipIcon
                    status="error"
                    sxTooltipIcon={{ p: 0.75 }}
                    text={searchParseError.message}
                  />
                ),
              }
            : {}
        }
        onSearch={(value) => {
          queryParams.set('query', value);
          history.push({ search: queryParams.toString() });
        }}
        clearable
        hideLabel
        isSearching={isFetching}
        label="Search"
        noMarginTop
        placeholder="Search by Label, Username, or Description"
        tooltipText={<StackScriptSearchHelperText />}
        tooltipWidth={300}
        value={query}
      />
      <Table aria-label="List of StackScripts">
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'label'}
              direction={order}
              handleClick={handleOrderChange}
              label="label"
            >
              StackScript
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'deployments_total'}
              direction={order}
              handleClick={handleOrderChange}
              label="deployments_total"
            >
              Deploys
            </TableSortCell>
            <Hidden smDown>
              <TableSortCell
                active={orderBy === 'updated'}
                direction={order}
                handleClick={handleOrderChange}
                label="updated"
                noWrap
              >
                Last Revision
              </TableSortCell>
            </Hidden>
            <Hidden lgDown>
              <TableCell>Compatible Images</TableCell>
            </Hidden>
            {type === 'account' && (
              <Hidden lgDown>
                <TableCell>Status</TableCell>
              </Hidden>
            )}
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {stackscripts?.map((stackscript) => (
            <StackScriptRow
              handlers={{
                onDelete: () => {
                  setSelectedStackScriptId(stackscript.id);
                  setIsDeleteDialogOpen(true);
                },
                onMakePublic: () => {
                  setSelectedStackScriptId(stackscript.id);
                  setIsMakePublicDialogOpen(true);
                },
              }}
              key={stackscript.id}
              stackscript={stackscript}
              type={type}
            />
          ))}
          {query && stackscripts?.length === 0 && <TableRowEmpty colSpan={6} />}
          {isFetchingNextPage && (
            <TableRowLoading
              responsive={
                type === 'account'
                  ? {
                      2: { smDown: true },
                      3: { lgDown: true },
                      4: { lgDown: true },
                    }
                  : {
                      2: { smDown: true },
                      3: { lgDown: true },
                    }
              }
              columns={type === 'account' ? 6 : 5}
            />
          )}
        </TableBody>
      </Table>
      {hasNextPage && <Waypoint onEnter={() => fetchNextPage()} />}
      <StackScriptMakePublicDialog
        onClose={() => setIsMakePublicDialogOpen(false)}
        open={isMakePublicDialogOpen}
        stackscript={selectedStackScript}
      />
      <StackScriptDeleteDialog
        onClose={() => setIsDeleteDialogOpen(false)}
        open={isDeleteDialogOpen}
        stackscript={selectedStackScript}
      />
    </Stack>
  );
};
