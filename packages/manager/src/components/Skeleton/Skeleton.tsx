import * as React from 'react';
import Skeleton, { SkeletonProps } from 'src/components/core/Skeleton';
import { makeStyles, Theme } from 'src/components/core/styles';

import Grid from 'src/components/Grid';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  column: {}
}));

interface Props {
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
}

type combinedProps = SkeletonProps & Props;

const _Skeleton: React.FC<combinedProps> = props => {
  const classes = useStyles();
  const { columns } = props;

  const cols: any = [];
  const renderCols = (colCount: any) => {
    for (
      colCount = 0;
      colCount <= (columns !== undefined ? columns - 1 : 1);
      colCount++
    ) {
      cols.push(
        <Grid
          item
          style={{ width: `${100 / (columns !== undefined ? columns : 1)}%` }}
        >
          <Skeleton {...props} className={classes.column} />
        </Grid>
      );
    }
    return;
  };

  renderCols(columns);

  return (
    <>
      {!columns ? (
        <Skeleton {...props} className={classes.root} />
      ) : (
        <Grid container>{cols}</Grid>
      )}
    </>
  );
};

export default _Skeleton;
