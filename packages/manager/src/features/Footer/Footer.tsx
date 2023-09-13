import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { Link } from 'src/components/Link';

import packageJson from '../../../package.json';

interface Props {
  desktopMenuIsOpen: boolean;
}

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    backgroundColor: theme.bg.main,
    margin: 0,
    padding: '4px 0px',
    [theme.breakpoints.down('sm')]: {
      alignItems: 'flex-start',
      flexDirection: 'column',
    },
    [theme.breakpoints.up('md')]: {
      paddingLeft: 200,
    },
    width: '100%',
  },
  desktopMenuIsOpen: {
    paddingLeft: 0,
    [theme.breakpoints.up('md')]: {
      paddingLeft: 52,
    },
  },
  feedbackLink: {
    [theme.breakpoints.down('sm')]: {
      marginBottom: theme.spacing(1),
    },
    [theme.breakpoints.up('xs')]: {
      '&.MuiGrid-item': {
        paddingRight: 0,
      },
    },
  },
  link: {
    fontSize: '90%',
    [theme.breakpoints.down('lg')]: {
      marginRight: theme.spacing(1),
    },
  },
  linkContainer: {
    [theme.breakpoints.down('sm')]: {
      padding: '0 8px !important',
    },
  },
  version: {
    '&.MuiGrid-item': {
      paddingLeft: 0,
    },
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(),
    },
  },
}));

const FEEDBACK_LINK = 'https://www.linode.com/feedback/';

export const Footer = React.memo((props: Props) => {
  const { classes, cx } = useStyles();

  const { desktopMenuIsOpen } = props;

  return (
    <footer role="contentinfo">
      <Grid
        className={cx({
          [classes.container]: true,
          [classes.desktopMenuIsOpen]: desktopMenuIsOpen,
        })}
        alignItems="center"
        container
        spacing={4}
      >
        <Grid className={classes.version}>{renderVersion(classes.link)}</Grid>
        <Grid
          className={cx({
            [classes.linkContainer]: true,
          })}
        >
          <Link
            className={classes.link}
            forceCopyColor
            to="https://developers.linode.com"
          >
            API Reference
          </Link>
        </Grid>
        <Grid
          className={cx({
            [classes.feedbackLink]: true,
            [classes.linkContainer]: true,
          })}
        >
          <Link className={classes.link} forceCopyColor to={FEEDBACK_LINK}>
            Provide Feedback
          </Link>
        </Grid>
      </Grid>
    </footer>
  );
});

const renderVersion = (className: string) => {
  const VERSION = packageJson.version;
  if (!VERSION) {
    return null;
  }

  return (
    <Link
      className={className}
      forceCopyColor
      to={`https://github.com/linode/manager/releases/tag/linode-manager@v${VERSION}`}
    >
      v{VERSION}
    </Link>
  );
};
