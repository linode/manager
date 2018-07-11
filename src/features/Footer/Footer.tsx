import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import FooterLogo from 'src/assets/logo/logo-footer.svg';
import Grid from 'src/components/Grid';

type CSSClasses = 'container'
| 'link'
| 'navWrapper'
| 'logoWrapper'
| 'logo';

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
    paddingBottom: '0 !important',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    backgroundColor: theme.bg.main,
    height: 70,
  },
  logo: {
    opacity: .5,
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

const Footer: React.StatelessComponent<CombinedProps> = ({ classes }) => {
  return (
    <Grid container className={classes.container}>
      <Grid item xs={12} className={classes.navWrapper}>
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
          Customer Feedback
        </a>
      </Grid>
      <Grid item xs={12} className={classes.logoWrapper}>
        <FooterLogo width="40" height="40" className={classes.logo} />
      </Grid>
    </Grid>
  );
};

export default styled(Footer);
