import * as React from 'react';
import { Theme } from '@mui/material/styles';
import Typography from 'src/components/core/Typography';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  '@keyframes dash': {
    to: {
      'stroke-dashoffset': 0,
    },
  },
  root: {
    paddingLeft: theme.spacing(),
    paddingRight: theme.spacing(),
    paddingTop: theme.spacing(),
    paddingBottom: theme.spacing(),
    borderBottom: `1px solid ${theme.palette.divider}`,
    maxWidth: '370px',
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color .2s ease-in-out',
    '& .circle': {
      fill: theme.bg.offWhite,
    },
    '& .outerCircle': {
      stroke: theme.bg.main,
    },
    '&:hover, &:focus': {
      ...theme.addCircleHoverEffect,
      backgroundColor: theme.bg.main,
      color: theme.palette.text.primary,
    },
  },
  iconWrapper: {
    width: 48,
    height: 48,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: theme.spacing(),
    paddingRight: theme.spacing(2),
    width: '100%',
  },
  titleLink: {
    textDecoration: 'none',
    color: theme.color.black,
    fontSize: '1.18rem',
  },
  body: {
    marginTop: 3,
    fontSize: '.9rem',
    lineHeight: '1.1rem',
  },
  link: {
    display: 'flex',
  },
}));

interface Props {
  title: string;
  body: string;
  ItemIcon: React.ComponentClass<any>;
  attr?: { [key: string]: any };
}

export const AddNewMenuItem = (props: Props) => {
  const classes = useStyles();
  const { title, body, ItemIcon, attr } = props;

  return (
    <div className={classes.root} data-qa-add-new-menu={title}>
      <div className={classes.iconWrapper} {...attr}>
        <ItemIcon />
      </div>
      <div className={classes.content}>
        <Typography variant="h3">{title}</Typography>
        <Typography variant="body1" className={classes.body}>
          {body}
        </Typography>
      </div>
    </div>
  );
};
