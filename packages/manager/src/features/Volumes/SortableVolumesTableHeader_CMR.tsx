import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableHead from 'src/components/core/TableHead';
import { OrderByProps } from 'src/components/OrderBy';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import TableSortCell from 'src/components/TableSortCell/TableSortCell_CMR';

const useStyles = makeStyles((theme: Theme) => ({
  borderRight: {
    borderRight: `1px solid ${theme.palette.divider}`
  }
}));

interface SortableVolumesTableHeaderProps {
  isVolumesLanding: boolean;
}

type CombinedProps = SortableVolumesTableHeaderProps &
  Omit<OrderByProps, 'data'>;

const SortableTableHeader: React.FC<CombinedProps> = props => {
  const classes = useStyles();
  const { order, orderBy, handleOrderChange, isVolumesLanding } = props;

  const isActive = (label: string) => label === orderBy;

  return (
    <TableHead
      data-qa-table-head={order}
      // className={
      //   isVolumesLanding ? classes.volumesWrapper : classes.linodeVolumesWrapper
      // }
    >
      <TableRow>
        <TableSortCell
          data-qa-volume-label-header={order}
          active={isActive('label')}
          label="label"
          direction={order}
          handleClick={handleOrderChange}
        >
          Label
        </TableSortCell>
        {isVolumesLanding && (
          <TableSortCell
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
          data-qa-volume-size-header={order}
          active={isActive('size')}
          label="size"
          direction={order}
          handleClick={handleOrderChange}
        >
          Size
        </TableSortCell>
        <TableCell className={classes.borderRight} role="columnheader">
          File System Path
        </TableCell>
        {isVolumesLanding && (
          <TableCell role="columnheader">Attached To</TableCell>
        )}
        <TableCell />
      </TableRow>
    </TableHead>
  );
};

export default SortableTableHeader;
