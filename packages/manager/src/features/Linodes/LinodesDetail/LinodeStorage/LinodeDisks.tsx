import * as React from 'react';
import AddNewLink from 'src/components/AddNewLink';
import Hidden from 'src/components/core/Hidden';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import Typography from 'src/components/core/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { Disk } from '@linode/api-v4/lib/linodes';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import { TooltipIcon } from 'src/components/TooltipIcon/TooltipIcon';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableSortCell } from 'src/components/TableSortCell';
import { sendEvent } from 'src/utilities/analytics';
import { LinodeDiskRow } from './LinodeDiskRow';
import { useAllLinodeDisksQuery } from 'src/queries/linodes/disks';
import { useParams } from 'react-router-dom';
import { useLinodeQuery } from 'src/queries/linodes/linodes';
import { useGrants } from 'src/queries/profile';
import { DeleteDiskDialog } from './DeleteDiskDialog';
import { CreateDiskDrawer } from './CreateDiskDrawer';
import { RenameDiskDrawer } from './RenameDiskDrawer';
import { ResizeDiskDrawer } from './ResizeDiskDrawer';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { CreateImageFromDiskDialog } from './CreateImageFromDiskDialog';

const useStyles = makeStyles((theme: Theme) => ({
  addNewWrapper: {
    '&.MuiGrid-item': {
      padding: 5,
    },
    [theme.breakpoints.down('sm')]: {
      marginLeft: `-${theme.spacing(1.5)}`,
    },
  },
  addNewWrapperContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  headline: {
    lineHeight: '1.5rem',
    marginBottom: 8,
    marginLeft: 15,
    marginTop: 8,
  },
  root: {
    backgroundColor: theme.color.white,
    margin: 0,
    width: '100%',
  },
}));

export const LinodeDisks = () => {
  const classes = useStyles();
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
        key={disk.id}
        disk={disk}
        linodeId={id}
        linodeStatus={linode?.status ?? 'offline'}
        readOnly={readOnly}
        onRename={() => onRename(disk)}
        onResize={() => onResize(disk)}
        onImagize={() => onImagize(disk)}
        onDelete={() => onDelete(disk)}
      />
    ));
  };

  return (
    <React.Fragment>
      <Grid
        className={classes.root}
        container
        alignItems="flex-end"
        justifyContent="space-between"
        spacing={1}
      >
        <Grid ref={disksHeaderRef} className="p0">
          <Typography variant="h3" className={classes.headline}>
            Disks
          </Typography>
        </Grid>
        <span className={classes.addNewWrapperContainer}>
          {!freeDiskSpace ? (
            <TooltipIcon
              text={noFreeDiskSpaceWarning}
              status="help"
              tooltipAnalyticsEvent={() =>
                sendEvent({
                  action: `Open:tooltip`,
                  category: `Disk Resize Flow`,
                  label: `Add a Disk help icon tooltip`,
                })
              }
            />
          ) : undefined}
          <Grid className={classes.addNewWrapper}>
            <AddNewLink
              onClick={() => setIsCreateDrawerOpen(true)}
              label="Add a Disk"
              disabled={readOnly || !freeDiskSpace}
            />
          </Grid>
        </span>
      </Grid>
      <OrderBy
        data={disks ?? []}
        orderBy={'created'}
        order={'asc'}
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
                            label="label"
                            direction={order}
                            handleClick={handleOrderChange}
                          >
                            Label
                          </TableSortCell>
                          <TableSortCell
                            active={orderBy === 'filesystem'}
                            label="filesystem"
                            direction={order}
                            handleClick={handleOrderChange}
                          >
                            Type
                          </TableSortCell>
                          <TableSortCell
                            active={orderBy === 'size'}
                            label="size"
                            direction={order}
                            handleClick={handleOrderChange}
                          >
                            Size
                          </TableSortCell>
                          <Hidden mdDown>
                            <TableSortCell
                              active={orderBy === 'created'}
                              label="created"
                              direction={order}
                              handleClick={handleOrderChange}
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
                    page={page}
                    pageSize={pageSize}
                    count={count}
                    handlePageChange={handlePageChange}
                    handleSizeChange={handlePageSizeChange}
                    eventCategory="linode disks"
                  />
                </React.Fragment>
              );
            }}
          </Paginate>
        )}
      </OrderBy>
      <DeleteDiskDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        disk={selectedDisk}
        linodeId={id}
      />
      <CreateDiskDrawer
        open={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        linodeId={id}
      />
      <RenameDiskDrawer
        open={isRenameDrawerOpen}
        onClose={() => setIsRenameDrawerOpen(false)}
        linodeId={id}
        disk={selectedDisk}
      />
      <ResizeDiskDrawer
        open={isResizeDrawerOpen}
        onClose={() => setIsResizeDrawerOpen(false)}
        linodeId={id}
        disk={selectedDisk}
      />
      <CreateImageFromDiskDialog
        open={isImageDialogOpen}
        onClose={() => setIsImageDialogOpen(false)}
        disk={selectedDisk}
        linodeId={id}
      />
    </React.Fragment>
  );
};

export const addUsedDiskSpace = (disks: Disk[]) => {
  return disks.reduce((accum, eachDisk) => eachDisk.size + accum, 0);
};
