import { compose } from 'ramda';
import * as React from 'react';

import ListItem from '@material-ui/core/ListItem';
import {
  StyleRules,
  Theme,
  WithStyles,
  withStyles,
} from '@material-ui/core/styles';

import RenderGuard from 'src/components/RenderGuard';


type ClassNames = 'root';

const styles = (theme: Theme & Linode.Theme): StyleRules => ({
  root: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    paddingLeft: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
    '&:last-child': {
      border: 0,
    },
    '& svg > g': {
      fill: 'transparent',
      transition: theme.transitions.create('fill'),
    },
    '& svg .outerCircle': {
      transition: theme.transitions.create('stroke'),
    },
    '& svg .insidePath *': {
      transition: theme.transitions.create('stroke'),
    },
    '&:hover': {
      '& svg > g': {
        fill: theme.palette.primary.main,
      },
      '& svg .insidePath *': {
        stroke: 'white',
      },
      '& svg .outerCircle': {
        stroke: theme.palette.primary.dark,
      },
    },
  }
});

interface Props {
  type: string;
  id: string;
  title: string;
  handleClick: (id: string, type: string) => void,
}

type CombinedProps = Props & WithStyles<ClassNames>;

const clickableRow: React.StatelessComponent<CombinedProps> = (props) => {
  const { classes } = props;

  const onClick = () => {
    const { id, type, handleClick } = props;
    handleClick(id, type);
  }

  return (
    <ListItem
      className={classes.root}
      onClick={onClick}
      button
      component="li"
    >
      {props.children}
    </ListItem>
  )
}

const styled = withStyles(styles, { withTheme: true });

export default compose<any, any, any>(
    styled,
    RenderGuard
    )(clickableRow);