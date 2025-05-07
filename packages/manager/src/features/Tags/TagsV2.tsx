import { useAllTagsQuery, useLinodesQuery } from '@linode/queries';
import { Autocomplete, Hidden, Stack, Typography } from '@linode/ui';
import { createLazyRoute, useNavigate } from '@tanstack/react-router';
import * as React from 'react';

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
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';

import { LinodeRow } from '../Linodes/LinodesLanding/LinodeRow/LinodeRow';

export const TagsV2 = () => {
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const { data: tags } = useAllTagsQuery();
  const navigate = useNavigate();
  const pagination = usePagination();
  const { handleOrderChange, order, orderBy } = useOrder();

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
        onButtonClick={() =>
          navigate({ search: () => ({}), to: '/linodes/create' })
        }
        title="Linodes / Group by Tags"
      />
      <Stack spacing={2}>
        <Autocomplete
          disableSelectAll
          label="Tags"
          multiple
          onChange={(e, tags) => {
            setSelectedTags(tags.map((tag) => tag.label));
          }}
          options={tags ?? []}
          placeholder="Select tags to view Linodes"
          sx={{ minWidth: 250 }}
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
  pagination: ReturnType<typeof usePagination>;
  tag: string;
}

const TaggedLinodesTable = ({
  handleOrderChange,
  order,
  orderBy,
  pagination,
  tag,
}: TaggedLinodesTableProps) => {
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
