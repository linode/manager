import { useAllTagsQuery, useLinodesQuery } from '@linode/queries';
import { Autocomplete, Hidden, Stack, Typography } from '@linode/ui';
import {
  createLazyRoute,
  useNavigate,
  useSearch,
} from '@tanstack/react-router';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
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
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useOrderV2 } from 'src/hooks/useOrderV2';
import { usePaginationV2 } from 'src/hooks/usePaginationV2';

import { LinodeRow } from '../Linodes/LinodesLanding/LinodeRow/LinodeRow';

export const TagsV2 = () => {
  const history = useHistory();
  const { data: tags } = useAllTagsQuery();
  const navigate = useNavigate();
  const search = useSearch({
    from: '/tags/groups',
  });
  const pagination = usePaginationV2({
    currentRoute: '/tags/groups',
    preferenceKey: 'tags-v2-table',
    searchParams: (prev) => ({
      ...prev,
      query: search.query,
    }),
  });
  const { handleOrderChange, order, orderBy } = useOrderV2({
    initialRoute: {
      defaultOrder: {
        order: 'asc',
        orderBy: 'label',
      },
      from: '/tags/groups',
    },
    preferenceKey: 'tags-v2-table',
  });
  const selectedTags = search.query?.split(',') ?? [];

  return (
    <>
      <DocumentTitleSegment segment="Group by Tags" />
      <LandingHeader
        breadcrumbProps={{
          pathname: 'Linodes / Group by Tags',
          removeCrumbX: 1,
        }}
        buttonDataAttrs={{
          tooltipText: getRestrictedResourceText({
            action: 'create',
            isSingular: false,
            resourceType: 'Linodes',
          }),
        }}
        docsLink="#"
        entity="Linodes"
        onButtonClick={() => history.push('/linodes/create')}
        title="Linodes / Group by Tags"
      />
      <Stack spacing={2}>
        <Autocomplete
          disableSelectAll
          label="Tags"
          multiple
          onChange={(e, tags) => {
            if (tags.length === 0) {
              navigate({
                search: (prev) => ({
                  ...prev,
                  query: undefined,
                }),
                to: '/tags/groups',
              });
            } else {
              navigate({
                search: (prev) => ({
                  ...prev,
                  query: tags.map((tag) => tag.label).join(','),
                }),
                to: '/tags/groups',
              });
            }
          }}
          onReset={() => {
            navigate({
              search: (prev) => ({
                ...prev,
                query: undefined,
              }),
              to: '/tags/groups',
            });
          }}
          options={tags ?? []}
          placeholder="Select tags to view Linodes"
          sx={{ minWidth: 250 }}
          value={(tags ?? []).filter((tag) => selectedTags.includes(tag.label))}
        />
        {selectedTags.length === 0 ? (
          <Table>
            <TableHead>
              <TableRow>
                <TableSortCell
                  active={orderBy === 'label'}
                  direction={order}
                  handleClick={handleOrderChange}
                  label="label"
                >
                  Label
                </TableSortCell>
                <TableSortCell
                  active={orderBy === 'status'}
                  direction={order}
                  handleClick={handleOrderChange}
                  label="status"
                >
                  Status
                </TableSortCell>
                <Hidden smDown>
                  <TableSortCell
                    active={orderBy === 'plan'}
                    direction={order}
                    handleClick={handleOrderChange}
                    label="plan"
                  >
                    Plan
                  </TableSortCell>
                  <TableCell>Public IP Address</TableCell>
                </Hidden>
                <Hidden lgDown>
                  <TableSortCell
                    active={orderBy === 'region'}
                    direction={order}
                    handleClick={handleOrderChange}
                    label="region"
                  >
                    Region
                  </TableSortCell>
                </Hidden>
                <Hidden lgDown>
                  <TableCell>Last Backup</TableCell>
                </Hidden>
                <Hidden lgDown>
                  <TableCell>Tags</TableCell>
                </Hidden>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRowEmpty
                colSpan={8}
                message="Select tags to view Linodes"
              />
            </TableBody>
          </Table>
        ) : (
          selectedTags.map((tag) => (
            <TaggedLinodesTable
              handleOrderChange={handleOrderChange}
              key={tag}
              order={order}
              orderBy={orderBy}
              pagination={pagination}
              tag={tag}
            />
          ))
        )}
      </Stack>
    </>
  );
};

interface TaggedLinodesTableProps {
  handleOrderChange: (orderBy: string, order: 'asc' | 'desc') => void;
  order: 'asc' | 'desc';
  orderBy: string;
  pagination: ReturnType<typeof usePaginationV2>;
  tag: string;
}

const TaggedLinodesTable = (props: TaggedLinodesTableProps) => {
  const { handleOrderChange, order, orderBy, pagination, tag } = props;

  const { data, error, isLoading } = useLinodesQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    {
      ['+order']: order,
      ['+order_by']: orderBy,
      tags: tag,
    }
  );

  return (
    <>
      <Typography sx={{ mb: 2 }} variant="h2">
        {tag}
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'label'}
              direction={order}
              handleClick={handleOrderChange}
              label="label"
            >
              Label
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'status'}
              direction={order}
              handleClick={handleOrderChange}
              label="status"
            >
              Status
            </TableSortCell>
            <Hidden smDown>
              <TableSortCell
                active={orderBy === 'plan'}
                direction={order}
                handleClick={handleOrderChange}
                label="plan"
              >
                Plan
              </TableSortCell>
              <TableCell>Public IP Address</TableCell>
            </Hidden>
            <Hidden lgDown>
              <TableSortCell
                active={orderBy === 'region'}
                direction={order}
                handleClick={handleOrderChange}
                label="region"
              >
                Region
              </TableSortCell>
            </Hidden>
            <Hidden lgDown>
              <TableCell>Last Backup</TableCell>
            </Hidden>
            <Hidden lgDown>
              <TableCell>Tags</TableCell>
            </Hidden>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableRowLoading columns={8} rows={1} />
          ) : error ? (
            <TableRowError colSpan={8} message={error[0].reason} />
          ) : data?.data.length === 0 ? (
            <TableRowEmpty
              colSpan={8}
              message={`No Linodes found with tag "${tag}"`}
            />
          ) : (
            data?.data.map((linode) => (
              <LinodeRow
                key={linode.id}
                {...linode}
                handlers={{
                  onOpenDeleteDialog: () => null,
                  onOpenMigrateDialog: () => null,
                  onOpenPowerDialog: () => null,
                  onOpenRebuildDialog: () => null,
                  onOpenRescueDialog: () => null,
                  onOpenResizeDialog: () => null,
                }}
              />
            ))
          )}
        </TableBody>
      </Table>
      <PaginationFooter
        count={data?.results ?? 0}
        eventCategory="Tagged Linodes Table"
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
    </>
  );
};

export const tagsV2LandingLazyRoute = createLazyRoute('/tags/groups')({
  component: TagsV2,
});
