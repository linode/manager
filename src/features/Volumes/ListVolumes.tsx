import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { StyleRulesCallback, WithStyles, withStyles } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableSortCell from 'src/components/TableSortCell';
import VolumeTableRow from 'src/features/Volumes/VolumeTableRow';

type ClassNames = 'root'
  | 'labelCol'
  | 'attachmentCol'
  | 'sizeCol'
  | 'pathCol'
  | 'volumesWrapper'
  | 'linodeVolumesWrapper';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  // styles for /volumes table
  volumesWrapper: {
  },
  // styles for linodes/id/volumes table
  linodeVolumesWrapper: {
    '& $labelCol': {
      width: '20%',
      minWidth: 200,
    },
    '& $sizeCol': {
      width: '15%',
      minWidth: 100,
    },
    '& $pathCol': {
      width: '55%',
      minWidth: 350,
    },
  },
  labelCol: {
    width: '15%',
    minWidth: 150,
  },
  attachmentCol: {
    width: '15%',
    minWidth: 150,
  },
  sizeCol: {
    width: '10%',
    minWidth: 75,
  },
  pathCol: {
    width: '25%',
    minWidth: 250,
  },
});

interface RenderDataProps {
  isVolumesLanding: boolean;
  openForEdit: (volumeId: number, volumeLabel: string, volumeTags: string[]) => void;
  openForResize: (volumeId: number, volumeSize: number, volumeLabel: string) => void;
  openForClone: (volumeId: number, volumeLabel: string, volumeSize: number, volumeRegion: string) => void;
  openForConfig: (volumeLabel: string, volumePath: string) => void;
  handleAttach: (volumeId: number, label: string, regionID: string) => void;
  handleDetach: (volumeId: number) => void;
  handleDelete: (volumeId: number) => void;
}

interface Props {
  data: Linode.Volume[];
  orderBy: string;
  order: 'asc' | 'desc';
  renderProps: RenderDataProps;
  handleOrderChange: (orderBy: string, order?: 'asc' | 'desc') => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const ListVolumes: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    classes, orderBy, order, handleOrderChange, data, renderProps,
  } = props;
  return (
    <Paginate data={data} pageSize={25}>
      {({ data: paginatedData, count, handlePageChange, handlePageSizeChange, page, pageSize }) => (
        <React.Fragment>
          <Paper>
            <Table aria-label="List of your Volumes" className={renderProps.isVolumesLanding ? classes.volumesWrapper : classes.linodeVolumesWrapper}>
              <TableHead>
                <TableRow>
                  <TableSortCell
                    className={classes.labelCol}
                    active={orderBy === 'label'}
                    label="Label"
                    direction={order}
                    handleClick={handleOrderChange}
                  >
                    Label
                  </TableSortCell>
                  {props.renderProps.isVolumesLanding && <TableCell>Region</TableCell>}
                  <TableCell className={classes.sizeCol}>Size</TableCell>
                  <TableCell className={classes.pathCol}>File System Path</TableCell>
                  {props.renderProps.isVolumesLanding && <TableCell className={classes.attachmentCol}>Attached To</TableCell>}
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                <RenderData
                  data={paginatedData}
                  {...renderProps}
                />
              </TableBody>
            </Table>
          </Paper>
          <PaginationFooter
            count={count}
            page={page}
            pageSize={pageSize}
            handlePageChange={handlePageChange}
            handleSizeChange={handlePageSizeChange}
            eventCategory="Volumes landing"
          />

        </React.Fragment>
      )}
    </Paginate>
  );
};

const isVolumeUpdating = (e?: Linode.Event) => {
  // Make Typescript happy, since this function can otherwise technically return undefined
  if (!e) { return false; }
  return e
    && ['volume_attach', 'volume_detach', 'volume_create'].includes(e.action)
    && ['scheduled', 'started'].includes(e.status);
};

const RenderData: React.StatelessComponent<{ data: Linode.Volume[] } & RenderDataProps> = (props) => {
  const {
    data,
    isVolumesLanding,
    handleAttach,
    handleDelete,
    handleDetach,
    openForClone,
    openForConfig,
    openForEdit,
    openForResize,
  } = props;

  return (
    <>
      {
        data.map((volume, idx: number) =>
          <VolumeTableRow
            key={`volume-table-row-${idx}`}
            volume={volume}
            isVolumesLanding={isVolumesLanding}
            isUpdating={isVolumeUpdating(volume.recentEvent)}
            handleAttach={handleAttach}
            handleDelete={handleDelete}
            handleDetach={handleDetach}
            openForEdit={openForEdit}
            openForClone={openForClone}
            openForConfig={openForConfig}
            openForResize={openForResize}
          />)
      }
    </>
  );
}

const styled = withStyles(styles);

export default styled(ListVolumes);
