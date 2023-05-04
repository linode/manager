import * as React from 'react';
import Typography from 'src/components/core/Typography';
import { makeStyles } from 'tss-react/mui';
import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  externalLink: {
    alignItems: 'baseline',
  },
  internalLink: {
    alignItems: 'center',
  },
  linksSubSection: {
    display: 'grid',
    gridTemplateRows: `22px minmax(${theme.spacing(3)}, 100%) 1.125rem`,
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
    },
    '& li': {
      paddingLeft: 0,
      paddingRight: 0,
      '& > a': {
        fontSize: '0.875rem',
        color: theme.textColors.linkActiveLight,
      },
    },
  },
}));

interface ResourcesLinksSubSectionProps {
  children?: JSX.Element[] | JSX.Element;
  external?: boolean;
  icon: JSX.Element;
  MoreLink: (props: { className: any }) => JSX.Element;
  title: string;
}

export const ResourcesLinksSubSection = (
  props: ResourcesLinksSubSectionProps
) => {
  const { children, external, icon, MoreLink, title } = props;
  const { classes } = useStyles();
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
