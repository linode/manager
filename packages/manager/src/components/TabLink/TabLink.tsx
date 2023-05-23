import { Link } from '@reach/router';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme: any) => ({
  root: {
    ...theme.overrides.MuiTab.root,
  },
  selected: {},
}));

interface Props {
  to: string;
  title: string;
  selected?: boolean;
  ref?: any;
}

export const TabLink = (props: Props) => {
  const { title, to } = props;

  const { classes, cx } = useStyles();

  const pathName = document.location.pathname;

  return (
    <Link
      to={to}
      className={cx({
        [classes.root]: true,
        [classes.selected]: pathName === to,
      })}
      aria-selected={pathName === to}
      data-qa-tab={title}
    >
      {title}
    </Link>
  );
};

export const convertForAria = (str: string) => {
  return str
    .trim()
    .toLowerCase()
    .replace(/([^A-Z0-9]+)(.)/gi, (match, p1, p2) => p2.toUpperCase());
};
