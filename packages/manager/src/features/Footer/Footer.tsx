import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import * as React from 'react';

import ExternalLink from 'src/components/ExternalLink';

import packageJson from '../../../package.json';

interface Props {
  desktopMenuIsOpen: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
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
    '&:hover, &:focus': {
      color: theme.color.black,
      textDecoration: 'underline',
    },
    color: theme.palette.text.primary,
    fontSize: '90%',
    [theme.breakpoints.down('lg')]: {
      marginRight: theme.spacing(1),
    },
    transition: theme.transitions.create('color'),
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

export const Footer: React.FC<Props> = (props) => {
  const classes = useStyles();

  const { desktopMenuIsOpen } = props;

  return (
    <footer role="contentinfo">
      <Grid
        className={classNames({
          [classes.container]: true,
          [classes.desktopMenuIsOpen]: desktopMenuIsOpen,
        })}
        alignItems="center"
        container
        spacing={4}
      >
        <Grid className={classes.version}>{renderVersion(classes.link)}</Grid>
        <Grid
          className={classNames({
            [classes.linkContainer]: true,
          })}
        >
          <a
            aria-describedby="external-site"
            className={classes.link}
            href="https://developers.linode.com"
            rel="noopener noreferrer"
            target="_blank"
          >
            API Reference
          </a>
        </Grid>
        <Grid
          className={classNames({
            [classes.feedbackLink]: true,
            [classes.linkContainer]: true,
          })}
        >
          <ExternalLink
            className={classes.link}
            hideIcon
            link={FEEDBACK_LINK}
            text="Provide Feedback"
          />
        </Grid>
      </Grid>
    </footer>
  );
};

const renderVersion = (className: string) => {
  const VERSION = packageJson.version;
  if (!VERSION) {
    return null;
  }

  return (
    <a
      aria-describedby="external-site"
      className={className}
      href={`https://github.com/linode/manager/releases/tag/linode-manager@v${VERSION}`}
      rel="noopener noreferrer"
      target="_blank"
    >
      v{VERSION}
    </a>
  );
};

export default React.memo(Footer);
