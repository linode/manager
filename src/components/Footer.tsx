import * as React from 'react';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';

import Grid from 'src/components/Grid';
import LinodeTheme from 'src/theme';

import FooterLogo from 'src/assets/logo/logo-footer.svg';

type CSSClasses = 'container'
| 'link'
| 'navWrapper'
| 'logoWrapper'
| 'logo';

const styles: StyleRulesCallback<CSSClasses> = (theme: Theme) => ({
  container: {
    width: '100%',
    backgroundColor: LinodeTheme.bg.main,
    margin: 0,
    height: 100,
  },
  navWrapper: {
    display: 'flex',
    paddingBottom: '0 !important',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  logo: {
    opacity: .5,
  },
  link: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    color: LinodeTheme.palette.text.primary,
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

const Footer: React.StatelessComponent<CombinedProps> = ({ classes }) => {
  return (
    <Grid container className={classes.container}>
      <Grid item xs={12} className={classes.navWrapper}>
        <a className={classes.link} href="https://developers.linode.com">API Reference</a>
        <a className={classes.link} href="mailto:feedback@linode.com">Customer Feedback</a>
      </Grid>
      <Grid item xs={12} className={classes.logoWrapper}>
        <FooterLogo width="40" height="40" className={classes.logo} />
      </Grid>
    </Grid>
  );
};

export default styled(Footer);
