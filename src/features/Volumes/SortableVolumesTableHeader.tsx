import * as React from 'react';
import { WithStyles } from '@material-ui/core/styles';
import {
  createStyles,
  Theme,
  withStyles
} from 'src/components/core/styles';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import { OrderByProps } from 'src/components/OrderBy';
import TableCell from 'src/components/TableCell';
import TableSortCell from 'src/components/TableSortCell';

type ClassNames =
  | 'root'
  | 'labelCol'
  | 'regionCol'
  | 'attachmentCol'
  | 'sizeCol'
  | 'pathCol'
  | 'volumesWrapper'
  | 'linodeVolumesWrapper';

const styles = (theme: Theme) =>
  createStyles({
  root: {},
  // styles for /volumes table
  volumesWrapper: {},
  // styles for linodes/id/volumes table
  linodeVolumesWrapper: {
    '& $labelCol': {
      width: '20%',
      minWidth: 150
    },
    '& $sizeCol': {
      width: '15%',
      minWidth: 100
    },
    '& $pathCol': {
      width: '55%',
      minWidth: 150
    }
  },
  regionCol: {
    width: '20%',
    minWidth: 75
  },
  labelCol: {
    width: '20%',
    minWidth: 75,
    paddingLeft: theme.spacing(2) + 49
  },
  attachmentCol: {
    width: '15%',
    minWidth: 75
  },
  sizeCol: {
    width: '10%',
    minWidth: 75
  },
  pathCol: {
    width: '25%',
    minWidth: 100
  }
});

interface SortableVolumesTableHeaderProps {
  isVolumesLanding: boolean;
}

type CombinedProps = WithStyles<ClassNames> &
  SortableVolumesTableHeaderProps &
  Omit<OrderByProps, 'data'>;

const SortableTableHeader: React.StatelessComponent<CombinedProps> = props => {
  const {
    classes,
    order,
    orderBy,
    handleOrderChange,
    isVolumesLanding
  } = props;

  const isActive = (label: string) => label === orderBy;

  return (
    <TableHead
      data-qa-table-head={order}
      className={
        isVolumesLanding ? classes.volumesWrapper : classes.linodeVolumesWrapper
      }
    >
      <TableRow>
        <TableSortCell
          className={classes.labelCol}
          active={isActive('label')}
          label="label"
          direction={order}
          handleClick={handleOrderChange}
          data-qa-volume-label-header={order}
        >
          Label
        </TableSortCell>
        {isVolumesLanding && (
          <TableSortCell
            className={classes.regionCol}
            data-qa-volume-region-header={order}
            active={isActive('region')}
            label="region"
            direction={order}
            handleClick={handleOrderChange}
          >
            Region
          </TableSortCell>
        )}
        <TableSortCell
          className={classes.sizeCol}
          data-qa-volume-size-header={order}
          active={isActive('size')}
          label="size"
          direction={order}
          handleClick={handleOrderChange}
        >
          Size
        </TableSortCell>
        <TableCell className={classes.pathCol}>File System Path</TableCell>
        {isVolumesLanding && (
          <TableCell className={classes.attachmentCol}>Attached To</TableCell>
        )}
        <TableCell />
      </TableRow>
    </TableHead>
  );
};

const styled = withStyles(styles);

export default styled(SortableTableHeader);
