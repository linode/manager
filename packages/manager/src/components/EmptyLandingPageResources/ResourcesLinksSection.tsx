import * as React from 'react';
import { makeStyles } from 'tss-react/mui';
import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  categoryWrapper: {
    maxWidth: 762,
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

interface ResourcesLinksSectionProps {
  children: JSX.Element[] | JSX.Element;
}

export const ResourcesLinksSection = (props: ResourcesLinksSectionProps) => {
  const { classes } = useStyles();

  return <div className={classes.categoryWrapper}>{props.children}</div>;
};
