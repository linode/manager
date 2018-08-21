import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import Grid from 'src/components/Grid';

type CSSClasses = 'container'
  | 'link'
  | 'navWrapper'

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme & Linode.Theme) => ({
  container: {
    width: '100%',
    backgroundColor: theme.bg.main,
    margin: 0,
    [theme.breakpoints.up('md')]: {
      paddingLeft: 215,
    },
    [theme.breakpoints.up('xl')]: {
      paddingLeft: 275,
    },
  },
  navWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    color: theme.palette.text.primary,
    textDecoration: 'none',
    fontSize: '90%',
    '&:hover, &:focus': {
      color: 'black',
    },
  },
});

const styled = withStyles(styles, { withTheme: true });

interface Props { }

type CombinedProps = Props & WithStyles<CSSClasses>;

export class Footer extends React.PureComponent<CombinedProps> {
  render() {
    const { classes } = this.props;

    return (
      <Grid container spacing={32} className={classes.container}>
        <Grid item xs={12} className={classes.navWrapper}>
          {this.renderVersion(classes.link)}
          <a
            className={classes.link}
            href="https://developers.linode.com"
            target="_blank"
          >
            API Reference
          </a>
          <a
            className={classes.link}
            href="mailto:feedback@linode.com"
          >
            Provide Feedback
          </a>
        </Grid>
      </Grid>
    );
  }

  renderVersion = (className: string) => {
    const { VERSION } = process.env;
    if (!VERSION) { return null; }

    return (
    <a
      className={className}
      href={`https://github.com/linode/manager/releases/tag/v${VERSION}`}
      target="_blank"
    >
      v{VERSION}
    </a>
    );
  };
}

export default styled(Footer);
