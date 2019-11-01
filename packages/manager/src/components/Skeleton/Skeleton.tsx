import * as React from 'react';
import Skeleton, { SkeletonProps } from 'src/components/core/Skeleton';
import { makeStyles, Theme } from 'src/components/core/styles';

import Grid from 'src/components/Grid';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: 10
  },
  columnTitle: {
    marginBottom: theme.spacing(1)
  },
  columnText: {
    marginTop: theme.spacing(1),
    marginBottom: 0
  }
}));

interface Props {
  table?: boolean;
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  firstColWidth?: number;
  textHeight?: number;
  subtextHeight?: number;
}

export type combinedProps = SkeletonProps & Props;

const _Skeleton: React.FC<combinedProps> = props => {
  const classes = useStyles();
  const {
    table,
    columns,
    firstColWidth,
    variant,
    textHeight,
    subtextHeight
  } = props;

  const cols: JSX.Element[] = [];
  const ifColumns = columns !== undefined ? columns : 1;
  const renderTableSkeleton = (colCount: number) => {
    const calcColumns = () => {
      if (colCount === 0) {
        return firstColWidth ? firstColWidth : 100 / ifColumns;
      } else {
        return firstColWidth
          ? (100 - firstColWidth) / (ifColumns - 1)
          : 100 / ifColumns;
      }
    };
    for (colCount = 0; colCount <= ifColumns - 1; colCount++) {
      cols.push(
        <Grid
          item
          style={{ width: `${calcColumns()}%` }}
          key={`ske-${colCount}`}
          data-testid={'skeletonCol'}
        >
          <Skeleton
            className={classes.columnTitle}
            height={textHeight && variant === 'text' ? textHeight : 16}
          />
          <Grid container>
            <Grid item xs={9} className="py0">
              <Skeleton
                className={classes.columnText}
                height={subtextHeight ? subtextHeight : 8}
              />
            </Grid>
            <Grid item xs={6} className="py0">
              <Skeleton
                className={classes.columnText}
                height={subtextHeight ? subtextHeight : 8}
              />
            </Grid>
          </Grid>
        </Grid>
      );
    }
    return;
  };

  return (
    <>
      {table ? (
        <>
          {renderTableSkeleton(ifColumns)}
          <Grid
            container
            className={classes.root}
            data-testid={'tableSkeleton'}
          >
            {cols}
          </Grid>
        </>
      ) : (
        <Skeleton
          {...props}
          className={classes.root}
          data-testid={'basicSkeleton'}
        />
      )}
    </>
  );
};

export default _Skeleton;
