import * as React from 'react';
import LinodeIcon from 'src/assets/addnewmenu/linode.svg';
import Paper from 'src/components/core/Paper';
import { Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import { H1Header } from 'src/components/H1Header/H1Header';
import AlgoliaSearchBar from './AlgoliaSearchBar';

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    padding: theme.spacing(4),
    backgroundColor: theme.color.green,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(8),
    },
  },
  bgIcon: {
    color: '#04994D',
    position: 'absolute',
    left: 0,
    width: 250,
    height: 250,
    '& .circle': {
      fill: 'transparent',
    },
    '& .outerCircle': {
      stroke: 'transparent',
    },
    '& .insidePath path': {
      stroke: '#04994D',
    },
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  searchHeading: {
    textAlign: 'center',
    color: theme.color.white,
    position: 'relative',
    zIndex: 2,
  },
}));

export const SearchPanel = () => {
  const { classes } = useStyles();

  return (
    <Paper className={classes.root}>
      <LinodeIcon className={classes.bgIcon} />
      <H1Header
        title="What can we help you with?"
        className={classes.searchHeading}
        data-qa-search-heading
      />
      <AlgoliaSearchBar />
    </Paper>
  );
};
