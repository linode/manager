import {
  useStackScriptQuery,
  useStackScriptsInfiniteQuery,
} from '@linode/queries';
import { getAPIFilterFromQuery } from '@linode/search';
import { CircleProgress, ErrorState, Stack, TooltipIcon } from '@linode/ui';
import { Hidden } from '@linode/ui';
import {
  useMatch,
  useNavigate,
  useParams,
  useSearch,
} from '@tanstack/react-router';
import React from 'react';
import { Waypoint } from 'react-waypoint';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
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
import { useOrderV2 } from 'src/hooks/useOrderV2';

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
  const navigate = useNavigate();
  const { id } = useParams({ strict: false });
  const { query } = useSearch({ from: '/stackscripts' });
  const match = useMatch({ strict: false });

  const filter =
    type === 'community'
      ? communityStackScriptFilter
      : accountStackScriptFilter;

  const defaultOrder =
    type === 'community'
      ? { order: 'desc' as const, orderBy: 'deployments_total' }
      : { order: 'desc' as const, orderBy: 'updated' };

  const { error: searchParseError, filter: searchFilter } =
    getAPIFilterFromQuery(query, {
      searchableFieldsWithoutOperator: ['username', 'label', 'description'],
    });

  const { handleOrderChange, order, orderBy } = useOrderV2({
    initialRoute: {
      defaultOrder,
      from:
        type === 'account'
          ? '/stackscripts/account'
          : '/stackscripts/community',
    },
    preferenceKey:
      type === 'account'
        ? 'stackscripts-landing-account'
        : 'stackscripts-landing-community',
  });

  const {
    data: selectedStackScript,
    error: selectedStackScriptError,
    isFetching: isFetchingStackScript,
  } = useStackScriptQuery(Number(id), !!id);

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

  return (
    <Stack spacing={3}>
      <DebouncedSearchTextField
        clearable
        hideLabel
        inputSlotProps={
          searchParseError
            ? {
                endAdornment: (
                  <TooltipIcon
                    sxTooltipIcon={{ p: 0.75 }}
                    text={searchParseError.message}
                  />
                ),
              }
            : {}
        }
        isSearching={isFetching}
        label="Search"
        noMarginTop
        onSearch={(value) => {
          if (!value) {
            navigate({
              search: undefined,
              to:
                type === 'account'
                  ? '/stackscripts/account'
                  : '/stackscripts/community',
            });
          } else {
            navigate({
              search: { query: value },
              to:
                type === 'account'
                  ? '/stackscripts/account'
                  : '/stackscripts/community',
            });
          }
        }}
        placeholder="Search by Label, Username, or Description"
        tooltipText={<StackScriptSearchHelperText />}
        tooltipWidth={300}
        value={query ?? ''}
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
                  navigate({
                    params: { id: stackscript.id },
                    to: `/stackscripts/account/$id/delete`,
                  });
                },
                onMakePublic: () => {
                  navigate({
                    params: { id: stackscript.id },
                    to: `/stackscripts/account/$id/make-public`,
                  });
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
              columns={type === 'account' ? 6 : 5}
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
            />
          )}
        </TableBody>
      </Table>
      {hasNextPage && <Waypoint onEnter={() => fetchNextPage()} />}
      <StackScriptMakePublicDialog
        isFetching={isFetchingStackScript}
        onClose={() => {
          navigate({
            to: `/stackscripts`,
          });
        }}
        open={match.routeId === '/stackscripts/account/$id/make-public'}
        stackscript={selectedStackScript}
        stackscriptError={selectedStackScriptError}
      />
      <StackScriptDeleteDialog
        isFetching={isFetchingStackScript}
        onClose={() => {
          navigate({
            to: `/stackscripts`,
          });
        }}
        open={match.routeId === '/stackscripts/account/$id/delete'}
        stackscript={selectedStackScript}
        stackscriptError={selectedStackScriptError}
      />
    </Stack>
  );
};
