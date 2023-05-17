import * as React from 'react';

import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

const useStyles = makeStyles((theme: Theme) => ({
  categoryWrapper: {
    display: 'grid',
    gridAutoColumns: '1fr',
    gridAutoFlow: 'column',
    columnGap: theme.spacing(5),
    justifyItems: 'center',
    [theme.breakpoints.down('md')]: {
      gridAutoFlow: 'row',
      rowGap: theme.spacing(8),
      justifyItems: 'start',
    },
  },
}));

interface Props {
  children: JSX.Element[] | JSX.Element;
}

const LinksSection = (props: Props) => {
  const classes = useStyles();
  return <div className={classes.categoryWrapper}>{props.children}</div>;
};

export default LinksSection;
