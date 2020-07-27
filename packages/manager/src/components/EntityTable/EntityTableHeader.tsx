import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import { OrderByProps } from 'src/components/OrderBy';
import TableCell from 'src/components/TableCell';
import Hidden from 'src/components/core/Hidden';
import Typography from 'src/components/core/Typography';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import TableSortCell from 'src/components/TableSortCell';
import TableSortCell_CMR from 'src/components/TableSortCell/TableSortCell_CMR';
import useFlags from 'src/hooks/useFlags';
import { HeaderCell } from './types';

const useStyles = makeStyles((theme: Theme) => ({
  hiddenHeaderCell: theme.visually.hidden,
  root: {
    '& td': {
      borderTop: 0,
      paddingLeft: '15px',
      paddingRight: '15px'
    }
  },
  '& .MuiTableCell-head': {
    borderBottom: 0
  }
}));

interface Props extends Omit<OrderByProps, 'data'> {
  headers: HeaderCell[];
}

export const EntityTableHeader: React.FC<Props> = props => {
  const { headers, handleOrderChange, order, orderBy } = props;
  const classes = useStyles();
  const flags = useFlags();

  const SortCell = flags.cmr ? TableSortCell_CMR : TableSortCell;
  return (
    <TableHead>
      <TableRow>
        {headers.map(thisCell =>
          thisCell.sortable ? (
            thisCell.hideOnMobile ? (
              <Hidden xsDown>
                <SortCell
                  key={thisCell.dataColumn}
                  active={orderBy === thisCell.dataColumn}
                  label={thisCell.dataColumn}
                  direction={order}
                  handleClick={handleOrderChange}
                  style={{ width: thisCell.widthPercent }}
                  data-testid={`${thisCell.label}-header-cell`}
                >
                  {thisCell.label}
                </SortCell>
              </Hidden>
            ) : (
              <SortCell
                key={thisCell.dataColumn}
                active={orderBy === thisCell.dataColumn}
                label={thisCell.dataColumn}
                direction={order}
                handleClick={handleOrderChange}
                style={{ width: thisCell.widthPercent }}
                data-testid={`${thisCell.label}-header-cell`}
              >
                {thisCell.label}
              </SortCell>
            )
          ) : (
            <TableCell
              key={thisCell.dataColumn}
              data-testid={`${thisCell.label}-header-cell`}
              style={{ width: thisCell.widthPercent }}
            >
              <Typography
                className={
                  thisCell.visuallyHidden ? classes.hiddenHeaderCell : undefined
                }
              >
                {thisCell.label}
              </Typography>
            </TableCell>
          )
        )}
      </TableRow>
    </TableHead>
  );
};

export default React.memo(EntityTableHeader);
