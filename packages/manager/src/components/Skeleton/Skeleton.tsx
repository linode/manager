import * as React from 'react';
import Skeleton from 'src/components/core/Skeleton';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {}
}));

interface Props {}

const _Skeleton: React.FC<Props> = () => {
  const classes = useStyles();

  return <Skeleton className={classes.root} />;
};

export default _Skeleton;
