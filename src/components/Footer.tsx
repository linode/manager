import * as React from 'react';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';

import Grid from 'material-ui/Grid';

type CSSClasses = 'container' | 'link' | 'gridWrapper';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme) => ({
  container: {
    flexShrink: 0,
    textAlign: 'center',
  },
  gridWrapper: {
    padding: '20px 0 !important',
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
      <Grid item xs={12} className={classes.gridWrapper}>
        <a className={classes.link} href="https://developers.linode.com">API Reference</a>
        <a className={classes.link} href="mailto:feedback@linode.com">Customer Feedback</a>
      </Grid>
    </Grid>
  );
};

export default styled(Footer);
