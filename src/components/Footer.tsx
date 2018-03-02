import * as React from 'react';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';

import Grid from 'material-ui/Grid';

type CSSClasses = 'container'
  | 'link';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme) => ({
  container: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    textAlign: 'center',
    marginTop: theme.spacing.unit * 4,
    marginBottom: theme.spacing.unit * 4,
  },
  link: {
    marginLeft: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit * 2,
  },
});

const styled = withStyles(styles, { withTheme: true });

interface Props { }

type CombinedProps = Props & WithStyles<CSSClasses>;

const Footer: React.StatelessComponent<CombinedProps> = ({ classes }) => {
  return (
    <Grid container className={classes.container}>
      <Grid item xs={12}>
        <a className={classes.link} href="https://developers.linode.com">API Reference</a>
        <a className={classes.link} href="mailto:feedback@linode.com">Customer Feedback</a>
      </Grid>
    </Grid>
  );
};

export default styled(Footer);
