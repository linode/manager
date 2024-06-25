import { Disk } from '@linode/api-v4/lib/linodes';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import AddNewLink from 'src/components/AddNewLink';
import { Hidden } from 'src/components/Hidden';
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
import { TooltipIcon } from 'src/components/TooltipIcon';
import { useAllLinodeDisksQuery } from 'src/queries/linodes/disks';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { useGrants } from 'src/queries/profile/profile';
import { sendEvent } from 'src/utilities/analytics/utils';

import { CreateDiskDrawer } from './CreateDiskDrawer';
import { CreateImageFromDiskDialog } from './CreateImageFromDiskDialog';
import { DeleteDiskDialog } from './DeleteDiskDialog';
import { LinodeDiskRow } from './LinodeDiskRow';
import { RenameDiskDrawer } from './RenameDiskDrawer';
import { ResizeDiskDrawer } from './ResizeDiskDrawer';
import {
  StyledTypography,
  StyledRootGrid,
  StyledWrapperGrid,
} from './CommonLinodeStorage.styles';

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
  const [isImageDialogOpen, setIsImageDialogOpen] = React.useState(false);

  const [selectedDiskId, setSelectedDiskId] = React.useState<number>();
  const selectedDisk = disks?.find((d) => d.id === selectedDiskId);

  const linodeTotalDisk = linode?.specs.disk ?? 0;

  const readOnly =
    grants !== undefined &&
    grants.linode.some((g) => g.id === id && g.permissions === 'read_only');

  const usedDiskSpace = addUsedDiskSpace(disks ?? []);

  const freeDiskSpace = linodeTotalDisk && linodeTotalDisk > usedDiskSpace;

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

  const onImagize = (disk: Disk) => {
    setSelectedDiskId(disk.id);
    setIsImageDialogOpen(true);
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
        onImagize={() => onImagize(disk)}
        onRename={() => onRename(disk)}
        onResize={() => onResize(disk)}
        readOnly={readOnly}
      />
    ));
  };

  return (
    <React.Fragment>
      <StyledRootGrid
        alignItems="flex-end"
        container
        justifyContent="space-between"
        spacing={1}
      >
        <Grid className="p0" ref={disksHeaderRef}>
          <StyledTypography variant="h3">Disks</StyledTypography>
        </Grid>
        <span style={{ display: 'flex', flexDirection: 'row' }}>
          {!freeDiskSpace ? (
            <TooltipIcon
              tooltipAnalyticsEvent={() =>
                sendEvent({
                  action: `Open:tooltip`,
                  category: `Disk Resize Flow`,
                  label: `Add a Disk help icon tooltip`,
                })
              }
              status="help"
              text={noFreeDiskSpaceWarning}
            />
          ) : undefined}
          <StyledWrapperGrid>
            <AddNewLink
              disabled={readOnly || !freeDiskSpace}
              label="Add a Disk"
              onClick={() => setIsCreateDrawerOpen(true)}
            />
          </StyledWrapperGrid>
        </span>
      </StyledRootGrid>
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
                  <Grid xs={12}>
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
      <CreateImageFromDiskDialog
        disk={selectedDisk}
        linodeId={id}
        onClose={() => setIsImageDialogOpen(false)}
        open={isImageDialogOpen}
      />
    </React.Fragment>
  );
};

export const addUsedDiskSpace = (disks: Disk[]) => {
  return disks.reduce((accum, eachDisk) => eachDisk.size + accum, 0);
};
