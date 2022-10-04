import * as React from 'react';
import Typography from 'src/components/core/Typography';

import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  linksSubSection: {
    display: 'grid',
    gridTemplateRows: `22px  minmax(${theme.spacing(3)}px, 100%) 1.125rem`,
    rowGap: theme.spacing(2),
    width: '100%',
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
      color: theme.textColors.linkActiveLight,
      '& > svg': {
        color: theme.textColors.linkActiveLight,
        marginLeft: theme.spacing(),
        height: 12,
        width: 12,
      },
    },
    '& li': {
      paddingLeft: 0,
      paddingRight: 0,
      '& > a': {
        fontSize: '0.875rem',
        color: theme.textColors.linkActiveLight,
        '& > svg': {
          color: theme.textColors.linkActiveLight,
          marginLeft: theme.spacing(),
          height: 12,
          width: 12,
        },
      },
    },
  },
  internalLink: {
    alignItems: 'center',
  },
  externalLink: {
    alignItems: 'baseline',
  },
}));

interface Props {
  children?: JSX.Element[] | JSX.Element;
  title: string;
  icon: JSX.Element;
  MoreLink: (props: { className: any }) => JSX.Element;
  external?: boolean;
}

const LinksSubSection = (props: Props) => {
  const { title, icon, children, MoreLink, external } = props;
  const classes = useStyles();
  const linkClassName = external ? classes.externalLink : classes.internalLink;

  return (
    <div className={classes.linksSubSection}>
      <Typography variant="h2">
        {icon} {title}
      </Typography>
      {children}
      <MoreLink className={linkClassName} />
    </div>
  );
};

export default LinksSubSection;
