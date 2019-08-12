import * as React from 'react';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  root: {}
}));

interface Props {
  something?: string;
}

type CombinedProps = Props;

const RegionSelect: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  return <div className={classes.root}>hello world</div>;
};

export default compose<CombinedProps, {}>(React.memo)(RegionSelect);
