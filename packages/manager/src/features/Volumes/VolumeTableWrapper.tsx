import * as React from 'react';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import { OrderByProps } from 'src/components/OrderBy';
import Table from 'src/components/Table';
import SortableVolumesTableHeader from './SortableVolumesTableHeader';

type ClassNames = 'root' | 'paperWrapper';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    paperWrapper: {
      backgroundColor: 'transparent'
    }
  });

interface VolumeTableWrapperProps {
  isVolumesLanding: boolean;
}

type CombinedProps = Omit<OrderByProps, 'data'> &
  VolumeTableWrapperProps &
  WithStyles<ClassNames>;

const DomainsTableWrapper: React.FC<CombinedProps> = props => {
  const {
    order,
    orderBy,
    handleOrderChange,
    classes,
    isVolumesLanding
  } = props;

  return (
    <Paper className={classes.paperWrapper}>
      <Grid container className="my0">
        <Grid item xs={12} className="py0">
          <Table aria-label="List of Volumes">
            <SortableVolumesTableHeader
              order={order}
              orderBy={orderBy}
              handleOrderChange={handleOrderChange}
              isVolumesLanding={isVolumesLanding}
            />
            {props.children}
          </Table>
        </Grid>
      </Grid>
    </Paper>
  );
};

const styled = withStyles(styles);

export default styled(DomainsTableWrapper);
