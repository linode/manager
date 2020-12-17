import * as classNames from 'classnames';
import * as React from 'react';
import { Theme, makeStyles } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import createMailto from './createMailto';

import AdaLink from './AdaLink';

interface Props {
  desktopMenuIsOpen: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    width: '100%',
    backgroundColor: theme.bg.main,
    margin: 0,
    padding: '4px 0px',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      alignItems: 'flex-start'
    },
    [theme.breakpoints.up('md')]: {
      paddingLeft: 200
    }
  },
  desktopMenuIsOpen: {
    paddingLeft: 0,
    [theme.breakpoints.up(1100)]: {
      paddingLeft: theme.spacing(7) + 36
    }
  },
  version: {
    marginLeft: 24,
    '&.MuiGrid-item': {
      paddingLeft: 0
    },
    [theme.breakpoints.down('xs')]: {
      marginLeft: 16
    }
  },
  linkContainer: {
    [theme.breakpoints.down('xs')]: {
      paddingTop: '0 !important',
      paddingBottom: '0 !important'
    }
  },
  link: {
    color: theme.palette.text.primary,
    fontSize: '90%',
    transition: theme.transitions.create('color'),
    '&:hover, &:focus': {
      color: theme.color.black,
      textDecoration: 'underline'
    },
    [theme.breakpoints.down('md')]: {
      marginRight: theme.spacing(1)
    }
  },
  feedbackLink: {
    [theme.breakpoints.down('xs')]: {
      marginBottom: theme.spacing(1)
    },
    [theme.breakpoints.up('xs')]: {
      '&.MuiGrid-item': {
        paddingRight: 0
      }
    }
  },
  adaLink: {
    padding: '0 !important',
    marginRight: theme.spacing(2),
    position: 'fixed',
    zIndex: 2,
    right: 0,
    bottom: 8,
    [theme.breakpoints.up('sm')]: {
      marginRight: theme.spacing(3)
    }
  }
}));

export const Footer: React.FC<Props> = props => {
  const classes = useStyles();

  const { desktopMenuIsOpen } = props;
  const feedbackEmail = window.location.host.match(/beta/)
    ? 'cloudbeta@linode.com'
    : 'feedback@linode.com';

  return (
    <footer role="contentinfo">
      <Grid
        container
        spacing={4}
        alignItems="center"
        className={classNames({
          [classes.container]: true,
          [classes.desktopMenuIsOpen]: desktopMenuIsOpen
        })}
      >
        <Grid item className={classes.version}>
          {renderVersion(classes.link)}
        </Grid>
        <Grid
          item
          className={classNames({
            [classes.linkContainer]: true
          })}
        >
          <a
            className={classes.link}
            href="https://developers.linode.com"
            target="_blank"
            aria-describedby="external-site"
            rel="noopener noreferrer"
          >
            API Reference
          </a>
        </Grid>
        <Grid
          item
          className={classNames({
            [classes.linkContainer]: true,
            [classes.feedbackLink]: true
          })}
        >
          <a
            className={classes.link}
            href={createMailto(window.navigator.userAgent || '', feedbackEmail)}
          >
            Provide Feedback
          </a>
        </Grid>
        <Grid item className={classes.adaLink}>
          <AdaLink />
        </Grid>
      </Grid>
    </footer>
  );
};

const renderVersion = (className: string) => {
  const { VERSION } = process.env;
  if (!VERSION) {
    return null;
  }

  return (
    <a
      className={className}
      href={`https://github.com/linode/manager/releases/tag/linode-manager@v${VERSION}`}
      target="_blank"
      aria-describedby="external-site"
      rel="noopener noreferrer"
    >
      v{VERSION}
    </a>
  );
};

export default React.memo(Footer);
