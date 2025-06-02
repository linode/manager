import {
  useAllLinodeDisksQuery,
  useGrants,
  useLinodeQuery,
} from '@linode/queries';
import { Box, Button, Paper, Stack, Typography } from '@linode/ui';
import { Hidden } from '@linode/ui';
import Grid from '@mui/material/Grid';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import { DocsLink } from 'src/components/DocsLink/DocsLink';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
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
import { sendEvent } from 'src/utilities/analytics/utils';

import { addUsedDiskSpace } from '../utilities';
import { CreateDiskDrawer } from './CreateDiskDrawer';
import { DeleteDiskDialog } from './DeleteDiskDialog';
import { LinodeDiskRow } from './LinodeDiskRow';
import { RenameDiskDrawer } from './RenameDiskDrawer';
import { ResizeDiskDrawer } from './ResizeDiskDrawer';

import type { Disk } from '@linode/api-v4/lib/linodes';

export const LinodeDisks = () => {
  const disksHeaderRef = React.useRef(null);
  const { linodeId } = useParams<{ linodeId: string }>();
  const id = Number(linodeId);

  const { data: disks, error, isLoading } = useAllLinodeDisksQuery(id);
  const { data: linode } = useLinodeQuery(id);
  const { data: grants } = useGrants();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = React.useState(false);
  const [isRenameDrawerOpen, setIsRenameDrawerOpen] = React.useState(false);
  const [isResizeDrawerOpen, setIsResizeDrawerOpen] = React.useState(false);

  const [selectedDiskId, setSelectedDiskId] = React.useState<number>();
  const selectedDisk = disks?.find((d) => d.id === selectedDiskId);

  const linodeTotalDisk = linode?.specs.disk ?? 0;

  const readOnly =
    grants !== undefined &&
    grants.linode.some((g) => g.id === id && g.permissions === 'read_only');

  const usedDiskSpace = addUsedDiskSpace(disks ?? []);

  const hasFreeDiskSpace = linodeTotalDisk > usedDiskSpace;

  const noFreeDiskSpaceWarning =
    'You do not have enough unallocated storage to create a Disk. Please choose a different plan with more storage or delete an existing Disk.';

  const onRename = (disk: Disk) => {
    setSelectedDiskId(disk.id);
    setIsRenameDrawerOpen(true);
  };

  const onResize = (disk: Disk) => {
    setSelectedDiskId(disk.id);
    setIsResizeDrawerOpen(true);
  };

  const onDelete = (disk: Disk) => {
    setSelectedDiskId(disk.id);
    setIsDeleteDialogOpen(true);
  };

  const renderTableContent = (disks: Disk[] | undefined) => {
    if (error) {
      return <TableRowError colSpan={5} message={error[0]?.reason} />;
    }

    if (isLoading) {
      return <TableRowLoading columns={5} rows={1} />;
    }

    if (disks?.length === 0) {
      return <TableRowEmpty colSpan={5} />;
    }

    return disks?.map((disk) => (
      <LinodeDiskRow
        disk={disk}
        key={disk.id}
        linodeId={id}
        linodeStatus={linode?.status ?? 'offline'}
        onDelete={() => onDelete(disk)}
        onRename={() => onRename(disk)}
        onResize={() => onResize(disk)}
        readOnly={readOnly}
      />
    ));
  };

  return (
    <Box>
      <Paper
        sx={{
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'space-between',
          pl: 2,
          pr: 0.5,
          py: 0.5,
        }}
      >
        <Typography ref={disksHeaderRef} variant="h3">
          Disks
        </Typography>
        <Stack direction="row" spacing={1}>
          <DocsLink
            href="https://techdocs.akamai.com/cloud-computing/docs/manage-disks-on-a-compute-instance#create-a-disk"
            label="Creating Disks"
          />
          <Button
            buttonType="primary"
            disabled={readOnly || !hasFreeDiskSpace}
            onClick={() => setIsCreateDrawerOpen(true)}
            tooltipAnalyticsEvent={() =>
              sendEvent({
                action: `Open:tooltip`,
                category: `Disk Resize Flow`,
                label: `Add a Disk help icon tooltip`,
              })
            }
            tooltipText={!hasFreeDiskSpace ? noFreeDiskSpaceWarning : undefined}
          >
            Add a Disk
          </Button>
        </Stack>
      </Paper>
      <OrderBy
        data={disks ?? []}
        order={'asc'}
        orderBy={'created'}
        preferenceKey="linode-disks"
      >
        {({ data: orderedData, handleOrderChange, order, orderBy }) => (
          <Paginate data={orderedData} scrollToRef={disksHeaderRef}>
            {({
              count,
              data: paginatedData,
              handlePageChange,
              handlePageSizeChange,
              page,
              pageSize,
            }) => {
              return (
                <React.Fragment>
                  <Grid size={12}>
                    <Table aria-label="List of Disks">
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
                            active={orderBy === 'filesystem'}
                            direction={order}
                            handleClick={handleOrderChange}
                            label="filesystem"
                          >
                            Type
                          </TableSortCell>
                          <TableSortCell
                            active={orderBy === 'size'}
                            direction={order}
                            handleClick={handleOrderChange}
                            label="size"
                          >
                            Size
                          </TableSortCell>
                          <Hidden mdDown>
                            <TableSortCell
                              active={orderBy === 'created'}
                              direction={order}
                              handleClick={handleOrderChange}
                              label="created"
                            >
                              Created
                            </TableSortCell>
                          </Hidden>
                          <TableCell />
                        </TableRow>
                      </TableHead>
                      <TableBody>{renderTableContent(paginatedData)}</TableBody>
                    </Table>
                  </Grid>
                  <PaginationFooter
                    count={count}
                    eventCategory="linode disks"
                    handlePageChange={handlePageChange}
                    handleSizeChange={handlePageSizeChange}
                    page={page}
                    pageSize={pageSize}
                  />
                </React.Fragment>
              );
            }}
          </Paginate>
        )}
      </OrderBy>
      <DeleteDiskDialog
        disk={selectedDisk}
        linodeId={id}
        onClose={() => setIsDeleteDialogOpen(false)}
        open={isDeleteDialogOpen}
      />
      <CreateDiskDrawer
        linodeId={id}
        onClose={() => setIsCreateDrawerOpen(false)}
        open={isCreateDrawerOpen}
      />
      <RenameDiskDrawer
        disk={selectedDisk}
        linodeId={id}
        onClose={() => setIsRenameDrawerOpen(false)}
        open={isRenameDrawerOpen}
      />
      <ResizeDiskDrawer
        disk={selectedDisk}
        linodeId={id}
        onClose={() => setIsResizeDrawerOpen(false)}
        open={isResizeDrawerOpen}
      />
    </Box>
  );
};
