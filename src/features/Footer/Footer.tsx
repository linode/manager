import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import Grid from 'src/components/Grid';

type CSSClasses = 'container'
  | 'link'
  | 'version';

const styles: StyleRulesCallback<CSSClasses> = (theme) => ({
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
  version: {
    flex: 1,
  },
  link: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    color: theme.palette.text.primary,
    fontSize: '90%',
    textDecoration: 'underline',
    transition: theme.transitions.create('color'),
    '&:hover, &:focus': {
      color: theme.color.black,
    },
  },
});

const styled = withStyles(styles, { withTheme: true });

type CombinedProps = WithStyles<CSSClasses>;

export class Footer extends React.PureComponent<CombinedProps> {
  render() {
    const { classes } = this.props;

    return (
      <Grid container spacing={32} className={classes.container}>
        <Grid item className={classes.version}>
          {this.renderVersion(classes.link)}
        </Grid>
        <Grid item>
          <a
            className={classes.link}
            href="https://developers.linode.com"
            target="_blank"
          >
            API Reference
          </a>
        </Grid>
        <Grid item style={{ paddingLeft: 0 }}>
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
