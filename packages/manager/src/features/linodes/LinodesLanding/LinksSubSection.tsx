import * as React from 'react';
import Typography from 'src/components/core/Typography';

import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  linksSubSection: {
    display: 'grid',
    gridTemplateRows: `22px  ${theme.spacing(20.5)}px 1.125rem`,
    rowGap: theme.spacing(2),
    '& > h2': {
      color: theme.palette.text.primary,
    },
    '& > h2 > svg': {
      color: theme.palette.primary.main,
      marginRight: theme.spacing(),
      height: '1.125rem',
      width: '1.125rem',
    },
    '& > a': {
      fontSize: '0.875rem',
      fontWeight: 700,
      display: 'flex',
      alignItems: 'baseline',
      '& > svg': {
        height: 12,
        width: 12,
      },
    },
    '& li': {
      paddingLeft: 0,
      '& > a': {
        fontSize: '0.875rem',
        '& > svg': {
          height: 12,
          width: 12,
        },
      },
    },
  },
}));

interface Props {
  children?: JSX.Element[] | JSX.Element;
  title: string;
  icon: JSX.Element;
  moreLink: JSX.Element;
}

const LinksSubSection = (props: Props) => {
  const { title, icon, children, moreLink } = props;
  const classes = useStyles();
  return (
    <div className={classes.linksSubSection}>
      <Typography variant="h2">
        {icon} {title}
      </Typography>
      {children}
      {moreLink}
    </div>
  );
};

export default LinksSubSection;
